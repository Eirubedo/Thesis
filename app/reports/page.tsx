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
import type { Conversation, ConversationMessage } from "@/types/database"

interface AssessmentResult {
  id: string
  userId: string
  type: "comprehensive" | "quick" | "knowledge"
  score: number
  maxScore: number
  completedAt: string
  data: any
}

export default function ReportsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [results, setResults] = useState<AssessmentResult[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<{
    conversation: Conversation
    messages: ConversationMessage[]
  } | null>(null)

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

    fetchConversations()
  }, [user, router])

  const fetchConversations = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/conversations/list?user_id=${user.id}`)
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    }
  }

  const viewConversationDetails = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/detail?conversation_id=${conversationId}`)
      const data = await response.json()
      setSelectedConversation(data)
    } catch (error) {
      console.error("Failed to fetch conversation details:", error)
      toast({
        title: "Error",
        description: "Failed to load conversation details",
        variant: "destructive",
      })
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

  if (!user) {
    return null
  }

  const comprehensiveResults = results.filter((r) => r.type === "comprehensive")
  const quickResults = results.filter((r) => r.type === "quick")
  const knowledgeResults = results.filter((r) => r.type === "knowledge")

  const chatConversations = conversations.filter((c) => c.conversation_type === "chat")
  const assessmentConversations = conversations.filter((c) => c.conversation_type === "assessment")
  const educationConversations = conversations.filter((c) => c.conversation_type === "education")

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
                  Riwayat Percakapan AI
                </CardTitle>
                <CardDescription>Semua percakapan Anda dengan asisten AI tersimpan di sini</CardDescription>
              </CardHeader>
              <CardContent>
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Percakapan</h3>
                    <p className="text-gray-600 mb-4">Mulai chat dengan AI untuk melihat riwayat di sini</p>
                    <Button onClick={() => router.push("/chat")}>Mulai Chat</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.map((conversation) => {
                      const typeInfo = getConversationType(conversation.conversation_type)
                      return (
                        <Card key={conversation.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(conversation.started_at).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </div>
                                </div>
                                <h3 className="font-semibold mb-1">{conversation.title || "Percakapan"}</h3>
                                <p className="text-sm text-gray-600">{conversation.message_count} pesan</p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => viewConversationDetails(conversation.id)}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Lihat Detail
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle>{conversation.title}</DialogTitle>
                                    <DialogDescription>
                                      {new Date(conversation.started_at).toLocaleString("id-ID")} •{" "}
                                      {conversation.message_count} pesan
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="h-[60vh] pr-4">
                                    {selectedConversation?.conversation.id === conversation.id && (
                                      <div className="space-y-4">
                                        {selectedConversation.messages.map((message) => (
                                          <div
                                            key={message.id}
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                          >
                                            <div
                                              className={`flex items-start space-x-3 max-w-[85%] ${
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
                                                  {new Date(message.created_at).toLocaleTimeString("id-ID")}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
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

          <TabsContent value="comprehensive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-red-500" />
                  Hasil Asesmen AI Lengkap
                </CardTitle>
                <CardDescription>Hasil evaluasi komprehensif menggunakan Dify API</CardDescription>
              </CardHeader>
              <CardContent>
                {comprehensiveResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Hasil Asesmen Lengkap</h3>
                    <p className="text-gray-600 mb-4">Ikuti asesmen AI lengkap untuk melihat hasil di sini</p>
                    <Button onClick={() => router.push("/assessment")}>Mulai Asesmen Lengkap</Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comprehensiveResults.map((result) => (
                      <Card key={result.id} className="border-l-4 border-l-red-500">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {new Date(result.completedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold">Asesmen AI Komprehensif</h3>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(result.score, result.maxScore)}`}>
                                {result.score}/{result.maxScore}
                              </div>
                              <Badge className={getScoreBg(result.score, result.maxScore)}>
                                {Math.round((result.score / result.maxScore) * 100)}%
                              </Badge>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-2" />
                              Lihat Detail
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
                  Hasil Asesmen AI Cepat
                </CardTitle>
                <CardDescription>Hasil screening cepat dan monitoring rutin</CardDescription>
              </CardHeader>
              <CardContent>
                {quickResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Hasil Asesmen Cepat</h3>
                    <p className="text-gray-600 mb-4">Ikuti asesmen AI cepat untuk monitoring rutin</p>
                    <Button onClick={() => router.push("/assessment")}>Mulai Asesmen Cepat</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quickResults.map((result) => (
                      <Card key={result.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">
                                    {new Date(result.completedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="font-semibold">Asesmen Cepat</div>
                              </div>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                {Math.round((result.score / result.maxScore) * 100)}% Skor
                              </Badge>
                            </div>
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-2" />
                              Detail
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
                  Level Pengetahuan Hipertensi
                </CardTitle>
                <CardDescription>Perkembangan pemahaman tentang hipertensi dan pengelolaannya</CardDescription>
              </CardHeader>
              <CardContent>
                {knowledgeResults.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Tes Pengetahuan</h3>
                    <p className="text-gray-600 mb-4">Ikuti tes pengetahuan hipertensi untuk melihat level Anda</p>
                    <Button onClick={() => router.push("/assessment")}>Mulai Tes Pengetahuan</Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {knowledgeResults.map((result) => (
                      <Card key={result.id} className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {new Date(result.completedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold">Tes Pengetahuan Hipertensi</h3>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(result.score, result.maxScore)}`}>
                                {result.score}/{result.maxScore}
                              </div>
                              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                {Math.round((result.score / result.maxScore) * 100) >= 80
                                  ? "Advanced"
                                  : Math.round((result.score / result.maxScore) * 100) >= 60
                                    ? "Intermediate"
                                    : "Beginner"}
                              </Badge>
                            </div>
                          </div>

                          <div className="mt-6 flex gap-2">
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-2" />
                              Lihat Sertifikat
                            </Button>
                            <Button size="sm" variant="outline">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Ulangi Tes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
                  <div className="text-2xl font-bold">{conversations.length}</div>
                  <div className="text-sm text-gray-600">Percakapan AI</div>
                </div>
              </div>
              {conversations.length > 0 && (
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
