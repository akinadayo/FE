-- Add UPDATE policy for study_sessions table
-- This allows users to update their own study sessions (needed for endSession)
CREATE POLICY "Users can update own sessions"
  ON study_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
