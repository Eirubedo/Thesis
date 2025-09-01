"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Timer,
} from "lucide-react"
import { useBPTracking } from "@/hooks/use-bp-tracking"
import { useMedicationTracking } from "@/hooks/use-medication-tracking"
import { useLanguage } from "@/contexts/language-context"

export default function MonitoringPage() {
  const { language, t } = useLanguage()
  const { readings, addReading, deleteReading, getStats, getAverageReading, getCategoryColor, getCategoryLabel } =
    useBPTracking()

  const {
    medications,
    addMedication,
    updateMedication,
    markMedicationTaken,
    getAdherenceRate,
    getTodaysMedications,
    getMissedDoses,
  } = useMedicationTracking()

  // BP Form State
  const [systolic, setSystolic] = useState("")
  const [diastolic, setDiastolic] = useState("")
  const [pulse, setPulse] = useState("")
  const [bpNotes, setBpNotes] = useState("")
  const [isAddingBP, setIsAddingBP] = useState(false)

  // Medication Form State
  const [medName, setMedName] = useState("")
  const [medDosage, setMedDosage] = useState("")
  const [medFrequency, setMedFrequency] = useState("")
  const [medTimes, setMedTimes] = useState<string[]>([""])
  const [medNotes, setMedNotes] = useState("")
  const [durationType, setDurationType] = useState<"lifelong" | "days" | "weeks" | "months" | "as_needed">("lifelong")
  const [durationValue, setDurationValue] = useState("")
  const [isAddingMed, setIsAddingMed] = useState(false)

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
    if (medName && medDosage && medFrequency) {
      addMedication({
        name: medName,
        dosage: medDosage,
        frequency: medFrequency,
        times: medTimes.filter((time) => time !== ""),
        start_date: new Date().toISOString(),
        duration_type: durationType,
        duration_value:
          durationType !== "lifelong" && durationType !== "as_needed" ? Number.parseInt(durationValue) : undefined,
        notes: medNotes || undefined,
      })
      setMedName("")
      setMedDosage("")
      setMedFrequency("")
      setMedTimes([""])
      setMedNotes("")
      setDurationType("lifelong")
      setDurationValue("")
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

  const getDurationText = (durationType?: string, durationValue?: number) => {
    if (!durationType) return ""

    switch (durationType) {
      case "lifelong":
        return t("monitoring.lifelong")
      case "as_needed":
        return t("monitoring.asNeeded")
      case "days":
        return `${durationValue} ${durationValue === 1 ? t("monitoring.day") : t("monitoring.days")}`
      case "weeks":
        return `${durationValue} ${durationValue === 1 ? t("monitoring.week") : t("monitoring.weeks")}`
      case "months":
        return `${durationValue} ${durationValue === 1 ? t("monitoring.month") : t("monitoring.months")}`
      default:
        return ""
    }
  }

  const getFrequencyText = (frequency?: string) => {
    if (!frequency) return ""

    switch (frequency) {
      case "once-daily":
        return t("monitoring.onceDailyFreq")
      case "twice-daily":
        return t("monitoring.twiceDailyFreq")
      case "three-times-daily":
        return t("monitoring.threeTimesDailyFreq")
      case "as-needed":
        return t("monitoring.asNeededFreq")
      default:
        return frequency
    }
  }

  const stats = getStats(30)
  const averageReading = getAverageReading(30)
  const adherenceStats = getAdherenceRate(30)
  const todaysMeds = getTodaysMedications()
  const missedDoses = getMissedDoses(7)

  // Calculate today's medication progress
  const totalScheduledToday = todaysMeds.reduce((total, med) => total + (med.times?.length || 0), 0)
  const takenToday = todaysMeds.reduce((total, med) => total + (med.logs?.filter((log) => log.taken).length || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-20 pb-12">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("monitoring.title")}</h1>
          <p className="text-gray-600">{t("monitoring.subtitle")}</p>
        </div>

        <Tabs defaultValue="bp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bp" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {t("monitoring.bpInput")}
            </TabsTrigger>
            <TabsTrigger value="medication" className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              {t("monitoring.medicationInput")}
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
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systolic">{t("bp.systolic")}</Label>
                      <Input
                        id="systolic"
                        type="number"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        placeholder="120"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diastolic">{t("bp.diastolic")}</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        placeholder="80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pulse">{t("bp.heartRate")}</Label>
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
                  <div className="text-2xl font-bold">{todaysMeds?.length || 0}</div>
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
                    <Label htmlFor="med-frequency">{t("meds.frequency")}</Label>
                    <Select value={medFrequency} onValueChange={setMedFrequency}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("meds.frequency")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once-daily">{t("monitoring.onceDailyFreq")}</SelectItem>
                        <SelectItem value="twice-daily">{t("monitoring.twiceDailyFreq")}</SelectItem>
                        <SelectItem value="three-times-daily">{t("monitoring.threeTimesDailyFreq")}</SelectItem>
                        <SelectItem value="as-needed">{t("monitoring.asNeededFreq")}</SelectItem>
                      </SelectContent>
                    </Select>
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
                            {t("monitoring.remove")}
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
                      + {t("monitoring.addTime")}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration-type">{t("monitoring.duration")}</Label>
                    <Select value={durationType} onValueChange={(value: any) => setDurationType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("monitoring.selectDuration")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lifelong">{t("monitoring.lifelong")}</SelectItem>
                        <SelectItem value="days">{t("monitoring.days")}</SelectItem>
                        <SelectItem value="weeks">{t("monitoring.weeks")}</SelectItem>
                        <SelectItem value="months">{t("monitoring.months")}</SelectItem>
                        <SelectItem value="as_needed">{t("monitoring.asNeeded")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {durationType !== "lifelong" && durationType !== "as_needed" && (
                    <div className="space-y-2">
                      <Label htmlFor="duration-value">{t("monitoring.durationValue")}</Label>
                      <Input
                        id="duration-value"
                        type="number"
                        value={durationValue}
                        onChange={(e) => setDurationValue(e.target.value)}
                        placeholder={`${t("monitoring.enter")} ${durationType === "days" ? t("monitoring.numberOfDays") : durationType === "weeks" ? t("monitoring.numberOfWeeks") : t("monitoring.numberOfMonths")}`}
                        min="1"
                      />
                    </div>
                  )}
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

            {/* Today's Medication Checklist */}
            <Card>
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
                            <div className="flex items-center gap-2 mt-1">
                              <Timer className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {getDurationText(med.duration_type, med.duration_value)}
                              </span>
                              {med.daysRemaining !== null &&
                                med.daysRemaining !== undefined &&
                                med.daysRemaining > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {med.daysRemaining} {t("monitoring.daysLeft")}
                                  </Badge>
                                )}
                            </div>
                          </div>
                          <Badge variant="outline">{getFrequencyText(med.frequency)}</Badge>
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
        </Tabs>
      </div>
    </div>
  )
}
