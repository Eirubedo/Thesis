/**
 * Medication Adherence Calculation Utilities
 * Tracks which medications were scheduled vs taken to properly calculate "missed" doses
 */

export interface MedicationLog {
  id: string
  taken_at: string | null
  was_taken: boolean
  scheduled_at: string | null
}

export interface MedicationWithLogs {
  id: string
  name: string
  logs: MedicationLog[]
}

export interface DailyAdherence {
  date: string
  taken: number
  missed: number
  scheduled: number
}

/**
 * Calculate daily medication adherence
 * Counts all logs (both taken and missed) for proper adherence tracking
 */
export function calculateDailyAdherence(medications: MedicationWithLogs[], days: number = 7): DailyAdherence[] {
  const adherenceMap = new Map<string, { taken: number; missed: number; scheduled: number }>()

  // Initialize all dates
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    adherenceMap.set(dateStr, { taken: 0, missed: 0, scheduled: 0 })
  }

  // Count logs by date
  medications.forEach((med) => {
    (med.logs || []).forEach((log) => {
      // Use taken_at or scheduled_at to determine the date
      const logDate = log.taken_at || log.scheduled_at
      if (logDate) {
        const dateStr = logDate.split("T")[0]
        const current = adherenceMap.get(dateStr)
        if (current) {
          current.scheduled += 1
          if (log.was_taken) {
            current.taken += 1
          } else {
            current.missed += 1
          }
        }
      }
    })
  })

  // Convert to array with formatted dates
  return Array.from(adherenceMap.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))
}

/**
 * Calculate adherence percentage
 */
export function calculateAdherencePercentage(adherence: DailyAdherence[]): number {
  const totalScheduled = adherence.reduce((sum, day) => sum + day.scheduled, 0)
  const totalTaken = adherence.reduce((sum, day) => sum + day.taken, 0)

  if (totalScheduled === 0) return 0
  return Math.round((totalTaken / totalScheduled) * 100)
}

/**
 * Get today's adherence summary
 */
export function getTodayAdherence(medications: MedicationWithLogs[]): { taken: number; missed: number; scheduled: number } {
  const today = new Date().toISOString().split("T")[0]
  const todayAdherence = { taken: 0, missed: 0, scheduled: 0 }

  medications.forEach((med) => {
    (med.logs || []).forEach((log) => {
      const logDate = (log.taken_at || log.scheduled_at)?.split("T")[0]
      if (logDate === today) {
        todayAdherence.scheduled += 1
        if (log.was_taken) {
          todayAdherence.taken += 1
        } else {
          todayAdherence.missed += 1
        }
      }
    })
  })

  return todayAdherence
}
