"use client"

import { useState, useEffect } from "react"

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  startDate: Date
  isActive: boolean
  notes?: string
  logs?: MedicationLog[]
}

export interface MedicationLog {
  id: string
  medicationId: string
  scheduledTime: string
  actualTime?: Date
  taken: boolean
  date: Date
}

export function useMedicationTracking() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [logs, setLogs] = useState<MedicationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    try {
      const storedMeds = localStorage.getItem("medications")
      const storedLogs = localStorage.getItem("medication-logs")

      if (storedMeds) {
        const parsed = JSON.parse(storedMeds)
        const medsWithDates = parsed.map((med: any) => ({
          ...med,
          startDate: new Date(med.startDate),
        }))
        setMedications(medsWithDates)
      }

      if (storedLogs) {
        const parsed = JSON.parse(storedLogs)
        const logsWithDates = parsed.map((log: any) => ({
          ...log,
          date: new Date(log.date),
          actualTime: log.actualTime ? new Date(log.actualTime) : undefined,
        }))
        setLogs(logsWithDates)
      }
    } catch (error) {
      console.error("Error loading medication data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveMedications = (newMedications: Medication[]) => {
    try {
      localStorage.setItem("medications", JSON.stringify(newMedications))
      setMedications(newMedications)
    } catch (error) {
      console.error("Error saving medications:", error)
    }
  }

  const saveLogs = (newLogs: MedicationLog[]) => {
    try {
      localStorage.setItem("medication-logs", JSON.stringify(newLogs))
      setLogs(newLogs)
    } catch (error) {
      console.error("Error saving medication logs:", error)
    }
  }

  const addMedication = (medicationData: Omit<Medication, "id" | "logs">): boolean => {
    try {
      const newMedication: Medication = {
        ...medicationData,
        id: Date.now().toString(),
      }

      const newMedications = [...medications, newMedication]
      saveMedications(newMedications)
      return true
    } catch (error) {
      console.error("Error adding medication:", error)
      return false
    }
  }

  const updateMedication = (id: string, updates: Partial<Medication>): boolean => {
    try {
      const newMedications = medications.map((med) => (med.id === id ? { ...med, ...updates } : med))
      saveMedications(newMedications)
      return true
    } catch (error) {
      console.error("Error updating medication:", error)
      return false
    }
  }

  const markMedicationTaken = (medicationId: string, scheduledTime: string, taken: boolean): boolean => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const existingLogIndex = logs.findIndex(
        (log) =>
          log.medicationId === medicationId &&
          log.scheduledTime === scheduledTime &&
          log.date.toDateString() === today.toDateString(),
      )

      let newLogs: MedicationLog[]

      if (existingLogIndex >= 0) {
        newLogs = [...logs]
        newLogs[existingLogIndex] = {
          ...newLogs[existingLogIndex],
          taken,
          actualTime: taken ? new Date() : undefined,
        }
      } else {
        const newLog: MedicationLog = {
          id: Date.now().toString(),
          medicationId,
          scheduledTime,
          taken,
          date: today,
          actualTime: taken ? new Date() : undefined,
        }
        newLogs = [...logs, newLog]
      }

      saveLogs(newLogs)
      return true
    } catch (error) {
      console.error("Error marking medication taken:", error)
      return false
    }
  }

  const getAdherenceRate = (days: number) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentLogs = logs.filter((log) => log.date >= cutoffDate)
    const totalDoses = recentLogs.length
    const takenDoses = recentLogs.filter((log) => log.taken).length

    const weeklyRate = Math.round(totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0)

    // Calculate monthly rate (last 30 days)
    const monthlyDate = new Date()
    monthlyDate.setDate(monthlyDate.getDate() - 30)
    const monthlyLogs = logs.filter((log) => log.date >= monthlyDate)
    const monthlyTotal = monthlyLogs.length
    const monthlyTaken = monthlyLogs.filter((log) => log.taken).length
    const monthlyRate = Math.round(monthlyTotal > 0 ? (monthlyTaken / monthlyTotal) * 100 : 0)

    return {
      weekly: weeklyRate,
      monthly: monthlyRate,
    }
  }

  const getTodaysMedications = (): (Medication & { logs?: MedicationLog[] })[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return medications
      .filter((med) => med.isActive)
      .map((med) => ({
        ...med,
        logs: logs.filter((log) => log.medicationId === med.id && log.date.toDateString() === today.toDateString()),
      }))
  }

  const getMissedDoses = (days: number): number => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return logs.filter((log) => log.date >= cutoffDate && !log.taken).length
  }

  return {
    medications,
    logs,
    addMedication,
    updateMedication,
    markMedicationTaken,
    getAdherenceRate,
    getTodaysMedications,
    getMissedDoses,
    isLoading,
  }
}
