"use client"

import { useState, useEffect } from "react"

export interface BPReading {
  id: string
  systolic: number
  diastolic: number
  pulse: number
  date: Date
  notes?: string
  category: BPCategory
}

export type BPCategory = "normal" | "elevated" | "stage1" | "stage2" | "crisis"

export interface BPStats {
  totalReadings: number
  averageSystolic: number
  averageDiastolic: number
  averagePulse: number
  lastReading?: BPReading
}

export function useBPTracking() {
  const [readings, setReadings] = useState<BPReading[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReadings()
  }, [])

  const loadReadings = () => {
    try {
      const stored = localStorage.getItem("bp-readings")
      if (stored) {
        const parsed = JSON.parse(stored)
        const readingsWithDates = parsed.map((reading: any) => ({
          ...reading,
          date: new Date(reading.date),
        }))
        setReadings(readingsWithDates)
      }
    } catch (error) {
      console.error("Error loading BP readings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveReadings = (newReadings: BPReading[]) => {
    try {
      localStorage.setItem("bp-readings", JSON.stringify(newReadings))
      setReadings(newReadings)
    } catch (error) {
      console.error("Error saving BP readings:", error)
    }
  }

  const categorizeBP = (systolic: number, diastolic: number): BPCategory => {
    if (systolic >= 180 || diastolic >= 120) return "crisis"
    if (systolic >= 140 || diastolic >= 90) return "stage2"
    if (systolic >= 130 || diastolic >= 80) return "stage1"
    if (systolic >= 120) return "elevated"
    return "normal"
  }

  const addReading = (systolic: number, diastolic: number, pulse: number, notes?: string): boolean => {
    try {
      const newReading: BPReading = {
        id: Date.now().toString(),
        systolic,
        diastolic,
        pulse,
        date: new Date(),
        notes,
        category: categorizeBP(systolic, diastolic),
      }

      const newReadings = [newReading, ...readings].slice(0, 100) // Keep only last 100 readings
      saveReadings(newReadings)
      return true
    } catch (error) {
      console.error("Error adding BP reading:", error)
      return false
    }
  }

  const deleteReading = (id: string): boolean => {
    try {
      const newReadings = readings.filter((reading) => reading.id !== id)
      saveReadings(newReadings)
      return true
    } catch (error) {
      console.error("Error deleting BP reading:", error)
      return false
    }
  }

  const getStats = (days: number): BPStats => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentReadings = readings.filter((reading) => reading.date >= cutoffDate)

    if (recentReadings.length === 0) {
      return {
        totalReadings: 0,
        averageSystolic: 0,
        averageDiastolic: 0,
        averagePulse: 0,
      }
    }

    const totalSystolic = recentReadings.reduce((sum, reading) => sum + reading.systolic, 0)
    const totalDiastolic = recentReadings.reduce((sum, reading) => sum + reading.diastolic, 0)
    const totalPulse = recentReadings.reduce((sum, reading) => sum + reading.pulse, 0)

    return {
      totalReadings: recentReadings.length,
      averageSystolic: Math.round(totalSystolic / recentReadings.length),
      averageDiastolic: Math.round(totalDiastolic / recentReadings.length),
      averagePulse: Math.round(totalPulse / recentReadings.length),
      lastReading: readings[0],
    }
  }

  const getAverageReading = (days: number) => {
    const stats = getStats(days)
    return {
      systolic: stats.averageSystolic,
      diastolic: stats.averageDiastolic,
      pulse: stats.averagePulse,
    }
  }

  const getBPCategory = (systolic: number, diastolic: number): string => {
    const category = categorizeBP(systolic, diastolic)
    const categoryLabels = {
      normal: "Normal",
      elevated: "Elevated",
      stage1: "Stage 1 Hypertension",
      stage2: "Stage 2 Hypertension",
      crisis: "Hypertensive Crisis",
    }
    return categoryLabels[category]
  }

  const getCategoryColor = (category: BPCategory | string): string => {
    const colorMap = {
      normal: "bg-green-100 text-green-800",
      elevated: "bg-yellow-100 text-yellow-800",
      stage1: "bg-orange-100 text-orange-800",
      stage2: "bg-red-100 text-red-800",
      crisis: "bg-red-200 text-red-900",
      Normal: "bg-green-100 text-green-800",
      Elevated: "bg-yellow-100 text-yellow-800",
      "Stage 1 Hypertension": "bg-orange-100 text-orange-800",
      "Stage 2 Hypertension": "bg-red-100 text-red-800",
      "Hypertensive Crisis": "bg-red-200 text-red-900",
    }
    return colorMap[category as keyof typeof colorMap] || "bg-gray-100 text-gray-800"
  }

  const getCategoryLabel = (category: BPCategory | string): string => {
    if (typeof category === "string") return category
    const categoryLabels = {
      normal: "Normal",
      elevated: "Elevated",
      stage1: "Stage 1 Hypertension",
      stage2: "Stage 2 Hypertension",
      crisis: "Hypertensive Crisis",
    }
    return categoryLabels[category]
  }

  return {
    readings,
    addReading,
    deleteReading,
    getStats,
    getAverageReading,
    getBPCategory,
    getCategoryColor,
    getCategoryLabel,
    isLoading,
  }
}
