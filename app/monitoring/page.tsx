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
import { Switch } from "@/components/ui/switch"
import { Heart, Activity, Pill, Plus, Calendar, Clock, TrendingUp, AlertTriangle } from "lucide-react"
import { useBPTracking } from "@/hooks/use-bp-tracking"
import { useMedicationTracking } from "@/hooks/use-medication-tracking"
import { useLanguage } from "@/contexts/language-context"

export default function MonitoringPage() {
  const { language, t } = useLanguage()
  const {
    readings,
    addReading,
    deleteReading,
    getStats,
    getAverageReading,
    getBPCategory,
    getCategoryColor,
    getCategoryLabel,
  } = useBPTracking()

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
        startDate: new Date(),
        isActive: true,
        notes: medNotes || undefined,
      })
      setMedName("")
      setMedDosage("")
      setMedFrequency("")
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

  const stats = getStats(30)
  const averageReading = getAverageReading(30)
  const adherenceStats = getAdherenceRate(30)
  const todaysMeds = getTodaysMedications()
  const missedDoses = getMissedDoses(7)

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
                  <div className="text-2xl font-bold">{averageReading.pulse}</div>
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
                        <div className="text-sm text-muted-foreground">
                          {reading.pulse} {t("bp.bpm")}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{reading.date.toLocaleDateString()}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("meds.adherence")}</CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adherenceStats.monthly}%</div>
                  <p className="text-xs text-muted-foreground">
                    {t("meds.thisMonth")} • {adherenceStats.weekly}% {t("meds.thisWeek").toLowerCase()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("meds.currentMedications")}</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todaysMeds.length}</div>
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
                  <div className="text-2xl font-bold">{missedDoses}</div>
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
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("meds.addMedication")}</DialogTitle>
                  <DialogDescription>{t("meds.noMedicationsDesc")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-name">{t("meds.medicationName")}</Label>
                    <Input
                      id="med-name"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      placeholder="Lisinopril"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-dosage">{t("meds.dosage")}</Label>
                    <Input
                      id="med-dosage"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      placeholder="10mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-frequency">{t("meds.frequency")}</Label>
                    <Select value={medFrequency} onValueChange={setMedFrequency}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("meds.frequency")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once-daily">
                          {t("common.once")} {t("common.daily")}
                        </SelectItem>
                        <SelectItem value="twice-daily">
                          {t("common.twice")} {t("common.daily")}
                        </SelectItem>
                        <SelectItem value="three-times-daily">
                          {t("common.threeTimes")} {t("common.daily")}
                        </SelectItem>
                        <SelectItem value="as-needed">{t("common.asNeeded")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("meds.time")}</Label>
                    {medTimes.map((time, index) => (
                      <div key={index} className="flex gap-2">
                        <Input type="time" value={time} onChange={(e) => updateTimeSlot(index, e.target.value)} />
                        {medTimes.length > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeTimeSlot(index)}>
                            {t("common.delete")}
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addTimeSlot}>
                      {t("meds.time")} +
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-notes">{t("meds.notes")}</Label>
                    <Textarea
                      id="med-notes"
                      value={medNotes}
                      onChange={(e) => setMedNotes(e.target.value)}
                      placeholder={t("meds.notes")}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingMed(false)}>
                    {t("meds.cancel")}
                  </Button>
                  <Button onClick={handleAddMedication}>{t("meds.save")}</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Today's Medications */}
            <Card>
              <CardHeader>
                <CardTitle>{t("meds.currentMedications")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysMeds.map((med) => (
                    <div key={med.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{med.name}</h3>
                          <p className="text-sm text-muted-foreground">{med.dosage}</p>
                        </div>
                        <Badge variant="outline">{med.frequency}</Badge>
                      </div>
                      <div className="space-y-2">
                        {med.times.map((time, index) => {
                          const log = med.logs?.find((l) => l.scheduledTime === time)
                          const isTaken = log?.taken || false

                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{time}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={isTaken}
                                  onCheckedChange={(checked) => markMedicationTaken(med.id, time, checked)}
                                />
                                <span className="text-sm">{isTaken ? t("meds.taken") : t("meds.missed")}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {todaysMeds.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">{t("meds.noMedicationsDesc")}</div>
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
