'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { triggerAchievementCheckAfterFriendAdd } from '@/lib/achievements/trigger';

export interface Friend {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  weekly_study_minutes: number;
  average_accuracy: number;
  completed_topics: number;
  friendship_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  current_topic_id?: string | null;
  last_activity_at?: string | null;
}

export interface FriendActivity {
  id: string;
  friend_id: string;
  friend_username: string;
  activity_type: 'topic_completed' | 'test_passed' | 'streak_milestone' | 'study_session';
  topic_id?: string;
  topic_title?: string;
  score?: number;
  streak_days?: number;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  requester_id: string;
  requester_username: string;
  requester_avatar: string | null;
  created_at: string;
}

export interface UserSearchResult {
  id: string;
  username: string;
  avatar_url: string | null;
  study_time: number;
  completed_topics: number;
}

/**
 * フレンド機能を管理するフック
 */
export function useFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchFriends() {
      try {
        setLoading(true);
        const supabase = createClient();

        // フレンド一覧を取得（承認済み）
        const { data: friendships, error: friendshipsError } = await supabase
          .from('friendships')
          .select(`
            id,
            user_id,
            friend_id,
            status,
            created_at
          `)
          .eq('status', 'accepted')
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

        if (friendshipsError) throw friendshipsError;

        // フレンドのIDリストを取得
        const friendIds = friendships?.map(f =>
          f.user_id === userId ? f.friend_id : f.user_id
        ) || [];

        if (friendIds.length > 0) {
          // プロフィール情報を取得
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', friendIds);

          if (profilesError) throw profilesError;

          // 週間学習時間を取得（過去7日間）
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);

          const { data: sessions, error: sessionsError } = await supabase
            .from('study_sessions')
            .select('user_id, duration_minutes')
            .in('user_id', friendIds)
            .gte('started_at', weekAgo.toISOString());

          if (sessionsError) throw sessionsError;

          // テスト結果を取得
          const { data: testResults, error: testError } = await supabase
            .from('test_results')
            .select('user_id, score')
            .in('user_id', friendIds)
            .gte('created_at', weekAgo.toISOString());

          if (testError) throw testError;

          // 完了単元数を取得
          const { data: progress, error: progressError } = await supabase
            .from('topic_progress')
            .select('user_id, test_completed')
            .in('user_id', friendIds)
            .eq('test_completed', true);

          if (progressError) throw progressError;

          // データを集計
          const friendsData: Friend[] = profiles?.map(profile => {
            const userSessions = sessions?.filter(s => s.user_id === profile.id) || [];
            const userTests = testResults?.filter(t => t.user_id === profile.id) || [];
            const userProgress = progress?.filter(p => p.user_id === profile.id) || [];

            const weeklyMinutes = userSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
            const avgAccuracy = userTests.length > 0
              ? userTests.reduce((sum, t) => sum + (t.score || 0), 0) / userTests.length
              : 0;

            const friendship = friendships?.find(f =>
              (f.user_id === userId && f.friend_id === profile.id) ||
              (f.friend_id === userId && f.user_id === profile.id)
            );

            return {
              id: profile.id,
              user_id: profile.id,
              username: profile.username || 'Unknown',
              avatar_url: profile.avatar_url,
              weekly_study_minutes: weeklyMinutes,
              average_accuracy: Math.round(avgAccuracy),
              completed_topics: userProgress.length,
              friendship_id: friendship?.id || '',
              status: 'accepted' as const,
            };
          }) || [];

          setFriends(friendsData);
        }

        // 保留中のリクエストを取得（自分がfriend_idのもの）
        const { data: requests, error: requestsError } = await supabase
          .from('friendships')
          .select(`
            id,
            requester_id,
            created_at
          `)
          .eq('friend_id', userId)
          .eq('status', 'pending');

        if (requestsError) throw requestsError;

        if (requests && requests.length > 0) {
          // リクエスト送信者のプロフィールを取得
          const requesterIds = requests.map(r => r.requester_id);
          const { data: requesters, error: requestersError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', requesterIds);

          if (requestersError) throw requestersError;

          const requestsData: FriendRequest[] = requests.map(req => {
            const requester = requesters?.find(r => r.id === req.requester_id);
            return {
              id: req.id,
              requester_id: req.requester_id,
              requester_username: requester?.username || 'Unknown',
              requester_avatar: requester?.avatar_url || null,
              created_at: req.created_at,
            };
          });

          setPendingRequests(requestsData);
        }

      } catch (err) {
        // Silently fail - friends feature is optional
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchFriends();

    // Set up real-time subscriptions for friend updates
    if (!userId) return;

    const supabase = createClient();

    // Subscribe to topic_progress changes for friends
    const progressChannel = supabase
      .channel('friend-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'topic_progress',
        },
        (payload) => {
          // Update friend's completed topics when they complete a new topic
          if (payload.new.test_completed && !payload.old?.test_completed) {
            setFriends(prev => prev.map(friend =>
              friend.id === payload.new.user_id
                ? { ...friend, completed_topics: friend.completed_topics + 1 }
                : friend
            ));
          }
        }
      )
      .subscribe();

    // Subscribe to study_sessions for real-time activity tracking
    const sessionsChannel = supabase
      .channel('friend-sessions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_sessions',
        },
        (payload) => {
          // Update weekly study time when friends study
          setFriends(prev => prev.map(friend =>
            friend.id === payload.new.user_id
              ? {
                  ...friend,
                  weekly_study_minutes: friend.weekly_study_minutes + (payload.new.duration_minutes || 0),
                  last_activity_at: payload.new.started_at,
                }
              : friend
          ));
        }
      )
      .subscribe();

    // Subscribe to friendships table for new requests
    const friendshipsChannel = supabase
      .channel('friendships')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
            // New friend request received
            const { data: requester } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', payload.new.requester_id)
              .single();

            if (requester) {
              const newRequest: FriendRequest = {
                id: payload.new.id,
                requester_id: payload.new.requester_id,
                requester_username: requester.username || 'Unknown',
                requester_avatar: requester.avatar_url,
                created_at: payload.new.created_at,
              };
              setPendingRequests(prev => [...prev, newRequest]);
            }
          } else if (payload.eventType === 'UPDATE' && payload.new.status === 'accepted') {
            // Request accepted, remove from pending and reload friends
            setPendingRequests(prev => prev.filter(r => r.id !== payload.new.id));
            fetchFriends();
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(friendshipsChannel);
    };
  }, [userId]);

  return { friends, pendingRequests, loading, error, refetch: () => {} };
}

/**
 * フレンド検索機能
 */
export function useSearchUsers(userId: string | undefined) {
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const search = async (query: string) => {
    if (!userId || !query.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const supabase = createClient();

      // ユーザー名で検索
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', userId)
        .limit(10);

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setResults([]);
        return;
      }

      // 既にフレンドかどうかをチェック
      const { data: existingFriendships } = await supabase
        .from('friendships')
        .select('user_id, friend_id, requester_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      const friendIds = new Set(
        existingFriendships?.flatMap(f => [f.user_id, f.friend_id].filter(id => id !== userId)) || []
      );

      // フレンドではないユーザーのみをフィルター
      const nonFriends = profiles.filter(p => !friendIds.has(p.id));

      // 統計情報を取得
      const userIds = nonFriends.map(p => p.id);

      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('user_id, duration_minutes')
        .in('user_id', userIds);

      const { data: progress } = await supabase
        .from('topic_progress')
        .select('user_id')
        .in('user_id', userIds)
        .eq('test_completed', true);

      const searchResults: UserSearchResult[] = nonFriends.map(profile => {
        const userSessions = sessions?.filter(s => s.user_id === profile.id) || [];
        const userProgress = progress?.filter(p => p.user_id === profile.id) || [];
        const totalMinutes = userSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

        return {
          id: profile.id,
          username: profile.username || 'Unknown',
          avatar_url: profile.avatar_url,
          study_time: totalMinutes,
          completed_topics: userProgress.length,
        };
      });

      setResults(searchResults);
    } catch {
      // Silently fail - user search is optional
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return { results, searching, search };
}

/**
 * フレンドリクエスト操作
 */
export function useFriendActions(userId: string | undefined) {
  const [processing, setProcessing] = useState(false);

  const sendRequest = async (friendId: string) => {
    if (!userId) return { success: false, error: 'Not authenticated' };

    setProcessing(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: userId,
          friend_id: friendId,
          requester_id: userId,
          status: 'pending',
        });

      if (error) throw error;

      return { success: true };
    } catch (err) {
      // Silently fail - friend requests are optional
      return { success: false, error: (err as Error).message };
    } finally {
      setProcessing(false);
    }
  };

  const acceptRequest = async (friendshipId: string) => {
    setProcessing(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      // Check for new achievements after adding a friend
      if (userId) {
        await triggerAchievementCheckAfterFriendAdd(userId).catch((error) => {
          console.error('Failed to check achievements after friend add:', error);
        });
      }

      return { success: true };
    } catch (err) {
      // Silently fail - accepting requests is optional
      return { success: false, error: (err as Error).message };
    } finally {
      setProcessing(false);
    }
  };

  const rejectRequest = async (friendshipId: string) => {
    setProcessing(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', friendshipId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      // Silently fail - rejecting requests is optional
      return { success: false, error: (err as Error).message };
    } finally {
      setProcessing(false);
    }
  };

  const removeFriend = async (friendshipId: string) => {
    setProcessing(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      // Silently fail - removing friends is optional
      return { success: false, error: (err as Error).message };
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  };
}

/**
 * フレンドのアクティビティをリアルタイムで追跡
 */
export function useFriendActivities(userId: string | undefined) {
  const [activities, setActivities] = useState<FriendActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchActivities() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Get friend IDs
        const { data: friendships } = await supabase
          .from('friendships')
          .select('user_id, friend_id')
          .eq('status', 'accepted')
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

        const friendIds = friendships?.map(f =>
          f.user_id === userId ? f.friend_id : f.user_id
        ) || [];

        if (friendIds.length === 0) {
          setActivities([]);
          setLoading(false);
          return;
        }

        // Get recent completed topics (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const { data: completedTopics } = await supabase
          .from('topic_progress')
          .select('user_id, topic_id, test_completed, updated_at')
          .in('user_id', friendIds)
          .eq('test_completed', true)
          .gte('updated_at', yesterday.toISOString())
          .order('updated_at', { ascending: false })
          .limit(20);

        // Get friend profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', friendIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || []);

        // Convert to activities
        const recentActivities: FriendActivity[] = completedTopics?.map(topic => ({
          id: `${topic.user_id}-${topic.topic_id}-${topic.updated_at}`,
          friend_id: topic.user_id,
          friend_username: profileMap.get(topic.user_id) || 'Unknown',
          activity_type: 'topic_completed' as const,
          topic_id: topic.topic_id,
          topic_title: topic.topic_id, // Will be resolved in component
          created_at: topic.updated_at,
        })) || [];

        setActivities(recentActivities);
      } catch (error) {
        console.error('Error fetching friend activities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();

    // Set up real-time subscription for new activities
    const supabase = createClient();
    const channel = supabase
      .channel('friend-activities')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'topic_progress',
        },
        async (payload) => {
          if (payload.new.test_completed && !payload.old?.test_completed) {
            // Get friend username
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', payload.new.user_id)
              .single();

            if (profile) {
              const newActivity: FriendActivity = {
                id: `${payload.new.user_id}-${payload.new.topic_id}-${new Date().toISOString()}`,
                friend_id: payload.new.user_id,
                friend_username: profile.username || 'Unknown',
                activity_type: 'topic_completed',
                topic_id: payload.new.topic_id,
                topic_title: payload.new.topic_id,
                created_at: new Date().toISOString(),
              };

              setActivities(prev => [newActivity, ...prev].slice(0, 20));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { activities, loading };
}
