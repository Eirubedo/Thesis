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
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      roleId: "Kepala Petugas Medis",
      description: "Cardiologist with 15+ years experience in hypertension management",
      descriptionId: "Kardiolog dengan pengalaman 15+ tahun dalam pengelolaan hipertensi",
    },
    {
      name: "Michael Chen",
      role: "AI Research Director",
      roleId: "Direktur Penelitian AI",
      description: "Leading AI researcher specializing in healthcare applications",
      descriptionId: "Peneliti AI terkemuka yang mengkhususkan diri dalam aplikasi kesehatan",
    },
    {
      name: "Dr. Maria Rodriguez",
      role: "Clinical Psychology Lead",
      roleId: "Kepala Psikologi Klinis",
      description: "Expert in mental health aspects of chronic disease management",
      descriptionId: "Ahli dalam aspek kesehatan mental pengelolaan penyakit kronis",
    },
  ]

  const isIndonesian = useLanguage().language === "id"

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
      <Navigation />

      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <img src="/images/hypercare-logo.png" alt="HyperCare Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("about.title")}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">{t("about.subtitle")}</p>

          <div className="flex justify-center gap-4 mb-8">
            <Badge variant="secondary" className="bg-red-100 text-red-700 px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              {t("about.badges.aiPowered")}
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              {t("about.badges.hipaaCompliant")}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700 px-4 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              {t("about.badges.evidenceBased")}
            </Badge>
          </div>
        </div>

        {/* Mission Section */}
        <Card className="mb-16 border-red-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-700">{t("about.mission.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
              {t("about.mission.description")}
            </p>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t("about.features.title")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-red-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{isIndonesian ? feature.titleId : feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{isIndonesian ? feature.descriptionId : feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <Card className="mb-16 border-blue-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-blue-700">{t("about.howItWorks.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t("about.team.title")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-green-100 text-center">
                <CardHeader>
                  <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-green-600 font-medium">
                    {isIndonesian ? member.roleId : member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{isIndonesian ? member.descriptionId : member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Source Section */}
        <Card className="mb-16 border-purple-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-700">{t("about.openSource.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Github className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t("about.openSource.openSource")}</h3>
                <p className="text-gray-600 mb-6">{t("about.openSource.openSourceDescription")}</p>
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                >
                  <Github className="w-4 h-4 mr-2" />
                  {t("about.openSource.viewOnGitHub")}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t("about.openSource.easyDeployment")}</h3>
                <p className="text-gray-600 mb-6">{t("about.openSource.easyDeploymentDescription")}</p>
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t("about.openSource.deploymentGuide")}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="border-red-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-700">{t("about.contact.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">{t("about.contact.description")}</p>
            <div className="flex justify-center gap-4">
              <Button className="bg-red-600 hover:bg-red-700">
                <Mail className="w-4 h-4 mr-2" />
                {t("about.contact.contactUs")}
              </Button>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent">
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
