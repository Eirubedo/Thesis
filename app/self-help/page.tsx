"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DifyChatInterface } from "@/components/dify-chat-interface"
import { InteractiveTimer } from "@/components/interactive-timer"
import { EmbeddedVideo } from "@/components/embedded-video"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { useProgressTracking } from "@/hooks/use-progress-tracking"
import { useRouter } from "next/navigation"
import {
  Heart,
  Activity,
  Utensils,
  Dumbbell,
  Brain,
  Pill,
  BookOpen,
  Play,
  Clock,
  Star,
  CheckCircle,
  MessageCircle,
  TrendingUp,
} from "lucide-react"

export default function SelfHelpPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  const { userStats, getResourceProgress, markResourceCompleted, getLastPracticedText, formatDuration, isLoading } =
    useProgressTracking()

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [showAIChat, setShowAIChat] = useState(false)

  const categories = [
    { id: "all", name: t("selfHelp.allResources"), icon: BookOpen },
    { id: "bloodPressure", name: t("selfHelp.bloodPressure"), icon: Activity },
    { id: "diet", name: t("selfHelp.diet"), icon: Utensils },
    { id: "exercise", name: t("selfHelp.exercise"), icon: Dumbbell },
    { id: "stress", name: t("selfHelp.stress"), icon: Brain },
    { id: "medications", name: t("selfHelp.medications"), icon: Pill },
    { id: "mentalHealth", name: t("selfHelp.mentalHealth"), icon: Heart },
  ]

  const resources = [
    {
      id: 1,
      title: "Deep Breathing for Blood Pressure",
      titleId: "Pernapasan Dalam untuk Tekanan Darah",
      description: "Learn breathing techniques that can help lower blood pressure naturally",
      descriptionId: "Pelajari teknik pernapasan yang dapat membantu menurunkan tekanan darah secara alami",
      category: "bloodPressure",
      duration: "10 min",
      durationId: "10 mnt",
      difficulty: t("selfHelp.beginner"),
      rating: 4.8,
      type: "exercise",
      timerDuration: 600,
      video: {
        videoId: "YRPh_GaiL8s",
        title: "Guided Breathing for Hypertension",
        titleId: "Panduan Pernapasan untuk Hipertensi",
        description: "Follow along with this breathing exercise designed for blood pressure management",
        descriptionId: "Ikuti latihan pernapasan ini yang dirancang untuk pengelolaan tekanan darah",
        duration: "10:15",
      },
      content: `
# Deep Breathing for Blood Pressure Control

## How It Helps:
Deep breathing activates the parasympathetic nervous system, which helps:
- Lower heart rate
- Reduce blood pressure
- Decrease stress hormones
- Improve circulation

## Instructions:
1. Sit comfortably with your back straight
2. Place one hand on your chest, one on your belly
3. Breathe in slowly through your nose for 4 counts
4. Hold your breath for 4 counts
5. Exhale slowly through your mouth for 6 counts
6. Repeat for 10 minutes

## Best Practices:
- Practice twice daily (morning and evening)
- Use before stressful situations
- Combine with blood pressure monitoring
- Track your progress over time
      `,
      contentId: `
# Pernapasan Dalam untuk Kontrol Tekanan Darah

## Bagaimana Membantu:
Pernapasan dalam mengaktifkan sistem saraf parasimpatis, yang membantu:
- Menurunkan detak jantung
- Mengurangi tekanan darah
- Mengurangi hormon stres
- Meningkatkan sirkulasi

## Instruksi:
1. Duduk dengan nyaman dengan punggung lurus
2. Letakkan satu tangan di dada, satu di perut
3. Tarik napas perlahan melalui hidung selama 4 hitungan
4. Tahan napas selama 4 hitungan
5. Buang napas perlahan melalui mulut selama 6 hitungan
6. Ulangi selama 10 menit

## Praktik Terbaik:
- Latihan dua kali sehari (pagi dan sore)
- Gunakan sebelum situasi stres
- Kombinasikan dengan pemantauan tekanan darah
- Lacak kemajuan Anda dari waktu ke waktu
      `,
    },
    {
      id: 2,
      title: "DASH Diet Basics",
      titleId: "Dasar-dasar Diet DASH",
      description: "Learn the fundamentals of the DASH diet for hypertension management",
      descriptionId: "Pelajari dasar-dasar diet DASH untuk pengelolaan hipertensi",
      category: "diet",
      duration: "15 min",
      durationId: "15 mnt",
      difficulty: t("selfHelp.beginner"),
      rating: 4.9,
      type: "guide",
      timerDuration: 900,
      video: {
        videoId: "6K8AnxrnROE",
        title: "DASH Diet Explained",
        titleId: "Diet DASH Dijelaskan",
        description: "Complete guide to the DASH diet for blood pressure control",
        descriptionId: "Panduan lengkap diet DASH untuk kontrol tekanan darah",
        duration: "12:30",
      },
      content: `
# DASH Diet for Hypertension

## What is DASH?
DASH (Dietary Approaches to Stop Hypertension) is an eating plan designed to help treat or prevent high blood pressure.

## Key Principles:
- Emphasize fruits and vegetables
- Include whole grains
- Choose lean proteins
- Limit sodium intake
- Reduce saturated fats
- Include low-fat dairy

## Daily Servings:
- Vegetables: 4-5 servings
- Fruits: 4-5 servings
- Grains: 6-8 servings
- Lean meats: 6 oz or less
- Nuts/seeds: 4-5 servings per week
- Sodium: Less than 2,300mg (ideally 1,500mg)

## Benefits:
- Can lower blood pressure by 8-14 mmHg
- Reduces risk of heart disease
- Helps with weight management
- Improves overall health
      `,
      contentId: `
# Diet DASH untuk Hipertensi

## Apa itu DASH?
DASH (Dietary Approaches to Stop Hypertension) adalah rencana makan yang dirancang untuk membantu mengobati atau mencegah tekanan darah tinggi.

## Prinsip Utama:
- Menekankan buah dan sayuran
- Sertakan biji-bijian utuh
- Pilih protein tanpa lemak
- Batasi asupan natrium
- Kurangi lemak jenuh
- Sertakan produk susu rendah lemak

## Porsi Harian:
- Sayuran: 4-5 porsi
- Buah: 4-5 porsi
- Biji-bijian: 6-8 porsi
- Daging tanpa lemak: 6 oz atau kurang
- Kacang/biji: 4-5 porsi per minggu
- Natrium: Kurang dari 2.300mg (idealnya 1.500mg)

## Manfaat:
- Dapat menurunkan tekanan darah 8-14 mmHg
- Mengurangi risiko penyakit jantung
- Membantu pengelolaan berat badan
- Meningkatkan kesehatan secara keseluruhan
      `,
    },
    {
      id: 3,
      title: "Gentle Exercise for Hypertension",
      titleId: "Olahraga Ringan untuk Hipertensi",
      description: "Safe and effective exercises for people with high blood pressure",
      descriptionId: "Olahraga yang aman dan efektif untuk penderita tekanan darah tinggi",
      category: "exercise",
      duration: "20 min",
      durationId: "20 mnt",
      difficulty: t("selfHelp.beginner"),
      rating: 4.7,
      type: "exercise",
      timerDuration: 1200,
      video: {
        videoId: "akbY1QMJR4M",
        title: "Low-Impact Exercise for High Blood Pressure",
        titleId: "Olahraga Dampak Rendah untuk Tekanan Darah Tinggi",
        description: "Safe exercise routine designed for hypertension management",
        descriptionId: "Rutinitas olahraga aman yang dirancang untuk pengelolaan hipertensi",
        duration: "18:45",
      },
      content: `
# Safe Exercise for Hypertension

## Benefits of Exercise:
- Lowers blood pressure by 4-9 mmHg
- Strengthens the heart
- Improves circulation
- Reduces stress
- Helps with weight management

## Recommended Activities:
- Walking (30 minutes daily)
- Swimming
- Cycling
- Light strength training
- Yoga
- Tai Chi

## Exercise Guidelines:
- Start slowly and gradually increase intensity
- Aim for 150 minutes of moderate activity per week
- Include strength training 2 days per week
- Monitor blood pressure before and after exercise
- Stay hydrated

## Safety Tips:
- Consult your doctor before starting
- Avoid holding your breath during exercise
- Stop if you feel dizzy or chest pain
- Take medications as prescribed
- Monitor your heart rate
      `,
      contentId: `
# Olahraga Aman untuk Hipertensi

## Manfaat Olahraga:
- Menurunkan tekanan darah 4-9 mmHg
- Memperkuat jantung
- Meningkatkan sirkulasi
- Mengurangi stres
- Membantu pengelolaan berat badan

## Aktivitas yang Direkomendasikan:
- Jalan kaki (30 menit sehari)
- Berenang
- Bersepeda
- Latihan kekuatan ringan
- Yoga
- Tai Chi

## Panduan Olahraga:
- Mulai perlahan dan tingkatkan intensitas secara bertahap
- Targetkan 150 menit aktivitas sedang per minggu
- Sertakan latihan kekuatan 2 hari per minggu
- Pantau tekanan darah sebelum dan sesudah olahraga
- Tetap terhidrasi

## Tips Keamanan:
- Konsultasikan dengan dokter sebelum memulai
- Hindari menahan napas saat berolahraga
- Berhenti jika merasa pusing atau nyeri dada
- Minum obat sesuai resep
- Pantau detak jantung Anda
      `,
    },
    {
      id: 4,
      title: "Stress Management for Blood Pressure",
      titleId: "Manajemen Stres untuk Tekanan Darah",
      description: "Learn techniques to manage stress and its impact on blood pressure",
      descriptionId: "Pelajari teknik untuk mengelola stres dan dampaknya pada tekanan darah",
      category: "stress",
      duration: "15 min",
      durationId: "15 mnt",
      difficulty: t("selfHelp.intermediate"),
      rating: 4.8,
      type: "guide",
      timerDuration: 900,
      content: `
# Stress Management for Hypertension

## How Stress Affects Blood Pressure:
- Triggers fight-or-flight response
- Increases heart rate
- Constricts blood vessels
- Releases stress hormones
- Can lead to unhealthy coping behaviors

## Stress Management Techniques:
1. **Deep Breathing**: 4-7-8 breathing technique
2. **Progressive Muscle Relaxation**: Tense and release muscle groups
3. **Mindfulness Meditation**: Focus on present moment
4. **Regular Exercise**: Natural stress reliever
5. **Adequate Sleep**: 7-9 hours per night
6. **Social Support**: Connect with friends and family

## Quick Stress Relief:
- Take 10 deep breaths
- Go for a short walk
- Listen to calming music
- Practice gratitude
- Use positive self-talk

## Long-term Strategies:
- Identify stress triggers
- Develop healthy coping mechanisms
- Maintain work-life balance
- Consider counseling if needed
- Practice regular relaxation
      `,
      contentId: `
# Manajemen Stres untuk Hipertensi

## Bagaimana Stres Mempengaruhi Tekanan Darah:
- Memicu respons fight-or-flight
- Meningkatkan detak jantung
- Menyempitkan pembuluh darah
- Melepaskan hormon stres
- Dapat menyebabkan perilaku koping yang tidak sehat

## Teknik Manajemen Stres:
1. **Pernapasan Dalam**: Teknik pernapasan 4-7-8
2. **Relaksasi Otot Progresif**: Tegang dan lepaskan kelompok otot
3. **Meditasi Mindfulness**: Fokus pada momen saat ini
4. **Olahraga Teratur**: Penghilang stres alami
5. **Tidur Cukup**: 7-9 jam per malam
6. **Dukungan Sosial**: Terhubung dengan teman dan keluarga

## Penghilang Stres Cepat:
- Ambil 10 napas dalam
- Jalan-jalan sebentar
- Dengarkan musik yang menenangkan
- Praktikkan rasa syukur
- Gunakan self-talk positif

## Strategi Jangka Panjang:
- Identifikasi pemicu stres
- Kembangkan mekanisme koping yang sehat
- Pertahankan keseimbangan kerja-hidup
- Pertimbangkan konseling jika diperlukan
- Praktikkan relaksasi teratur
      `,
    },
  ]

  const isIndonesian = language === "id"

  if (!user) {
    router.push("/login")
    return null
  }

  const filteredResources =
    selectedCategory === "all" ? resources : resources.filter((resource) => resource.category === selectedCategory)

  if (showAIChat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="pt-16 max-w-6xl mx-auto p-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("selfHelp.aiAssistantTitle")}</h1>
              <p className="text-gray-600">{t("selfHelp.aiAssistantDesc")}</p>
            </div>
            <Button onClick={() => setShowAIChat(false)} variant="outline" className="bg-transparent">
              {t("selfHelp.backToResources")}
            </Button>
          </div>

          <DifyChatInterface
            title={t("selfHelp.aiAssistantTitle")}
            showHeader={true}
            minHeight="calc(100vh - 200px)"
            className="shadow-lg"
            placeholder={t("selfHelp.aiPlaceholder")}
          />
        </div>
      </div>
    )
  }

  if (selectedResource) {
    const resourceProgress = getResourceProgress(selectedResource.id)

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="pt-16 max-w-6xl mx-auto p-4 py-8">
          <Button onClick={() => setSelectedResource(null)} variant="ghost" className="mb-4">
            {t("selfHelp.backToResources")}
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {isIndonesian ? selectedResource.titleId : selectedResource.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {isIndonesian ? selectedResource.descriptionId : selectedResource.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {isIndonesian ? selectedResource.durationId : selectedResource.duration}
                      </Badge>
                      <Badge variant="outline">{selectedResource.difficulty}</Badge>
                      {resourceProgress?.isCompleted && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="prose max-w-none">
                    {(isIndonesian ? selectedResource.contentId : selectedResource.content)
                      .split("\n")
                      .map((line: string, index: number) => {
                        if (line.startsWith("# ")) {
                          return (
                            <h1 key={index} className="text-2xl font-bold mb-4">
                              {line.substring(2)}
                            </h1>
                          )
                        }
                        if (line.startsWith("## ")) {
                          return (
                            <h2 key={index} className="text-xl font-semibold mb-3 mt-6">
                              {line.substring(3)}
                            </h2>
                          )
                        }
                        if (line.startsWith("- ")) {
                          return (
                            <li key={index} className="mb-1">
                              {line.substring(2)}
                            </li>
                          )
                        }
                        if (line.match(/^\d+\./)) {
                          return (
                            <li key={index} className="mb-1">
                              {line}
                            </li>
                          )
                        }
                        if (line.trim() === "") {
                          return <br key={index} />
                        }
                        return (
                          <p key={index} className="mb-3">
                            {line}
                          </p>
                        )
                      })}
                  </div>

                  <div className="mt-8 flex space-x-4">
                    <Button
                      onClick={() => markResourceCompleted(selectedResource.id)}
                      className={resourceProgress?.isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {resourceProgress?.isCompleted ? t("selfHelp.alreadyCompleted") : t("selfHelp.markCompleted")}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAIChat(true)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {t("selfHelp.discussWithAI")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Video */}
              {selectedResource.video && (
                <EmbeddedVideo
                  title={isIndonesian ? selectedResource.video.titleId : selectedResource.video.title}
                  description={isIndonesian ? selectedResource.video.descriptionId : selectedResource.video.description}
                  videoId={selectedResource.video.videoId}
                  duration={selectedResource.video.duration}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timer */}
              {selectedResource.timerDuration && (
                <InteractiveTimer
                  title={`${isIndonesian ? selectedResource.titleId : selectedResource.title} Timer`}
                  duration={selectedResource.timerDuration}
                  description={`Set timer for ${isIndonesian ? selectedResource.durationId : selectedResource.duration} practice session`}
                  resourceId={selectedResource.id}
                  onComplete={() => {
                    markResourceCompleted(selectedResource.id)
                  }}
                />
              )}

              {/* Resource Progress */}
              {resourceProgress && (
                <Card className="border-green-100 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-900 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Sessions completed</span>
                        <span className="text-sm font-medium text-green-900">{resourceProgress.sessions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Total practice time</span>
                        <span className="text-sm font-medium text-green-900">
                          {formatDuration(resourceProgress.totalPracticeTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Last practiced</span>
                        <span className="text-sm font-medium text-green-900">
                          {getLastPracticedText(selectedResource.id, t)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Completion count</span>
                        <span className="text-sm font-medium text-green-900">{resourceProgress.completionCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Overall Progress Tracking */}
              <Card className="border-red-100 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-900">{t("selfHelp.progressTracking")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">{t("selfHelp.sessionsCompleted")}</span>
                      <span className="text-sm font-medium text-red-900">{userStats.totalSessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">{t("selfHelp.totalPracticeTime")}</span>
                      <span className="text-sm font-medium text-red-900">
                        {formatDuration(userStats.totalPracticeTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">{t("selfHelp.completedResources")}</span>
                      <span className="text-sm font-medium text-red-900">{userStats.completedResources}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">{t("selfHelp.streak")}</span>
                      <span className="text-sm font-medium text-red-900">
                        {userStats.currentStreak} {t("selfHelp.days")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">{t("selfHelp.longestStreak")}</span>
                      <span className="text-sm font-medium text-red-900">
                        {userStats.longestStreak} {t("selfHelp.days")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">{t("selfHelp.quickTips")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-blue-800 space-y-2">
                    {t("selfHelp.tips")
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-16 max-w-6xl mx-auto p-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("selfHelp.title")}</h1>
            <p className="text-gray-600">{t("selfHelp.subtitle")}</p>
          </div>
          <Button onClick={() => setShowAIChat(true)} className="bg-red-500 hover:bg-red-600 text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("selfHelp.aiAssistant")}
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="space-y-4">
            <Card className="border-red-100 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg text-red-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {t("selfHelp.progressTracking")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700">{t("selfHelp.sessionsCompleted")}</span>
                    <span className="text-sm font-medium text-red-900">{userStats.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700">{t("selfHelp.totalPracticeTime")}</span>
                    <span className="text-sm font-medium text-red-900">
                      {formatDuration(userStats.totalPracticeTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700">{t("selfHelp.completedResources")}</span>
                    <span className="text-sm font-medium text-red-900">{userStats.completedResources}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700">{t("selfHelp.streak")}</span>
                    <span className="text-sm font-medium text-red-900">
                      {userStats.currentStreak} {t("selfHelp.days")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 gap-6">
              {filteredResources.map((resource) => {
                const resourceProgress = getResourceProgress(resource.id)

                return (
                  <Card
                    key={resource.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-red-100"
                    onClick={() => setSelectedResource(resource)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl flex items-center">
                            {isIndonesian ? resource.titleId : resource.title}
                            {resourceProgress?.isCompleted && <CheckCircle className="w-5 h-5 ml-2 text-green-600" />}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {isIndonesian ? resource.descriptionId : resource.description}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            {isIndonesian ? resource.durationId : resource.duration}
                          </Badge>
                          <Badge variant="outline">{resource.difficulty}</Badge>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 mr-1" />
                            <span className="text-xs text-gray-600">{resource.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {resourceProgress && (
                        <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Sessions:</span>
                            <span className="font-medium">{resourceProgress.sessions.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Practice time:</span>
                            <span className="font-medium">{formatDuration(resourceProgress.totalPracticeTime)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Last practiced:</span>
                            <span className="font-medium">{getLastPracticedText(resource.id, t)}</span>
                          </div>
                        </div>
                      )}

                      <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        {t("selfHelp.startResource")}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredResources.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("selfHelp.noResourcesFound")}</h3>
                  <p className="text-gray-600">{t("selfHelp.noResourcesDesc")}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
