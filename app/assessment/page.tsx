"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DifyChatInterface } from "@/components/dify-chat-interface"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import { Brain, Clock, BookOpen, CheckCircle, ArrowRight, Lightbulb } from "lucide-react"

export default function AssessmentPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null)
  const [assessmentMode, setAssessmentMode] = useState<"overview" | "comprehensive" | "quick" | "knowledge">("overview")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const assessmentTypes = [
    {
      id: "comprehensive",
      title: t("assessment.comprehensive"),
      description: t("assessment.comprehensiveDesc"),
      duration: "15-20 min",
      icon: Brain,
      color: "bg-red-100 text-red-700",
      features: [
        "Analisis mendalam kondisi hipertensi",
        "Evaluasi faktor risiko kardiovaskular",
        "Penilaian kesehatan mental terkait",
        "Rekomendasi pengobatan personal",
        "Laporan detail untuk dokter",
      ],
    },
    {
      id: "quick",
      title: t("assessment.quick"),
      description: t("assessment.quickDesc"),
      duration: "5-7 min",
      icon: Clock,
      color: "bg-blue-100 text-blue-700",
      features: [
        "Screening cepat tekanan darah",
        "Evaluasi gejala terkini",
        "Penilaian kepatuhan obat",
        "Alert kondisi darurat",
        "Rekomendasi tindakan segera",
      ],
    },
    {
      id: "knowledge",
      title: t("assessment.knowledge"),
      description: t("assessment.knowledgeDesc"),
      duration: "10-12 min",
      icon: BookOpen,
      color: "bg-green-100 text-green-700",
      features: [
        "Tes pengetahuan hipertensi",
        "Edukasi interaktif",
        "Tips pengelolaan harian",
        "Mitos vs fakta",
        "Sertifikat pengetahuan",
      ],
    },
  ]

  if (assessmentMode === "quick") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navigation />

        <div className="pt-16 max-w-7xl mx-auto p-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("assessment.quick")}</h1>
              <p className="text-gray-600">{t("assessment.quickDesc")}</p>
            </div>
            <Button onClick={() => setAssessmentMode("overview")} variant="outline" className="bg-transparent">
              {t("assessment.backToOverview")}
            </Button>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <DifyChatInterface
                title={t("assessment.quick")}
                showHeader={true}
                minHeight="calc(100vh - 250px)"
                className="shadow-lg"
                placeholder={t("assessment.chatPlaceholder")}
                apiPath="/api/dify/quick-assessment"
                conversationType="quick-assessment"
              />
            </div>

            <div className="space-y-4">
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="text-lg">{t("assessment.progressTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{t("assessment.startedConversation")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">Screening cepat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">{t("assessment.receiveInsights")}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">{t("assessment.tipsTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div>• Siapkan data tekanan darah terbaru</div>
                    <div>• Sebutkan gejala yang sedang dialami</div>
                    <div>• Jawab dengan cepat dan jujur</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (assessmentMode === "comprehensive") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
        <Navigation />

        <div className="pt-16 max-w-7xl mx-auto p-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("assessment.comprehensive")}</h1>
              <p className="text-gray-600">{t("assessment.comprehensiveDesc")}</p>
            </div>
            <Button onClick={() => setAssessmentMode("overview")} variant="outline" className="bg-transparent">
              {t("assessment.backToOverview")}
            </Button>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <DifyChatInterface
                title={t("assessment.comprehensive")}
                showHeader={true}
                minHeight="calc(100vh - 250px)"
                className="shadow-lg"
                placeholder={t("assessment.chatPlaceholder")}
                apiPath="/api/dify/assessment"
                conversationType="assessment"
              />
            </div>

            <div className="space-y-4">
              <Card className="border-red-100">
                <CardHeader>
                  <CardTitle className="text-lg">{t("assessment.progressTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{t("assessment.startedConversation")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">{t("assessment.completeAssessment")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">{t("assessment.receiveInsights")}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-100 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-900">{t("assessment.tipsTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-yellow-800 space-y-2">
                    {t("assessment.tips")
                      .split("\n")
                      .map((tip, index) => (
                        <div key={index}>{tip}</div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (assessmentMode === "knowledge") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <Navigation />

        <div className="pt-16 max-w-7xl mx-auto p-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("assessment.knowledge")}</h1>
              <p className="text-gray-600">{t("assessment.knowledgeDesc")}</p>
            </div>
            <Button onClick={() => setAssessmentMode("overview")} variant="outline" className="bg-transparent">
              {t("assessment.backToOverview")}
            </Button>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <DifyChatInterface
                title={t("assessment.knowledge")}
                showHeader={true}
                minHeight="calc(100vh - 250px)"
                className="shadow-lg"
                placeholder={t("assessment.chatPlaceholder")}
                apiPath="/api/dify/knowledge-test"
                conversationType="knowledge-test"
              />
            </div>

            <div className="space-y-4">
              <Card className="border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg">{t("assessment.progressTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{t("assessment.startedConversation")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">{t("assessment.completeAssessment")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">{t("assessment.receiveInsights")}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-100 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-900">{t("assessment.tipsTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-green-800 space-y-2">
                    {t("assessment.knowledgeTips")
                      .split("\n")
                      .map((tip, index) => (
                        <div key={index}>{tip}</div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 pt-20 pb-12">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("assessment.title")}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("assessment.subtitle")}</p>
          <div className="flex justify-center gap-2 mt-6">
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              <Brain className="w-4 h-4 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <CheckCircle className="w-4 h-4 mr-1" />
              Evidence-Based
            </Badge>
          </div>
        </div>

        {/* Assessment Types Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {assessmentTypes.map((assessment) => {
            const Icon = assessment.icon
            const isSelected = selectedAssessment === assessment.id

            return (
              <Card
                key={assessment.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isSelected ? "ring-2 ring-red-500 shadow-lg" : ""
                }`}
                onClick={() => setSelectedAssessment(assessment.id)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${assessment.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl w-auto h-5">{assessment.title}</CardTitle>
                  <CardDescription className="text-sm h-14">{assessment.description}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{assessment.duration}</span>
                  </div>
                  <Button
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-medium flex-row items-center"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (assessment.id === "comprehensive") {
                        setAssessmentMode("comprehensive")
                      } else if (assessment.id === "quick") {
                        setAssessmentMode("quick")
                      } else if (assessment.id === "knowledge") {
                        setAssessmentMode("knowledge")
                      }
                    }}
                  >
                    Mulai Asesmen
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <ul className="space-y-2 flex-grow">
                    {assessment.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* How It Works Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Cara Kerja Asesmen</CardTitle>
            <CardDescription className="text-center">Proses asesmen yang mudah dan komprehensif</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Pilih Jenis Asesmen",
                  description: "Pilih asesmen yang sesuai dengan kebutuhan Anda",
                },
                {
                  step: "2",
                  title: "Jawab Pertanyaan AI",
                  description: "Berinteraksi dengan AI melalui percakapan natural",
                },
                {
                  step: "3",
                  title: "Analisis Real-time",
                  description: "AI menganalisis jawaban Anda secara real-time",
                },
                {
                  step: "4",
                  title: "Terima Hasil",
                  description: "Dapatkan laporan dan rekomendasi personal",
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Tips untuk Asesmen yang Efektif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Sebelum Memulai:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Siapkan data tekanan darah terbaru</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Catat obat-obatan yang sedang dikonsumsi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Pilih waktu yang tenang dan tidak terganggu</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Selama Asesmen:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Jawab dengan jujur dan lengkap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Jangan ragu untuk bertanya jika tidak jelas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Sebutkan gejala atau keluhan yang dirasakan</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Notice */}
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              !
            </div>
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Kondisi Darurat</h4>
              <p className="text-sm text-red-700">
                Jika Anda mengalami nyeri dada, sesak napas berat, atau tekanan darah sangat tinggi{" "}
                {String.fromCharCode(62)}180/120{String.fromCharCode(62)}, segera hubungi layanan darurat 119 atau
                kunjungi IGD terdekat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
