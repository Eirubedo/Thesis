// Aski Variable State Tracking System
// Ensures no variable is asked twice once captured

import { Database } from "@/types/database"

// Phase definitions matching the Aski prompt
export const ASKI_PHASES = {
  ORIENTATION: "orientation",
  INTERAKSI: "interaksi",
  SCREENING: "screening",
  CSSRS: "cssrs",
  INSIGHT: "insight",
  CLOSING: "closing",
} as const

// Variable schema matching the Aski prompt
export const ASKI_VARIABLES = {
  // Phase 1: Demographics & Consent
  consent: { phase: "orientation", type: "boolean" },
  nama_pasien: { phase: "orientation", type: "string" },
  informed_consent: { phase: "orientation", type: "boolean" },
  usia: { phase: "orientation", type: "number" },
  tanggal_lahir: { phase: "orientation", type: "string" },
  jenis_kelamin: { phase: "orientation", type: "string" },
  pendidikan: { phase: "orientation", type: "string" },
  pekerjaan: { phase: "orientation", type: "string" },

  // Phase 2: Initial Complaint
  keluhan: { phase: "interaksi", type: "string" },
  penyakit_fisik: { phase: "interaksi", type: "string" },
  upaya_pengobatan: { phase: "interaksi", type: "string" },
  perubahan: { phase: "interaksi", type: "string" },

  // Phase 3: Clinical Screening - Biological
  tidur: { phase: "screening", type: "string", domain: "biological" },
  nafsu_makan: { phase: "screening", type: "string", domain: "biological" },
  sakit_kepala: { phase: "screening", type: "string", domain: "biological" },
  cemas: { phase: "screening", type: "string", domain: "biological" },
  gemetar: { phase: "screening", type: "string", domain: "biological" },
  gangguan_perut: { phase: "screening", type: "string", domain: "biological" },
  mudah_lelah: { phase: "screening", type: "string", domain: "biological" },

  // Phase 3: Clinical Screening - Psychological
  anhedonia: { phase: "screening", type: "string", domain: "psychological" },
  menangis: { phase: "screening", type: "string", domain: "psychological" },
  menikmati_aktivitas: { phase: "screening", type: "string", domain: "psychological" },
  hilang_minat: { phase: "screening", type: "string", domain: "psychological" },
  tidak_berharga: { phase: "screening", type: "string", domain: "psychological" },
  aktivitas_terbengkalai: { phase: "screening", type: "string", domain: "psychological" },
  berpikir_jernih: { phase: "screening", type: "string", domain: "psychological" },

  // Phase 3: Body Image & Self-Worth
  pandangan_diri: { phase: "screening", type: "string", domain: "bodyImage" },
  perubahan_tubuh: { phase: "screening", type: "string", domain: "bodyImage" },
  benci_tubuh: { phase: "screening", type: "string", domain: "bodyImage" },
  cemas_penampilan: { phase: "screening", type: "string", domain: "bodyImage" },
  merasa_gagal: { phase: "screening", type: "string", domain: "bodyImage" },
  harapan_ke_depan: { phase: "screening", type: "string", domain: "bodyImage" },
  motivasi: { phase: "screening", type: "string", domain: "bodyImage" },

  // Phase 3: Social & Cultural
  hubungan_pasangan: { phase: "screening", type: "string", domain: "social" },
  hubungan_orang_tua: { phase: "screening", type: "string", domain: "social" },
  hubungan_saudara: { phase: "screening", type: "string", domain: "social" },
  hubungan_teman: { phase: "screening", type: "string", domain: "social" },
  hubungan_tetangga: { phase: "screening", type: "string", domain: "social" },
  kegiatan_sosial: { phase: "screening", type: "string", domain: "social" },
  ibadah: { phase: "screening", type: "string", domain: "social" },
  keyakinan: { phase: "screening", type: "string", domain: "social" },

  // Phase 4: C-SSRS
  harapan_mati: { phase: "cssrs", type: "string" },
  pikiran_bunuhdiri: { phase: "cssrs", type: "string" },
  C_SSRS_Q3_method: { phase: "cssrs", type: "string", conditional: true },
  C_SSRS_Q4_intent: { phase: "cssrs", type: "string", conditional: true },
  C_SSRS_Q5_plan_intent: { phase: "cssrs", type: "string", conditional: true },
  C_SSRS_Q6_attempt: { phase: "cssrs", type: "string", conditional: true },
  C_SSRS_Q6_timeline: { phase: "cssrs", type: "string", conditional: true },
} as const

export type AskiVariable = keyof typeof ASKI_VARIABLES

// Variable state tracking
export interface AskiVariableState {
  user_id: string
  phase: string
  captured_variables: Record<AskiVariable, any>
  unanswered_variables: AskiVariable[]
  current_variable: AskiVariable | null
  assessment_conversation_id: string
  created_at: string
  updated_at: string
}

/**
 * Get all unanswered variables for the current phase
 */
export function getUnansweredVariables(
  phase: string,
  capturedVars: Record<AskiVariable, any> = {},
): AskiVariable[] {
  return (Object.keys(ASKI_VARIABLES) as AskiVariable[]).filter((varKey) => {
    const varDef = ASKI_VARIABLES[varKey]
    // Only include variables from current phase that haven't been captured
    return varDef.phase === phase && !capturedVars[varKey]
  })
}

/**
 * Get next unanswered variable for the current phase
 */
export function getNextVariable(
  phase: string,
  capturedVars: Record<AskiVariable, any> = {},
): AskiVariable | null {
  const unanswered = getUnansweredVariables(phase, capturedVars)
  return unanswered.length > 0 ? unanswered[0] : null
}

/**
 * Check if a variable should be asked (based on conditional logic)
 */
export function shouldAskVariable(varKey: AskiVariable, capturedVars: Record<AskiVariable, any>): boolean {
  const varDef = ASKI_VARIABLES[varKey]

  // Check if already captured
  if (capturedVars[varKey]) return false

  // Check conditional dependencies
  if (varDef.conditional) {
    switch (varKey) {
      case "C_SSRS_Q3_method":
      case "C_SSRS_Q4_intent":
      case "C_SSRS_Q5_plan_intent":
      case "C_SSRS_Q6_attempt":
      case "C_SSRS_Q6_timeline":
        // Only ask these if pikiran_bunuhdiri is YES
        return capturedVars.pikiran_bunuhdiri === "ya" || capturedVars.pikiran_bunuhdiri === "iya"
    }
  }

  return true
}

/**
 * Mark a variable as captured
 */
export function captureVariable(
  varKey: AskiVariable,
  value: any,
  capturedVars: Record<AskiVariable, any>,
): Record<AskiVariable, any> {
  return {
    ...capturedVars,
    [varKey]: value,
  }
}

/**
 * Get progress percentage for current phase
 */
export function getPhaseProgress(
  phase: string,
  capturedVars: Record<AskiVariable, any> = {},
): { completed: number; total: number; percentage: number } {
  const phaseVars = (Object.keys(ASKI_VARIABLES) as AskiVariable[]).filter(
    (varKey) => ASKI_VARIABLES[varKey].phase === phase,
  )

  const completed = phaseVars.filter((varKey) => capturedVars[varKey]).length
  const total = phaseVars.length

  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

/**
 * Check if all variables in a phase are captured
 */
export function isPhaseComplete(
  phase: string,
  capturedVars: Record<AskiVariable, any> = {},
): boolean {
  const progress = getPhaseProgress(phase, capturedVars)
  return progress.completed === progress.total
}
