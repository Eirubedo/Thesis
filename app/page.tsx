"use client"

import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MessageCircle, Activity, Heart, Pill, TrendingUp, Shield, FileText } from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-100">
      <Navigation />

      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">{t("home.title")}</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{t("home.subtitle")}</p>

          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t("home.startChat")}
                </Button>
              </Link>
              <Link href="/assessment">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                  <FileText className="w-5 h-5 mr-2" />
                  {t("home.takeAssessment")}
                </Button>
              </Link>
              <Link href="/bp-tracking">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-red-400 text-red-600 hover:bg-red-50 bg-transparent"
                >
                  <Activity className="w-5 h-5 mr-2" />
                  {t("home.trackBP")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white">
                  {t("home.getStarted")}
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-400 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  {t("home.learnMore")}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow border-red-100">
            <CardHeader>
              <MessageCircle className="w-12 h-12 text-red-600 mb-4" />
              <CardTitle>{t("home.aiChatTitle")}</CardTitle>
              <CardDescription>{t("home.aiChatDescription")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-red-100">
            <CardHeader>
              <Activity className="w-12 h-12 text-blue-500 mb-4" />
              <CardTitle>{t("home.bpTrackingTitle")}</CardTitle>
              <CardDescription>{t("home.bpTrackingDescription")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-red-100">
            <CardHeader>
              <Pill className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>{t("home.medicationTitle")}</CardTitle>
              <CardDescription>{t("home.medicationDescription")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-red-100">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-purple-500 mb-4" />
              <CardTitle>{t("home.lifestyleTitle")}</CardTitle>
              <CardDescription>{t("home.lifestyleDescription")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-red-100">
            <CardHeader>
              <Heart className="w-12 h-12 text-pink-500 mb-4" />
              <CardTitle>{t("home.mentalHealthTitle")}</CardTitle>
              <CardDescription>{t("home.mentalHealthDescription")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-red-100">
            <CardHeader>
              <Shield className="w-12 h-12 text-indigo-500 mb-4" />
              <CardTitle>{t("home.progressTrackingTitle")}</CardTitle>
              <CardDescription>{t("home.progressTrackingDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("home.readyToStart")}</h2>
            <p className="text-gray-600 mb-6">{t("home.joinThousands")}</p>
            <Link href="/login">
              <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white">
                {t("home.getStarted")}
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
