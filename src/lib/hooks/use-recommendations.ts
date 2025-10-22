"use client";

import { useState, useEffect } from 'react';
import { getRecommendedTopics, RecommendedTopic } from '@/lib/recommendations';

export function useRecommendations(userId: string | undefined, limit: number = 3) {
  const [recommendations, setRecommendations] = useState<RecommendedTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchRecommendations() {
      setLoading(true);
      try {
        const recs = await getRecommendedTopics(userId, limit);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId, limit]);

  return {
    recommendations,
    loading,
  };
}
