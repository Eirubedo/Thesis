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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-sky-100">
      <Navigation />

      <div className="pt-16 max-w-7xl mx-auto p-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("chat.title")}</h1>
          <p className="text-gray-600">
            Chat with our AI-powered mental health assistant. Get personalized support, guidance, and resources tailored
            to your needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <DifyChatInterface
              title={t("chat.title")}
              showHeader={true}
              minHeight="calc(100vh - 250px)"
              className="shadow-lg"
              conversationType="chat"
            />
          </div>

          {/* Sidebar with Information */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-sky-100">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-sky-600 mr-2" />
                <h3 className="font-semibold text-sky-900">24/7 Support</h3>
              </div>
              <p className="text-sm text-sky-800">
                Our AI assistant is available around the clock to provide support and guidance whenever you need it.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-100">
              <div className="flex items-center mb-3">
                <Heart className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-yellow-900">Personalized Care</h3>
              </div>
              <p className="text-sm text-yellow-800">
                Receive tailored recommendations and support based on your unique mental health journey and needs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-sky-100">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 text-sky-600 mr-2" />
                <h3 className="font-semibold text-sky-900">Privacy First</h3>
              </div>
              <p className="text-sm text-sky-800">
                Your conversations are private and secure. We prioritize your confidentiality and data protection.
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">Emergency Support</h3>
              <p className="text-sm text-red-800 mb-3">
                If you're experiencing a mental health emergency, please contact:
              </p>
              <button
                onClick={() => window.open("tel:119", "_self")}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm font-medium"
              >
                Emergency: 119
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/assessment")}
                  className="w-full text-left py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Take Assessment
                </button>
                <button
                  onClick={() => router.push("/self-help")}
                  className="w-full text-left py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Self-Help Resources
                </button>
                <button
                  onClick={() => router.push("/reports")}
                  className="w-full text-left py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
