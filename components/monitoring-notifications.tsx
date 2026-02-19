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
  const { isSupported, permission, preferences, subscribe } = useNotifications({ userId, enabled: true })
  const [isSetupComplete, setIsSetupComplete] = useState(false)

  // Fetch user's active reminders/schedules
  const { data: schedules } = useSWR(
    userId ? `/api/schedules?user_id=${userId}` : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  useEffect(() => {
    // Check if notifications are already enabled
    if (preferences?.notifications_enabled) {
      setIsSetupComplete(true)
    }
  }, [preferences])

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
          {isSetupComplete || preferences?.notifications_enabled ? (
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
          {isSetupComplete || preferences?.notifications_enabled ? t.enabled : t.setupDesc}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSetupComplete && !preferences?.notifications_enabled && (
          <Button onClick={handleSetupNotifications} className="w-full">
            <Bell className="w-4 h-4 mr-2" />
            {t.enableNotifications}
          </Button>
        )}

        {/* Upcoming Schedules */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            {t.todaySchedules}
          </h4>

          {schedules && schedules.length > 0 ? (
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
          ) : (
            <p className="text-sm text-muted-foreground py-3 text-center">{t.noSchedules}</p>
          )}
        </div>

        {/* Info Text */}
        {isSetupComplete || preferences?.notifications_enabled ? (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
            {language === "id"
              ? "Anda akan menerima pemberitahuan untuk pengingat jadwal minum obat dan aktivitas monitoring lainnya."
              : "You will receive notifications for medication reminders and other monitoring activities."}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
