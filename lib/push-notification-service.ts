export const pushNotificationService = {
  /**
   * Check if browser supports push notifications
   */
  isSupported: (): boolean => {
    return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
  },

  /**
   * Register service worker for push notifications
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) return null

    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
      })
      console.log("[v0] Service Worker registered:", registration)
      return registration
    } catch (error) {
      console.error("[v0] Service Worker registration failed:", error)
      return null
    }
  },

  /**
   * Request push notification permission and subscribe
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return "denied"

    if (Notification.permission === "granted") {
      return "granted"
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission
    }

    return "denied"
  },

  /**
   * Subscribe to push notifications and return device token
   */
  async subscribe(vapidPublicKey: string): Promise<string | null> {
    try {
      const registration = await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      })

      return JSON.stringify(subscription)
    } catch (error) {
      console.error("[v0] Push subscription failed:", error)
      return null
    }
  },

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] Push unsubscribe failed:", error)
      return false
    }
  },

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  },
}
