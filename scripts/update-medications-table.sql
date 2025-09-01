-- Add duration columns to medications table
ALTER TABLE medications 
ADD COLUMN duration_type VARCHAR(20) CHECK (duration_type IN ('lifelong', 'days', 'weeks', 'months', 'as_needed')),
ADD COLUMN duration_value INTEGER;

-- Update existing medications to have lifelong duration by default
UPDATE medications 
SET duration_type = 'lifelong' 
WHERE duration_type IS NULL;
