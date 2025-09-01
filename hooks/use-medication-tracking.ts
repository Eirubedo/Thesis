"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Medication, MedicationLog } from "@/types/database"

export function useMedicationTracking() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getUserId = () => {
    if (typeof window === "undefined") return null
    const storedUser = localStorage.getItem("auth_user")
    return storedUser ? JSON.parse(storedUser).id : null
  }

  useEffect(() => {
    loadMedications()
    loadMedicationLogs()
  }, [])

  const loadMedications = async () => {
    const userId = getUserId()
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setMedications(data || [])
    } catch (error) {
      console.error("Error loading medications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMedicationLogs = async () => {
    const userId = getUserId()
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", userId)
        .order("taken_at", { ascending: false })

      if (error) throw error
      setMedicationLogs(data || [])
    } catch (error) {
      console.error("Error loading medication logs:", error)
    }
  }

  const addMedication = async (medicationData: {
    name: string
    dosage?: string
    frequency?: string
    start_date?: string
    end_date?: string
    notes?: string
  }) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      const { data, error } = await supabase
        .from("medications")
        .insert({
          user_id: userId,
          name: medicationData.name,
          dosage: medicationData.dosage,
          frequency: medicationData.frequency,
          start_date: medicationData.start_date,
          end_date: medicationData.end_date,
          notes: medicationData.notes,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setMedications((prev) => [data, ...prev])
      return { success: true }
    } catch (error) {
      console.error("Error adding medication:", error)
      return { success: false, error: "Failed to add medication" }
    }
  }

  const markMedicationTaken = async (medicationId: string, taken = true, notes?: string) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      const { data, error } = await supabase
        .from("medication_logs")
        .insert({
          user_id: userId,
          medication_id: medicationId,
          taken_at: new Date().toISOString(),
          was_taken: taken,
          notes: notes,
        })
        .select()
        .single()

      if (error) throw error

      setMedicationLogs((prev) => [data, ...prev])
      return { success: true }
    } catch (error) {
      console.error("Error logging medication:", error)
      return { success: false, error: "Failed to log medication" }
    }
  }

  const getTodaysMedications = () => {
    return medications.filter((med) => med.is_active)
  }

  const getAdherenceRate = () => {
    if (typeof window === "undefined") return 0

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentLogs = medicationLogs.filter((log) => new Date(log.taken_at) >= sevenDaysAgo)

    if (recentLogs.length === 0) return 0

    const takenLogs = recentLogs.filter((log) => log.was_taken)
    return Math.round((takenLogs.length / recentLogs.length) * 100)
  }

  const getMissedDoses = () => {
    if (typeof window === "undefined") return 0

    const today = new Date().toDateString()
    const todayLogs = medicationLogs.filter((log) => new Date(log.taken_at).toDateString() === today)

    return todayLogs.filter((log) => !log.was_taken).length
  }

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      const { data, error } = await supabase
        .from("medications")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) throw error

      setMedications((prev) => prev.map((med) => (med.id === id ? { ...med, ...data } : med)))
      return { success: true }
    } catch (error) {
      console.error("Error updating medication:", error)
      return { success: false, error: "Failed to update medication" }
    }
  }

  const deleteMedication = async (id: string) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      const { error } = await supabase
        .from("medications")
        .update({ is_active: false })
        .eq("id", id)
        .eq("user_id", userId)

      if (error) throw error

      setMedications((prev) => prev.filter((med) => med.id !== id))
      return { success: true }
    } catch (error) {
      console.error("Error deleting medication:", error)
      return { success: false, error: "Failed to delete medication" }
    }
  }

  return {
    medications,
    medicationLogs,
    isLoading,
    addMedication,
    markMedicationTaken,
    getTodaysMedications,
    getAdherenceRate,
    getMissedDoses,
    updateMedication,
    deleteMedication,
    loadMedications,
    loadMedicationLogs,
  }
}
