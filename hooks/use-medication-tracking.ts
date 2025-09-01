"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

interface Medication {
  id: string
  name: string
  dosage: string
  times: string[]
  notes?: string
  created_at: string
}

interface TodaysMedication extends Medication {
  scheduled_time: string
  taken_at?: string
}

export function useMedicationTracking() {
  const { user } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [todaysMedications, setTodaysMedications] = useState<TodaysMedication[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMedications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      const medicationsWithTimes = data.map((med) => ({
        ...med,
        times: med.notes ? JSON.parse(med.notes).times || [] : [],
      }))

      setMedications(medicationsWithTimes)
    } catch (error) {
      console.error("Error fetching medications:", error)
    }
  }

  const fetchTodaysMedications = async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split("T")[0]

      // Get all medications
      const { data: medicationsData, error: medsError } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)

      if (medsError) throw medsError

      // Get today's medication logs
      const { data: logsData, error: logsError } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", today)
        .lt("date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0])

      if (logsError) throw logsError

      // Create today's medication schedule
      const todaysSchedule: TodaysMedication[] = []

      medicationsData.forEach((med) => {
        const times = med.notes ? JSON.parse(med.notes).times || [] : []
        times.forEach((time: string) => {
          const log = logsData.find((log) => log.medication_id === med.id && log.scheduled_time === time)

          todaysSchedule.push({
            ...med,
            times,
            scheduled_time: time,
            taken_at: log?.taken_at,
          })
        })
      })

      // Sort by scheduled time
      todaysSchedule.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))

      setTodaysMedications(todaysSchedule)
    } catch (error) {
      console.error("Error fetching today's medications:", error)
    }
  }

  const addMedication = async (medication: {
    name: string
    dosage: string
    times: string[]
    notes?: string
  }) => {
    if (!user) return

    try {
      const { error } = await supabase.from("medications").insert({
        user_id: user.id,
        name: medication.name,
        dosage: medication.dosage,
        notes: JSON.stringify({ times: medication.times, notes: medication.notes }),
      })

      if (error) throw error

      await fetchMedications()
      await fetchTodaysMedications()
    } catch (error) {
      console.error("Error adding medication:", error)
    }
  }

  const deleteMedication = async (medicationId: string) => {
    if (!user) return

    try {
      // Delete medication logs first
      await supabase.from("medication_logs").delete().eq("medication_id", medicationId)

      // Delete medication
      const { error } = await supabase.from("medications").delete().eq("id", medicationId).eq("user_id", user.id)

      if (error) throw error

      await fetchMedications()
      await fetchTodaysMedications()
    } catch (error) {
      console.error("Error deleting medication:", error)
    }
  }

  const markMedicationTaken = async (medicationId: string, scheduledTime: string) => {
    if (!user) return

    try {
      const now = new Date()
      const today = now.toISOString().split("T")[0]

      const { error } = await supabase.from("medication_logs").upsert({
        user_id: user.id,
        medication_id: medicationId,
        date: today,
        scheduled_time: scheduledTime,
        taken_at: now.toISOString(),
      })

      if (error) throw error

      await fetchTodaysMedications()
    } catch (error) {
      console.error("Error marking medication as taken:", error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMedications()
      fetchTodaysMedications()
      setLoading(false)
    }
  }, [user])

  return {
    medications,
    todaysMedications,
    loading,
    addMedication,
    deleteMedication,
    markMedicationTaken,
    refetch: () => {
      fetchMedications()
      fetchTodaysMedications()
    },
  }
}
