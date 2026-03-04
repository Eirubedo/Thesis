-- Migration: Add missing Monev variables
-- 1. Add pola_makan to full_assessments (static context variable from initial assessment)
ALTER TABLE public.full_assessments
  ADD COLUMN IF NOT EXISTS pola_makan text;

-- 2. Create monev_sessions table for runtime session-level variables
--    These are collected during each Monev conversation and are scoped per session.
CREATE TABLE IF NOT EXISTS public.monev_sessions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id       uuid REFERENCES public.conversations(id) ON DELETE SET NULL,

  -- GREETING phase variables
  kabar_terkini         text,          -- How the user feels right now
  perkembangan_keluhan  text,          -- Progress of main complaint since last session

  -- SELECTION phase variables
  diagnosis_pilihan     character varying,  -- Primary diagnosis chosen for this session
  diagnosis_queue       jsonb,              -- Full list of diagnoses to evaluate (array)

  -- PLANNING phase variables (aggregated result after all diagnosis loops)
  prioritas_diagnosis   character varying,
  kemampuan_baru_dipilih text,
  rencana_mulai         text,
  kendala_diperkirakan  text,
  solusi_kendala        text,
  komitmen              character varying,

  -- CLOSING phase variables
  kesimpulan_dipahami   character varying,  -- Whether user confirmed the session summary
  kesediaan_kembali     character varying,  -- Whether user will return for next session

  -- Metadata
  session_status        character varying DEFAULT 'in_progress',  -- in_progress | completed | aborted
  created_at            timestamp with time zone DEFAULT now(),
  updated_at            timestamp with time zone DEFAULT now()
);

-- Index for fast lookups by user and conversation
CREATE INDEX IF NOT EXISTS monev_sessions_user_id_idx          ON public.monev_sessions (user_id);
CREATE INDEX IF NOT EXISTS monev_sessions_conversation_id_idx  ON public.monev_sessions (conversation_id);

COMMENT ON TABLE  public.monev_sessions                        IS 'Stores runtime variables collected during each Aski Monev (Monitoring & Evaluation) conversation session.';
COMMENT ON COLUMN public.monev_sessions.kabar_terkini          IS 'GREETING phase: how the user is feeling at the start of the session.';
COMMENT ON COLUMN public.monev_sessions.perkembangan_keluhan   IS 'GREETING phase: progress of the main complaint since last session.';
COMMENT ON COLUMN public.monev_sessions.diagnosis_pilihan      IS 'SELECTION phase: primary diagnosis chosen for this session.';
COMMENT ON COLUMN public.monev_sessions.diagnosis_queue        IS 'SELECTION phase: ordered list of all diagnoses to evaluate in this session.';
COMMENT ON COLUMN public.monev_sessions.kesimpulan_dipahami    IS 'PLANNING phase: whether the user confirmed the end-of-session summary.';
COMMENT ON COLUMN public.monev_sessions.kesediaan_kembali      IS 'CLOSING phase: whether the user agreed to return for the next session.';
COMMENT ON COLUMN public.full_assessments.pola_makan           IS 'Dietary habits collected during initial assessment (context variable for Monev prompt).';
