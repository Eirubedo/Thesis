"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { useBPTracking } from "@/hooks/use-bp-tracking"
import { useRouter } from "next/navigation"
import { Activity, Plus, TrendingUp, Calendar, Heart, AlertTriangle } from "lucide-react"

export default function BPTrackingPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { readings, addReading, getStats, getCategoryColor, getCategoryLabel, isLoading } = useBPTracking()

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    heartRate: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
  })

  if (!user) {
    router.push("/login")
    return null
  }

  const stats = getStats()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const systolic = Number.parseInt(formData.systolic)
    const diastolic = Number.parseInt(formData.diastolic)
    const heartRate = formData.heartRate ? Number.parseInt(formData.heartRate) : undefined

    const dateTime = new Date(`${formData.date}T${formData.time}`)

    const success = addReading(systolic, diastolic, heartRate, formData.notes, dateTime)

    if (success) {
      setFormData({
        systolic: "",
        diastolic: "",
        heartRate: "",
        notes: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().slice(0, 5),
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("bp.title")}</h1>
            <p className="text-gray-600">{t("bp.subtitle")}</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-red-500 hover:bg-red-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            {t("bp.addReading")}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("bp.average")} ({t("bp.last30days")})
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.last30DaysAvg.systolic}/{stats.last30DaysAvg.diastolic}
              </div>
              <p className="text-xs text-muted-foreground">{t("bp.mmHg")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("bp.average")} ({t("bp.last7days")})
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.last7DaysAvg.systolic}/{stats.last7DaysAvg.diastolic}
              </div>
              <p className="text-xs text-muted-foreground">{t("bp.mmHg")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReadings}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Heart Rate</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageHeartRate || "--"}</div>
              <p className="text-xs text-muted-foreground">{t("bp.bpm")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Reading Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t("bp.addReading")}</CardTitle>
              <CardDescription>Enter your blood pressure reading details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systolic">{t("bp.systolic")} (mmHg)</Label>
                    <Input
                      id="systolic"
                      type="number"
                      min="70"
                      max="250"
                      value={formData.systolic}
                      onChange={(e) => setFormData((prev) => ({ ...prev, systolic: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolic">{t("bp.diastolic")} (mmHg)</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      min="40"
                      max="150"
                      value={formData.diastolic}
                      onChange={(e) => setFormData((prev) => ({ ...prev, diastolic: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heartRate">{t("bp.heartRate")} (bpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      min="40"
                      max="200"
                      value={formData.heartRate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heartRate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">{t("bp.date")}</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">{t("bp.time")}</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t("bp.notes")}</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about this reading..."
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white">
                    {t("bp.save")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    {t("bp.cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recent Readings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("bp.recentReadings")}</CardTitle>
            <CardDescription>Your blood pressure readings over time</CardDescription>
          </CardHeader>
          <CardContent>
            {readings.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("bp.noReadings")}</h3>
                <p className="text-gray-600 mb-6">{t("bp.noReadingsDesc")}</p>
                <Button onClick={() => setShowAddForm(true)} className="bg-red-500 hover:bg-red-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("bp.addReading")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {readings.slice(0, 10).map((reading) => (
                  <div key={reading.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {reading.systolic}/{reading.diastolic}
                        </div>
                        <div className="text-sm text-gray-500">{t("bp.mmHg")}</div>
                      </div>

                      {reading.heartRate && (
                        <div className="text-center">
                          <div className="text-lg font-semibold">{reading.heartRate}</div>
                          <div className="text-sm text-gray-500">{t("bp.bpm")}</div>
                        </div>
                      )}

                      <div>
                        <Badge className={getCategoryColor(reading.category)}>
                          {getCategoryLabel(reading.category, t)}
                        </Badge>
                        {reading.category === "crisis" && (
                          <div className="flex items-center mt-1 text-red-600">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            <span className="text-xs">Seek immediate medical attention</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">{reading.date.toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{reading.time}</div>
                      {reading.notes && (
                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">{reading.notes}</div>
                      )}
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
