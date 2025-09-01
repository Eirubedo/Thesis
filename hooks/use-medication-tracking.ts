"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  isActive: boolean
  createdAt: string
}

export interface MedicationLog {
  id: string
  medicationId: string
  takenAt: string
  missed: boolean
}

export function useMedicationTracking() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get user ID from localStorage (client-side only)
  const getUserId = () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("userId")
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadMedications()
      loadMedicationLogs()
    }
  }, [])

  const loadMedications = async () => {
    try {
      const userId = getUserId()
      if (!userId) return

      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setMedications(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load medications")
    } finally {
      setLoading(false)
    }
  }

  const loadMedicationLogs = async () => {
    try {
      const userId = getUserId()
      if (!userId) return

      const { data, error } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", userId)
        .order("taken_at", { ascending: false })

      if (error) throw error
      setMedicationLogs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load medication logs")
    }
  }

  const addMedication = async (medication: Omit<Medication, "id" | "createdAt">) => {
    try {
      const userId = getUserId()
      if (!userId) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from("medications")
        .insert([
          {
            user_id: userId,
            name: medication.name,
            dosage: medication.dosage,
            frequency: medication.frequency,
            times: medication.times,
            is_active: medication.isActive,
          },
        ])
        .select()

      if (error) throw error
      if (data) {
        const newMedication: Medication = {
          id: data[0].id,
          name: data[0].name,
          dosage: data[0].dosage,
          frequency: data[0].frequency,
          times: data[0].times,
          isActive: data[0].is_active,
          createdAt: data[0].created_at,
        }
        setMedications((prev) => [newMedication, ...prev])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add medication")
      throw err
    }
  }

  const markMedicationTaken = async (medicationId: string, missed = false) => {
    try {
      const userId = getUserId()
      if (!userId) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from("medication_logs")
        .insert([
          {
            user_id: userId,
            medication_id: medicationId,
            taken_at: new Date().toISOString(),
            missed,
          },
        ])
        .select()

      if (error) throw error
      if (data) {
        const newLog: MedicationLog = {
          id: data[0].id,
          medicationId: data[0].medication_id,
          takenAt: data[0].taken_at,
          missed: data[0].missed,
        }
        setMedicationLogs((prev) => [newLog, ...prev])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log medication")
      throw err
    }
  }

  const getTodaysMedications = () => {
    return medications.filter((med) => med.isActive)
  }

  const getAdherenceRate = () => {
    if (medicationLogs.length === 0) return 0

    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentLogs = medicationLogs.filter((log) => {
      const logDate = new Date(log.takenAt)
      return logDate >= sevenDaysAgo && logDate <= today
    })

    if (recentLogs.length === 0) return 0

    const takenLogs = recentLogs.filter((log) => !log.missed)
    return Math.round((takenLogs.length / recentLogs.length) * 100)
  }

  const getMissedDoses = () => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    return medicationLogs.filter((log) => {
      const logDate = new Date(log.takenAt)
      return logDate >= startOfDay && log.missed
    }).length
  }

  return {
    medications,
    medicationLogs,
    loading,
    error,
    addMedication,
    markMedicationTaken,
    getTodaysMedications,
    getAdherenceRate,
    getMissedDoses,
    loadMedications,
    loadMedicationLogs,
  }
}
