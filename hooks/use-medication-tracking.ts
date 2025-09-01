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
  isExpired?: boolean
  daysRemaining?: number
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

  const calculateEndDate = (startDate: string, durationType?: string, durationValue?: number) => {
    if (!durationType || durationType === "lifelong" || durationType === "as_needed") {
      return null
    }

    const start = new Date(startDate)
    const end = new Date(start)

    switch (durationType) {
      case "days":
        end.setDate(start.getDate() + (durationValue || 0))
        break
      case "weeks":
        end.setDate(start.getDate() + (durationValue || 0) * 7)
        break
      case "months":
        end.setMonth(start.getMonth() + (durationValue || 0))
        break
    }

    return end.toISOString()
  }

  const checkMedicationStatus = (medication: Medication) => {
    const now = new Date()
    let endDate: Date | null = null

    if (medication.end_date) {
      endDate = new Date(medication.end_date)
    } else if (medication.start_date && medication.duration_type && medication.duration_value) {
      const calculatedEndDate = calculateEndDate(
        medication.start_date,
        medication.duration_type,
        medication.duration_value,
      )
      if (calculatedEndDate) {
        endDate = new Date(calculatedEndDate)
      }
    }

    if (!endDate) {
      return { isExpired: false, daysRemaining: null }
    }

    const isExpired = now > endDate
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return { isExpired, daysRemaining: isExpired ? 0 : daysRemaining }
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

      // Parse the frequency and notes to extract schedule times
      const medicationsWithSchedule = (data || []).map((med) => {
        let times: string[] = []

        // Try to parse times from notes or create default times based on frequency
        if (med.notes && med.notes.includes("times:")) {
          const timesMatch = med.notes.match(/times:\s*\[(.*?)\]/)
          if (timesMatch) {
            times = timesMatch[1].split(",").map((t) => t.trim().replace(/"/g, ""))
          }
        } else {
          // Generate default times based on frequency
          switch (med.frequency) {
            case "once-daily":
              times = ["08:00"]
              break
            case "twice-daily":
              times = ["08:00", "20:00"]
              break
            case "three-times-daily":
              times = ["08:00", "14:00", "20:00"]
              break
            default:
              times = ["08:00"]
          }
        }

        const status = checkMedicationStatus(med)

        return {
          ...med,
          times,
          ...status,
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
    frequency?: string
    times?: string[]
    start_date?: string
    end_date?: string
    duration_type?: "lifelong" | "days" | "weeks" | "months" | "as_needed"
    duration_value?: number
    notes?: string
  }) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      // Store times in notes field as JSON
      const notesWithTimes = medicationData.notes
        ? `${medicationData.notes} times: [${medicationData.times?.map((t) => `"${t}"`).join(", ")}]`
        : `times: [${medicationData.times?.map((t) => `"${t}"`).join(", ")}]`

      // Calculate end date if duration is specified
      let endDate = medicationData.end_date
      if (!endDate && medicationData.start_date && medicationData.duration_type && medicationData.duration_value) {
        endDate = calculateEndDate(
          medicationData.start_date,
          medicationData.duration_type,
          medicationData.duration_value,
        )
      }

      const { data, error } = await supabase
        .from("medications")
        .insert({
          user_id: userId,
          name: medicationData.name,
          dosage: medicationData.dosage,
          frequency: medicationData.frequency,
          start_date: medicationData.start_date,
          end_date: endDate,
          duration_type: medicationData.duration_type,
          duration_value: medicationData.duration_value,
          notes: notesWithTimes,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      const status = checkMedicationStatus(data)
      const newMedication = {
        ...data,
        times: medicationData.times || [],
        ...status,
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
      const logId = `${medicationId}_${scheduledTime}_${today}`

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
      .filter((med) => {
        // Filter out expired medications unless they are "as_needed"
        if (med.duration_type === "as_needed") return true
        if (med.duration_type === "lifelong") return true
        return !med.isExpired
      })
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
      .filter((med) => med.is_active)
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

    const recentLogs = medicationLogs.filter((log) => new Date(log.taken_at) >= daysAgo)
    return recentLogs.filter((log) => !log.was_taken).length
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
