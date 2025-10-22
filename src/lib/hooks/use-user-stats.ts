"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserStatistics } from '@/lib/types';

export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchStats() {
      try {
        // Fetch user statistics
        const { data, error } = await supabase
          .from('user_statistics')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        setStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchTodayMinutes() {
      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        const { data, error } = await supabase
          .from('study_sessions')
          .select('duration_seconds')
          .eq('user_id', userId)
          .eq('session_date', today);

        if (error) throw error;

        // Sum up all session durations for today
        const totalSeconds = data?.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) || 0;
        setTodayMinutes(Math.round(totalSeconds / 60));
      } catch (error) {
        console.error('Error fetching today minutes:', error);
      }
    }

    fetchStats();
    fetchTodayMinutes();

    // Subscribe to realtime updates for study sessions
    const channel = supabase
      .channel('today_study_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchTodayMinutes(); // Refresh today's minutes when a new session is added
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { stats, todayMinutes, loading };
}
