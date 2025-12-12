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

interface AssessmentResult {
  id: string
  userId: string
  type: "comprehensive" | "quick" | "knowledge"
  score: number
  maxScore: number
  completedAt: string
  data: any
}

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

export default function ReportsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [results, setResults] = useState<AssessmentResult[]>([])
  const [dailyConversations, setDailyConversations] = useState<DailyConversation[]>([])
  const [selectedDay, setSelectedDay] = useState<DailyConversation | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const storedResults = JSON.parse(localStorage.getItem("assessmentResults") || "[]")
    const userResults = storedResults.filter((result: AssessmentResult) => result.userId === user.id)
    setResults(
      userResults.sort(
        (a: AssessmentResult, b: AssessmentResult) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      ),
    )

    fetchDailyConversations()
  }, [user, router])

  const fetchDailyConversations = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/conversations/daily?user_id=${user.id}`)
      const data = await response.json()
      setDailyConversations(data)
    } catch (error) {
      console.error("Failed to fetch daily conversations:", error)
    }
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return "bg-green-100"
    if (percentage >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  const exportToPDF = () => {
    toast({
      title: t("reports.exportPDF"),
      description: "PDF export functionality would be implemented here using libraries like jsPDF or Puppeteer.",
    })
  }

  const printReport = () => {
    window.print()
  }

  const getConversationType = (type: string) => {
    switch (type) {
      case "chat":
        return { label: "Chat AI", color: "bg-blue-100 text-blue-700" }
      case "assessment":
        return { label: "Asesmen", color: "bg-red-100 text-red-700" }
      case "education":
        return { label: "Edukasi", color: "bg-green-100 text-green-700" }
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

  const comprehensiveResults = results.filter((r) => r.type === "comprehensive")
  const quickResults = results.filter((r) => r.type === "quick")
  const knowledgeResults = results.filter((r) => r.type === "knowledge")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-20 pb-12">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("reports.title")}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("reports.subtitle")}</p>
          <div className="flex justify-center gap-4 mt-6">
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

        <Tabs defaultValue="conversations" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Riwayat Chat
            </TabsTrigger>
            <TabsTrigger value="comprehensive" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              {t("reports.comprehensiveResults")}
            </TabsTrigger>
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("reports.quickResults")}
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {t("reports.knowledgeLevel")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  Riwayat Percakapan Harian
                </CardTitle>
                <CardDescription>Semua percakapan Anda dengan AI dikelompokkan per hari</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Percakapan</h3>
                    <p className="text-gray-600 mb-4">Mulai chat dengan AI untuk melihat riwayat di sini</p>
                    <Button onClick={() => router.push("/chat")}>Mulai Chat</Button>
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
                                  {new Date(day.date).toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-600">
                                {day.messageCount} pesan dalam percakapan hari ini
                              </p>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedDay(day)}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Lihat Percakapan
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[85vh]">
                                <DialogHeader>
                                  <DialogTitle>
                                    Percakapan -{" "}
                                    {new Date(day.date).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </DialogTitle>
                                  <DialogDescription>{day.messageCount} pesan dari semua percakapan</DialogDescription>
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
                                                className={`flex items-start space-x-3 max-w-[80%] ${
                                                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                                                }`}
                                              >
                                                <div
                                                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                    message.role === "user" ? "bg-sky-500" : "bg-yellow-500"
                                                  }`}
                                                >
                                                  {message.role === "user" ? (
                                                    <User className="w-4 h-4 text-white" />
                                                  ) : (
                                                    <Bot className="w-4 h-4 text-white" />
                                                  )}
                                                </div>
                                                <div
                                                  className={`p-3 rounded-lg ${
                                                    message.role === "user"
                                                      ? "bg-sky-500 text-white"
                                                      : "bg-gray-100 text-gray-900"
                                                  }`}
                                                >
                                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                  <p className="text-xs opacity-70 mt-1">
                                                    {new Date(message.created_at).toLocaleTimeString("id-ID", {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    })}
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

          <TabsContent value="comprehensive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  {t("reports.comprehensiveResults")}
                </CardTitle>
                <CardDescription>Riwayat percakapan asesmen AI lengkap</CardDescription>
              </CardHeader>
              <CardContent>
                {getConversationsByType("assessment").length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Asesmen Lengkap</h3>
                    <p className="text-gray-600 mb-4">Mulai asesmen lengkap untuk melihat riwayat di sini</p>
                    <Button onClick={() => router.push("/assessment")}>Mulai Asesmen</Button>
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
                                    {new Date(day.date).toLocaleDateString("id-ID", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {assessmentMessages.length} pesan dalam asesmen lengkap
                                </p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Lihat Percakapan
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[85vh]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Asesmen Lengkap -{" "}
                                      {new Date(day.date).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </DialogTitle>
                                    <DialogDescription>{assessmentMessages.length} pesan</DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="h-[65vh] pr-4">
                                    <div className="space-y-4">
                                      {assessmentMessages.map((message) => (
                                        <div key={message.id}>
                                          <div
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                          >
                                            <div
                                              className={`flex items-start space-x-3 max-w-[80%] ${
                                                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                                              }`}
                                            >
                                              <div
                                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                  message.role === "user" ? "bg-purple-500" : "bg-purple-100"
                                                }`}
                                              >
                                                {message.role === "user" ? (
                                                  <User className="w-4 h-4 text-white" />
                                                ) : (
                                                  <Bot className="w-4 h-4 text-purple-600" />
                                                )}
                                              </div>
                                              <div
                                                className={`p-3 rounded-lg ${
                                                  message.role === "user"
                                                    ? "bg-purple-500 text-white"
                                                    : "bg-purple-50 text-gray-900"
                                                }`}
                                              >
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                  {new Date(message.created_at).toLocaleTimeString("id-ID", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  })}
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

          <TabsContent value="quick" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  {t("reports.quickResults")}
                </CardTitle>
                <CardDescription>Riwayat percakapan asesmen cepat</CardDescription>
              </CardHeader>
              <CardContent>
                {getConversationsByType("quick-assessment").length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Asesmen Cepat</h3>
                    <p className="text-gray-600 mb-4">Mulai asesmen cepat untuk melihat riwayat di sini</p>
                    <Button onClick={() => router.push("/assessment")}>Mulai Asesmen Cepat</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getConversationsByType("quick-assessment").map((day) => {
                      const quickMessages = day.messages.filter((msg) => msg.conversation_type === "quick-assessment")
                      return (
                        <Card key={day.date} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-5 h-5 text-gray-500" />
                                  <h3 className="text-lg font-semibold">
                                    {new Date(day.date).toLocaleDateString("id-ID", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {quickMessages.length} pesan dalam asesmen cepat
                                </p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Lihat Percakapan
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[85vh]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Asesmen Cepat -{" "}
                                      {new Date(day.date).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </DialogTitle>
                                    <DialogDescription>{quickMessages.length} pesan</DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="h-[65vh] pr-4">
                                    <div className="space-y-4">
                                      {quickMessages.map((message) => (
                                        <div key={message.id}>
                                          <div
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                          >
                                            <div
                                              className={`flex items-start space-x-3 max-w-[80%] ${
                                                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                                              }`}
                                            >
                                              <div
                                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                  message.role === "user" ? "bg-blue-500" : "bg-blue-100"
                                                }`}
                                              >
                                                {message.role === "user" ? (
                                                  <User className="w-4 h-4 text-white" />
                                                ) : (
                                                  <Bot className="w-4 h-4 text-blue-600" />
                                                )}
                                              </div>
                                              <div
                                                className={`p-3 rounded-lg ${
                                                  message.role === "user"
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-blue-50 text-gray-900"
                                                }`}
                                              >
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                  {new Date(message.created_at).toLocaleTimeString("id-ID", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  })}
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

          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-500" />
                  {t("reports.knowledgeLevel")}
                </CardTitle>
                <CardDescription>Riwayat percakapan tes pengetahuan</CardDescription>
              </CardHeader>
              <CardContent>
                {getConversationsByType("knowledge-test").length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Tes Pengetahuan</h3>
                    <p className="text-gray-600 mb-4">Mulai tes pengetahuan untuk melihat riwayat di sini</p>
                    <Button onClick={() => router.push("/assessment")}>Mulai Tes Pengetahuan</Button>
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
                                    {new Date(day.date).toLocaleDateString("id-ID", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {knowledgeMessages.length} pesan dalam tes pengetahuan
                                </p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Lihat Percakapan
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[85vh]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Tes Pengetahuan -{" "}
                                      {new Date(day.date).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </DialogTitle>
                                    <DialogDescription>{knowledgeMessages.length} pesan</DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="h-[65vh] pr-4">
                                    <div className="space-y-4">
                                      {knowledgeMessages.map((message) => (
                                        <div key={message.id}>
                                          <div
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                          >
                                            <div
                                              className={`flex items-start space-x-3 max-w-[80%] ${
                                                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                                              }`}
                                            >
                                              <div
                                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                  message.role === "user" ? "bg-green-500" : "bg-green-100"
                                                }`}
                                              >
                                                {message.role === "user" ? (
                                                  <User className="w-4 h-4 text-white" />
                                                ) : (
                                                  <Bot className="w-4 h-4 text-green-600" />
                                                )}
                                              </div>
                                              <div
                                                className={`p-3 rounded-lg ${
                                                  message.role === "user"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-green-50 text-gray-900"
                                                }`}
                                              >
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                  {new Date(message.created_at).toLocaleTimeString("id-ID", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  })}
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

        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{dailyConversations.length}</div>
                  <div className="text-sm text-gray-600">Riwayat Harian</div>
                </div>
              </div>
              {dailyConversations.length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Aktif berkomunikasi</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{comprehensiveResults.length}</div>
                  <div className="text-sm text-gray-600">Asesmen Lengkap</div>
                </div>
              </div>
              {comprehensiveResults.length > 1 && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Skor meningkat</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{quickResults.length}</div>
                  <div className="text-sm text-gray-600">Asesmen Cepat</div>
                </div>
              </div>
              {quickResults.length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Monitoring aktif</span>
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
                  <div className="text-2xl font-bold">
                    {knowledgeResults.length > 0
                      ? `${Math.round((knowledgeResults[0].score / knowledgeResults[0].maxScore) * 100)}%`
                      : "--"}
                  </div>
                  <div className="text-sm text-gray-600">Level Pengetahuan</div>
                </div>
              </div>
              {knowledgeResults.length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">
                    {Math.round((knowledgeResults[0].score / knowledgeResults[0].maxScore) * 100) >= 80
                      ? "Advanced"
                      : Math.round((knowledgeResults[0].score / knowledgeResults[0].maxScore) * 100) >= 60
                        ? "Intermediate"
                        : "Beginner"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
              <Button onClick={() => router.push("/chat")} size="sm">
                {t("reports.chatWithAI")}
              </Button>
              <Button onClick={() => router.push("/self-help")} variant="outline" size="sm">
                {t("reports.educationResources")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
