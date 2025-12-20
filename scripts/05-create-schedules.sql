-- Create activity_schedules table for scheduling self-help activities and reminders
CREATE TABLE IF NOT EXISTS activity_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('breathing', 'exercise', 'diet', 'meditation', 'medication', 'bp_measurement', 'stress_management', 'other')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_time TIME NOT NULL,
  scheduled_days VARCHAR(20)[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  duration_minutes INTEGER DEFAULT 10,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_minutes_before INTEGER DEFAULT 15,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table for tracking completed activities
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES activity_schedules(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_actual_minutes INTEGER,
  notes TEXT,
  mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 5),
  mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table for tracking reminder notifications
CREATE TABLE IF NOT EXISTS activity_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES activity_schedules(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  reminder_time TIME NOT NULL,
  was_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  was_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_schedules_user ON activity_schedules(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON activity_logs(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_reminders_user_date ON activity_reminders(user_id, reminder_date, reminder_time);
CREATE INDEX IF NOT EXISTS idx_activity_reminders_pending ON activity_reminders(was_sent, reminder_date, reminder_time) WHERE NOT was_sent;

-- Create trigger for updated_at on activity_schedules
CREATE TRIGGER update_activity_schedules_updated_at 
  BEFORE UPDATE ON activity_schedules 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
