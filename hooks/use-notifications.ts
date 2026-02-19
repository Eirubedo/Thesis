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

  // Initialize push notification support
  useEffect(() => {
    if (!enabled) return

    const initPushNotifications = async () => {
      setIsSupported(pushNotificationService.isSupported())
      if (pushNotificationService.isSupported()) {
        setPermission(Notification.permission)
        await pushNotificationService.registerServiceWorker()
      }
    }

    initPushNotifications()
  }, [enabled])

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
        await mutateDeviceTokens()
      }

      return result
    } catch (error) {
      console.error("[v0] Unsubscribe failed:", error)
      return false
    }
  }, [mutateDeviceTokens])

  // Update user preferences
  const updatePreferences = useCallback(
    async (updates: Partial<typeof preferences>) => {
      try {
        if (!userId) throw new Error("User not authenticated")

        const response = await fetch("/api/user-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            ...preferences,
            ...updates,
          }),
        })

        const data = await response.json()
        await mutatePreferences()
        return data
      } catch (error) {
        console.error("[v0] Failed to update preferences:", error)
        return null
      }
    },
    [userId, preferences, mutatePreferences]
  )

  return {
    isSupported,
    isSubscribed,
    permission,
    preferences,
    deviceTokens,
    requestPermission,
    subscribe,
    unsubscribe,
    updatePreferences,
    mutatePreferences,
    mutateDeviceTokens,
  }
}
