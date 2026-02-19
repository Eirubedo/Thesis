"use client"

import { useEffect, useState } from "react"
import { Lock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/contexts/language-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function SessionPreferences() {
  const { language } = useLanguage()
  const { user, keepLoggedIn, setKeepLoggedIn, logout } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  // Fetch preferences from server
  const { data: preferences, mutate } = useSWR(
    user?.id ? `/api/user-preferences?user_id=${user.id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const handleToggleKeepLoggedIn = async (enabled: boolean) => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/user-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          keep_logged_in: enabled,
        }),
      })

      if (response.ok) {
        setKeepLoggedIn(enabled)
        localStorage.setItem("keep_logged_in", String(enabled))
        await mutate()
        
        if (enabled) {
          setShowWarning(true)
          setTimeout(() => setShowWarning(false), 5000)
        }
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleForceLogout = () => {
    logout(true)
  }

  const translations = {
    id: {
      title: "Sesi & Keamanan",
      description: "Kelola pengaturan sesi dan keamanan akun Anda",
      keepLoggedIn: "Tetap Masuk",
      keepLoggedInDesc: "Tidak perlu memasukkan kata sandi lagi setelah logout",
      warning: "Peringatan: Perangkat ini akan tetap masuk hingga Anda mengubah pengaturan ini.",
      warningNotice: "Pastikan Anda adalah satu-satunya pengguna perangkat ini.",
      forceLogout: "Paksa Logout",
      forceLogoutDesc: "Logout sekarang, bahkan dengan Keep Logged In diaktifkan",
    },
    en: {
      title: "Session & Security",
      description: "Manage your session and account security settings",
      keepLoggedIn: "Keep Me Logged In",
      keepLoggedInDesc: "No need to enter password again after logout",
      warning: "Warning: This device will remain logged in until you change this setting.",
      warningNotice: "Make sure you are the only user of this device.",
      forceLogout: "Force Logout",
      forceLogoutDesc: "Logout now, even with Keep Logged In enabled",
    },
  }

  const t = translations[language] || translations.en

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keep Logged In Setting */}
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-base font-medium">{t.keepLoggedIn}</Label>
              <p className="text-sm text-muted-foreground mt-1">{t.keepLoggedInDesc}</p>
            </div>
            <Switch
              checked={keepLoggedIn || preferences?.keep_logged_in || false}
              onCheckedChange={handleToggleKeepLoggedIn}
              disabled={isUpdating}
            />
          </div>

          {/* Warning Banner */}
          {(keepLoggedIn || preferences?.keep_logged_in) && showWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <p className="text-sm text-amber-800 font-medium">{t.warning}</p>
              <p className="text-xs text-amber-700 mt-1">{t.warningNotice}</p>
            </div>
          )}
        </div>

        {/* Force Logout Button */}
        {(keepLoggedIn || preferences?.keep_logged_in) && (
          <Button
            onClick={handleForceLogout}
            variant="destructive"
            className="w-full"
            disabled={isUpdating}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t.forceLogout}
          </Button>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-xs text-blue-800">
            <strong>Info:</strong> Ubah pengaturan ini di menu Pengaturan untuk mengontrol waktu logout.
            Untuk keamanan maksimal, nonaktifkan "Tetap Masuk" di perangkat publik.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
