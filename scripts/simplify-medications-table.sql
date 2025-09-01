-- Remove columns that are no longer needed from medications table
ALTER TABLE medications 
DROP COLUMN IF EXISTS frequency,
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS end_date,
DROP COLUMN IF EXISTS duration_type,
DROP COLUMN IF EXISTS duration_value;

-- The notes column will now store JSON data with times and notes
-- Example: {"times": ["08:00", "20:00"], "notes": "Take with food"}

-- Update existing medications to have proper JSON structure in notes
UPDATE medications 
SET notes = COALESCE(
  CASE 
    WHEN notes IS NULL OR notes = '' THEN '{"times": [], "notes": ""}'
    ELSE '{"times": [], "notes": "' || notes || '"}'
  END,
  '{"times": [], "notes": ""}'
)
WHERE notes IS NULL OR NOT (notes ~ '^{.*}$');
