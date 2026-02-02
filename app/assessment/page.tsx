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
import { Brain, Clock, BookOpen, CheckCircle, ArrowRight, Lightbulb, AlertCircle, Mic } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function AssessmentPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null)
  const [assessmentMode, setAssessmentMode] = useState<"overview" | "comprehensive" | "quick" | "knowledge">("overview")
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [pendingAssessmentType, setPendingAssessmentType] = useState<"comprehensive" | "quick" | "knowledge" | null>(
    null,
  )

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
      duration: "30-60 min",
      icon: Brain,
      color: "bg-red-100 text-red-700",
      features: [
        "Analisis mendalam kondisi hipertensi",
        "Evaluasi faktor risiko kardiovaskular",
        "Penilaian kesehatan mental terkait",
        "Rekomendasi pengobatan personal",
        "Laporan detail untuk dokter",
      ],
      whyImportant: language === "id"
        ? "Asesmen komprehensif membantu mengidentifikasi faktor risiko tersembunyi dan memberikan gambaran lengkap kondisi kesehatan Anda. Hasil asesmen dapat digunakan sebagai referensi saat berkonsultasi dengan dokter."
        : "Comprehensive assessment helps identify hidden risk factors and provides a complete picture of your health condition. Results can be used as reference when consulting with your doctor.",
      howItHelps: language === "id"
        ? "AI akan menganalisis riwayat kesehatan, gaya hidup, dan kondisi mental Anda untuk memberikan rekomendasi personal yang dapat membantu mengendalikan hipertensi secara holistik."
        : "AI will analyze your health history, lifestyle, and mental condition to provide personalized recommendations that can help control hypertension holistically.",
    },
    {
      id: "quick",
      title: t("assessment.quick"),
      description: t("assessment.quickDesc"),
      duration: "15-30 min",
      icon: Clock,
      color: "bg-blue-100 text-blue-700",
      features: [
        "Pilihan diagnosis evaluasi (HT, AS, GCT, RBD)",
        "Asesmen tanda dan gejala",
        "Evaluasi kemampuan yang diketahui",
        "Evaluasi kemampuan yang dilakukan",
        "Ringkasan dan rekomendasi",
      ],
      whyImportant: language === "id"
        ? "Monitoring rutin penting untuk mendeteksi perubahan kondisi secara dini. Dengan evaluasi berkala, Anda dapat memantau efektivitas pengobatan dan gaya hidup yang dijalani."
        : "Routine monitoring is important for early detection of condition changes. With periodic evaluation, you can monitor the effectiveness of treatment and lifestyle.",
      howItHelps: language === "id"
        ? "AI akan mengevaluasi tanda, gejala, dan kemampuan pengelolaan diri Anda saat ini, kemudian memberikan umpan balik tentang area yang perlu ditingkatkan."
        : "AI will evaluate your current signs, symptoms, and self-management abilities, then provide feedback on areas that need improvement.",
    },
    {
      id: "knowledge",
      title: t("assessment.knowledge"),
      description: t("assessment.knowledgeDesc"),
      duration: "15-30 min",
      icon: BookOpen,
      color: "bg-green-100 text-green-700",
      features: [
        "Tes pengetahuan hipertensi",
        "Edukasi interaktif",
        "Tips pengelolaan harian",
        "Mitos vs fakta",
        "Sertifikat pengetahuan",
      ],
      whyImportant: language === "id"
        ? "Pengetahuan yang baik tentang hipertensi terbukti meningkatkan kepatuhan pengobatan dan hasil kesehatan. Tes ini membantu mengidentifikasi kesenjangan pengetahuan Anda."
        : "Good knowledge about hypertension is proven to improve medication adherence and health outcomes. This test helps identify your knowledge gaps.",
      howItHelps: language === "id"
        ? "AI akan menguji pemahaman Anda tentang hipertensi dan memberikan edukasi interaktif untuk memperbaiki miskonsepsi serta memperkuat pengetahuan yang sudah benar."
        : "AI will test your understanding of hypertension and provide interactive education to correct misconceptions and reinforce correct knowledge.",
    },
  ]

  const handleStartAssessment = (type: "comprehensive" | "quick" | "knowledge") => {
    setPendingAssessmentType(type)
    setShowDisclaimer(true)
  }

  const handleDisclaimerAccept = () => {
    if (pendingAssessmentType) {
      setAssessmentMode(pendingAssessmentType)
    }
    setShowDisclaimer(false)
    setPendingAssessmentType(null)
  }

  const handleDisclaimerCancel = () => {
    setShowDisclaimer(false)
    setPendingAssessmentType(null)
  }

  if (assessmentMode === "quick") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col">
        <Navigation />

        <div className="flex-1 pt-16 flex flex-col">
          {/* Back button bar */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Button onClick={() => setAssessmentMode("overview")} variant="ghost" size="sm" className="bg-transparent">
                <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                {t("assessment.backToOverview")}
              </Button>
            </div>
          </div>

          {/* Full-screen Chat Interface */}
          <div className="flex-1 max-w-4xl w-full mx-auto p-4">
            <DifyChatInterface
              title={t("assessment.quick")}
              showHeader={true}
              minHeight="calc(100vh - 180px)"
              className="shadow-lg h-full"
              placeholder={t("assessment.chatPlaceholder")}
              apiPath="/api/dify/quick-assessment"
              conversationType="quick-assessment"
              showProgressStatus={true}
              assessmentType="quick-assessment"
            />
          </div>
        </div>
      </div>
    )
  }

  if (assessmentMode === "comprehensive") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex flex-col">
        <Navigation />

        <div className="flex-1 pt-16 flex flex-col">
          {/* Back button bar */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Button onClick={() => setAssessmentMode("overview")} variant="ghost" size="sm" className="bg-transparent">
                <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                {t("assessment.backToOverview")}
              </Button>
            </div>
          </div>

          {/* Full-screen Chat Interface */}
          <div className="flex-1 max-w-4xl w-full mx-auto p-4">
            <DifyChatInterface
              title={t("assessment.comprehensive")}
              showHeader={true}
              minHeight="calc(100vh - 180px)"
              className="shadow-lg h-full"
              placeholder={t("assessment.chatPlaceholder")}
              apiPath="/api/dify/assessment"
              conversationType="assessment"
              showProgressStatus={true}
              assessmentType="assessment"
            />
          </div>
        </div>
      </div>
    )
  }

  if (assessmentMode === "knowledge") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex flex-col">
        <Navigation />

        <div className="flex-1 pt-16 flex flex-col">
          {/* Back button bar */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Button onClick={() => setAssessmentMode("overview")} variant="ghost" size="sm" className="bg-transparent">
                <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                {t("assessment.backToOverview")}
              </Button>
            </div>
          </div>

          {/* Full-screen Chat Interface */}
          <div className="flex-1 max-w-4xl w-full mx-auto p-4">
            <DifyChatInterface
              title={t("assessment.knowledge")}
              showHeader={true}
              minHeight="calc(100vh - 180px)"
              className="shadow-lg h-full"
              placeholder={t("assessment.chatPlaceholder")}
              apiPath="/api/dify/knowledge-test"
              conversationType="knowledge-test"
              showProgressStatus={true}
              assessmentType="knowledge-test"
            />
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
                        handleStartAssessment("comprehensive")
                      } else if (assessment.id === "quick") {
                        handleStartAssessment("quick")
                      } else if (assessment.id === "knowledge") {
                        handleStartAssessment("knowledge")
                      }
                    }}
                  >
                    Mulai Asesmen
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <ul className="space-y-2 flex-grow mb-4">
                    {assessment.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Detailed Information Section */}
                  <div className="border-t pt-4 mt-auto">
                    <details className="group">
                      <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        <AlertCircle className="w-4 h-4" />
                        {language === "id" ? "Informasi Detail" : "Detailed Information"}
                        <ArrowRight className="w-3 h-3 ml-auto transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="mt-3 space-y-3 text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="font-medium text-blue-900 mb-1">
                            {language === "id" ? "Mengapa Penting?" : "Why is it Important?"}
                          </p>
                          <p className="text-blue-700 text-xs">{assessment.whyImportant}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="font-medium text-green-900 mb-1">
                            {language === "id" ? "Bagaimana Ini Membantu?" : "How Does It Help?"}
                          </p>
                          <p className="text-green-700 text-xs">{assessment.howItHelps}</p>
                        </div>
                      </div>
                    </details>
                  </div>
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

      {/* Disclaimer Dialog */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              {t("assessment.disclaimerTitle")}
            </DialogTitle>
            <div className="text-base text-gray-700 space-y-4 pt-4">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    {language === "id" ? "Waktu yang Dibutuhkan: " : "Time Commitment: "}
                    {pendingAssessmentType === "comprehensive" ? "30-60 " : "15-30 "}
                    {language === "id" ? "menit" : "minutes"}
                  </p>
                  <p className="text-sm text-yellow-800">{t("assessment.disclaimerDurationDesc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Mic className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900">{t("assessment.disclaimerVoice")}</p>
                  <p className="text-sm text-blue-800">{t("assessment.disclaimerVoiceDesc")}</p>
                </div>
              </div>

              <p className="text-gray-600">{t("assessment.disclaimerConfirm")}</p>
            </div>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleDisclaimerCancel} className="flex-1 bg-transparent">
              {t("assessment.disclaimerCancel")}
            </Button>
            <Button onClick={handleDisclaimerAccept} className="flex-1 bg-red-600 hover:bg-red-700">
              {t("assessment.disclaimerAccept")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
