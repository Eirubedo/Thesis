import { useState, useCallback } from "react"
import {
  calculateSymptomCount,
  calculateAbilityGaps,
  getAssessmentSummary,
  recommendNextAbility,
  getDiagnosisAbilities,
  getDiagnosisSymptoms,
  type DiagnosisCode,
} from "@/lib/monev-knowledge-base"

export interface MonevAssessment {
  diagnosis_code: DiagnosisCode
  selected_symptom_ids: string[]
  abilities_known: string[]
  abilities_practiced: string[]
  practice_details: Record<
    string,
    {
      frequency: string
      benefit: string
      challenges: string
    }
  >
}

export interface MonevSummary {
  diagnosis_name: string
  symptom_count: number
  total_symptoms: number
  abilities_known_count: number
  abilities_practiced_count: number
  ability_gaps_count: number
  ability_gaps: string[]
  recovery_percentage: number
  next_recommended_ability: string | null
}

export function useMonevTracking() {
  const [assessments, setAssessments] = useState<Record<string, MonevAssessment>>({})
  const [summaries, setSummaries] = useState<Record<string, MonevSummary>>({})

  /**
   * Initialize assessment for a diagnosis
   */
  const initializeAssessment = useCallback((diagnosis_code: DiagnosisCode) => {
    if (!assessments[diagnosis_code]) {
      setAssessments((prev) => ({
        ...prev,
        [diagnosis_code]: {
          diagnosis_code,
          selected_symptom_ids: [],
          abilities_known: [],
          abilities_practiced: [],
          practice_details: {},
        },
      }))
    }
  }, [assessments])

  /**
   * Toggle symptom selection and auto-update summary
   */
  const toggleSymptom = useCallback(
    (diagnosis_code: DiagnosisCode, symptom_id: string) => {
      setAssessments((prev) => {
        const updated = { ...prev }
        if (!updated[diagnosis_code]) {
          updated[diagnosis_code] = {
            diagnosis_code,
            selected_symptom_ids: [],
            abilities_known: [],
            abilities_practiced: [],
            practice_details: {},
          }
        }

        const symptoms = updated[diagnosis_code].selected_symptom_ids
        const index = symptoms.indexOf(symptom_id)
        if (index > -1) {
          symptoms.splice(index, 1)
        } else {
          symptoms.push(symptom_id)
        }

        // Auto-update summary
        updateSummary(diagnosis_code, updated[diagnosis_code])
        return updated
      })
    },
    []
  )

  /**
   * Toggle ability as known
   */
  const toggleAbilityKnown = useCallback(
    (diagnosis_code: DiagnosisCode, ability_name: string) => {
      setAssessments((prev) => {
        const updated = { ...prev }
        if (!updated[diagnosis_code]) {
          updated[diagnosis_code] = {
            diagnosis_code,
            selected_symptom_ids: [],
            abilities_known: [],
            abilities_practiced: [],
            practice_details: {},
          }
        }

        const abilities = updated[diagnosis_code].abilities_known
        const index = abilities.indexOf(ability_name)
        if (index > -1) {
          abilities.splice(index, 1)
        } else {
          abilities.push(ability_name)
        }

        updateSummary(diagnosis_code, updated[diagnosis_code])
        return updated
      })
    },
    []
  )

  /**
   * Toggle ability as practiced
   */
  const toggleAbilityPracticed = useCallback(
    (diagnosis_code: DiagnosisCode, ability_name: string) => {
      setAssessments((prev) => {
        const updated = { ...prev }
        if (!updated[diagnosis_code]) {
          updated[diagnosis_code] = {
            diagnosis_code,
            selected_symptom_ids: [],
            abilities_known: [],
            abilities_practiced: [],
            practice_details: {},
          }
        }

        const abilities = updated[diagnosis_code].abilities_practiced
        const index = abilities.indexOf(ability_name)
        if (index > -1) {
          abilities.splice(index, 1)
        } else {
          abilities.push(ability_name)
        }

        updateSummary(diagnosis_code, updated[diagnosis_code])
        return updated
      })
    },
    []
  )

  /**
   * Update practice details for an ability
   */
  const updatePracticeDetails = useCallback(
    (
      diagnosis_code: DiagnosisCode,
      ability_name: string,
      details: {
        frequency: string
        benefit: string
        challenges: string
      }
    ) => {
      setAssessments((prev) => {
        const updated = { ...prev }
        if (!updated[diagnosis_code]) {
          updated[diagnosis_code] = {
            diagnosis_code,
            selected_symptom_ids: [],
            abilities_known: [],
            abilities_practiced: [],
            practice_details: {},
          }
        }

        updated[diagnosis_code].practice_details[ability_name] = details
        return updated
      })
    },
    []
  )

  /**
   * Update summary for a diagnosis
   */
  const updateSummary = (diagnosis_code: DiagnosisCode, assessment: MonevAssessment) => {
    const summary = getAssessmentSummary(
      diagnosis_code,
      assessment.selected_symptom_ids,
      assessment.abilities_known,
      assessment.abilities_practiced
    )

    const nextAbility = recommendNextAbility(
      diagnosis_code,
      assessment.abilities_known,
      assessment.abilities_practiced
    )

    setSummaries((prev) => ({
      ...prev,
      [diagnosis_code]: {
        ...summary,
        next_recommended_ability: nextAbility,
      },
    }))
  }

  /**
   * Get assessment for a diagnosis
   */
  const getAssessment = useCallback(
    (diagnosis_code: DiagnosisCode): MonevAssessment | undefined => {
      return assessments[diagnosis_code]
    },
    [assessments]
  )

  /**
   * Get summary for a diagnosis
   */
  const getSummary = useCallback(
    (diagnosis_code: DiagnosisCode): MonevSummary | undefined => {
      return summaries[diagnosis_code]
    },
    [summaries]
  )

  /**
   * Get all assessments
   */
  const getAllAssessments = useCallback(() => {
    return assessments
  }, [assessments])

  /**
   * Get all summaries
   */
  const getAllSummaries = useCallback(() => {
    return summaries
  }, [summaries])

  /**
   * Clear assessment for a diagnosis
   */
  const clearAssessment = useCallback((diagnosis_code: DiagnosisCode) => {
    setAssessments((prev) => {
      const updated = { ...prev }
      delete updated[diagnosis_code]
      return updated
    })

    setSummaries((prev) => {
      const updated = { ...prev }
      delete updated[diagnosis_code]
      return updated
    })
  }, [])

  return {
    assessments,
    summaries,
    initializeAssessment,
    toggleSymptom,
    toggleAbilityKnown,
    toggleAbilityPracticed,
    updatePracticeDetails,
    getAssessment,
    getSummary,
    getAllAssessments,
    getAllSummaries,
    clearAssessment,
  }
}
