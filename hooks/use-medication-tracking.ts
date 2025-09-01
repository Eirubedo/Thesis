"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./use-auth"
import type { Medication, MedicationLog } from "@/types/database"

export interface MedicationWithLogs extends Medication {
  logs?: MedicationLog[]
}

export function useMedicationTracking() {
  const { user } = useAuth()
  const [medications, setMedications] = useState<MedicationWithLogs[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadMedications()
    }
  }, [user])

  const loadMedications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading medications:", error)
        return
      }

      setMedications(data || [])
    } catch (error) {
      console.error("Error loading medications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addMedication = async (medicationData: {
    name: string
    dosage?: string
    frequency?: string
    start_date?: string
    notes?: string
  }): Promise<boolean> => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from("medications")
        .insert({
          user_id: user.id,
          ...medicationData,
          is_active: true,
        })
        .select()
        .single()

      if (error || !data) {
        console.error("Error adding medication:", error)
        return false
      }

      setMedications((prev) => [data, ...prev])
      return true
    } catch (error) {
      console.error("Error adding medication:", error)
      return false
    }
  }

  const updateMedication = async (id: string, updates: Partial<Medication>): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase.from("medications").update(updates).eq("id", id).eq("user_id", user.id)

      if (error) {
        console.error("Error updating medication:", error)
        return false
      }

      setMedications((prev) => prev.map((med) => (med.id === id ? { ...med, ...updates } : med)))
      return true
    } catch (error) {
      console.error("Error updating medication:", error)
      return false
    }
  }

  const deleteMedication = async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from("medications")
        .update({ is_active: false })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error deleting medication:", error)
        return false
      }

      setMedications((prev) => prev.filter((med) => med.id !== id))
      return true
    } catch (error) {
      console.error("Error deleting medication:", error)
      return false
    }
  }

  const logMedicationTaken = async (medicationId: string, wasTaken: boolean, notes?: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase.from("medication_logs").insert({
        user_id: user.id,
        medication_id: medicationId,
        taken_at: new Date().toISOString(),
        was_taken: wasTaken,
        notes,
      })

      if (error) {
        console.error("Error logging medication:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error logging medication:", error)
      return false
    }
  }

  const getAdherenceRate = async (medicationId: string, days = 30): Promise<number> => {
    if (!user) return 0

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from("medication_logs")
        .select("was_taken")
        .eq("user_id", user.id)
        .eq("medication_id", medicationId)
        .gte("taken_at", startDate.toISOString())

      if (error || !data) {
        console.error("Error getting adherence rate:", error)
        return 0
      }

      if (data.length === 0) return 0

      const takenCount = data.filter((log) => log.was_taken).length
      return Math.round((takenCount / data.length) * 100)
    } catch (error) {
      console.error("Error getting adherence rate:", error)
      return 0
    }
  }

  return {
    medications,
    isLoading,
    addMedication,
    updateMedication,
    deleteMedication,
    logMedicationTaken,
    getAdherenceRate,
    loadMedications,
  }
}
