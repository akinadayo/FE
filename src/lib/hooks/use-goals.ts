'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getSyllabusData } from '@/lib/syllabus';

export interface GoalAchievement {
  title: string;
  type: 'weekly' | 'monthly';
  achieved_at: string;
}

export interface Goals {
  weeklyProgress: number;
  monthlyProgress: number;
  achievements: GoalAchievement[];
}

export interface ProgressPrediction {
  daysUntilExam: number;
  totalTopics: number;
  completedTopics: number;
  recommendedDailyMinutes: number;
  isOnTrack: boolean;
}

/**
 * 学習目標を管理するフック
 */
export function useGoals(userId: string | undefined) {
  const [goals, setGoals] = useState<Goals | null>(null);
  const [loading, setLoading] = useState(true);
  const [examDate, setExamDateState] = useState<Date | null>(null);
  const [weeklyGoal, setWeeklyGoalState] = useState<number | null>(null);
  const [monthlyGoal, setMonthlyGoalState] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<ProgressPrediction | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchGoals() {
      try {
        setLoading(true);
        const supabase = createClient();

        // Get user profile to fetch goals
        const { data: profile } = await supabase
          .from('profiles')
          .select('exam_date, weekly_goal_minutes, monthly_goal_minutes')
          .eq('id', userId)
          .single();

        if (profile) {
          if (profile.exam_date) {
            setExamDateState(new Date(profile.exam_date));
          }
          setWeeklyGoalState(profile.weekly_goal_minutes);
          setMonthlyGoalState(profile.monthly_goal_minutes);
        }

        // Get weekly progress (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data: weeklySessions } = await supabase
          .from('study_sessions')
          .select('duration_minutes')
          .eq('user_id', userId)
          .gte('started_at', weekAgo.toISOString());

        const weeklyProgress = weeklySessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;

        // Get monthly progress
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const { data: monthlySessions } = await supabase
          .from('study_sessions')
          .select('duration_minutes')
          .eq('user_id', userId)
          .gte('started_at', monthAgo.toISOString());

        const monthlyProgress = monthlySessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;

        // Get achievements (mock for now - would be stored in DB)
        const achievements: GoalAchievement[] = [];

        // Check if weekly goal was achieved
        if (profile?.weekly_goal_minutes && weeklyProgress >= profile.weekly_goal_minutes) {
          achievements.push({
            title: `週間目標 ${Math.floor(profile.weekly_goal_minutes / 60)}時間 達成`,
            type: 'weekly',
            achieved_at: new Date().toISOString(),
          });
        }

        // Check if monthly goal was achieved
        if (profile?.monthly_goal_minutes && monthlyProgress >= profile.monthly_goal_minutes) {
          achievements.push({
            title: `月間目標 ${Math.floor(profile.monthly_goal_minutes / 60)}時間 達成`,
            type: 'monthly',
            achieved_at: new Date().toISOString(),
          });
        }

        setGoals({
          weeklyProgress,
          monthlyProgress,
          achievements,
        });

        // Calculate prediction if exam date is set
        if (profile?.exam_date) {
          const syllabusData = getSyllabusData();
          let totalTopics = 0;

          syllabusData.大分類.forEach(cat => {
            cat.中分類.forEach(mid => {
              mid.小分類.forEach(sub => {
                totalTopics += sub.トピック.length;
              });
            });
          });

          // Get completed topics
          const { data: progress } = await supabase
            .from('topic_progress')
            .select('topic_id, test_completed')
            .eq('user_id', userId)
            .eq('test_completed', true);

          const completedTopics = progress?.length || 0;
          const remainingTopics = totalTopics - completedTopics;

          const examDateTime = new Date(profile.exam_date).getTime();
          const now = new Date().getTime();
          const daysUntilExam = Math.max(0, Math.ceil((examDateTime - now) / (1000 * 60 * 60 * 24)));

          // Calculate recommended daily study time
          // Assume each topic takes 30 minutes on average
          const minutesPerTopic = 30;
          const totalMinutesNeeded = remainingTopics * minutesPerTopic;
          const recommendedDailyMinutes = daysUntilExam > 0
            ? Math.ceil(totalMinutesNeeded / daysUntilExam)
            : 0;

          // Check if user is on track
          // Get average daily study time over the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: recentSessions } = await supabase
            .from('study_sessions')
            .select('duration_minutes')
            .eq('user_id', userId)
            .gte('started_at', thirtyDaysAgo.toISOString());

          const totalRecentMinutes = recentSessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
          const averageDailyMinutes = totalRecentMinutes / 30;

          const isOnTrack = averageDailyMinutes >= recommendedDailyMinutes;

          setPrediction({
            daysUntilExam,
            totalTopics,
            completedTopics,
            recommendedDailyMinutes,
            isOnTrack,
          });
        }

      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGoals();
  }, [userId]);

  const setExamDate = async (date: Date) => {
    if (!userId) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ exam_date: date.toISOString() })
        .eq('id', userId);

      if (error) throw error;
      setExamDateState(date);

      // Trigger notification
      await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: 'goal_set',
        p_title: '試験日を設定しました',
        p_message: `試験日: ${date.toLocaleDateString('ja-JP')}`,
      }).catch(() => {
        // Silently fail if notification creation fails
      });
    } catch (error) {
      console.error('Error setting exam date:', error);
    }
  };

  const setWeeklyGoal = async (minutes: number) => {
    if (!userId) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ weekly_goal_minutes: minutes })
        .eq('id', userId);

      if (error) throw error;
      setWeeklyGoalState(minutes);

      // Trigger notification
      await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: 'goal_set',
        p_title: '週間目標を設定しました',
        p_message: `目標: ${Math.floor(minutes / 60)}時間${minutes % 60}分`,
      }).catch(() => {
        // Silently fail if notification creation fails
      });
    } catch (error) {
      console.error('Error setting weekly goal:', error);
    }
  };

  const setMonthlyGoal = async (minutes: number) => {
    if (!userId) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ monthly_goal_minutes: minutes })
        .eq('id', userId);

      if (error) throw error;
      setMonthlyGoalState(minutes);

      // Trigger notification
      await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: 'goal_set',
        p_title: '月間目標を設定しました',
        p_message: `目標: ${Math.floor(minutes / 60)}時間${minutes % 60}分`,
      }).catch(() => {
        // Silently fail if notification creation fails
      });
    } catch (error) {
      console.error('Error setting monthly goal:', error);
    }
  };

  return {
    goals,
    loading,
    examDate,
    setExamDate,
    weeklyGoal,
    setWeeklyGoal,
    monthlyGoal,
    setMonthlyGoal,
    prediction,
  };
}
