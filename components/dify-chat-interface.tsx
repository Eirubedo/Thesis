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
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, MessageCircle, Bot, User, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { SpeechRecognition } from "types/speech-recognition"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface DifyChatInterfaceProps {
  title?: string
  showHeader?: boolean
  className?: string
  minHeight?: string
  placeholder?: string
}

export function DifyChatInterface({
  title,
  showHeader = true,
  className = "",
  minHeight = "600px",
  placeholder,
}: DifyChatInterfaceProps) {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const { speak, manualSpeak, stopSpeech, isPlaying, isLoading: ttsLoading, currentProvider, settings } = useTTS()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        language === "id"
          ? "Halo! Saya asisten kesehatan mental AI Anda. Saya di sini untuk mendengarkan, mendukung, dan memberikan bimbingan. Bagaimana perasaan Anda hari ini?"
          : "Hello! I'm your AI mental health assistant. I'm here to listen, support, and provide guidance. How are you feeling today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [conversationId, setConversationId] = useState<string>("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

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

    try {
      const response = await fetch("/api/dify/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: conversationId,
          user_id: user?.id || "anonymous",
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

      // Use TTS hook for speech synthesis
      await speak(assistantMessage.content, language === "id" ? "id-ID" : "en-US")
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
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="border-t border-gray-200 p-4">
        {/* TTS Status Bar */}
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
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )

  if (!showHeader) {
    return <div className="w-full">{chatContent}</div>
  }

  return (
    <div className="space-y-4">
      <Card className="w-full border-sky-100">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-sky-600" />
              {title || t("chat.title")}
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
