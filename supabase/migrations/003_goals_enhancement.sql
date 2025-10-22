-- ============================================================================
-- Goals Enhancement Migration
-- Add weekly and monthly goal tracking to profiles
-- ============================================================================

-- Add weekly and monthly goal columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS weekly_goal_minutes INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS monthly_goal_minutes INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS exam_date DATE DEFAULT NULL;

-- Create an index for faster queries on exam_date
CREATE INDEX IF NOT EXISTS idx_profiles_exam_date ON profiles(exam_date);

-- Add comments for clarity
COMMENT ON COLUMN profiles.weekly_goal_minutes IS '週間学習時間目標（分）';
COMMENT ON COLUMN profiles.monthly_goal_minutes IS '月間学習時間目標（分）';
COMMENT ON COLUMN profiles.exam_date IS '試験日 (target_exam_dateと同じ用途)';
