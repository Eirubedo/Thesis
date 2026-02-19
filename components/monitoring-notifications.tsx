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

        {/* Upcoming Medication Reminders */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            {t.upcomingMeds}
          </h4>

          {upcomingReminders.length > 0 ? (
            <div className="space-y-2">
              {upcomingReminders.map((reminder: any) => {
                const timeStr = reminder.reminderTime.toLocaleTimeString(language === "id" ? "id-ID" : "en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                return (
                  <div key={reminder.id} className="flex items-start justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{reminder.medication}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {reminder.dosage ? `${reminder.dosage} • ` : ""}
                        {timeStr}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 border-blue-200">
                      {reminder.time}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-3 text-center bg-gray-50 rounded">
              {language === "id" ? "Belum ada obat yang dijadwalkan" : "No medications scheduled"}
            </div>
          )}
        </div>

        {/* Today's Activities */}
        {schedules && schedules.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              {t.todaySchedules}
            </h4>

            <div className="space-y-2">
              {schedules.slice(0, 3).map((schedule: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-2 bg-muted rounded text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">{schedule.activity_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === "id" ? "Waktu" : "Time"}: {schedule.scheduled_time}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {schedule.status === "completed" ? "✓" : "•"}
                  </Badge>
                </div>
              ))}
              {schedules.length > 3 && (
                <p className="text-xs text-muted-foreground pt-2">
                  +{schedules.length - 3} {language === "id" ? "lainnya" : "more"}
                </p>
              )}
            </div>
          </div>
        )}

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
