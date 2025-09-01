"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Trash2, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useMedicationTracking } from "@/hooks/use-medication-tracking"
import { useLanguage } from "@/contexts/language-context"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function MonitoringPage() {
  const { t } = useLanguage()
  const { medications, todaysMedications, addMedication, markMedicationTaken, deleteMedication } =
    useMedicationTracking()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    times: [""],
    notes: "",
  })

  const addTime = () => {
    setNewMedication((prev) => ({
      ...prev,
      times: [...prev.times, ""],
    }))
  }

  const removeTime = (index: number) => {
    setNewMedication((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }))
  }

  const updateTime = (index: number, value: string) => {
    setNewMedication((prev) => ({
      ...prev,
      times: prev.times.map((time, i) => (i === index ? value : time)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMedication.name || !newMedication.dosage || newMedication.times.some((time) => !time)) {
      return
    }

    await addMedication({
      name: newMedication.name,
      dosage: newMedication.dosage,
      times: newMedication.times.filter((time) => time),
      notes: newMedication.notes,
    })

    setNewMedication({
      name: "",
      dosage: "",
      times: [""],
      notes: "",
    })
    setShowAddForm(false)
  }

  const handleDeleteMedication = async (medicationId: string) => {
    await deleteMedication(medicationId)
  }

  const getMedicationStatus = (medication: any) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    if (medication.taken_at) {
      return { status: "taken", color: "bg-green-100 text-green-800" }
    }

    const [hours, minutes] = medication.scheduled_time.split(":").map(Number)
    const scheduledTime = hours * 60 + minutes
    const timeDiff = currentTime - scheduledTime

    if (timeDiff > 60) {
      return { status: t("monitoring.overdue"), color: "bg-red-100 text-red-800" }
    } else if (timeDiff > -30) {
      return { status: t("monitoring.dueSoon"), color: "bg-yellow-100 text-yellow-800" }
    } else {
      return { status: t("monitoring.scheduled"), color: "bg-blue-100 text-blue-800" }
    }
  }

  const takenCount = todaysMedications.filter((med) => med.taken_at).length
  const totalCount = todaysMedications.length

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t("monitoring.title")}</h1>
        <p className="text-muted-foreground">{t("monitoring.subtitle")}</p>
      </div>

      {/* Today's Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {t("monitoring.todaysProgress")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold">
              {takenCount}/{totalCount}
            </div>
            <p className="text-muted-foreground">{t("monitoring.medicationsTaken")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Medication Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("monitoring.todaysChecklist")}
          </CardTitle>
          <CardDescription>{t("monitoring.checklistDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {todaysMedications.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">{t("monitoring.noMedicationsToday")}</h3>
              <p className="text-muted-foreground">{t("monitoring.noMedicationsDesc")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysMedications.map((medication) => {
                const status = getMedicationStatus(medication)
                return (
                  <div
                    key={`${medication.id}-${medication.scheduled_time}`}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{medication.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {medication.dosage} • {medication.scheduled_time}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={status.color}>
                        {medication.taken_at ? t("monitoring.taken") : status.status}
                      </Badge>
                      {medication.taken_at ? (
                        <span className="text-sm text-muted-foreground">
                          {t("monitoring.takenAt")}{" "}
                          {new Date(medication.taken_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : (
                        <Button size="sm" onClick={() => markMedicationTaken(medication.id, medication.scheduled_time)}>
                          {t("monitoring.taken")}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Medications Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("monitoring.currentMedications")}</CardTitle>
            <CardDescription>{t("monitoring.currentMedicationsDesc")}</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {medications.length} {t("monitoring.activeMedications")}
          </div>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">{t("monitoring.noCurrentMedications")}</h3>
              <p className="text-muted-foreground">{t("monitoring.noCurrentMedicationsDesc")}</p>
            </div>
          ) : (
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
                    <TableCell>{medication.dosage}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {medication.times?.map((time, index) => (
                          <Badge key={index} variant="outline">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{medication.notes || "-"}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("monitoring.deleteMedication")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("monitoring.deleteMedicationConfirm")} "{medication.name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("monitoring.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteMedication(medication.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t("monitoring.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Medication Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t("monitoring.medicationInput")}
          </CardTitle>
          <CardDescription>{t("monitoring.addMedicationDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {t("monitoring.addMedication")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{t("monitoring.addMedication")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("meds.medicationName")}</Label>
                    <Input
                      id="name"
                      value={newMedication.name}
                      onChange={(e) => setNewMedication((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dosage">{t("meds.dosage")}</Label>
                    <Input
                      id="dosage"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication((prev) => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 10mg, 1 tablet"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("monitoring.scheduleTimes")}</Label>
                    {newMedication.times.map((time, index) => (
                      <div key={index} className="flex gap-2">
                        <Input type="time" value={time} onChange={(e) => updateTime(index, e.target.value)} required />
                        {newMedication.times.length > 1 && (
                          <Button type="button" variant="outline" size="icon" onClick={() => removeTime(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTime}
                      className="w-full bg-transparent"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("monitoring.addTime")}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{t("monitoring.additionalNotes")}</Label>
                    <Textarea
                      id="notes"
                      value={newMedication.notes}
                      onChange={(e) => setNewMedication((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder={t("monitoring.additionalNotes")}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    {t("monitoring.cancel")}
                  </Button>
                  <Button type="submit">{t("monitoring.addMedication")}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
