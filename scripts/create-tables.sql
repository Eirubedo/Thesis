-- Create users table for authentication and basic profile
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  birth_date DATE,
  address TEXT,
  postal_code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hypertension_profiles table for hypertension-specific data
CREATE TABLE IF NOT EXISTS hypertension_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medical_history TEXT,
  risk_factors TEXT[],
  family_history BOOLEAN DEFAULT FALSE,
  smoking_status VARCHAR(20) CHECK (smoking_status IN ('never', 'former', 'current')),
  alcohol_consumption VARCHAR(20) CHECK (alcohol_consumption IN ('none', 'light', 'moderate', 'heavy')),
  exercise_frequency VARCHAR(20) CHECK (exercise_frequency IN ('none', 'rare', 'weekly', 'daily')),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medications table for tracking hypertension medications
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(50),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bp_readings table for blood pressure tracking
CREATE TABLE IF NOT EXISTS bp_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  systolic INTEGER NOT NULL CHECK (systolic BETWEEN 70 AND 300),
  diastolic INTEGER NOT NULL CHECK (diastolic BETWEEN 40 AND 200),
  heart_rate INTEGER CHECK (heart_rate BETWEEN 40 AND 200),
  measurement_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  category VARCHAR(20) CHECK (category IN ('normal', 'elevated', 'stage1', 'stage2', 'crisis')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medication_logs table for tracking medication adherence
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
  was_taken BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_bp_readings_user_date ON bp_readings(user_id, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_medications_user_active ON medications(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_date ON medication_logs(user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_hypertension_profiles_user ON hypertension_profiles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hypertension_profiles_updated_at BEFORE UPDATE ON hypertension_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
