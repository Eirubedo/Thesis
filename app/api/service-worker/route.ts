export async function GET() {
  const serviceWorkerCode = `
// Service Worker for handling push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body || "Pengingat kesehatan Anda",
    icon: "/icon-dark-32x32.png",
    badge: "/icon-light-32x32.png",
    tag: data.tag || "health-reminder",
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
  }

  event.waitUntil(self.registration.showNotification(data.title || "Teman Kesehatan", options))
})

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data.url || "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus()
        }
      }
      // If not open, open it
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("[v0] Notification closed:", event.notification.tag)
})
  `

  return new Response(serviceWorkerCode, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
