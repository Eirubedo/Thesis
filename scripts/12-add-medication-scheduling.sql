-- Add scheduled_at column to medication_logs to track when medications were scheduled
ALTER TABLE medication_logs
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- Add comment for clarity
COMMENT ON COLUMN medication_logs.scheduled_at IS 'When the medication was scheduled to be taken';

-- Update existing logs to use taken_at as scheduled_at if taken_at exists
UPDATE medication_logs
SET scheduled_at = taken_at
WHERE scheduled_at IS NULL AND taken_at IS NOT NULL;
