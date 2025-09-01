"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { useMedicationTracking } from "@/hooks/use-medication-tracking"
import { useRouter } from "next/navigation"
import { Pill, Plus, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"

export default function MedicationsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const {
    medications,
    addMedication,
    deleteMedication,
    markAsTaken,
    markAsMissed,
    getStats,
    getFrequencyLabel,
    isLoading,
  } = useMedicationTracking()

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "once" as const,
    times: ["08:00"],
    notes: "",
  })

  if (!user) {
    router.push("/login")
    return null
  }

  const stats = getStats()

  const handleFrequencyChange = (frequency: string) => {
    const freq = frequency as typeof formData.frequency
    let defaultTimes: string[] = []

    switch (freq) {
      case "once":
        defaultTimes = ["08:00"]
        break
      case "twice":
        defaultTimes = ["08:00", "20:00"]
        break
      case "three_times":
        defaultTimes = ["08:00", "14:00", "20:00"]
        break
      case "four_times":
        defaultTimes = ["08:00", "12:00", "16:00", "20:00"]
        break
      case "as_needed":
        defaultTimes = []
        break
    }

    setFormData((prev) => ({ ...prev, frequency: freq, times: defaultTimes }))
  }

  const handleTimeChange = (index: number, time: string) => {
    const newTimes = [...formData.times]
    newTimes[index] = time
    setFormData((prev) => ({ ...prev, times: newTimes }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const success = addMedication(formData.name, formData.dosage, formData.frequency, formData.times, formData.notes)

    if (success) {
      setFormData({
        name: "",
        dosage: "",
        frequency: "once",
        times: ["08:00"],
        notes: "",
      })
      setShowAddForm(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-16 max-w-6xl mx-auto p-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-16 max-w-6xl mx-auto p-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("meds.title")}</h1>
            <p className="text-gray-600">{t("meds.subtitle")}</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            {t("meds.addMedication")}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeMedications}</div>
              <p className="text-xs text-muted-foreground">Currently taking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("meds.adherence")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adherenceRate}%</div>
              <p className="text-xs text-muted-foreground">Overall</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("meds.thisWeek")}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeekAdherence}%</div>
              <p className="text-xs text-muted-foreground">Adherence rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("meds.overdue")}</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overdueDoses.length}</div>
              <p className="text-xs text-muted-foreground">Missed doses</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Medication Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t("meds.addMedication")}</CardTitle>
              <CardDescription>Add a new medication to your tracking list</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("meds.medicationName")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Lisinopril"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosage">{t("meds.dosage")}</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 10mg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">{t("meds.frequency")}</Label>
                  <Select value={formData.frequency} onValueChange={handleFrequencyChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once daily</SelectItem>
                      <SelectItem value="twice">Twice daily</SelectItem>
                      <SelectItem value="three_times">Three times daily</SelectItem>
                      <SelectItem value="four_times">Four times daily</SelectItem>
                      <SelectItem value="as_needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.frequency !== "as_needed" && (
                  <div className="space-y-2">
                    <Label>{t("meds.time")}s</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {formData.times.map((time, index) => (
                        <Input
                          key={index}
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          required
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">{t("meds.notes")}</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about this medication..."
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
                    {t("meds.save")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    {t("meds.cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Current Medications */}
        <Card>
          <CardHeader>
            <CardTitle>{t("meds.currentMedications")}</CardTitle>
            <CardDescription>Your active medication list</CardDescription>
          </CardHeader>
          <CardContent>
            {medications.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("meds.noMedications")}</h3>
                <p className="text-gray-600 mb-6">{t("meds.noMedicationsDesc")}</p>
                <Button onClick={() => setShowAddForm(true)} className="bg-green-500 hover:bg-green-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("meds.addMedication")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {medications
                  .filter((med) => med.isActive)
                  .map((medication) => (
                    <div key={medication.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Pill className="w-6 h-6 text-green-600" />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{medication.name}</h3>
                          <p className="text-gray-600">{medication.dosage}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{getFrequencyLabel(medication.frequency)}</Badge>
                            {medication.times.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{medication.times.join(", ")}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => {
                            // This would mark the current dose as taken
                            // In a real implementation, you'd find the current scheduled dose
                            console.log("Mark as taken:", medication.id)
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t("meds.takeNow")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMedication(medication.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
