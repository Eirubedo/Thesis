"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { useTTS } from "@/hooks/use-tts"
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, MessageCircle, Bot, User, Play, CheckCircle, Circle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { SpeechRecognition } from "types/speech-recognition"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface UserContext {
  profile: {
    name: string | null
    gender: string | null
    age: number | null
    location: string | null
  }
  hypertension: {
    familyHistory: boolean
    riskFactors: string[]
    medicalHistory: string | null
    smokingStatus: string | null
    alcoholConsumption: string | null
    exerciseFrequency: string | null
    stressLevel: number | null
  }
  bloodPressure: {
    recentReadings: any[]
    average: { systolic: number; diastolic: number; heartRate: number | null } | null
    latestReading: any | null
    latestCategory: string | null
  }
  medications: any[]
  activities: any[]
}

interface AssessmentProgress {
  id: string
  user_id: string
  assessment_type: string
  status: "started" | "assessed" | "completed"
  started_at: string | null
  assessed_at: string | null
  completed_at: string | null
}

interface DifyChatInterfaceProps {
  title?: string
  showHeader?: boolean
  className?: string
  minHeight?: string
  placeholder?: string
  apiPath?: string
  conversationType?: "chat" | "assessment" | "education" | "quick-assessment" | "knowledge-test"
  showProgressStatus?: boolean
  assessmentType?: string
}

export function DifyChatInterface({
  title,
  showHeader = true,
  className = "",
  minHeight = "600px",
  placeholder,
  apiPath = "/api/dify/chat",
  conversationType = "chat",
  showProgressStatus = false,
  assessmentType,
}: DifyChatInterfaceProps) {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const { speak, manualSpeak, stopSpeech, isPlaying, isLoading: ttsLoading, currentProvider } = useTTS()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [conversationId, setConversationId] = useState<string>("")
  const [dbConversationId, setDbConversationId] = useState<string>("")
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [contextLoaded, setContextLoaded] = useState(false)
  const [assessmentProgress, setAssessmentProgress] = useState<AssessmentProgress | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const fetchUserContext = async () => {
      if (!user?.id) {
        setContextLoaded(true)
        return
      }

      try {
        const response = await fetch(`/api/user-context?user_id=${user.id}`)
        if (response.ok) {
          const context = await response.json()
          setUserContext(context)
        }
      } catch (error) {
        console.error("Failed to fetch user context:", error)
      } finally {
        setContextLoaded(true)
      }
    }

    fetchUserContext()
  }, [user?.id])

  // Fetch and update assessment progress
  useEffect(() => {
    if (!showProgressStatus || !assessmentType || !user?.id) return

    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/assessment-progress?user_id=${user.id}&assessment_type=${assessmentType}`)
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setAssessmentProgress(data)
          }
        }
      } catch (error) {
        console.error("Failed to fetch assessment progress:", error)
      }
    }

    fetchProgress()
  }, [showProgressStatus, assessmentType, user?.id])

  // Start assessment progress when chat begins
  useEffect(() => {
    if (!showProgressStatus || !assessmentType || !user?.id || assessmentProgress) return

    const startProgress = async () => {
      try {
        const response = await fetch("/api/assessment-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            assessment_type: assessmentType,
            status: "started",
          }),
        })
        if (response.ok) {
          const data = await response.json()
          setAssessmentProgress(data)
        }
      } catch (error) {
        console.error("Failed to start assessment progress:", error)
      }
    }

    startProgress()
  }, [showProgressStatus, assessmentType, user?.id, assessmentProgress])

  const updateAssessmentProgress = async (status: "assessed" | "completed") => {
    if (!showProgressStatus || !assessmentType || !user?.id) return

    try {
      const response = await fetch("/api/assessment-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          assessment_type: assessmentType,
          status,
          conversation_id: dbConversationId,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setAssessmentProgress(data)
      }
    } catch (error) {
      console.error("Failed to update assessment progress:", error)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = language === "id" ? "id-ID" : "en-US"

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
        toast({
          title: "Speech Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        })
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [toast, language])

  const saveConversation = async (message: Message, role: "user" | "assistant") => {
    if (!user?.id) return

    try {
      const response = await fetch("/api/conversations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: dbConversationId || undefined,
          user_id: user.id,
          conversation_type: conversationType,
          dify_conversation_id: conversationId,
          message: {
            message_id: message.id,
            content: message.content,
            role: role,
          },
        }),
      })

      const data = await response.json()
      if (data.conversation_id && !dbConversationId) {
        setDbConversationId(data.conversation_id)
      }
    } catch (error) {
      console.error("Failed to save conversation:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    await saveConversation(userMessage, "user")

    try {
      const response = await fetch(apiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: conversationId,
          user_id: user?.id || "anonymous",
          userContext: userContext,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: data.message_id || (Date.now() + 1).toString(),
        content: data.message,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setConversationId(data.conversation_id)

      await saveConversation(assistantMessage, "assistant")

      // Check for assessment progress triggers in assistant response
      if (showProgressStatus && assessmentProgress?.status === "started") {
        // Keywords that indicate data has been gathered (assessed)
        const assessedKeywords = [
          "berdasarkan informasi", "dari data yang", "hasil evaluasi", "ringkasan",
          "rekomendasi untuk anda", "based on", "from your data", "summary",
          "kemampuan yang diketahui", "kemampuan yang dilakukan", "tanda dan gejala"
        ]
        const lowerContent = data.message.toLowerCase()
        if (assessedKeywords.some(keyword => lowerContent.includes(keyword))) {
          await updateAssessmentProgress("assessed")
        }
      }

      // Check for completion triggers
      if (showProgressStatus && assessmentProgress?.status !== "completed") {
        const completionKeywords = [
          "asesmen selesai", "terima kasih telah menyelesaikan", "assessment complete",
          "selamat anda telah", "hasil akhir", "final result", "semoga bermanfaat",
          "jangan ragu untuk kembali", "sampai jumpa"
        ]
        const lowerContent = data.message.toLowerCase()
        if (completionKeywords.some(keyword => lowerContent.includes(keyword))) {
          await updateAssessmentProgress("completed")
        }
      }

      // TTS is now on-demand only - user must click play button to hear audio
      // Removed auto-play: await speak(assistantMessage.content, language === "id" ? "id-ID" : "en-US")
    } catch (error) {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          language === "id"
            ? "Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi dukungan jika masalah berlanjut."
            : "Sorry, there was an error. Please try again or contact support if the issue persists.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleManualSpeak = async (text: string) => {
    await manualSpeak(text, language === "id" ? "id-ID" : "en-US")
  }

  const chatContent = (
    <div className={`flex flex-col h-full ${className}`} style={{ minHeight }}>
      {userContext && (userContext.profile?.name || userContext.bloodPressure?.latestReading) && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-200 text-xs text-green-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {language === "id"
            ? "Konteks personal aktif - AI mengenali data kesehatan Anda"
            : "Personal context active - AI recognizes your health data"}
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
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
                      ? "bg-sky-500 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm whitespace-pre-wrap flex-1">{message.content}</p>
                    {message.role === "assistant" && (
                      <Button
                        onClick={() => handleManualSpeak(message.content)}
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-6 w-6 p-0 hover:bg-gray-200"
                        disabled={ttsLoading}
                        aria-label="Play assistant message"
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
          
          {/* TTS Audio Visualization */}
          {(isPlaying || ttsLoading) && (
            <div className="flex justify-center my-6">
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center animate-pulse">
                      <Volume2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">
                        {ttsLoading ? (language === "id" ? "Menyiapkan audio..." : "Preparing audio...") : (language === "id" ? "Memutar audio" : "Playing audio")}
                      </p>
                      <p className="text-xs text-yellow-700">{currentProvider}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={stopSpeech} 
                    variant="ghost" 
                    size="sm" 
                    className="text-yellow-700 hover:bg-yellow-200 h-8 w-8 p-0 rounded-full"
                    aria-label="Stop audio"
                  >
                    <VolumeX className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Animated Waveform */}
                <div className="flex items-center justify-center gap-1 h-16">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-yellow-600 rounded-full animate-pulse"
                      style={{
                        height: `${20 + Math.sin(i * 0.5) * 20}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${0.6 + (i % 3) * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="border-t border-gray-200 p-4">
        {(isPlaying || ttsLoading) && (
          <div className="flex items-center justify-between mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">{ttsLoading ? "Generating speech..." : "Playing audio"}</span>
              <span className="text-xs text-yellow-600">({currentProvider})</span>
            </div>
            <Button onClick={stopSpeech} variant="ghost" size="sm" className="text-yellow-600 hover:bg-yellow-100">
              <VolumeX className="w-4 h-4" />
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder || t("chat.placeholder")}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            className={isListening ? "bg-yellow-100 text-yellow-600 border-yellow-300" : ""}
            aria-pressed={isListening}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-sky-500 hover:bg-sky-600 text-white"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )

  const getWelcomeMessage = (context: UserContext | null) => {
    const userName = context?.profile?.name || ""
    const greeting = userName ? (language === "id" ? `Halo ${userName}!` : `Hello ${userName}!`) : (language === "id" ? "Halo!" : "Hello!")
    
    if (language === "id") {
      return `${greeting} Saya ANSWA (AI Nursing Support for Wellness Assistance), asisten kesehatan AI Anda yang siap membantu 24/7. Saya di sini untuk mendengarkan, mendukung, dan memberikan bimbingan terkait kesehatan hipertensi dan kesejahteraan mental Anda. Anda juga bisa berbicara dengan menekan ikon mikrofon untuk mengobrol dengan suara. Bagaimana perasaan Anda hari ini?`
    }
    return `${greeting} I'm ANSWA (AI Nursing Support for Wellness Assistance), your AI health assistant available 24/7. I'm here to listen, support, and provide guidance for your hypertension health and mental wellbeing. You can also speak by pressing the microphone icon to chat with voice. How are you feeling today?`
  }

  useEffect(() => {
    if (contextLoaded && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          content: getWelcomeMessage(userContext),
          role: "assistant",
          timestamp: new Date(),
        },
      ])
    }
  }, [contextLoaded, userContext, language])

  if (!showHeader) {
    return <div className="w-full">{chatContent}</div>
  }

  const getProgressBadge = () => {
    if (!showProgressStatus || !assessmentProgress) return null

    const status = assessmentProgress.status
    const statusConfig = {
      started: {
        label: language === "id" ? "Dimulai" : "Started",
        icon: Clock,
        className: "bg-blue-100 text-blue-700 border-blue-200",
      },
      assessed: {
        label: language === "id" ? "Data Terkumpul" : "Assessed",
        icon: CheckCircle,
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      completed: {
        label: language === "id" ? "Selesai" : "Completed",
        icon: CheckCircle,
        className: "bg-green-100 text-green-700 border-green-200",
      },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="w-full border-sky-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <MessageCircle className="w-6 h-6 mr-2 text-sky-600" />
                {title || t("chat.title")}
              </div>
              {getProgressBadge()}
            </div>
            {showHeader && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Voice: {currentProvider}</span>
                {isPlaying && <Volume2 className="w-4 h-4 text-yellow-500 animate-pulse" />}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">{chatContent}</CardContent>
      </Card>
    </div>
  )
}
