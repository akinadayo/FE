"use client";

import { createClient } from '@/lib/supabase/client';

export function useTopicActions(userId: string | undefined) {
  const supabase = createClient();

  // Mark explanation as completed
  const markExplanationCompleted = async (topicId: string) => {
    if (!userId) {
      console.log('No userId - skipping explanation completion');
      return;
    }

    try {
      console.log('Marking explanation as completed for topic:', topicId);

      // First, try to get existing progress
      const { data: existing, error: selectError } = await supabase
        .from('topic_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error fetching existing progress:', selectError);
        throw selectError;
      }

      if (existing) {
        console.log('Updating existing progress record:', existing.id);
        // Update existing record
        const { error: updateError } = await supabase
          .from('topic_progress')
          .update({
            explanation_completed: true,
            explanation_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error updating progress:', updateError);
          throw updateError;
        }
        console.log('Successfully updated progress');
      } else {
        console.log('Creating new progress record');
        // Create new record
        const { error: insertError } = await supabase.from('topic_progress').insert({
          user_id: userId,
          topic_id: topicId,
          explanation_completed: true,
          explanation_completed_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Error inserting progress:', insertError);
          throw insertError;
        }
        console.log('Successfully created progress record');
      }
    } catch (error) {
      console.error('Error marking explanation as completed:', error);
      throw error;
    }
  };

  // Mark flashcard as completed
  const markFlashcardCompleted = async (topicId: string) => {
    if (!userId) return;

    try {
      const { data: existing } = await supabase
        .from('topic_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .single();

      if (existing) {
        await supabase
          .from('topic_progress')
          .update({
            flashcard_completed: true,
            flashcard_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('topic_progress').insert({
          user_id: userId,
          topic_id: topicId,
          flashcard_completed: true,
          flashcard_completed_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error marking flashcard as completed:', error);
    }
  };

  // Save test score
  const saveTestScore = async (topicId: string, score: number, totalQuestions: number, correctAnswers: number) => {
    if (!userId) return;

    try {
      // Save to test_results
      await supabase.from('test_results').insert({
        user_id: userId,
        topic_id: topicId,
        test_type: 'initial',
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        time_spent_seconds: 0,
        answers: { questions: [] },
        incorrect_subtopics: [],
      });

      // Update topic_progress
      const { data: existing } = await supabase
        .from('topic_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .single();

      // Calculate best score
      const bestScore = existing?.best_score
        ? Math.max(existing.best_score, score)
        : score;

      // Calculate average score
      const totalTests = (existing?.total_tests_taken || 0) + 1;
      const previousTotal = (existing?.average_score || 0) * (existing?.total_tests_taken || 0);
      const averageScore = (previousTotal + score) / totalTests;

      if (existing) {
        await supabase
          .from('topic_progress')
          .update({
            latest_score: score,
            best_score: bestScore,
            average_score: averageScore,
            total_tests_taken: totalTests,
            test_completed: score >= 70,
            test_completed_at: score >= 70 ? new Date().toISOString() : existing.test_completed_at,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('topic_progress').insert({
          user_id: userId,
          topic_id: topicId,
          latest_score: score,
          best_score: score,
          average_score: score,
          total_tests_taken: 1,
          test_completed: score >= 70,
          test_completed_at: score >= 70 ? new Date().toISOString() : null,
        });
      }
    } catch (error) {
      console.error('Error saving test score:', error);
    }
  };

  return {
    markExplanationCompleted,
    markFlashcardCompleted,
    saveTestScore,
  };
}
