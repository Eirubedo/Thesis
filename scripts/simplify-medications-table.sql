-- Update medications table to remove frequency and duration fields
ALTER TABLE medications 
DROP COLUMN IF EXISTS frequency,
DROP COLUMN IF EXISTS start_date,
DROP COLUMN IF EXISTS end_date,
DROP COLUMN IF EXISTS duration_type,
DROP COLUMN IF EXISTS duration_value;

-- Update the notes column to store schedule times as JSON
-- The notes field will now store: {"times": ["08:00", "20:00"], "notes": "Take with food"}
