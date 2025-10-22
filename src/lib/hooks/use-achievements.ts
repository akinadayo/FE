"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Achievement {
  id: string;
  achievement_key: string;
  name: string;
  description: string;
  icon: string | null;
  category: 'streak' | 'accuracy' | 'completion' | 'social';
  requirement: {
    days?: number;
    score?: number;
    count?: number;
    avg_score?: number;
    topics?: number;
    friends?: number;
  };
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_key: string;
  earned_at: string;
}

export interface AchievementWithProgress extends Achievement {
  earned: boolean;
  earned_at?: string;
  progress: number; // 0-100
  current_value: number;
  target_value: number;
}

export function useAchievements(userId: string | undefined) {
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    earned: number;
    percentage: number;
  }>({ total: 0, earned: 0, percentage: 0 });
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchAchievements() {
      try {
        // Fetch all achievements
        const { data: allAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('category', { ascending: true });

        if (achievementsError) throw achievementsError;

        // Fetch user's earned achievements
        const { data: userAchievements, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId);

        if (userAchievementsError) throw userAchievementsError;

        // Fetch user stats for progress calculation
        const { data: userStats, error: statsError } = await supabase
          .from('user_statistics')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (statsError && statsError.code !== 'PGRST116') throw statsError; // Ignore "no rows" error

        // Fetch study sessions for streak calculation
        const { data: sessions, error: sessionsError } = await supabase
          .from('study_sessions')
          .select('session_date')
          .eq('user_id', userId)
          .order('session_date', { ascending: false });

        if (sessionsError) throw sessionsError;

        // Fetch friend count
        const { data: friendships, error: friendshipsError } = await supabase
          .from('friendships')
          .select('id')
          .eq('status', 'accepted')
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

        if (friendshipsError) throw friendshipsError;

        // Calculate current streak
        const currentStreak = calculateStreak(sessions?.map(s => s.session_date) || []);
        const friendCount = friendships?.length || 0;

        // Map achievements with progress
        const achievementsWithProgress: AchievementWithProgress[] = (allAchievements || []).map((achievement) => {
          const userAchievement = userAchievements?.find(ua => ua.achievement_key === achievement.achievement_key);
          const earned = !!userAchievement;

          let current_value = 0;
          let target_value = 0;
          let progress = 0;

          // Calculate progress based on category and requirement
          if (achievement.category === 'streak' && achievement.requirement.days) {
            current_value = currentStreak;
            target_value = achievement.requirement.days;
            progress = Math.min((current_value / target_value) * 100, 100);
          } else if (achievement.category === 'accuracy' && achievement.requirement.avg_score) {
            current_value = Math.round(userStats?.avg_test_score || 0);
            target_value = achievement.requirement.avg_score;
            progress = Math.min((current_value / target_value) * 100, 100);
          } else if (achievement.category === 'completion' && achievement.requirement.topics) {
            current_value = userStats?.completed_topics || 0;
            target_value = achievement.requirement.topics;
            progress = Math.min((current_value / target_value) * 100, 100);
          } else if (achievement.category === 'social' && achievement.requirement.friends) {
            current_value = friendCount;
            target_value = achievement.requirement.friends;
            progress = Math.min((current_value / target_value) * 100, 100);
          }

          if (earned) {
            progress = 100;
          }

          return {
            ...achievement,
            earned,
            earned_at: userAchievement?.earned_at,
            progress,
            current_value,
            target_value,
          };
        });

        setAchievements(achievementsWithProgress);

        // Calculate stats
        const total = achievementsWithProgress.length;
        const earned = achievementsWithProgress.filter(a => a.earned).length;
        const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
        setStats({ total, earned, percentage });
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAchievements();

    // Subscribe to user achievements changes
    const channel = supabase
      .channel('user_achievements_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchAchievements(); // Refresh on changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { achievements, stats, loading };
}

// Helper function to calculate current streak
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(dates)).sort().reverse();
  const today = new Date().toISOString().split('T')[0];

  let streak = 0;
  const currentDate = new Date(today);

  for (const dateStr of uniqueDates) {
    const date = new Date(dateStr);
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - streak);

    const dateOnly = date.toISOString().split('T')[0];
    const expectedDateOnly = expectedDate.toISOString().split('T')[0];

    if (dateOnly === expectedDateOnly) {
      streak++;
    } else if (streak > 0) {
      break;
    }
  }

  return streak;
}
