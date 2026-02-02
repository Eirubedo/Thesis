-- Create comprehensive assessment table for "Asesmen Lengkap"
-- This table stores all patient assessment data for the Dify psychiatric nursing assistant

CREATE TABLE IF NOT EXISTS public.full_assessments (
  -- Primary keys and references
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  
  -- Patient Profile (already in users table, but stored here for historical record)
  nama_pasien VARCHAR(255),
  usia INTEGER,
  jenis_kelamin VARCHAR(50),
  tanggal_lahir DATE,
  pendidikan VARCHAR(100),
  pekerjaan VARCHAR(100),
  
  -- Clinical History
  keluhan TEXT, -- Main complaint
  penyakit_fisik TEXT, -- Physical illnesses
  upaya_pengobatan TEXT, -- Treatment efforts
  perubahan TEXT, -- Changes experienced
  
  -- Psychological Symptoms
  tidur VARCHAR(50), -- Sleep issues (Poor, Fair, Good)
  nafsu_makan VARCHAR(50), -- Appetite (Poor, Fair, Good)
  sakit_kepala VARCHAR(50), -- Headache (None, Mild, Moderate, Severe)
  cemas VARCHAR(50), -- Anxiety level (Low, Moderate, High)
  gemetar VARCHAR(50), -- Trembling (None, Sometimes, Often)
  gangguan_perut VARCHAR(50), -- Stomach issues (None, Sometimes, Often)
  mudah_lelah VARCHAR(50), -- Fatigue (None, Sometimes, Often)
  
  -- Emotional State
  anhedonia VARCHAR(50), -- Loss of pleasure (Yes, No, Sometimes)
  menangis VARCHAR(50), -- Crying (Never, Sometimes, Often)
  menikmati_aktivitas VARCHAR(50), -- Enjoying activities (Yes, No, Sometimes)
  hilang_minat VARCHAR(50), -- Loss of interest (Yes, No, Sometimes)
  
  -- Self-Perception
  tidak_berharga VARCHAR(50), -- Feeling worthless (Never, Sometimes, Often)
  merasa_gagal VARCHAR(50), -- Feeling like a failure (Never, Sometimes, Often)
  pandangan_diri TEXT, -- Self-perception
  berpikir_jernih VARCHAR(50), -- Clear thinking (Yes, No, Sometimes)
  
  -- Body Image
  perubahan_tubuh TEXT, -- Body changes
  benci_tubuh VARCHAR(50), -- Body hatred (Never, Sometimes, Often)
  cemas_penampilan VARCHAR(50), -- Appearance anxiety (Low, Moderate, High)
  
  -- Social Relationships
  hubungan_pasangan VARCHAR(50), -- Partner relationship (Good, Fair, Poor, N/A)
  hubungan_orang_tua VARCHAR(50), -- Parent relationship (Good, Fair, Poor, N/A)
  hubungan_saudara VARCHAR(50), -- Sibling relationship (Good, Fair, Poor, N/A)
  hubungan_teman VARCHAR(50), -- Friend relationship (Good, Fair, Poor)
  hubungan_tetangga VARCHAR(50), -- Neighbor relationship (Good, Fair, Poor)
  
  -- Activities & Motivation
  aktivitas_terbengkalai TEXT, -- Neglected activities
  kegiatan_sosial VARCHAR(50), -- Social activities (Active, Moderate, Inactive)
  motivasi VARCHAR(50), -- Motivation level (High, Moderate, Low)
  
  -- Spiritual & Hope
  ibadah VARCHAR(50), -- Worship frequency (Regular, Sometimes, Rarely, Never)
  keyakinan TEXT, -- Beliefs
  harapan_ke_depan TEXT, -- Future hopes
  
  -- Safety Indicators (Critical)
  harapan_mati VARCHAR(50), -- Death wishes (Never, Sometimes, Often)
  pikiran_bunuhdiri VARCHAR(50), -- Suicidal thoughts (Never, Sometimes, Often)
  
  -- Assessment metadata
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assessment_status VARCHAR(50) DEFAULT 'completed', -- draft, in_progress, completed
  assessed_by VARCHAR(100), -- Clinician or system
  notes TEXT, -- Additional clinical notes
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_full_assessments_user_id ON public.full_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_full_assessments_conversation_id ON public.full_assessments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_full_assessments_assessment_date ON public.full_assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_full_assessments_status ON public.full_assessments(assessment_status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_full_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_full_assessments_updated_at
  BEFORE UPDATE ON public.full_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_full_assessments_updated_at();

-- Grant permissions (adjust as needed)
-- ALTER TABLE public.full_assessments ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.full_assessments IS 'Comprehensive psychiatric assessment data for hypertensive patients';
COMMENT ON COLUMN public.full_assessments.keluhan IS 'Main complaint or presenting problem';
COMMENT ON COLUMN public.full_assessments.harapan_mati IS 'Death wishes - CRITICAL safety indicator';
COMMENT ON COLUMN public.full_assessments.pikiran_bunuhdiri IS 'Suicidal ideation - CRITICAL safety indicator';
