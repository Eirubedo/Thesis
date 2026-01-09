"use client"

import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Link from "next/link"
import { MessageCircle, Activity, Heart, Pill, TrendingUp, Shield, FileText } from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()
  const { t } = useLanguage()

  const features = [
    {
      icon: MessageCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      title: t("home.aiChatTitle"),
      description: t("home.aiChatDescription"),
    },
    {
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      title: t("home.bpTrackingTitle"),
      description: t("home.bpTrackingDescription"),
    },
    {
      icon: Pill,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      title: t("home.medicationTitle"),
      description: t("home.medicationDescription"),
    },
    {
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      title: t("home.lifestyleTitle"),
      description: t("home.lifestyleDescription"),
    },
    {
      icon: Heart,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      title: t("home.mentalHealthTitle"),
      description: t("home.mentalHealthDescription"),
    },
    {
      icon: Shield,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      title: t("home.progressTrackingTitle"),
      description: t("home.progressTrackingDescription"),
    },
  ]

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

        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            {t("home.featuresTitle") || "Fitur Unggulan"}
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <Card
                      className={`h-full hover:shadow-lg transition-all duration-300 ${feature.borderColor} ${feature.bgColor}`}
                    >
                      <CardHeader className="text-center">
                        <div
                          className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-white shadow-sm`}
                        >
                          <Icon className={`w-8 h-8 ${feature.color}`} />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription className="text-sm">{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-12" />
            <CarouselNext className="hidden sm:flex -right-12" />
          </Carousel>
          {/* Mobile swipe indicator */}
          <p className="text-center text-sm text-gray-500 mt-4 sm:hidden">
            ← {t("home.swipeToSee") || "Geser untuk melihat fitur lainnya"} →
          </p>
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
