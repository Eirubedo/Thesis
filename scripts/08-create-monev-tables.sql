-- Monitoring & Evaluation (Monev) Tables for Symptom and Ability Tracking
-- These tables support the Dify AI chatbot "Aski" to track user progress across multiple diagnoses

-- Table 1: User Diagnoses
-- Tracks which diagnoses (HT, AS, GCT, RBD) a user has been assigned
CREATE TABLE IF NOT EXISTS user_diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  diagnosis_code VARCHAR(10) NOT NULL, -- 'HT', 'AS', 'GCT', 'RBD'
  diagnosis_name VARCHAR(255) NOT NULL, -- 'Hipertensi', 'Ansietas', etc.
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1, -- For multi-diagnosis sequencing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, diagnosis_code)
);

-- Table 2: Symptom Assessments
-- Records which symptoms a user is experiencing at each evaluation session
CREATE TABLE IF NOT EXISTS symptom_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  diagnosis_code VARCHAR(10) NOT NULL,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Store symptoms as JSONB array for flexibility
  -- Example: [{"id": 1, "text": "Sakit kepala atau pusing", "present": true}, ...]
  symptoms_data JSONB NOT NULL,
  
  -- Calculated fields
  total_symptoms INTEGER DEFAULT 0,
  symptoms_present INTEGER DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: Ability Assessments
-- Tracks which abilities a user knows (cognitive) and does (psychomotor)
CREATE TABLE IF NOT EXISTS ability_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  diagnosis_code VARCHAR(10) NOT NULL,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Store abilities as JSONB array for flexibility
  -- Example: [{"id": 1, "text": "Mengenal tanda gejala...", "known": true, "done": true, "frequency": "daily", "benefit": "helpful"}, ...]
  abilities_data JSONB NOT NULL,
  
  -- Calculated fields
  total_abilities INTEGER DEFAULT 0,
  abilities_known INTEGER DEFAULT 0,
  abilities_done INTEGER DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: Ability Practice Details
-- Deep dive into how users are practicing specific abilities
CREATE TABLE IF NOT EXISTS ability_practice_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ability_assessment_id UUID NOT NULL REFERENCES ability_assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  diagnosis_code VARCHAR(10) NOT NULL,
  ability_id INTEGER NOT NULL,
  ability_text TEXT NOT NULL,
  
  -- Practice details from Phase 3 deep dive
  frequency VARCHAR(50), -- 'daily', 'weekly', '3x per week', etc.
  frequency_detail TEXT, -- Free text explanation
  benefit_level VARCHAR(50), -- 'very_helpful', 'somewhat_helpful', 'not_helpful'
  benefit_detail TEXT, -- Free text explanation
  
  -- Barriers and solutions
  barriers TEXT,
  solutions TEXT,
  
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 5: Action Plans
-- Records the new abilities recommended and scheduled in Phase 4
CREATE TABLE IF NOT EXISTS monev_action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  diagnosis_code VARCHAR(10) NOT NULL,
  
  -- The new ability being recommended
  new_ability_id INTEGER NOT NULL,
  new_ability_text TEXT NOT NULL,
  
  -- Scheduling details
  start_date DATE,
  scheduled_time TIME,
  frequency VARCHAR(100), -- 'daily', '3x per week', etc.
  
  -- Problem solving
  anticipated_barriers TEXT,
  proposed_solutions TEXT,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'abandoned'
  completion_rate INTEGER, -- 0-100%
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_diagnoses_user ON user_diagnoses(user_id) WHERE is_active = true;
CREATE INDEX idx_symptom_assessments_user_diagnosis ON symptom_assessments(user_id, diagnosis_code);
CREATE INDEX idx_symptom_assessments_date ON symptom_assessments(assessment_date DESC);
CREATE INDEX idx_ability_assessments_user_diagnosis ON ability_assessments(user_id, diagnosis_code);
CREATE INDEX idx_ability_assessments_date ON ability_assessments(assessment_date DESC);
CREATE INDEX idx_ability_practice_user ON ability_practice_details(user_id, diagnosis_code);
CREATE INDEX idx_action_plans_user ON monev_action_plans(user_id, status);

-- Comments for documentation
COMMENT ON TABLE user_diagnoses IS 'Tracks which nursing diagnoses (HT, AS, GCT, RBD) are assigned to users';
COMMENT ON TABLE symptom_assessments IS 'Records symptom presence for each diagnosis at each evaluation session';
COMMENT ON TABLE ability_assessments IS 'Tracks cognitive (known) and psychomotor (done) ability progress';
COMMENT ON TABLE ability_practice_details IS 'Detailed records of how users practice specific abilities including frequency and benefits';
COMMENT ON TABLE monev_action_plans IS 'Action plans created in Phase 4 with new ability recommendations and scheduling';
