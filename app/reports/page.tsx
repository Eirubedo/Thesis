"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import {
  FileText,
  Download,
  Printer,
  TrendingUp,
  Brain,
  Clock,
  BookOpen,
  Award,
  Calendar,
  CheckCircle,
  MessageCircle,
  Bot,
  User,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DailyConversation {
  date: string
  messageCount: number
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    created_at: string
    conversation_type: string
    conversation_title: string
  }>
}

interface ConversationStats {
  totalDays: number
  assessmentDays: number
  quickAssessmentDays: number
  knowledgeTestDays: number
  totalMessages: number
  assessmentMessages: number
  quickAssessmentMessages: number
  knowledgeTestMessages: number
}

export default function ReportsPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [dailyConversations, setDailyConversations] = useState<DailyConversation[]>([])
  const [selectedDay, setSelectedDay] = useState<DailyConversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<ConversationStats>({
    totalDays: 0,
    assessmentDays: 0,
    quickAssessmentDays: 0,
    knowledgeTestDays: 0,
    totalMessages: 0,
    assessmentMessages: 0,
    quickAssessmentMessages: 0,
    knowledgeTestMessages: 0,
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchDailyConversations()
  }, [user, router])

  const fetchDailyConversations = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/conversations/daily?user_id=${user.id}`)
      const data = await response.json()
      setDailyConversations(data)

      const newStats: ConversationStats = {
        totalDays: data.length,
        assessmentDays: 0,
        quickAssessmentDays: 0,
        knowledgeTestDays: 0,
        totalMessages: 0,
        assessmentMessages: 0,
        quickAssessmentMessages: 0,
        knowledgeTestMessages: 0,
      }

      data.forEach((day: DailyConversation) => {
        newStats.totalMessages += day.messageCount

        const hasAssessment = day.messages.some((m) => m.conversation_type === "assessment")
        const hasQuickAssessment = day.messages.some((m) => m.conversation_type === "quick-assessment")
        const hasKnowledgeTest = day.messages.some((m) => m.conversation_type === "knowledge-test")

        if (hasAssessment) newStats.assessmentDays++
        if (hasQuickAssessment) newStats.quickAssessmentDays++
        if (hasKnowledgeTest) newStats.knowledgeTestDays++

        day.messages.forEach((m) => {
          if (m.conversation_type === "assessment") newStats.assessmentMessages++
          if (m.conversation_type === "quick-assessment") newStats.quickAssessmentMessages++
          if (m.conversation_type === "knowledge-test") newStats.knowledgeTestMessages++
        })
      })

      setStats(newStats)
    } catch (error) {
      console.error("Failed to fetch daily conversations:", error)
      toast({
        title: language === "id" ? "Gagal memuat data" : "Failed to load data",
        description: language === "id" ? "Silakan coba lagi" : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportToPDF = () => {
    toast({
      title: t("reports.exportPDF"),
      description: language === "id" ? "Fitur ekspor PDF akan segera tersedia" : "PDF export feature coming soon",
    })
  }

  const printReport = () => {
    window.print()
  }

  const getConversationType = (type: string) => {
    switch (type) {
      case "chat":
        return { label: language === "id" ? "Chat AI" : "AI Chat", color: "bg-blue-100 text-blue-700" }
      case "assessment":
        return {
          label: language === "id" ? "Asesmen Lengkap" : "Full Assessment",
          color: "bg-purple-100 text-purple-700",
        }
      case "quick-assessment":
        return {
          label: language === "id" ? "Monitoring & Evaluasi" : "Monitoring & Evaluation",
          color: "bg-cyan-100 text-cyan-700",
        }
      case "knowledge-test":
        return { label: language === "id" ? "Tes Pengetahuan" : "Knowledge Test", color: "bg-green-100 text-green-700" }
      case "education":
        return { label: language === "id" ? "Edukasi" : "Education", color: "bg-amber-100 text-amber-700" }
      default:
        return { label: type, color: "bg-gray-100 text-gray-700" }
    }
  }

  const getConversationsByType = (type: string) => {
    return dailyConversations.filter((day) => day.messages.some((msg) => msg.conversation_type === type))
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-20 pb-12">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("reports.title")}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("reports.subtitle")}</p>
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={fetchDailyConversations}
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              {language === "id" ? "Refresh" : "Refresh"}
            </Button>
            <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              {t("reports.exportPDF")}
            </Button>
            <Button onClick={printReport} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Printer className="w-4 h-4" />
              {t("reports.print")}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalDays}</div>
                  <div className="text-sm text-gray-600">{language === "id" ? "Riwayat Harian" : "Daily History"}</div>
                </div>
              </div>
              {stats.totalMessages > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">
                    {stats.totalMessages} {language === "id" ? "pesan" : "messages"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.assessmentDays}</div>
                  <div className="text-sm text-gray-600">
                    {language === "id" ? "Asesmen Lengkap" : "Full Assessment"}
                  </div>
                </div>
              </div>
              {stats.assessmentMessages > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">
                    {stats.assessmentMessages} {language === "id" ? "pesan" : "messages"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.quickAssessmentDays}</div>
                  <div className="text-sm text-gray-600">
                    {language === "id" ? "Monitoring & Evaluasi" : "Monitoring & Evaluation"}
                  </div>
                </div>
              </div>
              {stats.quickAssessmentMessages > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">
                    {stats.quickAssessmentMessages} {language === "id" ? "pesan" : "messages"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.knowledgeTestDays}</div>
                  <div className="text-sm text-gray-600">
                    {language === "id" ? "Tes Pengetahuan" : "Knowledge Test"}
                  </div>
                </div>
              </div>
              {stats.knowledgeTestMessages > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">
                    {stats.knowledgeTestMessages} {language === "id" ? "pesan" : "messages"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="conversations" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "id" ? "Riwayat Harian" : "Daily History"}</span>
            </TabsTrigger>
            <TabsTrigger value="comprehensive" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "id" ? "Asesmen Lengkap" : "Full Assessment"}</span>
            </TabsTrigger>
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "id" ? "Monitoring" : "Monitoring"}</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">{language === "id" ? "Pengetahuan" : "Knowledge"}</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Riwayat Harian - All conversations */}
          <TabsContent value="conversations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  {language === "id" ? "Riwayat Percakapan Harian" : "Daily Conversation History"}
                </CardTitle>
                <CardDescription>
                  {language === "id"
                    ? "Semua percakapan Anda dengan AI dikelompokkan per hari"
                    : "All your AI conversations grouped by day"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">{language === "id" ? "Memuat data..." : "Loading data..."}</p>
                  </div>
                ) : dailyConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {language === "id" ? "Belum Ada Percakapan" : "No Conversations Yet"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {language === "id"
                        ? "Mulai chat dengan AI untuk melihat riwayat di sini"
                        : "Start chatting with AI to see history here"}
                    </p>
                    <Button onClick={() => router.push("/chat")}>
                      {language === "id" ? "Mulai Chat" : "Start Chat"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dailyConversations.map((day) => (
                      <Card key={day.date} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                <h3 className="text-lg font-semibold">
                                  {new Date(day.date).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-600">
                                {day.messageCount}{" "}
                                {language === "id" ? "pesan dalam percakapan hari ini" : "messages today"}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {Array.from(new Set(day.messages.map((m) => m.conversation_type))).map((type) => {
                                  const typeInfo = getConversationType(type)
                                  return (
                                    <Badge key={type} className={typeInfo.color}>
                                      {typeInfo.label}
                                    </Badge>
                                  )
                                })}
                              </div>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedDay(day)}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  {language === "id" ? "Lihat" : "View"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[85vh]">
                                <DialogHeader>
                                  <DialogTitle>
                                    {language === "id" ? "Percakapan" : "Conversations"} -{" "}
                                    {new Date(day.date).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {day.messageCount}{" "}
                                    {language === "id"
                                      ? "pesan dari semua percakapan"
                                      : "messages from all conversations"}
                                  </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="h-[65vh] pr-4">
                                  {selectedDay?.date === day.date && (
                                    <div className="space-y-4">
                                      {selectedDay.messages.map((message, index) => {
                                        const typeInfo = getConversationType(message.conversation_type)
                                        const showTypeLabel =
                                          index === 0 ||
                                          message.conversation_type !==
                                            selectedDay.messages[index - 1]?.conversation_type

                                        return (
                                          <div key={message.id}>
                                            {showTypeLabel && (
                                              <div className="flex items-center gap-2 my-4">
                                                <div className="h-px flex-1 bg-gray-200" />
                                                <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                                                <div className="h-px flex-1 bg-gray-200" />
                                              </div>
                                            )}
                                            <div
                                              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                            >
                                              <div
                                                className={`flex items-start space-x-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                                              >
                                                <div
                                                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === "user" ? "bg-sky-500" : "bg-yellow-500"}`}
                                                >
                                                  {message.role === "user" ? (
                                                    <User className="w-4 h-4 text-white" />
                                                  ) : (
                                                    <Bot className="w-4 h-4 text-white" />
                                                  )}
                                                </div>
                                                <div
                                                  className={`p-3 rounded-lg ${message.role === "user" ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-900"}`}
                                                >
                                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                  <p className="text-xs opacity-70 mt-1">
                                                    {new Date(message.created_at).toLocaleTimeString(
                                                      language === "id" ? "id-ID" : "en-US",
                                                      {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                      },
                                                    )}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Asesmen Lengkap */}
          <TabsContent value="comprehensive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  {language === "id" ? "Hasil Asesmen AI Lengkap" : "Full AI Assessment Results"}
                </CardTitle>
                <CardDescription>
                  {language === "id"
                    ? "Riwayat percakapan asesmen AI lengkap"
                    : "Full AI assessment conversation history"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">{language === "id" ? "Memuat data..." : "Loading data..."}</p>
                  </div>
                ) : getConversationsByType("assessment").length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {language === "id" ? "Belum Ada Asesmen Lengkap" : "No Full Assessments Yet"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {language === "id"
                        ? "Mulai asesmen lengkap untuk melihat riwayat di sini"
                        : "Start a full assessment to see history here"}
                    </p>
                    <Button onClick={() => router.push("/assessment")}>
                      {language === "id" ? "Mulai Asesmen" : "Start Assessment"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getConversationsByType("assessment").map((day) => {
                      const assessmentMessages = day.messages.filter((msg) => msg.conversation_type === "assessment")
                      return (
                        <Card key={day.date} className="border-l-4 border-l-purple-500">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-5 h-5 text-gray-500" />
                                  <h3 className="text-lg font-semibold">
                                    {new Date(day.date).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {assessmentMessages.length}{" "}
                                  {language === "id" ? "pesan dalam asesmen lengkap" : "messages in full assessment"}
                                </p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedDay({ ...day, messages: assessmentMessages })}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    {language === "id" ? "Lihat Percakapan" : "View Conversation"}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[85vh]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {language === "id" ? "Asesmen Lengkap" : "Full Assessment"} -{" "}
                                      {new Date(day.date).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </DialogTitle>
                                    <DialogDescription>
                                      {assessmentMessages.length} {language === "id" ? "pesan" : "messages"}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="h-[65vh] pr-4">
                                    <div className="space-y-4">
                                      {assessmentMessages.map((message) => (
                                        <div key={message.id}>
                                          <div
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                          >
                                            <div
                                              className={`flex items-start space-x-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                                            >
                                              <div
                                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === "user" ? "bg-purple-500" : "bg-purple-100"}`}
                                              >
                                                {message.role === "user" ? (
                                                  <User className="w-4 h-4 text-white" />
                                                ) : (
                                                  <Bot className="w-4 h-4 text-purple-600" />
                                                )}
                                              </div>
                                              <div
                                                className={`p-3 rounded-lg ${message.role === "user" ? "bg-purple-500 text-white" : "bg-purple-50 text-gray-900"}`}
                                              >
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                  {new Date(message.created_at).toLocaleTimeString(
                                                    language === "id" ? "id-ID" : "en-US",
                                                    {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    },
                                                  )}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Monitoring & Evaluasi */}
          <TabsContent value="quick" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-500" />
                  {language === "id" ? "Hasil Monitoring dan Evaluasi" : "Monitoring and Evaluation Results"}
                </CardTitle>
                <CardDescription>
                  {language === "id"
                    ? "Riwayat percakapan monitoring dan evaluasi sistematis"
                    : "Systematic monitoring and evaluation conversation history"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">{language === "id" ? "Memuat data..." : "Loading data..."}</p>
                  </div>
                ) : getConversationsByType("quick-assessment").length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {language === "id" ? "Belum Ada Monitoring & Evaluasi" : "No Monitoring & Evaluation Yet"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {language === "id"
                        ? "Mulai monitoring dan evaluasi untuk melihat riwayat di sini"
                        : "Start monitoring and evaluation to see history here"}
                    </p>
                    <Button onClick={() => router.push("/assessment")}>
                      {language === "id" ? "Mulai Monitoring & Evaluasi" : "Start Monitoring & Evaluation"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getConversationsByType("quick-assessment").map((day) => {
                      const quickMessages = day.messages.filter((msg) => msg.conversation_type === "quick-assessment")
                      return (
                        <Card key={day.date} className="border-l-4 border-l-cyan-500">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-5 h-5 text-gray-500" />
                                  <h3 className="text-lg font-semibold">
                                    {new Date(day.date).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {quickMessages.length}{" "}
                                  {language === "id"
                                    ? "pesan dalam monitoring dan evaluasi"
                                    : "messages in monitoring and evaluation"}
                                </p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedDay({ ...day, messages: quickMessages })}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    {language === "id" ? "Lihat Percakapan" : "View Conversation"}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[85vh]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {language === "id" ? "Monitoring & Evaluasi" : "Monitoring & Evaluation"} -{" "}
                                      {new Date(day.date).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </DialogTitle>
                                    <DialogDescription>
                                      {quickMessages.length} {language === "id" ? "pesan" : "messages"}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="h-[65vh] pr-4">
                                    <div className="space-y-4">
                                      {quickMessages.map((message) => (
                                        <div key={message.id}>
                                          <div
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                          >
                                            <div
                                              className={`flex items-start space-x-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                                            >
                                              <div
                                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === "user" ? "bg-cyan-500" : "bg-cyan-100"}`}
                                              >
                                                {message.role === "user" ? (
                                                  <User className="w-4 h-4 text-white" />
                                                ) : (
                                                  <Bot className="w-4 h-4 text-cyan-600" />
                                                )}
                                              </div>
                                              <div
                                                className={`p-3 rounded-lg ${message.role === "user" ? "bg-cyan-500 text-white" : "bg-cyan-50 text-gray-900"}`}
                                              >
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                  {new Date(message.created_at).toLocaleTimeString(
                                                    language === "id" ? "id-ID" : "en-US",
                                                    {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    },
                                                  )}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Level Pengetahuan */}
          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-500" />
                  {language === "id" ? "Hasil Tes Pengetahuan" : "Knowledge Test Results"}
                </CardTitle>
                <CardDescription>
                  {language === "id" ? "Riwayat percakapan tes pengetahuan" : "Knowledge test conversation history"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">{language === "id" ? "Memuat data..." : "Loading data..."}</p>
                  </div>
                ) : getConversationsByType("knowledge-test").length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {language === "id" ? "Belum Ada Tes Pengetahuan" : "No Knowledge Tests Yet"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {language === "id"
                        ? "Mulai tes pengetahuan untuk melihat riwayat di sini"
                        : "Start a knowledge test to see history here"}
                    </p>
                    <Button onClick={() => router.push("/assessment")}>
                      {language === "id" ? "Mulai Tes Pengetahuan" : "Start Knowledge Test"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getConversationsByType("knowledge-test").map((day) => {
                      const knowledgeMessages = day.messages.filter((msg) => msg.conversation_type === "knowledge-test")
                      return (
                        <Card key={day.date} className="border-l-4 border-l-green-500">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-5 h-5 text-gray-500" />
                                  <h3 className="text-lg font-semibold">
                                    {new Date(day.date).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {knowledgeMessages.length}{" "}
                                  {language === "id" ? "pesan dalam tes pengetahuan" : "messages in knowledge test"}
                                </p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedDay({ ...day, messages: knowledgeMessages })}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    {language === "id" ? "Lihat Percakapan" : "View Conversation"}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[85vh]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {language === "id" ? "Tes Pengetahuan" : "Knowledge Test"} -{" "}
                                      {new Date(day.date).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </DialogTitle>
                                    <DialogDescription>
                                      {knowledgeMessages.length} {language === "id" ? "pesan" : "messages"}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="h-[65vh] pr-4">
                                    <div className="space-y-4">
                                      {knowledgeMessages.map((message) => (
                                        <div key={message.id}>
                                          <div
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                          >
                                            <div
                                              className={`flex items-start space-x-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                                            >
                                              <div
                                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === "user" ? "bg-green-500" : "bg-green-100"}`}
                                              >
                                                {message.role === "user" ? (
                                                  <User className="w-4 h-4 text-white" />
                                                ) : (
                                                  <Bot className="w-4 h-4 text-green-600" />
                                                )}
                                              </div>
                                              <div
                                                className={`p-3 rounded-lg ${message.role === "user" ? "bg-green-500 text-white" : "bg-green-50 text-gray-900"}`}
                                              >
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                  {new Date(message.created_at).toLocaleTimeString(
                                                    language === "id" ? "id-ID" : "en-US",
                                                    {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    },
                                                  )}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recommendations Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("reports.recommendations")}</CardTitle>
            <CardDescription>{t("reports.recommendationsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{t("reports.continueAI")}</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{t("reports.exploreSelfHelp")}</p>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button onClick={() => router.push("/chat")}>
                {language === "id" ? "Lanjut Chat" : "Continue Chat"}
              </Button>
              <Button variant="outline" onClick={() => router.push("/self-help")} className="bg-transparent">
                {language === "id" ? "Buka Edukasi" : "Open Self-Help"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
