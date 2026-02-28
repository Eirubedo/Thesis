"use client"

import { useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { DifyChatInterface } from "@/components/dify-chat-interface"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import { BookOpen, Shield, Mic } from "lucide-react"

export default function EducationChatPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex flex-col">
      <Navigation />

      <div className="flex-1 pt-16 flex flex-col">
        {/* Compact Info Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-green-700">
              <BookOpen className="w-4 h-4" />
              <span>
                {language === "id" ? "Edukasi Hipertensi" : "Hypertension Education"}
              </span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1.5 text-blue-700">
              <Mic className="w-4 h-4" />
              <span>
                {language === "id" ? "Bisa pakai suara" : "Voice input available"}
              </span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1.5 text-teal-700">
              <Shield className="w-4 h-4" />
              <span>
                {language === "id" ? "Data Anda aman" : "Your data is safe"}
              </span>
            </div>
          </div>
        </div>

        {/* Full-screen Chat Interface */}
        <div className="flex-1 max-w-4xl w-full mx-auto p-4">
          <DifyChatInterface
            title={
              language === "id"
                ? "Pelatih Kesehatan AI - Edukasi Hipertensi"
                : "AI Health Coach - Hypertension Education"
            }
            showHeader={true}
            minHeight="calc(100vh - 180px)"
            className="shadow-lg h-full"
            apiPath="/api/dify/education"
            conversationType="education"
          />
        </div>
      </div>
    </div>
  )
}
