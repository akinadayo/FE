"use client";

import { createClient } from '@/lib/supabase/client';

export function useFlashcardReview(userId: string | undefined) {
  const supabase = createClient();

  const saveReview = async (
    flashcardId: string,
    topicId: string,
    confidence: number
  ) => {
    if (!userId) return;

    try {
      // Calculate interval and easiness factor based on confidence
      // Simplified spaced repetition algorithm
      let intervalDays = 1;
      let easinessFactor = 2.5;

      switch (confidence) {
        case 1: // わからない
          intervalDays = 1;
          easinessFactor = 1.3;
          break;
        case 2: // 微妙
          intervalDays = 1;
          easinessFactor = 1.8;
          break;
        case 3: // 理解した
          intervalDays = 3;
          easinessFactor = 2.5;
          break;
        case 4: // 完璧
          intervalDays = 7;
          easinessFactor = 2.8;
          break;
      }

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

      await supabase.from('flashcard_reviews').insert({
        user_id: userId,
        topic_id: topicId,
        flashcard_id: flashcardId,
        confidence_level: confidence,
        interval_days: intervalDays,
        easiness_factor: easinessFactor,
        next_review_date: nextReviewDate.toISOString(),
      });
    } catch (error) {
      console.error('Error saving flashcard review:', error);
    }
  };

  return {
    saveReview,
  };
}
