-- Create assessment_progress table to track assessment status
CREATE TABLE IF NOT EXISTS assessment_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  assessment_type VARCHAR(50) NOT NULL, -- 'comprehensive', 'quick', 'knowledge'
  status VARCHAR(20) NOT NULL DEFAULT 'started', -- 'started', 'assessed', 'completed'
  signs_symptoms_collected BOOLEAN DEFAULT FALSE,
  abilities_collected BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assessed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_assessment_progress_user_id ON assessment_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_progress_conversation_id ON assessment_progress(conversation_id);
CREATE INDEX IF NOT EXISTS idx_assessment_progress_status ON assessment_progress(status);

-- Add unique constraint for active assessment per user per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_assessment 
  ON assessment_progress(user_id, assessment_type) 
  WHERE status != 'completed';
