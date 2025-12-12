"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import { Globe, Bell, Shield, Info, Palette, FileText } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()

  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  if (!user) {
    router.push("/login")
    return null
  }

  const handleLanguageChange = (newLanguage: "en" | "id") => {
    setLanguage(newLanguage)
    toast({
      title: "Language Updated",
      description: `Language changed to ${newLanguage === "en" ? "English" : "Bahasa Indonesia"}`,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-sky-100">
      <Navigation />

      <div className="pt-16 max-w-4xl mx-auto p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("settings.title")}</h1>
          <p className="text-gray-600">Customize your ANSWA experience</p>
        </div>

        <div className="space-y-6">
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

          {/* Notification Settings */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-yellow-500" />
                {t("settings.notifications")}
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications about your mental health journey</p>
                </div>
                <Switch id="push-notifications" checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-notifications">Sound Notifications</Label>
                  <p className="text-sm text-gray-500">Play sounds for notifications and alerts</p>
                </div>
                <Switch id="sound-notifications" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2 text-sky-600" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-gray-500">Switch to dark theme for better viewing in low light</p>
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
              <CardDescription>Control your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-sky-200 hover:bg-sky-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Data Export
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-sky-200 hover:bg-sky-50"
                  onClick={() => router.push("/privacy")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-sky-200 hover:bg-sky-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Terms of Service
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Research Information */}
          <Card className="border-yellow-100 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-900">
                <Info className="w-5 h-5 mr-2" />
                Informasi Penelitian
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Aplikasi ini dikembangkan untuk tujuan penelitian
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2 text-yellow-800">
                <p>
                  <strong>Peneliti:</strong> Eka Putri Yulianti
                </p>
                <p>
                  <strong>Institusi:</strong> Universitas Indonesia
                </p>
                <p>
                  <strong>Program:</strong> Magister Ilmu Keperawatan
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-yellow-300 hover:bg-yellow-100 text-yellow-700"
                onClick={() => router.push("/privacy")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Baca Kebijakan Privasi Lengkap
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
              <CardDescription>Information about the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1">
                <p>
                  <strong>Version:</strong> 1.0.0
                </p>
                <p>
                  <strong>Build:</strong> 2024.01.15
                </p>
                <p>
                  <strong>AI Model:</strong> Dify.ai RAG + OpenAI GPT
                </p>
                <p>
                  <strong>Application Name:</strong> ANSWA (Asisten Keperawatan Jiwa)
                </p>
                <p>
                  <strong>Voice:</strong> Browser Speech Synthesis
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-yellow-200 hover:bg-yellow-50"
                onClick={() => router.push("/about")}
              >
                <Info className="w-4 h-4 mr-2" />
                Learn More About ANSWA
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
