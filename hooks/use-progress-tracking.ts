"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export interface ProgressSession {
  id: string
  resourceId: number
  userId: string
  startTime: Date
  endTime: Date
  duration: number // in seconds
  completed: boolean
  type: "timer" | "manual" | "video" | "reading"
}

export interface ResourceProgress {
  resourceId: number
  userId: string
  completedAt: Date | null
  sessions: ProgressSession[]
  totalPracticeTime: number // in seconds
  completionCount: number
  lastPracticed: Date | null
  isCompleted: boolean
}

export interface UserProgressStats {
  totalSessions: number
  totalPracticeTime: number // in seconds
  completedResources: number
  currentStreak: number
  longestStreak: number
  lastPracticeDate: Date | null
  streakDates: string[] // Array of YYYY-MM-DD strings
}

const STORAGE_KEY = "selfHelpProgress"

export function useProgressTracking() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [progressData, setProgressData] = useState<Record<string, ResourceProgress>>({})
  const [userStats, setUserStats] = useState<UserProgressStats>({
    totalSessions: 0,
    totalPracticeTime: 0,
    completedResources: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    streakDates: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load progress data from localStorage
  const loadProgressData = useCallback(() => {
    if (!user) return

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`)
      if (stored) {
        const parsed = JSON.parse(stored)

        // Convert date strings back to Date objects
        const processedData: Record<string, ResourceProgress> = {}
        Object.keys(parsed.resources || {}).forEach((key) => {
          const resource = parsed.resources[key]
          processedData[key] = {
            ...resource,
            completedAt: resource.completedAt ? new Date(resource.completedAt) : null,
            lastPracticed: resource.lastPracticed ? new Date(resource.lastPracticed) : null,
            sessions: resource.sessions.map((session: any) => ({
              ...session,
              startTime: new Date(session.startTime),
              endTime: new Date(session.endTime),
            })),
          }
        })

        const processedStats: UserProgressStats = {
          ...parsed.stats,
          lastPracticeDate: parsed.stats.lastPracticeDate ? new Date(parsed.stats.lastPracticeDate) : null,
        }

        setProgressData(processedData)
        setUserStats(processedStats)
      }
    } catch (error) {
      console.error("Error loading progress data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Save progress data to localStorage
  const saveProgressData = useCallback(
    (data: Record<string, ResourceProgress>, stats: UserProgressStats) => {
      if (!user) return

      try {
        const toSave = {
          resources: data,
          stats: stats,
          lastUpdated: new Date().toISOString(),
        }
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(toSave))
      } catch (error) {
        console.error("Error saving progress data:", error)
      }
    },
    [user],
  )

  // Calculate streak based on practice dates
  const calculateStreak = useCallback((streakDates: string[]): { current: number; longest: number } => {
    if (streakDates.length === 0) return { current: 0, longest: 0 }

    const sortedDates = [...streakDates].sort().reverse() // Most recent first
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Calculate current streak
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      let expectedDate = sortedDates[0] === today ? today : yesterday

      for (const date of sortedDates) {
        if (date === expectedDate) {
          currentStreak++
          const prevDate = new Date(expectedDate)
          prevDate.setDate(prevDate.getDate() - 1)
          expectedDate = prevDate.toISOString().split("T")[0]
        } else {
          break
        }
      }
    }

    // Calculate longest streak
    for (let i = 0; i < sortedDates.length; i++) {
      tempStreak = 1
      let currentDate = sortedDates[i]

      for (let j = i + 1; j < sortedDates.length; j++) {
        const nextExpectedDate = new Date(currentDate)
        nextExpectedDate.setDate(nextExpectedDate.getDate() - 1)
        const expectedDateStr = nextExpectedDate.toISOString().split("T")[0]

        if (sortedDates[j] === expectedDateStr) {
          tempStreak++
          currentDate = sortedDates[j]
        } else {
          break
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak)
    }

    return { current: currentStreak, longest: longestStreak }
  }, [])

  // Start a practice session
  const startSession = useCallback(
    (resourceId: number, type: "timer" | "manual" | "video" | "reading" = "manual") => {
      if (!user) return null

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const session: ProgressSession = {
        id: sessionId,
        resourceId,
        userId: user.id,
        startTime: new Date(),
        endTime: new Date(), // Will be updated when session ends
        duration: 0,
        completed: false,
        type,
      }

      return session
    },
    [user],
  )

  // Complete a practice session
  const completeSession = useCallback(
    (session: ProgressSession, duration?: number) => {
      if (!user) return

      const endTime = new Date()
      const actualDuration = duration || Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000)

      const completedSession: ProgressSession = {
        ...session,
        endTime,
        duration: actualDuration,
        completed: true,
      }

      const resourceKey = `resource_${session.resourceId}`
      const today = new Date().toISOString().split("T")[0]

      setProgressData((prev) => {
        const updated = { ...prev }

        if (!updated[resourceKey]) {
          updated[resourceKey] = {
            resourceId: session.resourceId,
            userId: user.id,
            completedAt: null,
            sessions: [],
            totalPracticeTime: 0,
            completionCount: 0,
            lastPracticed: null,
            isCompleted: false,
          }
        }

        updated[resourceKey].sessions.push(completedSession)
        updated[resourceKey].totalPracticeTime += actualDuration
        updated[resourceKey].lastPracticed = endTime

        return updated
      })

      setUserStats((prev) => {
        const newStreakDates = [...new Set([...prev.streakDates, today])]
        const streakStats = calculateStreak(newStreakDates)

        const updated: UserProgressStats = {
          totalSessions: prev.totalSessions + 1,
          totalPracticeTime: prev.totalPracticeTime + actualDuration,
          completedResources: prev.completedResources,
          currentStreak: streakStats.current,
          longestStreak: Math.max(prev.longestStreak, streakStats.longest),
          lastPracticeDate: endTime,
          streakDates: newStreakDates,
        }

        // Save updated data
        setTimeout(() => {
          setProgressData((currentProgress) => {
            saveProgressData(currentProgress, updated)
            return currentProgress
          })
        }, 0)

        return updated
      })

      toast({
        title: "Session Complete!",
        description: `Great job! You practiced for ${Math.floor(actualDuration / 60)} minutes.`,
      })
    },
    [user, calculateStreak, saveProgressData, toast],
  )

  // Mark a resource as completed
  const markResourceCompleted = useCallback(
    (resourceId: number) => {
      if (!user) return

      const resourceKey = `resource_${resourceId}`
      const completionTime = new Date()

      setProgressData((prev) => {
        const updated = { ...prev }

        if (!updated[resourceKey]) {
          updated[resourceKey] = {
            resourceId,
            userId: user.id,
            completedAt: null,
            sessions: [],
            totalPracticeTime: 0,
            completionCount: 0,
            lastPracticed: null,
            isCompleted: false,
          }
        }

        const wasAlreadyCompleted = updated[resourceKey].isCompleted

        if (!wasAlreadyCompleted) {
          updated[resourceKey].isCompleted = true
          updated[resourceKey].completedAt = completionTime
          updated[resourceKey].completionCount += 1

          setUserStats((prevStats) => {
            const newStats = {
              ...prevStats,
              completedResources: prevStats.completedResources + 1,
            }

            // Save updated data
            setTimeout(() => saveProgressData(updated, newStats), 0)

            return newStats
          })

          toast({
            title: "Resource Completed!",
            description: "Well done! You've completed this self-help resource.",
          })
        } else {
          updated[resourceKey].completionCount += 1

          toast({
            title: "Already Completed",
            description: "You've already completed this resource. Keep up the great work!",
          })
        }

        return updated
      })
    },
    [user, saveProgressData, toast],
  )

  // Get progress for a specific resource
  const getResourceProgress = useCallback(
    (resourceId: number): ResourceProgress | null => {
      const resourceKey = `resource_${resourceId}`
      return progressData[resourceKey] || null
    },
    [progressData],
  )

  // Get formatted last practiced date
  const getLastPracticedText = useCallback(
    (resourceId: number, t: (key: string) => string): string => {
      const progress = getResourceProgress(resourceId)
      if (!progress?.lastPracticed) return t("selfHelp.never")

      const now = new Date()
      const lastPracticed = progress.lastPracticed
      const diffTime = now.getTime() - lastPracticed.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return t("selfHelp.today")
      if (diffDays === 1) return t("selfHelp.yesterday")
      return `${diffDays} ${t("selfHelp.daysAgo")}`
    },
    [getResourceProgress],
  )

  // Format duration in minutes
  const formatDuration = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    if (minutes === 0) return "< 1 min"
    return `${minutes} min`
  }, [])

  // Load data on mount and user change
  useEffect(() => {
    loadProgressData()
  }, [loadProgressData])

  return {
    // Data
    progressData,
    userStats,
    isLoading,

    // Actions
    startSession,
    completeSession,
    markResourceCompleted,

    // Getters
    getResourceProgress,
    getLastPracticedText,
    formatDuration,

    // Utils
    loadProgressData,
  }
}
