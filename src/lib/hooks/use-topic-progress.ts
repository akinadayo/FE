"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TopicProgress } from '@/lib/types';

export function useTopicProgress(userId: string | undefined) {
  const [progressMap, setProgressMap] = useState<Map<string, TopicProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchProgress() {
      try {
        const { data, error } = await supabase
          .from('topic_progress')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        const map = new Map<string, TopicProgress>();
        data?.forEach((progress) => {
          map.set(progress.topic_id, progress);
        });
        setProgressMap(map);
      } catch (error) {
        console.error('Error fetching topic progress:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('topic_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'topic_progress',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const progress = payload.new as TopicProgress;
            setProgressMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(progress.topic_id, progress);
              return newMap;
            });
          } else if (payload.eventType === 'DELETE') {
            const progress = payload.old as TopicProgress;
            setProgressMap((prev) => {
              const newMap = new Map(prev);
              newMap.delete(progress.topic_id);
              return newMap;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const getProgress = (topicId: string): TopicProgress | undefined => {
    return progressMap.get(topicId);
  };

  const getProgressPercentage = (topicId: string): number => {
    const progress = progressMap.get(topicId);
    if (!progress) return 0;

    // Calculate overall progress based on completion flags
    const isCompleted = progress.explanation_completed && progress.flashcard_completed && (progress.best_score || 0) >= 70;
    if (isCompleted) return 100;

    const hasAnyProgress = progress.explanation_completed || progress.flashcard_completed || (progress.best_score || 0) > 0;
    if (!hasAnyProgress) return 0;

    // For 'in_progress', use a weighted average
    const weights = {
      explanation: 0.3,
      flashcard: 0.3,
      test: 0.4,
    };

    return Math.round(
      (progress.explanation_completed ? weights.explanation * 100 : 0) +
      (progress.flashcard_completed ? weights.flashcard * 100 : 0) +
      (progress.best_score || 0) * weights.test
    );
  };

  const isLocked = (topicId: string, previousTopicId?: string): boolean => {
    // First topic is never locked
    if (!previousTopicId) return false;

    // A topic is locked if the previous topic is not completed
    const prevProgress = progressMap.get(previousTopicId);
    if (!prevProgress) return true; // Lock if no progress data

    const isCompleted = prevProgress.explanation_completed && prevProgress.flashcard_completed && (prevProgress.best_score || 0) >= 70;
    return !isCompleted;
  };

  return {
    progressMap,
    loading,
    getProgress,
    getProgressPercentage,
    isLocked,
  };
}
