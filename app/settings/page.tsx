"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import { Globe, Bell, Shield, Info, Palette, FileText } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { NotificationPreferences } from "@/components/notification-preferences"
import { SessionPreferences } from "@/components/session-preferences"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()

  const [darkMode, setDarkMode] = useState(false)

  // Wait for auth to load before checking
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const handleLanguageChange = (newLanguage: "en" | "id") => {
    setLanguage(newLanguage)
    toast({
      title: t("settings.languageUpdated"),
      description: t("settings.languageChangedTo").replace("{language}", newLanguage === "en" ? "English" : "Bahasa Indonesia"),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-sky-100">
      <Navigation />

      <div className="pt-16 max-w-4xl mx-auto p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("settings.title")}</h1>
          <p className="text-gray-600">{t("settings.subtitle")}</p>
        </div>

        <div className="space-y-6">
          {/* Session Preferences */}
          <SessionPreferences />

          {/* Notification Preferences */}
          <NotificationPreferences userId={user?.id} />

          {/* Language Settings */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-sky-600" />
                {t("settings.language")}
              </CardTitle>
              <CardDescription>{t("settings.selectLanguage")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("settings.english")}</SelectItem>
                  <SelectItem value="id">{t("settings.indonesian")}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2 text-sky-600" />
                {t("settings.appearance")}
              </CardTitle>
              <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">{t("settings.darkMode")}</Label>
                  <p className="text-sm text-gray-500">{t("settings.darkModeDesc")}</p>
                </div>
                <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-yellow-500" />
                {t("settings.privacy")}
              </CardTitle>
              <CardDescription>{t("settings.privacyDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-sky-200 hover:bg-sky-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t("settings.dataExport")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-sky-200 hover:bg-sky-50"
                  onClick={() => router.push("/privacy")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t("settings.privacyPolicy")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-sky-200 hover:bg-sky-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t("settings.termsOfService")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Research Information */}
          <Card className="border-yellow-100 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-900">
                <Info className="w-5 h-5 mr-2" />
                {t("settings.researchInfo")}
              </CardTitle>
              <CardDescription className="text-yellow-700">
                {t("settings.researchInfoDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2 text-yellow-800">
                <p>
                  <strong>{t("settings.researcher")}:</strong> Eka Putri Yulianti
                </p>
                <p>
                  <strong>{t("settings.institution")}:</strong> Universitas Indonesia
                </p>
                <p>
                  <strong>{t("settings.program")}:</strong> Magister Ilmu Keperawatan
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-yellow-300 hover:bg-yellow-100 text-yellow-700"
                onClick={() => router.push("/privacy")}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t("settings.readFullPrivacy")}
              </Button>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="w-5 h-5 mr-2 text-sky-600" />
                {t("settings.about")}
              </CardTitle>
              <CardDescription>{t("settings.aboutDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1">
                <p>
                  <strong>{t("settings.version")}:</strong> 1.0.0
                </p>
                <p>
                  <strong>{t("settings.build")}:</strong> 2024.01.15
                </p>
                <p>
                  <strong>{t("settings.aiModel")}:</strong> Dify.ai RAG + OpenAI GPT
                </p>
                <p>
                  <strong>{t("settings.appName")}:</strong> ANSWA (Asisten Keperawatan Jiwa)
                </p>
                <p>
                  <strong>{t("settings.voice")}:</strong> Browser Speech Synthesis
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-yellow-200 hover:bg-yellow-50"
                onClick={() => router.push("/about")}
              >
                <Info className="w-4 h-4 mr-2" />
                {t("settings.learnMore")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
