import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TrendingUp, CheckCircle2, AlertCircle } from "lucide-react"
import {
  getDiagnosisSymptoms,
  getDiagnosisAbilities,
  PRACTICE_FREQUENCIES,
  type DiagnosisCode,
} from "@/lib/monev-knowledge-base"
import { useMonevTracking, type MonevSummary } from "@/hooks/use-monev-tracking"

interface MonevAssessmentProps {
  diagnosis_code: DiagnosisCode
  diagnosis_name: string
  onSave?: (assessment: any) => Promise<void>
}

export function MonevAssessmentComponent({
  diagnosis_code,
  diagnosis_name,
  onSave,
}: MonevAssessmentProps) {
  const {
    toggleSymptom,
    toggleAbilityKnown,
    toggleAbilityPracticed,
    updatePracticeDetails,
    getAssessment,
    getSummary,
  } = useMonevTracking()

  const [step, setStep] = useState<"symptoms" | "abilities" | "practice" | "summary">("symptoms")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAbilityForDetails, setSelectedAbilityForDetails] = useState<string | null>(null)

  const symptoms = getDiagnosisSymptoms(diagnosis_code)
  const abilities = getDiagnosisAbilities(diagnosis_code)
  const assessment = getAssessment(diagnosis_code)
  const summary = getSummary(diagnosis_code)

  useEffect(() => {
    // Initialize assessment when component mounts
    if (!assessment) {
      // Initialize is called automatically by toggleSymptom if needed
    }
  }, [])

  const handleSymptomToggle = (symptom_id: string) => {
    toggleSymptom(diagnosis_code, symptom_id)
  }

  const handleAbilityKnownToggle = (ability_name: string) => {
    toggleAbilityKnown(diagnosis_code, ability_name)
  }

  const handleAbilityPracticedToggle = (ability_name: string) => {
    toggleAbilityPracticed(diagnosis_code, ability_name)
  }

  const handleSavePracticeDetails = (
    ability_name: string,
    frequency: string,
    benefit: string,
    challenges: string
  ) => {
    updatePracticeDetails(diagnosis_code, ability_name, {
      frequency,
      benefit,
      challenges,
    })
    setSelectedAbilityForDetails(null)
  }

  const handleSaveAssessment = async () => {
    if (onSave && assessment) {
      setIsLoading(true)
      try {
        await onSave(assessment)
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (!assessment || !summary) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading assessment...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{diagnosis_name}</CardTitle>
              <CardDescription>Monitoring dan Evaluasi Progress</CardDescription>
            </div>
            <Badge variant="outline" className="ml-auto">
              {step === "symptoms" && "Gejala"}
              {step === "abilities" && "Kemampuan"}
              {step === "practice" && "Praktik"}
              {step === "summary" && "Ringkasan"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-semibold">{summary.recovery_percentage}%</span>
            </div>
            <Progress value={summary.recovery_percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Symptoms Check */}
      {step === "symptoms" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pemeriksaan Gejala
            </CardTitle>
            <CardDescription>
              Pilih gejala yang Anda rasakan dalam 3 hari terakhir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm font-semibold">
                Gejala yang tersisa: <span className="text-lg">{summary.symptom_count}</span> / {summary.total_symptoms}
              </p>
            </div>

            <div className="space-y-3">
              {symptoms.map((symptom) => (
                <div key={symptom.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`symptom-${symptom.id}`}
                    checked={assessment.selected_symptom_ids.includes(symptom.id)}
                    onCheckedChange={() => handleSymptomToggle(symptom.id)}
                  />
                  <Label htmlFor={`symptom-${symptom.id}`} className="cursor-pointer flex-1">
                    {symptom.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" disabled>
                Kembali
              </Button>
              <Button onClick={() => setStep("abilities")} className="ml-auto">
                Lanjut ke Kemampuan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Abilities Known Check */}
      {step === "abilities" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Kemampuan yang Sudah Dipahami
            </CardTitle>
            <CardDescription>
              Pilih kemampuan yang sudah Anda ketahui dan pahami caranya
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg mb-4">
              <p className="text-sm font-semibold">
                Kemampuan dipahami: <span className="text-lg">{assessment.abilities_known.length}</span> / {abilities.length}
              </p>
            </div>

            <div className="space-y-3">
              {abilities.map((ability) => (
                <div key={ability.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={`ability-known-${ability.id}`}
                    checked={assessment.abilities_known.includes(ability.name)}
                    onCheckedChange={() => handleAbilityKnownToggle(ability.name)}
                    className="mt-1"
                  />
                  <Label htmlFor={`ability-known-${ability.id}`} className="cursor-pointer flex-1 text-sm">
                    {ability.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep("symptoms")}>
                Kembali
              </Button>
              <Button onClick={() => setStep("practice")} className="ml-auto">
                Lanjut ke Praktik
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Abilities Practiced Check */}
      {step === "practice" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Kemampuan yang Sudah Dilatih
            </CardTitle>
            <CardDescription>
              Dari kemampuan yang dipahami, mana yang sudah benar-benar dilakukan sehari-hari?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 p-3 rounded-lg mb-4">
              <p className="text-sm font-semibold">
                Kemampuan dilatih: <span className="text-lg">{assessment.abilities_practiced.length}</span> / {assessment.abilities_known.length}
              </p>
            </div>

            <div className="space-y-3">
              {abilities
                .filter((a) => assessment.abilities_known.includes(a.name))
                .map((ability) => (
                  <div key={ability.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={`ability-practiced-${ability.id}`}
                        checked={assessment.abilities_practiced.includes(ability.name)}
                        onCheckedChange={() => handleAbilityPracticedToggle(ability.name)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={`ability-practiced-${ability.id}`} className="cursor-pointer text-sm">
                          {ability.label}
                        </Label>
                        {assessment.abilities_practiced.includes(ability.name) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-auto p-0 text-xs"
                            onClick={() => setSelectedAbilityForDetails(ability.name)}
                          >
                            Tambah detail praktik →
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {assessment.abilities_known.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Pilih kemampuan yang dipahami terlebih dahulu
              </p>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep("abilities")}>
                Kembali
              </Button>
              <Button onClick={() => setStep("summary")} className="ml-auto">
                Lihat Ringkasan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Summary */}
      {step === "summary" && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Evaluasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-red-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Gejala Tersisa</p>
                  <p className="text-2xl font-bold">{summary.symptom_count}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Kemampuan Dilatih</p>
                  <p className="text-2xl font-bold">{summary.abilities_practiced_count}</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Kemampuan Belum Dilatih</p>
                  <p className="text-2xl font-bold">{summary.ability_gaps_count}</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Progress Pemulihan</p>
                  <p className="text-2xl font-bold">{summary.recovery_percentage}%</p>
                </CardContent>
              </Card>
            </div>

            {summary.next_recommended_ability && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-base">Rekomendasi Selanjutnya</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{summary.next_recommended_ability}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep("practice")}>
                Kembali
              </Button>
              <Button onClick={handleSaveAssessment} disabled={isLoading} className="ml-auto">
                {isLoading ? "Menyimpan..." : "Simpan Evaluasi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Practice Details Dialog */}
      {selectedAbilityForDetails && (
        <PracticeDetailsDialog
          ability_name={selectedAbilityForDetails}
          onSave={handleSavePracticeDetails}
          onClose={() => setSelectedAbilityForDetails(null)}
        />
      )}
    </div>
  )
}

function PracticeDetailsDialog({
  ability_name,
  onSave,
  onClose,
}: {
  ability_name: string
  onSave: (ability_name: string, frequency: string, benefit: string, challenges: string) => void
  onClose: () => void
}) {
  const [frequency, setFrequency] = useState("")
  const [benefit, setBenefit] = useState("")
  const [challenges, setChallenges] = useState("")

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Detail Praktik</AlertDialogTitle>
          <AlertDialogDescription>{ability_name}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="frequency" className="text-sm font-medium">
              Seberapa sering Anda melakukannya?
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency" className="mt-1">
                <SelectValue placeholder="Pilih frekuensi" />
              </SelectTrigger>
              <SelectContent>
                {PRACTICE_FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="benefit" className="text-sm font-medium">
              Apakah membantu mengurangi keluhan?
            </Label>
            <Textarea
              id="benefit"
              placeholder="Jelaskan manfaatnya..."
              value={benefit}
              onChange={(e) => setBenefit(e.target.value)}
              className="mt-1 min-h-20"
            />
          </div>

          <div>
            <Label htmlFor="challenges" className="text-sm font-medium">
              Hambatan atau kesulitan yang dirasakan?
            </Label>
            <Textarea
              id="challenges"
              placeholder="Jelaskan hambatannya..."
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              className="mt-1 min-h-20"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onSave(ability_name, frequency, benefit, challenges)}
            disabled={!frequency}
          >
            Simpan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
