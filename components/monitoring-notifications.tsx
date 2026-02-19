"use client"

import { useEffect, useState } from "react"
import { Bell, CheckCircle, Clock, AlertCircle, CheckCircle2, Circle, Pill, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/use-notifications"
import { useLanguage } from "@/contexts/language-context"
import useSWR from "swr"

interface MonitoringNotificationsProps {
  userId: string | undefined
  todaysMeds?: any[]
  todaysActivities?: any[]
  handleMedicationCheck?: (medicationId: string, time: string, taken: boolean) => void
  handleActivityToggle?: (activityId: string, isCompleted: boolean) => void
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function MonitoringNotifications({ 
  userId, 
  todaysMeds, 
  todaysActivities,
  handleMedicationCheck,
  handleActivityToggle 
}: MonitoringNotificationsProps) {
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

        {/* Daftar Tugas Hari Ini */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            {language === "id" ? "Daftar Tugas Hari Ini" : "Today's To-Do List"}
          </h4>
          <p className="text-xs text-muted-foreground">
            {language === "id" ? "Obat dan aktivitas yang harus dilakukan hari ini" : "Medications and activities to complete today"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AM (Morning) Column */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {language === "id" ? "Pagi" : "AM"}
                </div>
                <span className="text-xs text-muted-foreground">(00:00 - 11:59)</span>
              </div>

              {/* AM Medications */}
              {todaysMeds && todaysMeds.length > 0 ? (
                todaysMeds.map((med) => 
                  med.times?.filter((time: string) => {
                    const [hours] = time.split(":").map(Number)
                    return hours < 12
                  }).map((time: string) => {
                    const log = med.logs?.find((l: any) => l.scheduledTime === time)
                    const isTaken = log?.taken || false
                    const currentTime = new Date()
                    const scheduleTime = new Date()
                    const [hours, minutes] = time.split(":")
                    scheduleTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)
                    const isPastDue = currentTime > scheduleTime

                    return (
                      <div
                        key={`${med.id}-${time}`}
                        className={`p-2 rounded-lg border transition-all ${
                          isTaken
                            ? "bg-green-50 border-green-200"
                            : isPastDue
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => handleMedicationCheck?.(med.id, time, !isTaken)}
                            className="flex items-center justify-center mt-0.5"
                          >
                            {isTaken ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400 hover:text-green-600 transition-colors" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Pill className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <span className="font-medium text-xs truncate">{med.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{time}</span>
                              <span>•</span>
                              <span className="truncate">{med.dosage}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )
              ) : null}

              {/* AM Activities */}
              {todaysActivities
                ?.filter((activity) => {
                  const [hours] = activity.scheduled_time.split(":").map(Number)
                  return hours < 12
                })
                .map((activity) => {
                  const isCompleted = activity.completed_at !== null

                  return (
                    <div
                      key={activity.id}
                      className={`p-2 rounded-lg border transition-all ${
                        isCompleted ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleActivityToggle?.(activity.id, !isCompleted)}
                          className="flex items-center justify-center mt-0.5"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400 hover:text-green-600 transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Activity className="w-3 h-3 text-purple-600 flex-shrink-0" />
                            <span className="font-medium text-xs truncate">{activity.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{typeof activity.scheduled_time === 'string' ? activity.scheduled_time.slice(0, 5) : activity.scheduled_time}</span>
                            <span>•</span>
                            <span>{activity.duration_minutes} {language === "id" ? "mnt" : "min"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

              {/* Empty state for AM */}
              {(!todaysMeds || todaysMeds.every(med => !med.times?.some((t: string) => Number.parseInt(t.split(':')[0]) < 12))) &&
               (!todaysActivities || !todaysActivities.some(a => Number.parseInt(a.scheduled_time.split(':')[0]) < 12)) && (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                  <p className="text-xs">{language === "id" ? "Tidak ada tugas pagi" : "No morning tasks"}</p>
                </div>
              )}
            </div>

            {/* PM (Afternoon/Evening) Column */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <div className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {language === "id" ? "Malam" : "PM"}
                </div>
                <span className="text-xs text-muted-foreground">(12:00 - 23:59)</span>
              </div>

              {/* PM Medications */}
              {todaysMeds && todaysMeds.length > 0 ? (
                todaysMeds.map((med) => 
                  med.times?.filter((time: string) => {
                    const [hours] = time.split(":").map(Number)
                    return hours >= 12
                  }).map((time: string) => {
                    const log = med.logs?.find((l: any) => l.scheduledTime === time)
                    const isTaken = log?.taken || false
                    const currentTime = new Date()
                    const scheduleTime = new Date()
                    const [hours, minutes] = time.split(":")
                    scheduleTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)
                    const isPastDue = currentTime > scheduleTime

                    return (
                      <div
                        key={`${med.id}-${time}`}
                        className={`p-2 rounded-lg border transition-all ${
                          isTaken
                            ? "bg-green-50 border-green-200"
                            : isPastDue
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => handleMedicationCheck?.(med.id, time, !isTaken)}
                            className="flex items-center justify-center mt-0.5"
                          >
                            {isTaken ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400 hover:text-green-600 transition-colors" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Pill className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <span className="font-medium text-xs truncate">{med.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{time}</span>
                              <span>•</span>
                              <span className="truncate">{med.dosage}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )
              ) : null}

              {/* PM Activities */}
              {todaysActivities
                ?.filter((activity) => {
                  const [hours] = activity.scheduled_time.split(":").map(Number)
                  return hours >= 12
                })
                .map((activity) => {
                  const isCompleted = activity.completed_at !== null

                  return (
                    <div
                      key={activity.id}
                      className={`p-2 rounded-lg border transition-all ${
                        isCompleted ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleActivityToggle?.(activity.id, !isCompleted)}
                          className="flex items-center justify-center mt-0.5"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400 hover:text-green-600 transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Activity className="w-3 h-3 text-purple-600 flex-shrink-0" />
                            <span className="font-medium text-xs truncate">{activity.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{typeof activity.scheduled_time === 'string' ? activity.scheduled_time.slice(0, 5) : activity.scheduled_time}</span>
                            <span>•</span>
                            <span>{activity.duration_minutes} {language === "id" ? "mnt" : "min"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

              {/* Empty state for PM */}
              {(!todaysMeds || todaysMeds.every(med => !med.times?.some((t: string) => Number.parseInt(t.split(':')[0]) >= 12))) &&
               (!todaysActivities || !todaysActivities.some(a => Number.parseInt(a.scheduled_time.split(':')[0]) >= 12)) && (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                  <p className="text-xs">{language === "id" ? "Tidak ada tugas malam" : "No evening tasks"}</p>
                </div>
              )}
            </div>
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
