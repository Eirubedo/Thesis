"use client"

import { ChartLegendContent } from "@/components/ui/chart"

import { ChartLegend } from "@/components/ui/chart"

import { ChartTooltipContent } from "@/components/ui/chart"

import { ChartTooltip } from "@/components/ui/chart"

import { ChartContainer } from "@/components/ui/chart"

import React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  Line,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Heart,
  Activity,
  Pill,
  Plus,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Trash2,
  X,
  Bell,
  BellOff,
  CalendarClock,
  HelpCircle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useBPTracking } from "@/hooks/use-bp-tracking"
import { useMedicationTracking } from "@/hooks/use-medication-tracking"
import { useActivityScheduling } from "@/hooks/use-activity-scheduling"
import { MonitoringNotifications } from "@/components/monitoring-notifications"
import { useLanguage } from "@/contexts/language-context"
import type { ActivityType } from "@/types/database"

export default function MonitoringPage() {
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const { readings, addReading, deleteReading, getStats, getAverageReading, getCategoryColor, getCategoryLabel } =
    useBPTracking()

  const {
    medications,
    addMedication,
    markMedicationTaken,
    getAdherenceRate,
    getTodaysMedications,
    getMissedDoses,
    deleteMedication,
  } = useMedicationTracking()

  const {
    schedules,
    addSchedule,
    logActivity,
    deleteSchedule,
    getTodaysSchedule,
    getUpcomingSchedule,
    getActivityStatistics,
  } = useActivityScheduling()

  // Chat Activity State
  const [chatActivityData, setChatActivityData] = useState<any[]>([])
  const [isLoadingChartData, setIsLoadingChartData] = useState(true)

  // BP Form State
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [pulse, setPulse] = useState("")
  const [bpNotes, setBpNotes] = useState("")
  const [isAddingBP, setIsAddingBP] = useState(false)

  // Medication Form State
  const [medName, setMedName] = useState("")
  const [medDosage, setMedDosage] = useState("")
  const [medTimes, setMedTimes] = useState<string[]>([""])
  const [medNotes, setMedNotes] = useState("")
  const [isAddingMed, setIsAddingMed] = useState(false)

  // Schedule Form State
  const [scheduleType, setScheduleType] = useState<ActivityType>("breathing")
  const [scheduleTitle, setScheduleTitle] = useState("")
  const [scheduleDesc, setScheduleDesc] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [scheduleDuration, setScheduleDuration] = useState("10")
  const [scheduleDays, setScheduleDays] = useState<string[]>([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ])
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderBefore, setReminderBefore] = useState("15")
  const [isAddingSchedule, setIsAddingSchedule] = useState(false)

  const handleAddBP = () => {
    if (systolic && diastolic && pulse) {
      addReading(Number.parseInt(systolic), Number.parseInt(diastolic), Number.parseInt(pulse), bpNotes || undefined)
      setSystolic("")
      setDiastolic("")
      setPulse("")
      setBpNotes("")
      setIsAddingBP(false)
    }
  }

  const handleAddMedication = () => {
    if (medName && medDosage) {
      addMedication({
        name: medName,
        dosage: medDosage,
        times: medTimes.filter((time) => time !== ""),
        notes: medNotes || undefined,
      })
      setMedName("")
      setMedDosage("")
      setMedTimes([""])
      setMedNotes("")
      setIsAddingMed(false)
    }
  }

  const addTimeSlot = () => {
    setMedTimes([...medTimes, ""])
  }

  const updateTimeSlot = (index: number, value: string) => {
    const newTimes = [...medTimes]
    newTimes[index] = value
    setMedTimes(newTimes)
  }

  const removeTimeSlot = (index: number) => {
    setMedTimes(medTimes.filter((_, i) => i !== index))
  }

  const handleMedicationCheck = async (medicationId: string, scheduledTime: string, checked: boolean) => {
    await markMedicationTaken(medicationId, scheduledTime, checked)
  }

  const handleDeleteMedication = async (medicationId: string) => {
    await deleteMedication(medicationId)
  }

  // Schedule Handlers
  const handleAddSchedule = async () => {
    if (scheduleTitle && scheduleTime && scheduleDays.length > 0) {
      await addSchedule({
        activity_type: scheduleType,
        title: scheduleTitle,
        description: scheduleDesc,
        scheduled_time: scheduleTime,
        scheduled_days: scheduleDays as any,
        duration_minutes: Number.parseInt(scheduleDuration),
        reminder_enabled: reminderEnabled,
        reminder_minutes_before: Number.parseInt(reminderBefore),
      })
      setScheduleTitle("")
      setScheduleDesc("")
      setScheduleTime("")
      setScheduleDuration("10")
      setScheduleDays(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])
      setReminderEnabled(true)
      setReminderBefore("15")
      setIsAddingSchedule(false)
    }
  }

  const toggleDay = (day: string) => {
    setScheduleDays((prev) => {
      if (prev.includes(day)) {
        // Don't allow removing the last day
        if (prev.length === 1) return prev
        return prev.filter((d) => d !== day)
      } else {
        return [...prev, day]
      }
    })
  }

  const handleCompleteActivity = async (scheduleId: string) => {
    await logActivity(scheduleId)
  }

  const handleActivityToggle = async (scheduleId: string, isCompleted: boolean) => {
    if (isCompleted) {
      await logActivity(scheduleId)
    }
    // If uncompleting, we would need to delete the log, but for now we just mark as complete
  }

  const stats = getStats(30)
  const averageReading = getAverageReading(30)
  const adherenceStats = getAdherenceRate(30)
  const todaysMeds = getTodaysMedications()
  const missedDoses = getMissedDoses(7)

  const activityStats = getActivityStatistics()
  const todaysActivities = getTodaysSchedule()
  const upcomingActivities = getUpcomingSchedule()

  // Calculate today's medication progress
  const totalScheduledToday = todaysMeds.reduce((total, med) => total + (med.times?.length || 0), 0)
  const takenToday = todaysMeds.reduce((total, med) => total + (med.logs?.filter((log) => log.taken).length || 0), 0)

  // Fetch chat activity data
  React.useEffect(() => {
    const fetchChatActivity = async () => {
      if (!user?.id) return

      try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data, error } = await supabase
          .from("conversations")
          .select("started_at, message_count")
          .eq("user_id", user.id)
          .gte("started_at", thirtyDaysAgo.toISOString())
          .order("started_at", { ascending: true })

        if (error) throw error

        // Group by day
        const groupedByDay: { [key: string]: { count: number; messages: number } } = {}
        data?.forEach((conv: any) => {
          const date = new Date(conv.started_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
          if (!groupedByDay[date]) {
            groupedByDay[date] = { count: 0, messages: 0 }
          }
          groupedByDay[date].count += 1
          groupedByDay[date].messages += conv.message_count || 0
        })

        const chartData = Object.entries(groupedByDay).map(([date, data]) => ({
          date,
          sessions: data.count,
          messages: data.messages,
        }))

        setChatActivityData(chartData)
      } catch (error) {
        console.error("Error fetching chat activity:", error)
      } finally {
        setIsLoadingChartData(false)
      }
    }

    fetchChatActivity()
  }, [user?.id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-20 pb-12">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("monitoring.title")}</h1>
          <p className="text-gray-600">{t("monitoring.subtitle")}</p>
        </div>

        {/* Monitoring Notifications Widget */}
        <div className="mb-6">
          <MonitoringNotifications userId={user?.id} />
        </div>

        <Tabs defaultValue="bp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bp" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {t("monitoring.bpInput")}
            </TabsTrigger>
            <TabsTrigger value="medication" className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              {t("monitoring.medicationInput")}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4" />
              {t("monitoring.scheduleTab") || "Jadwal Aktivitas"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bp" className="space-y-6">
            {/* BP Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("bp.last30days")}</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {averageReading.systolic}/{averageReading.diastolic}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("bp.average")} • {stats.totalReadings} {t("bp.recentReadings").toLowerCase()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("bp.heartRate")}</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageReading.heartRate || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {t("bp.bpm")} {t("bp.average").toLowerCase()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("reports.latestBP")}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {stats.lastReading ? (
                    <>
                      <div className="text-2xl font-bold">
                        {stats.lastReading.systolic}/{stats.lastReading.diastolic}
                      </div>
                      <Badge className={getCategoryColor(stats.lastReading.category)}>
                        {getCategoryLabel(stats.lastReading.category)}
                      </Badge>
                      {stats.lastReading.heart_rate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.lastReading.heart_rate} {t("bp.bpm")}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">{t("bp.noReadings")}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Add BP Button */}
            <Dialog open={isAddingBP} onOpenChange={setIsAddingBP}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("bp.addReading")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("bp.addReading")}</DialogTitle>
                  <DialogDescription>{t("bp.noReadingsDesc")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* BP Device Reading Guide */}
                  <TooltipProvider>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 mb-1">
                            {language === "id" ? "Cara Membaca Alat Ukur" : "How to Read Your Device"}
                          </p>
                          <p className="text-blue-700">
                            {language === "id" 
                              ? "Pada layar alat ukur tekanan darah digital: angka ATAS (besar) adalah Sistolik, angka BAWAH adalah Diastolik, dan simbol hati/jantung menunjukkan Denyut Nadi."
                              : "On digital BP monitor display: TOP number (larger) is Systolic, BOTTOM number is Diastolic, and heart symbol shows Pulse Rate."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="systolic">{t("bp.systolic")}</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="text-xs">
                              {language === "id" 
                                ? "Angka ATAS/BESAR pada layar alat. Normal: 90-120 mmHg" 
                                : "TOP/LARGER number on device. Normal: 90-120 mmHg"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="systolic"
                        type="number"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        placeholder="120"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="diastolic">{t("bp.diastolic")}</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="text-xs">
                              {language === "id" 
                                ? "Angka BAWAH/KECIL pada layar alat. Normal: 60-80 mmHg" 
                                : "BOTTOM/SMALLER number on device. Normal: 60-80 mmHg"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="diastolic"
                        type="number"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        placeholder="80"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="pulse">{t("bp.heartRate")}</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="text-xs">
                              {language === "id" 
                                ? "Angka dengan simbol hati/jantung. Normal: 60-100 bpm" 
                                : "Number with heart symbol. Normal: 60-100 bpm"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="pulse"
                        type="number"
                        value={pulse}
                        onChange={(e) => setPulse(e.target.value)}
                        placeholder="70"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bp-notes">{t("bp.notes")}</Label>
                    <Textarea
                      id="bp-notes"
                      value={bpNotes}
                      onChange={(e) => setBpNotes(e.target.value)}
                      placeholder={t("bp.notes")}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingBP(false)}>
                    {t("bp.cancel")}
                  </Button>
                  <Button onClick={handleAddBP}>{t("bp.save")}</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* BP Readings List */}
            <Card>
              <CardHeader>
                <CardTitle>{t("bp.recentReadings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {readings.slice(0, 10).map((reading) => (
                    <div key={reading.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-semibold">
                          {reading.systolic}/{reading.diastolic}
                        </div>
                        <Badge className={getCategoryColor(reading.category)}>
                          {getCategoryLabel(reading.category)}
                        </Badge>
                        {reading.heart_rate && (
                          <div className="text-sm text-muted-foreground">
                            {reading.heart_rate} {t("bp.bpm")}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {reading.measurement_date ? new Date(reading.measurement_date).toLocaleDateString() : "N/A"}
                      </div>
                    </div>
                  ))}
                  {readings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">{t("bp.noReadingsDesc")}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medication" className="space-y-6">
            {/* Medication Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("monitoring.todaysProgress")}</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {takenToday}/{totalScheduledToday}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("monitoring.medicationsTaken")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("meds.adherence")}</CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adherenceStats.monthly || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    {t("meds.thisMonth")} • {adherenceStats.weekly || 0}% {t("meds.thisWeek").toLowerCase()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("meds.currentMedications")}</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{medications?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">{t("meds.currentMedications")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("meds.missed")} (7 {t("common.days")})
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{missedDoses || 0}</div>
                  <p className="text-xs text-muted-foreground">{t("bp.last7days")}</p>
                </CardContent>
              </Card>
            </div>

            {/* Add Medication Button */}
            <Dialog open={isAddingMed} onOpenChange={setIsAddingMed}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("meds.addMedication")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("meds.addMedication")}</DialogTitle>
                  <DialogDescription>{t("monitoring.addMedicationDesc")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="med-name">{t("meds.medicationName")}</Label>
                    <Input
                      id="med-name"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      placeholder="e.g., Amlodipine"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-dosage">{t("meds.dosage")}</Label>
                    <Input
                      id="med-dosage"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      placeholder="e.g., 5mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("monitoring.scheduleTimes")}</Label>
                    {medTimes.map((time, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => updateTimeSlot(index, e.target.value)}
                          className="flex-1"
                        />
                        {medTimes.length > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeTimeSlot(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTimeSlot}
                      className="w-full bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("monitoring.addTime")}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-notes">{t("meds.notes")}</Label>
                    <Textarea
                      id="med-notes"
                      value={medNotes}
                      onChange={(e) => setMedNotes(e.target.value)}
                      placeholder={t("monitoring.additionalNotes")}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingMed(false)}>
                    {t("monitoring.cancel")}
                  </Button>
                  <Button onClick={handleAddMedication}>{t("monitoring.addMedication")}</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Current Medications Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  {t("meds.currentMedications")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("meds.manageMedicationList")}</p>
              </CardHeader>
              <CardContent>
                {medications && medications.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("meds.medicationName")}</TableHead>
                        <TableHead>{t("meds.dosage")}</TableHead>
                        <TableHead>{t("monitoring.schedule")}</TableHead>
                        <TableHead>{t("meds.notes")}</TableHead>
                        <TableHead className="text-right">{t("monitoring.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medications.map((medication) => (
                        <TableRow key={medication.id}>
                          <TableCell className="font-medium">{medication.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{medication.dosage}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {medication.times?.map((time, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{medication.notes || "-"}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Medication</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{medication.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteMedication(medication.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No medications added yet</p>
                    <p className="text-sm">Add your first medication to start tracking</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Combined To-Do List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {language === "id" ? "Daftar Tugas Hari Ini" : "Today's To-Do List"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {language === "id" ? "Obat dan aktivitas yang harus dilakukan hari ini" : "Medications and activities to complete today"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AM (Morning) Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                      <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {language === "id" ? "Pagi" : "AM"}
                      </div>
                      <span className="text-sm text-muted-foreground">(00:00 - 11:59)</span>
                    </div>

                    {/* AM Medications */}
                    {todaysMeds && todaysMeds.length > 0 ? (
                      todaysMeds.map((med) => 
                        med.times?.filter((time) => {
                          const [hours] = time.split(":").map(Number)
                          return hours < 12
                        }).map((time, index) => {
                          const log = med.logs?.find((l) => l.scheduledTime === time)
                          const isTaken = log?.taken || false
                          const currentTime = new Date()
                          const scheduleTime = new Date()
                          const [hours, minutes] = time.split(":")
                          scheduleTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)
                          const isPastDue = currentTime > scheduleTime

                          return (
                            <div
                              key={`${med.id}-${time}`}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                isTaken
                                  ? "bg-green-50 border-green-200"
                                  : isPastDue
                                    ? "bg-red-50 border-red-200"
                                    : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => handleMedicationCheck(med.id, time, !isTaken)}
                                  className="flex items-center justify-center mt-0.5"
                                >
                                  {isTaken ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400 hover:text-green-600 transition-colors" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Pill className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-sm">{med.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{time}</span>
                                    <span>•</span>
                                    <span>{med.dosage}</span>
                                  </div>
                                  {isTaken && (
                                    <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                                      {t("monitoring.taken")}
                                    </Badge>
                                  )}
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
                            className={`p-3 rounded-lg border-2 transition-all ${
                              isCompleted ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleActivityToggle(activity.id, !isCompleted)}
                                className="flex items-center justify-center mt-0.5"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400 hover:text-green-600 transition-colors" />
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Activity className="w-4 h-4 text-purple-600" />
                                  <span className="font-medium text-sm">{activity.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{activity.scheduled_time}</span>
                                  <span>•</span>
                                  <span>{activity.duration_minutes} {language === "id" ? "menit" : "min"}</span>
                                </div>
                                {isCompleted && (
                                  <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                                    {t("monitoring.completed")}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}

                    {/* Empty state for AM */}
                    {(!todaysMeds || todaysMeds.every(med => !med.times?.some(t => Number.parseInt(t.split(':')[0]) < 12))) &&
                     (!todaysActivities || !todaysActivities.some(a => Number.parseInt(a.scheduled_time.split(':')[0]) < 12)) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">{language === "id" ? "Tidak ada tugas pagi" : "No morning tasks"}</p>
                      </div>
                    )}
                  </div>

                  {/* PM (Afternoon/Evening) Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                      <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {language === "id" ? "Malam" : "PM"}
                      </div>
                      <span className="text-sm text-muted-foreground">(12:00 - 23:59)</span>
                    </div>

                    {/* PM Medications */}
                    {todaysMeds && todaysMeds.length > 0 ? (
                      todaysMeds.map((med) => 
                        med.times?.filter((time) => {
                          const [hours] = time.split(":").map(Number)
                          return hours >= 12
                        }).map((time, index) => {
                          const log = med.logs?.find((l) => l.scheduledTime === time)
                          const isTaken = log?.taken || false
                          const currentTime = new Date()
                          const scheduleTime = new Date()
                          const [hours, minutes] = time.split(":")
                          scheduleTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)
                          const isPastDue = currentTime > scheduleTime

                          return (
                            <div
                              key={`${med.id}-${time}`}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                isTaken
                                  ? "bg-green-50 border-green-200"
                                  : isPastDue
                                    ? "bg-red-50 border-red-200"
                                    : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => handleMedicationCheck(med.id, time, !isTaken)}
                                  className="flex items-center justify-center mt-0.5"
                                >
                                  {isTaken ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400 hover:text-green-600 transition-colors" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Pill className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-sm">{med.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{time}</span>
                                    <span>•</span>
                                    <span>{med.dosage}</span>
                                  </div>
                                  {isTaken && (
                                    <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                                      {t("monitoring.taken")}
                                    </Badge>
                                  )}
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
                            className={`p-3 rounded-lg border-2 transition-all ${
                              isCompleted ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleActivityToggle(activity.id, !isCompleted)}
                                className="flex items-center justify-center mt-0.5"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400 hover:text-green-600 transition-colors" />
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Activity className="w-4 h-4 text-purple-600" />
                                  <span className="font-medium text-sm">{activity.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{activity.scheduled_time}</span>
                                  <span>•</span>
                                  <span>{activity.duration_minutes} {language === "id" ? "menit" : "min"}</span>
                                </div>
                                {isCompleted && (
                                  <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                                    {t("monitoring.completed")}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}

                    {/* Empty state for PM */}
                    {(!todaysMeds || todaysMeds.every(med => !med.times?.some(t => Number.parseInt(t.split(':')[0]) >= 12))) &&
                     (!todaysActivities || !todaysActivities.some(a => Number.parseInt(a.scheduled_time.split(':')[0]) >= 12)) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">{language === "id" ? "Tidak ada tugas malam" : "No evening tasks"}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Original Detailed Medication Checklist (kept for reference) */}
            <Card className="hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {t("monitoring.todaysChecklist")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("monitoring.checklistDescription")}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysMeds && todaysMeds.length > 0 ? (
                    todaysMeds.map((med) => (
                      <div key={med.id} className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{med.name}</h3>
                            <p className="text-sm text-muted-foreground">{med.dosage}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {med.times &&
                            med.times.map((time, index) => {
                              const log = med.logs?.find((l) => l.scheduledTime === time)
                              const isTaken = log?.taken || false
                              const currentTime = new Date()
                              const scheduleTime = new Date()
                              const [hours, minutes] = time.split(":")
                              scheduleTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

                              const isPastDue = currentTime > scheduleTime
                              const isUpcoming =
                                !isPastDue && scheduleTime.getTime() - currentTime.getTime() < 60 * 60 * 1000 // Within 1 hour

                              return (
                                <div
                                  key={index}
                                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                                    isTaken
                                      ? "bg-green-50 border-green-200"
                                      : isPastDue
                                        ? "bg-red-50 border-red-200"
                                        : isUpcoming
                                          ? "bg-yellow-50 border-yellow-200"
                                          : "bg-gray-50 border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => handleMedicationCheck(med.id, time, !isTaken)}
                                      className="flex items-center justify-center"
                                    >
                                      {isTaken ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                      ) : (
                                        <Circle className="w-6 h-6 text-gray-400 hover:text-green-600 transition-colors" />
                                      )}
                                    </button>
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium">{time}</span>
                                      </div>
                                      {isTaken && log?.takenAt && (
                                        <p className="text-xs text-green-600 mt-1">
                                          {t("monitoring.takenAt")}{" "}
                                          {new Date(log.takenAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    {isTaken ? (
                                      <Badge className="bg-green-100 text-green-800">{t("monitoring.taken")}</Badge>
                                    ) : isPastDue ? (
                                      <Badge className="bg-red-100 text-red-800">{t("monitoring.overdue")}</Badge>
                                    ) : isUpcoming ? (
                                      <Badge className="bg-yellow-100 text-yellow-800">{t("monitoring.dueSoon")}</Badge>
                                    ) : (
                                      <Badge variant="outline">{t("monitoring.scheduled")}</Badge>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>{t("monitoring.noMedicationsToday")}</p>
                      <p className="text-sm">{t("monitoring.noMedicationsDesc")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            {/* Schedule Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("monitoring.todaysActivities") || "Aktivitas Hari Ini"}
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {activityStats.todayCompleted}/{activityStats.todayTotal}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activityStats.todayPercentage}% {t("monitoring.completed") || "selesai"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("monitoring.upcomingToday") || "Akan Datang"}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activityStats.upcomingToday}</div>
                  <p className="text-xs text-muted-foreground">
                    {t("monitoring.activitiesRemaining") || "aktivitas tersisa"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("monitoring.totalSchedules") || "Total Jadwal"}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activityStats.totalSchedules}</div>
                  <p className="text-xs text-muted-foreground">{t("monitoring.activeSchedules") || "jadwal aktif"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("monitoring.remindersEnabled") || "Pengingat Aktif"}
                  </CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{schedules.filter((s) => s.reminder_enabled).length}</div>
                  <p className="text-xs text-muted-foreground">{t("monitoring.withReminders") || "dengan pengingat"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Add Schedule Button */}
            <Dialog open={isAddingSchedule} onOpenChange={setIsAddingSchedule}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("monitoring.addSchedule") || "Tambah Jadwal"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("monitoring.addSchedule") || "Tambah Jadwal Aktivitas"}</DialogTitle>
                  <DialogDescription>
                    {t("monitoring.addScheduleDesc") || "Jadwalkan aktivitas kesehatan Anda dengan pengingat otomatis"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-type">{t("monitoring.activityType") || "Jenis Aktivitas"}</Label>
                    <Select value={scheduleType} onValueChange={(value) => setScheduleType(value as ActivityType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breathing">Teknik Pernapasan</SelectItem>
                        <SelectItem value="exercise">Olahraga</SelectItem>
                        <SelectItem value="meditation">Meditasi</SelectItem>
                        <SelectItem value="stress_management">Manajemen Stres</SelectItem>
                        <SelectItem value="bp_measurement">Cek Tekanan Darah</SelectItem>
                        <SelectItem value="medication">Minum Obat</SelectItem>
                        <SelectItem value="diet">Diet & Nutrisi</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule-title">{t("monitoring.activityTitle") || "Nama Aktivitas"}</Label>
                    <Input
                      id="schedule-title"
                      value={scheduleTitle}
                      onChange={(e) => setScheduleTitle(e.target.value)}
                      placeholder={t("monitoring.activityTitlePlaceholder") || "e.g., Pernapasan Pagi"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule-desc">{t("monitoring.description") || "Deskripsi"}</Label>
                    <Textarea
                      id="schedule-desc"
                      value={scheduleDesc}
                      onChange={(e) => setScheduleDesc(e.target.value)}
                      placeholder={t("monitoring.descriptionPlaceholder") || "Deskripsi aktivitas (opsional)"}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === "id" ? "Hari" : "Days"}</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {[
                        { key: "monday", label: language === "id" ? "Sen" : "Mon" },
                        { key: "tuesday", label: language === "id" ? "Sel" : "Tue" },
                        { key: "wednesday", label: language === "id" ? "Rab" : "Wed" },
                        { key: "thursday", label: language === "id" ? "Kam" : "Thu" },
                        { key: "friday", label: language === "id" ? "Jum" : "Fri" },
                        { key: "saturday", label: language === "id" ? "Sab" : "Sat" },
                        { key: "sunday", label: language === "id" ? "Min" : "Sun" },
                      ].map((day) => (
                        <Button
                          key={day.key}
                          type="button"
                          variant={scheduleDays.includes(day.key) ? "default" : "outline"}
                          size="sm"
                          className="h-10 text-xs"
                          onClick={() => toggleDay(day.key)}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language === "id" ? "Pilih minimal 1 hari" : "Select at least 1 day"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schedule-time">{t("monitoring.scheduledTime") || "Waktu"}</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="schedule-duration">{t("monitoring.duration") || "Durasi (menit)"}</Label>
                      <Input
                        id="schedule-duration"
                        type="number"
                        value={scheduleDuration}
                        onChange={(e) => setScheduleDuration(e.target.value)}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reminder-toggle">{t("monitoring.enableReminder") || "Aktifkan Pengingat"}</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setReminderEnabled(!reminderEnabled)}
                        className="h-8"
                      >
                        {reminderEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                      </Button>
                    </div>

                    {reminderEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="reminder-before">
                          {t("monitoring.reminderBefore") || "Ingatkan sebelum (menit)"}
                        </Label>
                        <Input
                          id="reminder-before"
                          type="number"
                          value={reminderBefore}
                          onChange={(e) => setReminderBefore(e.target.value)}
                          placeholder="15"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingSchedule(false)}>
                    {t("monitoring.cancel") || "Batal"}
                  </Button>
                  <Button onClick={handleAddSchedule}>{t("monitoring.save") || "Simpan"}</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Today's activities are now shown in the unified To-Do List in the medications tab */}

            {/* All Schedules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="w-5 h-5" />
                  {t("monitoring.allSchedules") || "Semua Jadwal"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("monitoring.activity") || "Aktivitas"}</TableHead>
                      <TableHead>{t("monitoring.time") || "Waktu"}</TableHead>
                      <TableHead>{t("monitoring.frequency") || "Frekuensi"}</TableHead>
                      <TableHead>{t("monitoring.reminder") || "Pengingat"}</TableHead>
                      <TableHead className="text-right">{t("monitoring.actions") || "Aksi"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.filter(s => s.is_active !== false).map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{schedule.title}</div>
                            <div className="text-sm text-muted-foreground">{schedule.description}</div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {schedule.activity_type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {schedule.scheduled_time}
                          </div>
                          <div className="text-xs text-muted-foreground">{schedule.duration_minutes} min</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{schedule.scheduled_days.length} hari/minggu</div>
                        </TableCell>
                        <TableCell>
                          {schedule.reminder_enabled ? (
                            <Badge variant="outline" className="text-xs">
                              <Bell className="w-3 h-3 mr-1" />
                              {schedule.reminder_minutes_before} min
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <BellOff className="w-3 h-3 mr-1" />
                              Off
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("monitoring.deleteSchedule") || "Hapus Jadwal?"}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("monitoring.deleteScheduleDesc") ||
                                    "Jadwal ini akan dihapus dan tidak dapat dikembalikan"}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("monitoring.cancel") || "Batal"}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSchedule(schedule.id)}>
                                  {t("monitoring.delete") || "Hapus"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {schedules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("monitoring.noSchedules") || "Belum ada jadwal yang dibuat"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
