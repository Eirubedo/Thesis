"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { ActivitySchedule, ActivityLog, ActivityType, DayOfWeek } from "@/types/database"

interface ScheduleWithLogs extends ActivitySchedule {
  todayCompleted?: boolean
  upcomingReminder?: Date
  completionRate?: number
}

export function useActivityScheduling() {
  const [schedules, setSchedules] = useState<ScheduleWithLogs[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getUserId = () => {
    if (typeof window === "undefined") return null
    const storedUser = localStorage.getItem("auth_user")
    return storedUser ? JSON.parse(storedUser).id : null
  }

  useEffect(() => {
    loadSchedules()
    loadActivityLogs()
    requestNotificationPermission()
  }, [])

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return

    if (Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }

  const loadSchedules = async () => {
    const userId = getUserId()
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from("activity_schedules")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("scheduled_time", { ascending: true })

      if (error) throw error

      const schedulesWithStatus = await Promise.all(
        (data || []).map(async (schedule) => {
          const todayCompleted = await checkTodayCompletion(schedule.id)
          const completionRate = await getCompletionRate(schedule.id, 30)
          return {
            ...schedule,
            todayCompleted,
            completionRate,
          }
        }),
      )

      setSchedules(schedulesWithStatus)
    } catch (error) {
      console.error("Error loading schedules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadActivityLogs = async () => {
    const userId = getUserId()
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(100)

      if (error) throw error
      setActivityLogs(data || [])
    } catch (error) {
      console.error("Error loading activity logs:", error)
    }
  }

  const checkTodayCompletion = async (scheduleId: string): Promise<boolean> => {
    const userId = getUserId()
    if (!userId) return false

    const today = new Date().toISOString().split("T")[0]

    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("schedule_id", scheduleId)
        .gte("completed_at", `${today}T00:00:00`)
        .lt("completed_at", `${today}T23:59:59`)
        .single()

      return !!data
    } catch {
      return false
    }
  }

  const addSchedule = async (scheduleData: {
    activity_type: ActivityType
    title: string
    description?: string
    scheduled_time: string
    scheduled_days?: DayOfWeek[]
    duration_minutes?: number
    reminder_enabled?: boolean
    reminder_minutes_before?: number
  }) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      const { data, error } = await supabase
        .from("activity_schedules")
        .insert({
          user_id: userId,
          activity_type: scheduleData.activity_type,
          title: scheduleData.title,
          description: scheduleData.description,
          scheduled_time: scheduleData.scheduled_time,
          scheduled_days: scheduleData.scheduled_days || [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          duration_minutes: scheduleData.duration_minutes || 10,
          reminder_enabled: scheduleData.reminder_enabled ?? true,
          reminder_minutes_before: scheduleData.reminder_minutes_before || 15,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      await loadSchedules()
      scheduleNotifications(data)

      return { success: true, data }
    } catch (error) {
      console.error("Error adding schedule:", error)
      return { success: false, error: "Failed to add schedule" }
    }
  }

  const logActivity = async (
    scheduleId: string,
    durationMinutes?: number,
    notes?: string,
    moodBefore?: number,
    moodAfter?: number,
  ) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .insert({
          user_id: userId,
          schedule_id: scheduleId,
          completed_at: new Date().toISOString(),
          duration_actual_minutes: durationMinutes,
          notes,
          mood_before: moodBefore,
          mood_after: moodAfter,
        })
        .select()
        .single()

      if (error) throw error

      await loadSchedules()
      await loadActivityLogs()

      return { success: true, data }
    } catch (error) {
      console.error("Error logging activity:", error)
      return { success: false, error: "Failed to log activity" }
    }
  }

  const updateSchedule = async (id: string, updates: Partial<ActivitySchedule>) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      const { data, error } = await supabase
        .from("activity_schedules")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) throw error

      await loadSchedules()
      if (data.reminder_enabled) {
        scheduleNotifications(data)
      }

      return { success: true, data }
    } catch (error) {
      console.error("Error updating schedule:", error)
      return { success: false, error: "Failed to update schedule" }
    }
  }

  const deleteSchedule = async (id: string) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      const { error } = await supabase
        .from("activity_schedules")
        .update({ is_active: false })
        .eq("id", id)
        .eq("user_id", userId)

      if (error) throw error

      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id))
      return { success: true }
    } catch (error) {
      console.error("Error deleting schedule:", error)
      return { success: false, error: "Failed to delete schedule" }
    }
  }

  const deleteActivityLog = async (scheduleId: string) => {
    const userId = getUserId()
    if (!userId) return { success: false, error: "Not authenticated" }

    try {
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("activity_logs")
        .delete()
        .eq("user_id", userId)
        .eq("schedule_id", scheduleId)
        .gte("completed_at", `${today}T00:00:00`)
        .lte("completed_at", `${today}T23:59:59`)
        .select()

      if (error) throw error

      await loadSchedules()
      await loadActivityLogs()

      return { success: true }
    } catch (error) {
      console.error("Error deleting activity log:", error)
      return { success: false, error: "Failed to delete activity log" }
    }
  }

  const scheduleNotifications = (schedule: ActivitySchedule) => {
    if (typeof window === "undefined" || !("Notification" in window)) return
    if (Notification.permission !== "granted" || !schedule.reminder_enabled) return

    const [hours, minutes] = schedule.scheduled_time.split(":").map(Number)
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hours, minutes, 0, 0)

    // Calculate reminder time
    const reminderTime = new Date(scheduledTime.getTime() - schedule.reminder_minutes_before * 60000)

    // If reminder time is in the future today, schedule it
    if (reminderTime > now) {
      const timeUntilReminder = reminderTime.getTime() - now.getTime()

      setTimeout(() => {
        new Notification(`⏰ Pengingat: ${schedule.title}`, {
          body: `${schedule.description || "Waktunya melakukan aktivitas Anda"} dalam ${schedule.reminder_minutes_before} menit`,
          icon: "/images/answa-logo.png",
          tag: schedule.id,
        })
      }, timeUntilReminder)
    }
  }

  const getTodaysSchedule = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as DayOfWeek

    return schedules.filter((schedule) => schedule.scheduled_days.includes(today))
  }

  const getUpcomingSchedule = () => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    return getTodaysSchedule()
      .filter((schedule) => schedule.scheduled_time >= currentTime && !schedule.todayCompleted)
      .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
  }

  const getCompletionRate = async (scheduleId: string, days = 30): Promise<number> => {
    const userId = getUserId()
    if (!userId) return 0

    try {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - days)

      const { data, error } = await supabase
        .from("activity_logs")
        .select("completed_at")
        .eq("user_id", userId)
        .eq("schedule_id", scheduleId)
        .gte("completed_at", daysAgo.toISOString())

      if (error) throw error

      const completedDays = data?.length || 0
      return Math.round((completedDays / days) * 100)
    } catch (error) {
      console.error("Error calculating completion rate:", error)
      return 0
    }
  }

  const getActivityStatistics = () => {
    const today = getTodaysSchedule()
    const completed = today.filter((s) => s.todayCompleted).length
    const total = today.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      todayCompleted: completed,
      todayTotal: total,
      todayPercentage: percentage,
      totalSchedules: schedules.length,
      upcomingToday: getUpcomingSchedule().length,
    }
  }

  return {
    schedules,
    activityLogs,
    isLoading,
    addSchedule,
    logActivity,
    updateSchedule,
    deleteSchedule,
    deleteActivityLog,
    getTodaysSchedule,
    getUpcomingSchedule,
    getActivityStatistics,
    loadSchedules,
    loadActivityLogs,
  }
}
