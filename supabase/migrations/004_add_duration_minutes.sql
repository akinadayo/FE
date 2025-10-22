-- Add duration_minutes column to study_sessions table
ALTER TABLE study_sessions
ADD COLUMN duration_minutes INTEGER GENERATED ALWAYS AS (ROUND(duration_seconds::numeric / 60)) STORED;

-- Create index for better query performance
CREATE INDEX idx_study_sessions_duration_minutes ON study_sessions(duration_minutes);

COMMENT ON COLUMN study_sessions.duration_minutes IS 'Duration in minutes, automatically calculated from duration_seconds';
