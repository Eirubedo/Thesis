"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import {
  Heart,
  Shield,
  BookOpen,
  Users,
  Github,
  ExternalLink,
  Mail,
  MessageSquare,
  Brain,
  Activity,
  Stethoscope,
  Award,
  GraduationCap,
  Lightbulb,
  Target,
} from "lucide-react"

export default function AboutPage() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Assessments",
      titleId: "Asesmen Bertenaga AI",
      description: "Comprehensive health evaluations using advanced RAG technology",
      descriptionId: "Evaluasi kesehatan komprehensif menggunakan teknologi RAG yang canggih",
    },
    {
      icon: Activity,
      title: "Blood Pressure Monitoring",
      titleId: "Pemantauan Tekanan Darah",
      description: "Smart tracking with automatic categorization and trend analysis",
      descriptionId: "Pelacakan cerdas dengan kategorisasi otomatis dan analisis tren",
    },
    {
      icon: Stethoscope,
      title: "Medication Management",
      titleId: "Manajemen Obat",
      description: "Track medications, set reminders, and monitor adherence rates",
      descriptionId: "Lacak obat, atur pengingat, dan pantau tingkat kepatuhan",
    },
    {
      icon: BookOpen,
      title: "Health Education",
      titleId: "Edukasi Kesehatan",
      description: "Evidence-based resources for hypertension management",
      descriptionId: "Sumber berbasis bukti untuk pengelolaan hipertensi",
    },
    {
      icon: Heart,
      title: "Mental Health Support",
      titleId: "Dukungan Kesehatan Mental",
      description: "Address stress and emotional factors affecting blood pressure",
      descriptionId: "Atasi stres dan faktor emosional yang mempengaruhi tekanan darah",
    },
    {
      icon: Award,
      title: "Progress Tracking",
      titleId: "Pelacakan Kemajuan",
      description: "Comprehensive reports and analytics for your health journey",
      descriptionId: "Laporan dan analitik komprehensif untuk perjalanan kesehatan Anda",
    },
  ]

  const team = [
    {
      name: "Prof. Dr. Budi Anna Keliat, S.Kp., M.App.Sc",
      role: "Mental Health Nursing Expert",
      roleId: "Ahli Keperawatan Jiwa",
      description:
        "Professor of Mental Health Nursing at Faculty of Nursing, Universitas Indonesia. Leading expert in community mental health nursing, psychosocial interventions, and research-based mental health education since 1990s.",
      descriptionId:
        "Guru Besar Keperawatan Jiwa di Fakultas Ilmu Keperawatan Universitas Indonesia. Ahli terkemuka dalam keperawatan jiwa komunitas, intervensi psikososial, dan pendidikan kesehatan jiwa berbasis riset sejak dekade 1990-an.",
    },
    {
      name: "Prof. Dr. Achmad Nizar Hidayanto, S.Kom., M.Kom",
      role: "Information Systems Professor",
      roleId: "Profesor Sistem Informasi",
      description:
        "Professor of Information Systems at Faculty of Computer Science, Universitas Indonesia. Expert in information technology adoption and health information systems with extensive publications in digital health systems and AI applications.",
      descriptionId:
        "Profesor Sistem Informasi di Fakultas Ilmu Komputer Universitas Indonesia. Pakar adopsi teknologi informasi dan sistem informasi kesehatan dengan ratusan publikasi dalam sistem digital kesehatan dan aplikasi AI.",
    },
    {
      name: "Ns. Eka Putri Yulianti, S.Kep.",
      role: "Mental Health Nurse & Researcher",
      roleId: "Perawat & Peneliti Kesehatan Jiwa",
      description:
        "Nurse and researcher at Faculty of Nursing, Universitas Indonesia. Specializes in mental health nursing and nursing informatics, with systematic review on NLP for mental health assessment, providing scientific foundation for AI chatbot development.",
      descriptionId:
        "Perawat dan peneliti di Fakultas Ilmu Keperawatan Universitas Indonesia. Fokus pada keperawatan jiwa dan informatik keperawatan, dengan telaah sistematik tentang NLP untuk asesmen kesehatan mental yang menjadi landasan ilmiah pengembangan chatbot AI.",
    },
  ]

  const isIndonesian = useLanguage().language === "id"

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
      <Navigation />

      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Hero Section - Improved mobile typography and spacing */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <img src="/images/asked-logo.png" alt="ANSWA Logo" className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{t("about.title")}</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
            {t("about.subtitle")}
          </p>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
            >
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              {t("about.badges.aiPowered")}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
            >
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              {t("about.badges.hipaaCompliant")}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
            >
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              {t("about.badges.evidenceBased")}
            </Badge>
          </div>
        </div>

        {/* Mission Section - Improved mobile padding */}
        <Card className="mb-8 sm:mb-12 lg:mb-16 border-red-100">
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-red-700">{t("about.mission.title")}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
              {t("about.mission.description")}
            </p>
          </CardContent>
        </Card>

        {/* Foundation Section - Single column on mobile */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8 lg:mb-12">
            {t("about.foundation.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <Card className="border-purple-100 hover:shadow-lg transition-shadow">
              <CardHeader className="px-4 sm:px-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <CardTitle className="text-base sm:text-lg">{t("about.foundation.stuartModel.title")}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  {t("about.foundation.stuartModel.description")}
                </p>
                <ul className="space-y-1.5 sm:space-y-2">
                  {[
                    t("about.foundation.stuartModel.biological"),
                    t("about.foundation.stuartModel.psychological"),
                    t("about.foundation.stuartModel.sociocultural"),
                    t("about.foundation.stuartModel.environmental"),
                    t("about.foundation.stuartModel.legal"),
                  ].map((item, index) => (
                    <li key={index} className="flex items-start text-xs sm:text-sm text-gray-600">
                      <span className="text-purple-600 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-lg transition-shadow">
              <CardHeader className="px-4 sm:px-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <CardTitle className="text-base sm:text-lg">{t("about.foundation.designScience.title")}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  {t("about.foundation.designScience.description")}
                </p>
                <ul className="space-y-1.5 sm:space-y-2">
                  {[
                    t("about.foundation.designScience.problemIdentification"),
                    t("about.foundation.designScience.requirementsAnalysis"),
                    t("about.foundation.designScience.design"),
                    t("about.foundation.designScience.development"),
                    t("about.foundation.designScience.evaluation"),
                  ].map((item, index) => (
                    <li key={index} className="flex items-start text-xs sm:text-sm text-gray-600">
                      <span className="text-blue-600 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* AI Chatbot Purpose - Responsive spacing */}
          <Card className="mt-4 sm:mt-6 lg:mt-8 border-green-100">
            <CardHeader className="px-4 sm:px-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                <Target className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-center text-green-700">
                {t("about.foundation.chatbotPurpose.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <p className="text-sm sm:text-base text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
                {t("about.foundation.chatbotPurpose.description")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section - Single column mobile, 2 cols tablet, 3 cols desktop */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8 lg:mb-12">
            {t("about.features.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-red-100 hover:shadow-lg transition-shadow">
                  <CardHeader className="px-4 sm:px-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">
                      {isIndonesian ? feature.titleId : feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <p className="text-sm sm:text-base text-gray-600">
                      {isIndonesian ? feature.descriptionId : feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* How It Works Section - 2x2 grid on mobile/tablet, 4 cols desktop */}
        <Card className="mb-8 sm:mb-12 lg:mb-16 border-blue-100">
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-blue-700">{t("about.howItWorks.title")}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[
                {
                  step: "1",
                  title: t("about.howItWorks.steps.signUp"),
                  description: t("about.howItWorks.steps.signUpDescription"),
                  icon: Users,
                },
                {
                  step: "2",
                  title: t("about.howItWorks.steps.assessment"),
                  description: t("about.howItWorks.steps.assessmentDescription"),
                  icon: Brain,
                },
                {
                  step: "3",
                  title: t("about.howItWorks.steps.aiSupport"),
                  description: t("about.howItWorks.steps.aiSupportDescription"),
                  icon: MessageSquare,
                },
                {
                  step: "4",
                  title: t("about.howItWorks.steps.trackProgress"),
                  description: t("about.howItWorks.steps.trackProgressDescription"),
                  icon: Activity,
                },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 text-xs sm:text-sm font-bold">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team Section - Single column mobile, 3 cols tablet+ */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-3 sm:mb-4">
            {t("about.team.title")}
          </h2>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 lg:mb-12 max-w-3xl mx-auto px-2">
            {isIndonesian
              ? "Tim ahli dari Universitas Indonesia yang mengembangkan platform ANSWA dengan pendekatan berbasis riset dan evidence-based practice."
              : "Expert team from Universitas Indonesia developing the ANSWA platform with research-based and evidence-based practice approach."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-green-100 hover:shadow-lg transition-shadow">
                <CardHeader className="px-4 sm:px-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                  </div>
                  <CardTitle className="text-sm sm:text-base leading-tight mb-1 sm:mb-2 text-center">
                    {member.name}
                  </CardTitle>
                  <CardDescription className="text-green-600 font-medium text-center text-xs sm:text-sm">
                    {isIndonesian ? member.roleId : member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {isIndonesian ? member.descriptionId : member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Source Section - Stack on mobile */}
        <Card className="mb-8 sm:mb-12 lg:mb-16 border-purple-100">
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-purple-700">{t("about.openSource.title")}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Github className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">{t("about.openSource.openSource")}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  {t("about.openSource.openSourceDescription")}
                </p>
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent text-sm sm:text-base"
                >
                  <Github className="w-4 h-4 mr-2" />
                  {t("about.openSource.viewOnGitHub")}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <ExternalLink className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
                  {t("about.openSource.easyDeployment")}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  {t("about.openSource.easyDeploymentDescription")}
                </p>
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent text-sm sm:text-base"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t("about.openSource.deploymentGuide")}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section - Stack buttons on mobile */}
        <Card className="border-red-100">
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-red-700">{t("about.contact.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center px-4 sm:px-6">
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
              {t("about.contact.description")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button className="bg-red-600 hover:bg-red-700 text-sm sm:text-base">
                <Mail className="w-4 h-4 mr-2" />
                {t("about.contact.contactUs")}
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent text-sm sm:text-base"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {t("about.contact.joinCommunity")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
