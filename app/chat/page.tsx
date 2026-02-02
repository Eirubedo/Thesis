"use client"

import { useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { DifyChatInterface } from "@/components/dify-chat-interface"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import { Shield, Heart, Clock } from "lucide-react"

export default function ChatPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-sky-100 flex flex-col">
      <Navigation />

      <div className="flex-1 pt-16 flex flex-col">
        {/* Compact Info Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-sky-700">
              <Clock className="w-4 h-4" />
              <span>{t("chat.support247")}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1.5 text-yellow-700">
              <Heart className="w-4 h-4" />
              <span>{t("chat.personalizedCare")}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1.5 text-sky-700">
              <Shield className="w-4 h-4" />
              <span>{t("chat.privacyFirst")}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300" />
            <button
              onClick={() => window.open("tel:119", "_self")}
              className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-medium"
            >
              <span>{t("chat.emergencySupport")}: 119</span>
            </button>
          </div>
        </div>

        {/* Full-screen Chat Interface */}
        <div className="flex-1 max-w-4xl w-full mx-auto p-4">
          <DifyChatInterface
            title={t("chat.title")}
            showHeader={true}
            minHeight="calc(100vh - 180px)"
            className="shadow-lg h-full"
            conversationType="chat"
          />
        </div>
      </div>
    </div>
  )
}
