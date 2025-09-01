"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./use-auth"
import type { BPReading } from "@/types/database"

export interface BPStats {
  totalReadings: number
  last7DaysAvg: { systolic: number; diastolic: number; heartRate: number }
  last30DaysAvg: { systolic: number; diastolic: number; heartRate: number }
  averageHeartRate: number
}

export type BPCategory = "normal" | "elevated" | "stage1" | "stage2" | "crisis"

export function useBPTracking() {
  const { user } = useAuth()
  const [readings, setReadings] = useState<BPReading[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadReadings()
    }
  }, [user])

  const loadReadings = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("bp_readings")
        .select("*")
        .eq("user_id", user.id)
        .order("measurement_date", { ascending: false })
        .limit(100)

      if (error) {
        console.error("Error loading BP readings:", error)
        return
      }

      setReadings(data || [])
    } catch (error) {
      console.error("Error loading BP readings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const categorizeBP = (systolic: number, diastolic: number): BPCategory => {
    if (systolic >= 180 || diastolic >= 120) return "crisis"
    if (systolic >= 140 || diastolic >= 90) return "stage2"
    if (systolic >= 130 || diastolic >= 80) return "stage1"
    if (systolic >= 120) return "elevated"
    return "normal"
  }

  const addReading = async (
    systolic: number,
    diastolic: number,
    heartRate?: number,
    notes?: string,
    measurementDate?: Date,
  ): Promise<boolean> => {
    if (!user) return false

    try {
      const category = categorizeBP(systolic, diastolic)
      const measurement_date = measurementDate || new Date()

      const { data, error } = await supabase
        .from("bp_readings")
        .insert({
          user_id: user.id,
          systolic,
          diastolic,
          heart_rate: heartRate,
          measurement_date: measurement_date.toISOString(),
          notes,
          category,
        })
        .select()
        .single()

      if (error || !data) {
        console.error("Error adding BP reading:", error)
        return false
      }

      setReadings((prev) => [data, ...prev].slice(0, 100))
      return true
    } catch (error) {
      console.error("Error adding BP reading:", error)
      return false
    }
  }

  const deleteReading = async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase.from("bp_readings").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting BP reading:", error)
        return false
      }

      setReadings((prev) => prev.filter((reading) => reading.id !== id))
      return true
    } catch (error) {
      console.error("Error deleting BP reading:", error)
      return false
    }
  }

  const getStats = (): BPStats => {
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const last7DaysReadings = readings.filter((r) => new Date(r.measurement_date) >= last7Days)
    const last30DaysReadings = readings.filter((r) => new Date(r.measurement_date) >= last30Days)

    const calculateAverage = (readings: BPReading[]) => {
      if (readings.length === 0) return { systolic: 0, diastolic: 0, heartRate: 0 }

      const totals = readings.reduce(
        (acc, reading) => ({
          systolic: acc.systolic + reading.systolic,
          diastolic: acc.diastolic + reading.diastolic,
          heartRate: acc.heartRate + (reading.heart_rate || 0),
        }),
        { systolic: 0, diastolic: 0, heartRate: 0 },
      )

      const heartRateReadings = readings.filter((r) => r.heart_rate).length

      return {
        systolic: Math.round(totals.systolic / readings.length),
        diastolic: Math.round(totals.diastolic / readings.length),
        heartRate: heartRateReadings > 0 ? Math.round(totals.heartRate / heartRateReadings) : 0,
      }
    }

    return {
      totalReadings: readings.length,
      last7DaysAvg: calculateAverage(last7DaysReadings),
      last30DaysAvg: calculateAverage(last30DaysReadings),
      averageHeartRate: calculateAverage(readings).heartRate,
    }
  }

  const getCategoryColor = (category: BPCategory): string => {
    const colorMap = {
      normal: "bg-green-100 text-green-800",
      elevated: "bg-yellow-100 text-yellow-800",
      stage1: "bg-orange-100 text-orange-800",
      stage2: "bg-red-100 text-red-800",
      crisis: "bg-red-600 text-white",
    }
    return colorMap[category]
  }

  const getCategoryLabel = (category: BPCategory, t?: any): string => {
    const labels = {
      normal: "Normal",
      elevated: "Elevated",
      stage1: "Stage 1",
      stage2: "Stage 2",
      crisis: "Crisis",
    }
    return labels[category]
  }

  const getAverageReading = (days = 30) => {
    const stats = getStats()
    return days <= 7 ? stats.last7DaysAvg : stats.last30DaysAvg
  }

  return {
    readings,
    isLoading,
    addReading,
    deleteReading,
    getStats,
    getAverageReading,
    getCategoryColor,
    getCategoryLabel,
    categorizeBP,
    loadReadings,
  }
}
