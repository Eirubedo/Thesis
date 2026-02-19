"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Medication, MedicationLog } from "@/types/database"

interface MedicationWithSchedule extends Medication {
  times?: string[]
  logs?: Array<{
    id: string
    scheduledTime: string
    taken: boolean
    takenAt?: string
  }>
}

export function useMedicationTracking() {
  const [medications, setMedications] = useState<MedicationWithSchedule[]>([])
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

      // Parse the notes to extract schedule times
      const medicationsWithSchedule = (data || []).map((med) => {
        let times: string[] = []
        let notes = ""

        if (med.notes) {
          try {
            const parsed = JSON.parse(med.notes)
            times = parsed.times || []
            notes = parsed.notes || ""
          } catch {
            // If parsing fails, treat as plain text notes
            notes = med.notes
            times = []
          }
        }

        return {
          ...med,
          times,
          notes,
        }
      })

      setMedications(medicationsWithSchedule)
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
    times?: string[]
    notes?: string
  }) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      // Store times and notes in JSON format
      const notesData = {
        times: medicationData.times || [],
        notes: medicationData.notes || "",
      }

      const { data, error } = await supabase
        .from("medications")
        .insert({
          user_id: userId,
          name: medicationData.name,
          dosage: medicationData.dosage,
          notes: JSON.stringify(notesData),
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      const newMedication = {
        ...data,
        times: medicationData.times || [],
        notes: medicationData.notes || "",
      }

      setMedications((prev) => [newMedication, ...prev])
      return { success: true }
    } catch (error) {
      console.error("Error adding medication:", error)
      return { success: false, error: "Failed to add medication" }
    }
  }

  const markMedicationTaken = async (medicationId: string, scheduledTime: string, taken = true, notes?: string) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      const today = new Date().toISOString().split("T")[0]

      // Check if log already exists for this medication, time, and date
      const { data: existingLog } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("medication_id", medicationId)
        .gte("taken_at", `${today}T00:00:00`)
        .lt("taken_at", `${today}T23:59:59`)
        .eq("notes", scheduledTime)
        .single()

      if (existingLog) {
        // Update existing log
        const { error } = await supabase
          .from("medication_logs")
          .update({
            was_taken: taken,
            taken_at: new Date().toISOString(),
          })
          .eq("id", existingLog.id)

        if (error) throw error
      } else {
        // Create new log
        const { data, error } = await supabase
          .from("medication_logs")
          .insert({
            user_id: userId,
            medication_id: medicationId,
            taken_at: new Date().toISOString(),
            was_taken: taken,
            notes: scheduledTime, // Store scheduled time in notes
          })
          .select()
          .single()

        if (error) throw error
        setMedicationLogs((prev) => [data, ...prev])
      }

      await loadMedicationLogs()
      return { success: true }
    } catch (error) {
      console.error("Error logging medication:", error)
      return { success: false, error: "Failed to log medication" }
    }
  }

  const getTodaysMedications = () => {
    const today = new Date().toISOString().split("T")[0]

    return medications
      .filter((med) => med.is_active)
      .map((med) => {
        const todaysLogs = medicationLogs.filter(
          (log) => log.medication_id === med.id && log.taken_at.startsWith(today),
        )

        const logs = (med.times || []).map((time) => {
          const log = todaysLogs.find((l) => l.notes === time)
          return {
            id: log?.id || `${med.id}_${time}_${today}`,
            scheduledTime: time,
            taken: log?.was_taken || false,
            takenAt: log?.taken_at,
          }
        })

        return {
          ...med,
          logs,
        }
      })
  }

  const getAdherenceRate = (days = 7) => {
    if (typeof window === "undefined") return { weekly: 0, monthly: 0 }

    const now = new Date()
    const weekAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const weeklyLogs = medicationLogs.filter((log) => new Date(log.taken_at) >= weekAgo)
    const monthlyLogs = medicationLogs.filter((log) => new Date(log.taken_at) >= monthAgo)

    const weeklyTaken = weeklyLogs.filter((log) => log.was_taken).length
    const monthlyTaken = monthlyLogs.filter((log) => log.was_taken).length

    const weeklyRate = weeklyLogs.length > 0 ? Math.round((weeklyTaken / weeklyLogs.length) * 100) : 0
    const monthlyRate = monthlyLogs.length > 0 ? Math.round((monthlyTaken / monthlyLogs.length) * 100) : 0

    return { weekly: weeklyRate, monthly: monthlyRate }
  }

  const getMissedDoses = (days = 7) => {
    if (typeof window === "undefined") return 0

    const now = new Date()
    const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    let missedCount = 0

    // Get all active medications
    const activeMedications = medications.filter((med) => med.is_active)

    // For each day in the range
    for (let d = 0; d < days; d++) {
      const checkDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000)
      const dateString = checkDate.toISOString().split("T")[0]

      // For each active medication
      for (const med of activeMedications) {
        const scheduledTimes = med.times || []

        // For each scheduled time
        for (const time of scheduledTimes) {
          // Check if there's a log for this medication, date, and time
          const log = medicationLogs.find(
            (l) =>
              l.medication_id === med.id &&
              l.taken_at.startsWith(dateString) &&
              l.notes === time
          )

          // Count as missed if: no log exists OR log exists but was_taken = false
          if (!log || !log.was_taken) {
            // Only count if the scheduled time has passed
            const [hours, minutes] = time.split(":").map(Number)
            const scheduledDateTime = new Date(checkDate)
            scheduledDateTime.setHours(hours, minutes, 0, 0)

            if (scheduledDateTime <= now) {
              missedCount++
            }
          }
        }
      }
    }

    return missedCount
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
