"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Lightbulb,
  Sparkles,
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
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"
import useSWR from "swr"
import { supabase } from "@/lib/supabase"
import { Heart, Pill, Activity } from "lucide-react"

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

interface InsightsData {
  insights: string
  data: {
    bpStats: {
      avgSystolic: number
      avgDiastolic: number
      trend: string
      totalReadings: number
    } | null
    adherenceRate: number | null
    conversationSummary: {
      totalConversations: number
      assessments: number
      monitoring: number
      knowledgeTests: number
      education: number
    }
    activeMedications: number
    activeSchedules: number
  }
  generatedAt: string
}

interface DailySummary {
  id: string
  summary_date: string
  summary_text: string
  conversation_types: string[]
  message_count: number
  key_topics: string[]
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

  // SWR fetchers for real-time chart data
  const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
  }

  const { data: bpReadings, mutate: mutateBP } = useSWR(
    user?.id ? `/api/bp-readings?user_id=${user.id}` : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const { data: medicationData, mutate: mutateMeds } = useSWR(
    user?.id ? `/api/medications?user_id=${user.id}` : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const { data: activityData, mutate: mutateActivity } = useSWR(
    user?.id ? `/api/schedules?user_id=${user.id}` : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const { data: chatActivity, mutate: mutateChat } = useSWR(
    user?.id ? [`/api/chat-activity?user_id=${user.id}`, user.id] : null,
    async ([url]) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    { refreshInterval: 3000, dedupingInterval: 1000 }
  )

  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [dailySummaries, setDailySummaries] = useState<Record<string, DailySummary>>({})
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchDailyConversations()
    fetchInsights()
    fetchDailySummaries()
  }, [user, router])

  const fetchDailySummaries = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`/api/daily-summary?user_id=${user.id}&limit=30`)
      if (response.ok) {
        const data = await response.json()
        const summaryMap: Record<string, DailySummary> = {}
        data.forEach((s: DailySummary) => {
          summaryMap[s.summary_date] = s
        })
        setDailySummaries(summaryMap)
      }
    } catch (error) {
      console.error("Failed to fetch daily summaries:", error)
    }
  }

  const generateSummary = async (date: string) => {
    if (!user?.id) return
    setGeneratingSummary(date)
    try {
      const response = await fetch("/api/daily-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, date, lang: language }),
      })
      
      // Check content type before parsing
      const contentType = response.headers.get("content-type")
      
      if (!contentType?.includes("application/json")) {
        // Server returned non-JSON (likely plain text error)
        const textError = await response.text()
        console.error("[v0] Non-JSON response:", textError)
        toast({
          title: language === "id" ? "Gagal membuat ringkasan" : "Failed to generate summary",
          description: language === "id" ? "Terjadi kesalahan server" : "Server error occurred",
          variant: "destructive",
        })
        return
      }
      
      const data = await response.json()
      
      if (response.ok) {
        setDailySummaries((prev) => ({ ...prev, [date]: data }))
        toast({
          title: language === "id" ? "Ringkasan dibuat" : "Summary generated",
          description: language === "id" ? "Ringkasan harian berhasil dibuat" : "Daily summary has been generated",
        })
      } else {
        // Show specific error from API
        const errorMessage = data?.error || "Unknown error"
        toast({
          title: language === "id" ? "Gagal membuat ringkasan" : "Failed to generate summary",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("[v0] Failed to generate summary:", error)
      toast({
        title: language === "id" ? "Gagal membuat ringkasan" : "Failed to generate summary",
        description: error?.message || "Network error",
        variant: "destructive",
      })
    } finally {
      setGeneratingSummary(null)
    }
  }

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

  const fetchInsights = async () => {
    if (!user?.id) return

    setIsLoadingInsights(true)
    try {
      const response = await fetch(`/api/insights?user_id=${user.id}&lang=${language}`)
      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      }
    } catch (error) {
      console.error("Failed to fetch insights:", error)
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const refreshInsights = async () => {
    setIsLoadingInsights(true)
    try {
      const response = await fetch(`/api/insights?user_id=${user?.id}&lang=${language}`)
      if (response.ok) {
        const data = await response.json()
        setInsights(data)
        toast({
          title: language === "id" ? "Wawasan diperbarui" : "Insights updated",
          description: language === "id" ? "Analisis terbaru telah dibuat" : "Latest analysis has been generated",
        })
      }
    } catch (error) {
      console.error("Failed to refresh insights:", error)
      toast({
        title: language === "id" ? "Gagal memperbarui" : "Failed to refresh",
        variant: "destructive",
      })
    } finally {
      setIsLoadingInsights(false)
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
              onClick={() => {
                fetchDailyConversations()
                fetchInsights()
              }}
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              disabled={isLoading || isLoadingInsights}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading || isLoadingInsights ? "animate-spin" : ""}`} />
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

        {/* Data Visualizations - 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Blood Pressure Over Time */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="w-4 h-4 text-red-500" />
                {language === "id" ? "Tekanan Darah" : "Blood Pressure"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bpReadings && bpReadings.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={bpReadings
                      .slice(0, 30)
                      .reverse()
                      .map((r: any) => ({
                        date: new Date(r.measurement_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        }),
                        [language === "id" ? "Sistolik" : "Systolic"]: r.systolic,
                        [language === "id" ? "Diastolik" : "Diastolic"]: r.diastolic,
                      }))}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" hide />
                    <YAxis domain={[40, 200]} className="text-xs" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={language === "id" ? "Sistolik" : "Systolic"}
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={language === "id" ? "Diastolik" : "Diastolic"}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                  {language === "id" ? "Belum ada data" : "No data"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medication Adherence */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="w-4 h-4 text-blue-500" />
                {language === "id" ? "Kepatuhan Obat" : "Med Adherence"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medicationData && medicationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={(() => {
                      const last7Days = []
                      for (let i = 6; i >= 0; i--) {
                        const date = new Date()
                        date.setDate(date.getDate() - i)
                        const dateStr = date.toISOString().split("T")[0]
                        const dayLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

                        // Get all logs for this day
                        const allDayLogs = medicationData.flatMap((med: any) => (med.logs || []).map((log: any) => ({ ...log, med_id: med.id, med_name: med.name })))
                        const dayLogsByDate = allDayLogs.filter((log: any) => log.taken_at && log.taken_at.startsWith(dateStr))
                        
                        const taken = dayLogsByDate.filter((log: any) => log.was_taken === true).length
                        const missed = dayLogsByDate.filter((log: any) => log.was_taken === false).length
                        
                        // If there are active medications but no logs for today, count them as "no data"
                        // The visualization will show 0 for both if no logs exist
                        const total = taken + missed

                        last7Days.push({
                          date: dayLabel,
                          [language === "id" ? "Diminum" : "Taken"]: taken,
                          [language === "id" ? "Terlewat" : "Missed"]: missed,
                          total: total, // For reference in tooltips
                        })
                      }
                      return last7Days
                    })()}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" hide />
                    <YAxis className="text-xs" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === "total") return null
                        return [value, name]
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={language === "id" ? "Diminum" : "Taken"}
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={language === "id" ? "Terlewat" : "Missed"}
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                  {language === "id" ? "Belum ada data" : "No data"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Level */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-green-500" />
                {language === "id" ? "Aktivitas" : "Activity"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityData && activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={(() => {
                      const last30Days = []
                      for (let i = 29; i >= 0; i--) {
                        const date = new Date()
                        date.setDate(date.getDate() - i)
                        const dateStr = date.toISOString().split("T")[0]
                        const dayLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

                        const dayActivities = activityData.flatMap((s: any) => s.logs || [])
                        const completed = dayActivities.filter(
                          (log: any) => log.completed_at && log.completed_at.startsWith(dateStr),
                        ).length

                        last30Days.push({
                          date: dayLabel,
                          [language === "id" ? "Selesai" : "Completed"]: completed,
                        })
                      }
                      return last30Days
                    })()}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" hide />
                    <YAxis className="text-xs" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={language === "id" ? "Selesai" : "Completed"}
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                  {language === "id" ? "Belum ada data" : "No data"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="w-4 h-4 text-purple-500" />
                {language === "id" ? "Aktivitas Chat" : "Chat Activity"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chatActivity && chatActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={chatActivity.map((d: any) => ({
                      date: d.date,
                      [language === "id" ? "Sesi" : "Sessions"]: d.sessions,
                      [language === "id" ? "Pesan" : "Messages"]: d.messages,
                    }))}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" hide />
                    <YAxis className="text-xs" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={language === "id" ? "Sesi" : "Sessions"}
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={language === "id" ? "Pesan" : "Messages"}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                  {language === "id" ? "Belum ada data" : "No data"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights and Recommendation Card */}
        <Card className="mb-8 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Lightbulb className="w-6 h-6" />
              {language === "id" ? "Wawasan dan Rekomendasi" : "Insights and Recommendation"}
            </CardTitle>
            <CardDescription className="text-amber-700">
              {language === "id"
                ? "Ringkasan kondisi Anda berdasarkan seluruh data kesehatan dan percakapan"
                : "Summary of your condition based on all health data and conversations"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInsights ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mr-3" />
                <span className="text-amber-700">
                  {language === "id" ? "Menganalisis data Anda..." : "Analyzing your data..."}
                </span>
              </div>
            ) : insights ? (
              <div className="space-y-6">
                {/* Insights Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {insights.data.bpStats && (
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-sm text-gray-600">{language === "id" ? "Rata-rata TD" : "Avg BP"}</div>
                      <div className="text-lg font-bold text-red-600">
                        {insights.data.bpStats.avgSystolic}/{insights.data.bpStats.avgDiastolic}
                      </div>
                      <div className="text-xs text-gray-500">
                        {insights.data.bpStats.trend === "increasing"
                          ? language === "id"
                            ? "↑ Meningkat"
                            : "↑ Increasing"
                          : insights.data.bpStats.trend === "decreasing"
                            ? language === "id"
                              ? "↓ Menurun"
                              : "↓ Decreasing"
                            : language === "id"
                              ? "→ Stabil"
                              : "→ Stable"}
                      </div>
                    </div>
                  )}
                  {insights.data.adherenceRate !== null && (
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-sm text-gray-600">
                        {language === "id" ? "Kepatuhan Obat" : "Med Adherence"}
                      </div>
                      <div className="text-lg font-bold text-green-600">{insights.data.adherenceRate}%</div>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-gray-600">
                      {language === "id" ? "Total Percakapan" : "Total Chats"}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {insights.data.conversationSummary.totalConversations}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-gray-600">{language === "id" ? "Obat Aktif" : "Active Meds"}</div>
                    <div className="text-lg font-bold text-purple-600">{insights.data.activeMedications}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-gray-600">
                      {language === "id" ? "Jadwal Aktif" : "Active Schedules"}
                    </div>
                    <div className="text-lg font-bold text-cyan-600">{insights.data.activeSchedules}</div>
                  </div>
                </div>

                {/* AI-Generated Insights */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-amber-100">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                    <div className="prose prose-sm max-w-none">
                      {insights.insights.split("\n\n").map((paragraph, index) => (
                        <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {language === "id" ? "Terakhir diperbarui: " : "Last updated: "}
                    {new Date(insights.generatedAt).toLocaleString(language === "id" ? "id-ID" : "en-US")}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshInsights}
                    disabled={isLoadingInsights}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingInsights ? "animate-spin" : ""}`} />
                    {language === "id" ? "Perbarui Wawasan" : "Refresh Insights"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === "id" ? "Belum Ada Wawasan" : "No Insights Yet"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === "id"
                    ? "Mulai gunakan aplikasi untuk mendapatkan wawasan personal"
                    : "Start using the app to get personalized insights"}
                </p>
                <Button onClick={refreshInsights} disabled={isLoadingInsights}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {language === "id" ? "Buat Wawasan" : "Generate Insights"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
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

        {/* Daily History - All conversations consolidated */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              {language === "id" ? "Riwayat Percakapan Harian" : "Daily Conversation History"}
            </CardTitle>
            <CardDescription>
              {language === "id"
                ? "Semua percakapan Anda dengan AI dikelompokkan per hari (Asesmen, Monitoring, Tes Pengetahuan)"
                : "All your AI conversations grouped by day (Assessment, Monitoring, Knowledge Test)"}
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
                <Button onClick={() => router.push("/assessment")}>
                  {language === "id" ? "Mulai Asesmen" : "Start Assessment"}
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
                          {dailySummaries[day.date] ? (
                            <div className="mt-2">
                              <p className="text-sm text-gray-700 line-clamp-3">
                                {dailySummaries[day.date].summary_text}
                              </p>
                              {dailySummaries[day.date].key_topics.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {dailySummaries[day.date].key_topics.map((topic) => (
                                    <Badge key={topic} variant="outline" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic mt-1">
                              {day.messageCount} {language === "id" ? "pesan" : "messages"} -{" "}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  generateSummary(day.date)
                                }}
                                disabled={generatingSummary === day.date}
                                className="text-blue-600 hover:underline disabled:opacity-50"
                              >
                                {generatingSummary === day.date
                                  ? language === "id"
                                    ? "Membuat ringkasan..."
                                    : "Generating..."
                                  : language === "id"
                                    ? "Buat ringkasan"
                                    : "Generate summary"}
                              </button>
                            </p>
                          )}
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
                            <Button size="sm" variant="outline" onClick={() => setSelectedDay(day)} className="bg-transparent">
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
                                              className={`rounded-2xl px-4 py-3 ${
                                                message.role === "user"
                                                  ? "bg-sky-500 text-white"
                                                  : "bg-gray-100 text-gray-900"
                                              }`}
                                            >
                                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                              <p
                                                className={`text-xs mt-1 ${message.role === "user" ? "text-sky-100" : "text-gray-500"}`}
                                              >
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

        {/* Recommendations Card */}
        <Card>
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
              <Button onClick={() => router.push("/assessment")}>
                {language === "id" ? "Mulai Asesmen" : "Start Assessment"}
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
