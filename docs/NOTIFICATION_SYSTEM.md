# Notification System & Persistent Session Implementation

## Overview

Complete notification and persistent session system has been implemented with:
1. **Web Push Notifications** - Browser-based push reminders for medications and schedules
2. **Persistent Sessions** - "Keep Logged In" feature so users don't lose session
3. **Device Token Management** - Multi-device support for push notifications
4. **User Preferences** - Centralized settings for notifications and sessions

## Database Schema

### `user_preferences` table
Stores per-user preferences for sessions and notifications:
- `user_id` (UUID, PK) - References users table
- `keep_logged_in` (boolean) - Whether to persist session after logout
- `notifications_enabled` (boolean) - Whether push notifications are active
- `reminder_times` (jsonb) - Array of preferred reminder times
- `created_at`, `updated_at` - Timestamps
- Row-level security enabled for user isolation

### `device_tokens` table  
Stores browser/device push notification subscriptions:
- `id` (UUID, PK)
- `user_id` (UUID, FK) - References users table
- `device_name` (text) - Human-readable device identifier
- `subscription_json` (jsonb) - Full Web Push subscription object
- `created_at`, `last_seen_at` - Track device activity
- Indexes on `user_id` for efficient queries
- Row-level security enabled

## Components

### `NotificationPreferences` (`/components/notification-preferences.tsx`)
Settings UI for managing push notifications:
- Enable/disable notifications toggle
- Request browser notification permission
- List and manage registered devices
- Remove devices from notifications
- Bilingual (ID/EN) support

### `SessionPreferences` (`/components/session-preferences.tsx`)
Settings UI for managing persistent sessions:
- "Keep Logged In" toggle switch
- Warning banner about security implications
- Force logout button (overrides keep_logged_in)
- Requires explicit toggle in settings to enable

### `MonitoringNotifications` (`/components/monitoring-notifications.tsx`)
Widget embedded in monitoring page:
- Shows notification status (Active/Inactive)
- One-click setup for notifications
- Displays upcoming medication schedules
- Real-time schedule updates

## Utilities

### `pushNotificationService` (`/lib/push-notification-service.ts`)
Service for Web Push operations:
- `isSupported()` - Check browser support
- `registerServiceWorker()` - Register SW for push
- `requestPermission()` - Request notification permission from user
- `subscribe(vapidKey)` - Subscribe to push notifications
- `unsubscribe()` - Unsubscribe from push notifications

## Hooks

### `useNotifications` (`/hooks/use-notifications.ts`)
React hook for managing notifications:
\`\`\`typescript
const {
  isSupported,           // Browser supports push
  isSubscribed,          // Currently subscribed
  permission,            // Notification permission status
  preferences,           // User preference settings (from API)
  deviceTokens,          // List of registered devices
  requestPermission,     // Request permission from user
  subscribe,             // Subscribe to notifications
  unsubscribe,           // Unsubscribe from notifications
  updatePreferences,     // Update settings
  mutatePreferences,     // Revalidate preferences from server
  mutateDeviceTokens,    // Revalidate device tokens from server
} = useNotifications({ userId, enabled: true })
\`\`\`

### Updated `useAuth` Hook (`/hooks/use-auth.ts`)
Enhanced with persistent session support:
- `keepLoggedIn` - Current state of keep_logged_in setting
- `setKeepLoggedIn()` - Update the setting
- `login()` - Now accepts optional `keepLogged` parameter
- `logout()` - Modified to prevent logout if keepLoggedIn is true, unless `force=true`

## API Endpoints

### `POST/GET /api/user-preferences`
Manages user preferences:
- **GET** - Fetch user's preferences
- **POST** - Create/update user preferences

### `POST/GET/DELETE /api/device-tokens`
Manages device push subscriptions:
- **GET** - List all registered devices for user
- **POST** - Register a new device with subscription
- **DELETE** - Unregister a device

## Service Worker

### `/public/service-worker.js`
Handles push notifications:
- `push` event - Receives and displays push notifications
- `notificationclick` event - Handles user clicks on notifications
- `notificationclose` event - Logs notification dismissals
- Auto-opens app on notification click

## Authentication Updates

### Session Persistence Flow
1. User logs in with "Keep Logged In" checkbox
2. `keep_logged_in` flag stored in `user_preferences` table
3. Auth state persisted in localStorage with flag
4. On page reload, if flag is true, user auto-logs in
5. Logout button is disabled/hidden if keep_logged_in is true
6. Force logout available in Settings to override

## Monitoring Page Integration

Notification widget added to `/app/monitoring/page.tsx`:
- Positioned at top of monitoring section
- Quick setup button for notifications
- Shows upcoming medication schedules
- Real-time status indicator
- Fully bilingual

## Settings Page Updates

Updated `/app/settings/page.tsx` to include:
1. **Session Preferences** - Keep logged in toggle
2. **Notification Preferences** - Push notification setup
3. Original language and appearance settings below

## Usage Example

\`\`\`typescript
// In a component
import { useNotifications } from '@/hooks/use-notifications'

function MyComponent() {
  const { isSupported, subscribe, preferences, updatePreferences } = 
    useNotifications({ userId: user?.id })
    
  const handleSetupNotifications = async () => {
    const success = await subscribe("YOUR_VAPID_KEY")
    if (success) {
      await updatePreferences({ notifications_enabled: true })
    }
  }
  
  return (
    <button onClick={handleSetupNotifications}>
      Enable Notifications
    </button>
  )
}
\`\`\`

## Important Notes

1. **VAPID Key Required** - Replace "VAPID_PUBLIC_KEY_HERE" with actual public key in components
2. **Browser Support** - Push notifications work in modern browsers; graceful fallback for unsupported
3. **Security** - Row-level security prevents users from accessing others' preferences/tokens
4. **Session Security** - Warn users about keep_logged_in on shared devices
5. **Bilingual** - All components support Indonesian (id) and English (en)

## Testing Checklist

- [ ] Push notifications enabled in browser settings
- [ ] Service worker successfully registered
- [ ] Device token saved to database
- [ ] Notification permission request works
- [ ] Keep logged in persists across page reloads
- [ ] Force logout works with keep_logged_in enabled
- [ ] Monitoring page shows notification widget
- [ ] Settings page shows both preference components
- [ ] Language switching works in settings
