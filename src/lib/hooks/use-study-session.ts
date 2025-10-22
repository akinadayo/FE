"use client";

import { useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useStudySession(userId: string | undefined, topicId: string | undefined) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const startTimeRef = useRef<Date | null>(null);
  const supabaseRef = useRef(createClient());

  // Start a new study session
  const startSession = useCallback(async () => {
    if (!userId || !topicId) return;

    setIsActive(prev => {
      if (prev) return prev; // Already active, do nothing
      return true;
    });

    try {
      const now = new Date();
      const { data, error } = await supabaseRef.current
        .from('study_sessions')
        .insert({
          user_id: userId,
          topic_id: topicId,
          session_type: 'explanation',
          session_start_time: now.toISOString(),
          session_end_time: now.toISOString(),
          duration_seconds: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      startTimeRef.current = now;
    } catch (error) {
      // Silently fail - study sessions are optional
      // If the table doesn't exist, we just skip time tracking
      setIsActive(false);
    }
  }, [userId, topicId]);

  // End the current study session
  const endSession = useCallback(async () => {
    setSessionId(prevSessionId => {
      if (!prevSessionId) return null;

      (async () => {
        try {
          const endTime = new Date();
          const startTime = startTimeRef.current || endTime;
          const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

          const { error } = await supabaseRef.current
            .from('study_sessions')
            .update({
              session_end_time: endTime.toISOString(),
              duration_seconds: durationSeconds,
            })
            .eq('id', prevSessionId);

          if (error) throw error;

          setIsActive(false);
          startTimeRef.current = null;
        } catch (error) {
          // Silently fail - study sessions are optional
        }
      })();

      return null;
    });
  }, []);

  return {
    isActive,
    startSession,
    endSession,
  };
}
