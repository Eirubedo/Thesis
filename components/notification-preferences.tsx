"use client"

import { useState } from "react"
import { Bell, Smartphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useNotifications } from "@/hooks/use-notifications"
import { useLanguage } from "@/contexts/language-context"

interface NotificationPreferencesProps {
  userId: string | undefined
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const { language } = useLanguage()
  const {
    isSupported,
    permission,
    preferences,
    deviceTokens,
    subscribe,
    unsubscribe,
  } = useNotifications({ userId, enabled: true })

  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleNotifications = async (enabled: boolean) => {
    setIsUpdating(true)
    try {
      if (enabled && permission !== "granted") {
        await subscribe("VAPID_PUBLIC_KEY_HERE")
      } else if (!enabled && deviceTokens?.length) {
        for (const token of deviceTokens) {
          await unsubscribe(token.id)
        }
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveDevice = async (tokenId: string) => {
    try {
      await unsubscribe(tokenId)
    } catch (error) {
      console.error("[v0] Failed to remove device:", error)
    }
  }

  const translations = {
    id: {
      title: "Pemberitahuan",
      description: "Kelola pengaturan pemberitahuan dan perangkat",
      enableNotifications: "Aktifkan Pemberitahuan",
      notSupported: "Pemberitahuan tidak didukung di browser Anda",
      permissionDenied: "Izin pemberitahuan ditolak. Buka pengaturan browser untuk mengubahnya.",
      permissionDefault: "Klik tombol di bawah untuk mengaktifkan pemberitahuan",
      devices: "Perangkat Terdaftar",
      noDevices: "Tidak ada perangkat terdaftar",
      registerDevice: "Daftarkan Perangkat Ini",
      removeDevice: "Hapus",
      lastSeen: "Terakhir dilihat",
    },
    en: {
      title: "Notifications",
      description: "Manage your notification and device settings",
      enableNotifications: "Enable Notifications",
      notSupported: "Notifications not supported in your browser",
      permissionDenied: "Notification permission denied. Open browser settings to change it.",
      permissionDefault: "Click the button below to enable notifications",
      devices: "Registered Devices",
      noDevices: "No devices registered",
      registerDevice: "Register This Device",
      removeDevice: "Remove",
      lastSeen: "Last seen",
    },
  }

  const t = translations[language] || translations.en

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t.notSupported}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-500" />
            <div>
              <Label className="text-base font-medium">{t.enableNotifications}</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {permission === "granted"
                  ? "Pemberitahuan diaktifkan"
                  : permission === "denied"
                    ? t.permissionDenied
                    : t.permissionDefault}
              </p>
            </div>
          </div>
          <Switch
            checked={preferences?.notifications_enabled ?? false}
            onCheckedChange={handleToggleNotifications}
            disabled={isUpdating || (permission === "denied")}
          />
        </div>

        {/* Registered Devices */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              {t.devices}
            </h3>
            <span className="text-sm text-muted-foreground">{deviceTokens?.length || 0}</span>
          </div>

          {deviceTokens && deviceTokens.length > 0 ? (
            <div className="space-y-2">
              {deviceTokens.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{device.device_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.lastSeen}: {new Date(device.last_seen_at || device.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDevice(device.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">{t.noDevices}</p>
          )}

          {isSupported && permission === "granted" && !isSubscribing && (
            <Button
              onClick={() => handleToggleNotifications(true)}
              disabled={isUpdating}
              className="w-full"
              variant="outline"
            >
              {isUpdating ? "Updating..." : t.registerDevice}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
