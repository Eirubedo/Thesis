"use client"

import { useEffect, useState } from "react"
import { Bell, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/use-notifications"
import { useLanguage } from "@/contexts/language-context"
import useSWR from "swr"

interface MonitoringNotificationsProps {
  userId: string | undefined
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function MonitoringNotifications({ userId }: MonitoringNotificationsProps) {
  const { language } = useLanguage()
  const { isSupported, isSubscribed, permission, subscribe, medications, schedules, preferences } = useNotifications({ userId, enabled: true })
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component only renders after hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Check if notifications are already enabled
    if (isSubscribed) {
      setIsSetupComplete(true)
    }
  }, [isSubscribed])

  // Calculate upcoming medication reminders
  useEffect(() => {
    if (!medications || !Array.isArray(medications)) return

    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const reminders: any[] = []

      medications.forEach((med: any) => {
        if (med.time_slots && Array.isArray(med.time_slots)) {
          med.time_slots.forEach((timeStr: string) => {
            try {
              const [hours, minutes] = timeStr.split(":").map(Number)
              const reminderTime = new Date(today)
              reminderTime.setHours(hours, minutes, 0)

              // Include today's reminders that haven't passed and tomorrow's
              if (reminderTime >= now) {
                reminders.push({
                  id: `${med.id}-${timeStr}`,
                  medication: med.name,
                  dosage: med.dosage,
                  time: timeStr,
                  reminderTime,
                  isPast: false,
                })
              } else if (today.getTime() === new Date(reminderTime).getTime()) {
                // For tomorrow
                reminderTime.setDate(reminderTime.getDate() + 1)
                reminders.push({
                  id: `${med.id}-${timeStr}-tomorrow`,
                  medication: med.name,
                  dosage: med.dosage,
                  time: timeStr,
                  reminderTime,
                  isPast: false,
                })
              }
            } catch (error) {
              console.error("[v0] Error parsing medication time:", timeStr, error)
            }
          })
        }
      })

      // Sort by time
      reminders.sort((a, b) => a.reminderTime.getTime() - b.reminderTime.getTime())
      
      // Keep only next 5 reminders
      setUpcomingReminders(reminders.slice(0, 5))
    } catch (error) {
      console.error("[v0] Error calculating reminders:", error)
    }
  }, [medications])

  const handleSetupNotifications = async () => {
    if (isSupported && permission !== "granted") {
      const success = await subscribe("VAPID_PUBLIC_KEY_HERE", "Browser Device")
      if (success) {
        setIsSetupComplete(true)
      }
    }
  }

  const translations = {
    id: {
      title: "Pemberitahuan Monitoring",
      setupRequired: "Pengaturan Diperlukan",
      setupDesc: "Aktifkan pemberitahuan untuk menerima pengingat jadwal minum obat",
      enableNotifications: "Aktifkan Pemberitahuan",
      enabled: "Pemberitahuan Aktif",
      upcomingReminders: "Jadwal Mendatang",
      noSchedules: "Tidak ada jadwal yang ditetapkan",
      upcomingMeds: "Obat Mendatang",
      todaySchedules: "Jadwal Hari Ini",
      nextReminder: "Pengingat Berikutnya",
      notSupported: "Browser Anda tidak mendukung pemberitahuan",
    },
    en: {
      title: "Monitoring Notifications",
      setupRequired: "Setup Required",
      setupDesc: "Enable notifications to receive medication reminders",
      enableNotifications: "Enable Notifications",
      enabled: "Notifications Active",
      upcomingReminders: "Upcoming Reminders",
      noSchedules: "No schedules set",
      upcomingMeds: "Upcoming Medications",
      todaySchedules: "Today's Schedules",
      nextReminder: "Next Reminder",
      notSupported: "Your browser does not support notifications",
    },
  }

  const t = translations[language] || translations.en

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">{t.notSupported}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {t.title}
          </span>
          {isSetupComplete || preferences?.notification_medications ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              {language === "id" ? "Aktif" : "Active"}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              {language === "id" ? "Tidak Aktif" : "Inactive"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="mt-2">
          {isSetupComplete || preferences?.notification_medications ? t.enabled : t.setupDesc}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSetupComplete && (
          <Button onClick={handleSetupNotifications} className="w-full">
            <Bell className="w-4 h-4 mr-2" />
            {t.enableNotifications}
          </Button>
        )}

        {/* Daftar Tugas Checklist */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            {language === "id" ? "Daftar Tugas" : "Task Checklist"}
          </h4>

          {/* Combined Medications and Activities Checklist */}
          <div className="space-y-2">
            {upcomingReminders.length === 0 && (!schedules || schedules.length === 0) ? (
              <div className="text-sm text-muted-foreground py-4 text-center bg-gray-50 rounded-lg">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>{language === "id" ? "Semua tugas selesai!" : "All tasks completed!"}</p>
              </div>
            ) : (
              <>
                {/* Medication Tasks */}
                {upcomingReminders.slice(0, 3).map((reminder: any) => {
                  const now = new Date()
                  const isPast = reminder.reminderTime < now
                  return (
                    <div 
                      key={reminder.id} 
                      className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                        isPast 
                          ? "bg-red-50 border-red-200" 
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full ${isPast ? "bg-red-500" : "bg-blue-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{reminder.medication}</p>
                        <p className="text-xs text-muted-foreground">
                          {reminder.time} • {reminder.dosage}
                        </p>
                      </div>
                    </div>
                  )
                })}
                
                {/* Show total count if there are more tasks */}
                {(upcomingReminders.length + (schedules?.length || 0)) > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{(upcomingReminders.length + (schedules?.length || 0)) - 3} {language === "id" ? "tugas lagi" : "more tasks"}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Info Text */}
        {isSetupComplete ? (
          <div className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800">
            {language === "id"
              ? "✓ Pemberitahuan aktif. Anda akan menerima pengingat untuk obat yang dijadwalkan."
              : "✓ Notifications active. You will receive reminders for scheduled medications."}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
