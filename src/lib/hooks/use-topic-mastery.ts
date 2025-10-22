"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { calculateMasteryLevel, calculateTotalCompletions, getMasteryTier } from '@/lib/recommendations';

export interface TopicMastery {
  topicId: string;
  masteryLevel: number; // 0-100
  totalCompletions: number;
  tier: {
    tier: number;
    tierName: string;
    color: string;
    bgColor: string;
    borderColor: string;
  };
  averageScore: number;
  totalTestsTaken: number;
}

export function useTopicMastery(userId: string | undefined, topicId: string | undefined) {
  const [mastery, setMastery] = useState<TopicMastery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !topicId) {
      setLoading(false);
      return;
    }

    async function fetchMastery() {
      setLoading(true);
      try {
        const supabase = createClient();

        const { data: progress, error } = await supabase
          .from('topic_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('topic_id', topicId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (progress) {
          const masteryLevel = calculateMasteryLevel(progress);
          const totalCompletions = calculateTotalCompletions(progress);
          const tier = getMasteryTier(totalCompletions);

          setMastery({
            topicId,
            masteryLevel,
            totalCompletions,
            tier,
            averageScore: progress.average_score || 0,
            totalTestsTaken: progress.total_tests_taken || 0,
          });
        } else {
          // No progress yet
          setMastery({
            topicId,
            masteryLevel: 0,
            totalCompletions: 0,
            tier: getMasteryTier(0),
            averageScore: 0,
            totalTestsTaken: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching topic mastery:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMastery();
  }, [userId, topicId]);

  return {
    mastery,
    loading,
  };
}

/**
 * 複数のトピックの習熟度を一度に取得
 */
export function useTopicsMastery(userId: string | undefined, topicIds: string[]) {
  const [masteryMap, setMasteryMap] = useState<Map<string, TopicMastery>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || topicIds.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchMasteries() {
      setLoading(true);
      try {
        const supabase = createClient();

        const { data: progressList, error } = await supabase
          .from('topic_progress')
          .select('*')
          .eq('user_id', userId)
          .in('topic_id', topicIds);

        if (error) throw error;

        const newMasteryMap = new Map<string, TopicMastery>();

        topicIds.forEach(topicId => {
          const progress = progressList?.find(p => p.topic_id === topicId);

          if (progress) {
            const masteryLevel = calculateMasteryLevel(progress);
            const totalCompletions = calculateTotalCompletions(progress);
            const tier = getMasteryTier(totalCompletions);

            newMasteryMap.set(topicId, {
              topicId,
              masteryLevel,
              totalCompletions,
              tier,
              averageScore: progress.average_score || 0,
              totalTestsTaken: progress.total_tests_taken || 0,
            });
          } else {
            // No progress yet
            newMasteryMap.set(topicId, {
              topicId,
              masteryLevel: 0,
              totalCompletions: 0,
              tier: getMasteryTier(0),
              averageScore: 0,
              totalTestsTaken: 0,
            });
          }
        });

        setMasteryMap(newMasteryMap);
      } catch (error) {
        console.error('Error fetching topics mastery:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMasteries();
  }, [userId, topicIds.join(',')]);

  return {
    masteryMap,
    loading,
  };
}
