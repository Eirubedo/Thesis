-- Create Aski Assessment State Table
-- Tracks which variables have been captured during the assessment
CREATE TABLE IF NOT EXISTS aski_assessment_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  current_phase TEXT NOT NULL DEFAULT 'orientation',
  captured_variables JSONB DEFAULT '{}'::jsonb,
  current_variable TEXT,
  is_high_risk BOOLEAN DEFAULT false,
  safety_acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, conversation_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_aski_assessment_state_user_id ON aski_assessment_state(user_id);
CREATE INDEX IF NOT EXISTS idx_aski_assessment_state_conversation ON aski_assessment_state(conversation_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_aski_assessment_state_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS aski_assessment_state_timestamp ON aski_assessment_state;
CREATE TRIGGER aski_assessment_state_timestamp
  BEFORE UPDATE ON aski_assessment_state
  FOR EACH ROW
  EXECUTE FUNCTION update_aski_assessment_state_timestamp();

-- Enable RLS
ALTER TABLE aski_assessment_state ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own assessment state
CREATE POLICY aski_assessment_state_user_access ON aski_assessment_state
  FOR ALL USING (auth.uid() = user_id);
