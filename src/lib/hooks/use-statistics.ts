'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DailyStudyTime {
  date: string;
  hours: number;
  minutes: number;
  totalMinutes: number;
}

interface WeeklyAccuracy {
  week: string;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
}

interface CategoryMastery {
  category: string;
  categoryId: string;
  completedTopics: number;
  totalTopics: number;
  averageScore: number;
  mastery: number; // 0-100
}

interface StatisticsData {
  dailyStudyTime: DailyStudyTime[];
  weeklyAccuracy: WeeklyAccuracy[];
  categoryMastery: CategoryMastery[];
  totalStudyMinutes: number;
  averageDailyMinutes: number;
  currentStreak: number;
  totalCompletedTopics: number;
}

/**
 * ユーザーの学習統計データを取得するフック
 */
export function useStatistics(userId: string | undefined, period: 'week' | 'month' | 'year' = 'month') {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchStatistics() {
      try {
        setLoading(true);
        const supabase = createClient();

        // 期間を計算
        const now = new Date();
        const daysToFetch = period === 'week' ? 7 : period === 'month' ? 30 : 365;
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - daysToFetch);

        // 1. 日別学習時間を取得
        const { data: sessions, error: sessionsError } = await supabase
          .from('study_sessions')
          .select('started_at, ended_at, duration_minutes')
          .eq('user_id', userId)
          .gte('started_at', startDate.toISOString())
          .order('started_at', { ascending: true });

        if (sessionsError) throw sessionsError;

        // 日別に集計
        const dailyMap = new Map<string, number>();
        sessions?.forEach(session => {
          const date = new Date(session.started_at).toISOString().split('T')[0];
          const minutes = session.duration_minutes || 0;
          dailyMap.set(date, (dailyMap.get(date) || 0) + minutes);
        });

        const dailyStudyTime: DailyStudyTime[] = Array.from(dailyMap.entries()).map(([date, totalMinutes]) => ({
          date,
          hours: Math.floor(totalMinutes / 60),
          minutes: totalMinutes % 60,
          totalMinutes,
        }));

        // 2. 週別正解率を取得
        const { data: testResults, error: testsError } = await supabase
          .from('test_results')
          .select('created_at, score, total_questions, correct_count')
          .eq('user_id', userId)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true });

        if (testsError) throw testsError;

        // 週別に集計
        const weeklyMap = new Map<number, { total: number; correct: number; count: number }>();
        testResults?.forEach(result => {
          const date = new Date(result.created_at);
          const weekNumber = getWeekNumber(date);
          const existing = weeklyMap.get(weekNumber) || { total: 0, correct: 0, count: 0 };
          weeklyMap.set(weekNumber, {
            total: existing.total + (result.total_questions || 0),
            correct: existing.correct + (result.correct_count || 0),
            count: existing.count + 1,
          });
        });

        const weeklyAccuracy: WeeklyAccuracy[] = Array.from(weeklyMap.entries())
          .map(([weekNum, stats]) => ({
            week: `W${weekNum}`,
            accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
            totalQuestions: stats.total,
            correctAnswers: stats.correct,
          }))
          .slice(-8); // 直近8週間

        // 3. 分野別習熟度を取得
        const { data: progressData, error: progressError } = await supabase
          .from('topic_progress')
          .select('topic_id, test_score, explanation_completed, flashcard_completed, test_completed')
          .eq('user_id', userId);

        if (progressError) throw progressError;

        // 分野別に集計
        const categoryStats = new Map<string, {
          completed: number;
          total: number;
          totalScore: number;
          scoreCount: number;
        }>();

        // fe_syllabus.jsonから全トピック数を取得
        const syllabusResponse = await fetch('/data/syllabus.json');
        const syllabusData = await syllabusResponse.json();

        // 各分野の総トピック数を計算
        const categoryCounts: Record<string, number> = {};
        interface Topic {
          id: string;
          タイトル: string;
        }
        interface SmallCategory {
          id: string;
          名称: string;
          トピック?: Topic[];
        }
        interface MidCategory {
          id: string;
          名称: string;
          小分類?: SmallCategory[];
        }
        interface Category {
          id: string;
          名称: string;
          中分類?: MidCategory[];
        }
        interface SyllabusData {
          大分類: Category[];
        }

        (syllabusData as SyllabusData).大分類.forEach((cat) => {
          let count = 0;
          cat.中分類?.forEach((mid) => {
            mid.小分類?.forEach((small) => {
              count += small.トピック?.length || 0;
            });
          });
          categoryCounts[cat.id] = count;
        });

        progressData?.forEach(progress => {
          const categoryId = progress.topic_id.split('-')[0]; // 'tech-1-1-1' -> 'tech'
          const existing = categoryStats.get(categoryId) || {
            completed: 0,
            total: categoryCounts[categoryId] || 0,
            totalScore: 0,
            scoreCount: 0,
          };

          if (progress.test_completed) {
            existing.completed++;
          }

          if (progress.test_score !== null) {
            existing.totalScore += progress.test_score;
            existing.scoreCount++;
          }

          categoryStats.set(categoryId, existing);
        });

        const categoryNames: Record<string, string> = {
          'tech': 'テクノロジ系',
          'management': 'マネジメント系',
          'strategy': 'ストラテジ系',
        };

        const categoryMastery: CategoryMastery[] = Array.from(categoryStats.entries()).map(([id, stats]) => {
          const averageScore = stats.scoreCount > 0 ? stats.totalScore / stats.scoreCount : 0;
          const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
          // 習熟度 = (完了率 * 0.6) + (平均スコア * 0.4)
          const mastery = Math.round(completionRate * 0.6 + averageScore * 0.4);

          return {
            category: categoryNames[id] || id,
            categoryId: id,
            completedTopics: stats.completed,
            totalTopics: stats.total,
            averageScore: Math.round(averageScore),
            mastery,
          };
        });

        // 4. その他の統計
        const totalStudyMinutes = dailyStudyTime.reduce((sum, day) => sum + day.totalMinutes, 0);
        const averageDailyMinutes = dailyStudyTime.length > 0
          ? Math.round(totalStudyMinutes / daysToFetch)
          : 0;

        const totalCompletedTopics = categoryMastery.reduce((sum, cat) => sum + cat.completedTopics, 0);

        // 連続学習日数を計算
        const currentStreak = calculateStreak(dailyStudyTime);

        setData({
          dailyStudyTime,
          weeklyAccuracy,
          categoryMastery,
          totalStudyMinutes,
          averageDailyMinutes,
          currentStreak,
          totalCompletedTopics,
        });

      } catch (err) {
        // Silently fail - statistics feature is optional
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatistics();
  }, [userId, period]);

  return { data, loading, error };
}

/**
 * 週番号を取得
 */
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * 連続学習日数を計算
 */
function calculateStreak(dailyData: DailyStudyTime[]): number {
  if (dailyData.length === 0) return 0;

  // 日付でソート（新しい順）
  const sorted = [...dailyData].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const studyDate = new Date(sorted[i].date);
    studyDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - streak);

    if (studyDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
