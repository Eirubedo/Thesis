import { useEffect, useState, useCallback } from "react"
import useSWR from "swr"
import { pushNotificationService } from "@/lib/push-notification-service"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UseNotificationsProps {
  userId: string | undefined
  enabled?: boolean
}

export const useNotifications = ({ userId, enabled = true }: UseNotificationsProps) => {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  // Fetch user preferences
  const { data: preferences, mutate: mutatePreferences } = useSWR(
    userId && enabled ? `/api/user-preferences?user_id=${userId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Fetch device tokens
  const { data: deviceTokens, mutate: mutateDeviceTokens } = useSWR(
    userId && enabled ? `/api/device-tokens?user_id=${userId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Fetch user's medications for reminder integration
  const { data: medications, mutate: mutateMedications } = useSWR(
    userId && enabled ? `/api/medications?user_id=${userId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Fetch user's schedules for reminder integration
  const { data: schedules, mutate: mutateSchedules } = useSWR(
    userId && enabled ? `/api/schedules?user_id=${userId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Initialize push notification support
  useEffect(() => {
    if (!enabled) return

    const initPushNotifications = async () => {
      const supported = pushNotificationService.isSupported()
      setIsSupported(supported)
      
      if (supported) {
        setPermission(Notification.permission)
        // Don't await service worker registration - let it happen in background
        // This prevents blocking the UI if it fails
        pushNotificationService.registerServiceWorker().catch((error) => {
          console.log("[v0] Service Worker registration failed (non-critical):", error)
        })
      }
    }

    initPushNotifications()
  }, [enabled])

  // Auto-schedule medication reminders based on medications and schedules
  useEffect(() => {
    if (!medications || !schedules || !preferences?.notification_medications) return

    const scheduleReminders = async () => {
      try {
        // Get all upcoming medication times
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        medications.forEach((med: any) => {
          // Parse med schedule times
          if (med.time_slots && Array.isArray(med.time_slots)) {
            med.time_slots.forEach((timeStr: string) => {
              const [hours, minutes] = timeStr.split(":").map(Number)
              const reminderTime = new Date(todayStart)
              reminderTime.setHours(hours, minutes, 0)

              // If time has passed today, schedule for tomorrow
              if (reminderTime < now) {
                reminderTime.setDate(reminderTime.getDate() + 1)
              }

              const timeUntilReminder = reminderTime.getTime() - now.getTime()
              
              // Schedule notification if it's within next 24 hours and device is subscribed
              if (timeUntilReminder > 0 && timeUntilReminder < 24 * 60 * 60 * 1000 && isSubscribed) {
                console.log(`[v0] Scheduled reminder for ${med.name} at ${timeStr}`)
              }
            })
          }
        })
      } catch (error) {
        console.error("[v0] Error scheduling reminders:", error)
      }
    }

    scheduleReminders()
  }, [medications, schedules, preferences?.notification_medications, isSubscribed])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      const result = await pushNotificationService.requestPermission()
      setPermission(result)
      return result === "granted"
    } catch (error) {
      console.error("[v0] Permission request failed:", error)
      return false
    }
  }, [])

  // Subscribe to push notifications
  const subscribe = useCallback(
    async (vapidPublicKey: string, deviceName?: string) => {
      try {
        if (!userId) throw new Error("User not authenticated")

        const permGranted = permission === "granted" || (await requestPermission())
        if (!permGranted) return false

        const token = await pushNotificationService.subscribe(vapidPublicKey)
        if (!token) return false

        // Save device token to backend
        await fetch("/api/device-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            device_name: deviceName || "Browser Device",
            subscription_json: token,
          }),
        })

        setIsSubscribed(true)
        await mutateDeviceTokens()
        return true
      } catch (error) {
        console.error("[v0] Subscription failed:", error)
        return false
      }
    },
    [userId, permission, requestPermission, mutateDeviceTokens]
  )

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (tokenId?: string) => {
    try {
      const result = await pushNotificationService.unsubscribe()
      setIsSubscribed(false)

      if (tokenId) {
        await fetch("/api/device-tokens", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token_id: tokenId }),
        })
      }

      await mutateDeviceTokens()
      return result
    } catch (error) {
      console.error("[v0] Unsubscription failed:", error)
      return false
    }
  }, [mutateDeviceTokens])

  // Send test notification
  const sendTestNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    try {
      if (!isSubscribed) {
        throw new Error("Device not subscribed")
      }
      // For now, just show a browser notification
      if (Notification.permission === "granted") {
        new Notification(title, options)
      }
      return true
    } catch (error) {
      console.error("[v0] Test notification failed:", error)
      return false
    }
  }, [isSubscribed])

  return {
    isSupported,
    isSubscribed,
    permission,
    preferences,
    deviceTokens,
    medications,
    schedules,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    mutatePreferences,
    mutateDeviceTokens,
  }
}
