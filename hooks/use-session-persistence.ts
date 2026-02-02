"use client"

import { useEffect, useRef, useCallback } from "react"

interface SessionState {
  lastActivity: number
  chatMessages?: any[]
  formData?: Record<string, any>
  currentPath?: string
}

const SESSION_KEY = "answa_session_state"
const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export function useSessionPersistence(key: string) {
  const lastActivityRef = useRef<number>(Date.now())

  // Save state to localStorage
  const saveState = useCallback((data: any) => {
    if (typeof window === "undefined") return
    
    try {
      const sessionState: SessionState = {
        lastActivity: Date.now(),
        [key]: data,
        currentPath: window.location.pathname,
      }
      
      // Get existing session and merge
      const existing = localStorage.getItem(SESSION_KEY)
      const existingState = existing ? JSON.parse(existing) : {}
      
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        ...existingState,
        ...sessionState,
        lastActivity: Date.now(),
      }))
    } catch (error) {
      console.error("Failed to save session state:", error)
    }
  }, [key])

  // Load state from localStorage
  const loadState = useCallback(() => {
    if (typeof window === "undefined") return null
    
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) return null
      
      const state: SessionState = JSON.parse(stored)
      
      // Check if session has expired
      if (Date.now() - state.lastActivity > SESSION_TIMEOUT) {
        localStorage.removeItem(SESSION_KEY)
        return null
      }
      
      return state[key as keyof SessionState] || null
    } catch (error) {
      console.error("Failed to load session state:", error)
      return null
    }
  }, [key])

  // Clear state
  const clearState = useCallback(() => {
    if (typeof window === "undefined") return
    
    try {
      const existing = localStorage.getItem(SESSION_KEY)
      if (existing) {
        const state = JSON.parse(existing)
        delete state[key]
        localStorage.setItem(SESSION_KEY, JSON.stringify(state))
      }
    } catch (error) {
      console.error("Failed to clear session state:", error)
    }
  }, [key])

  // Heartbeat to keep session alive
  useEffect(() => {
    if (typeof window === "undefined") return

    const updateActivity = () => {
      lastActivityRef.current = Date.now()
      const existing = localStorage.getItem(SESSION_KEY)
      if (existing) {
        try {
          const state = JSON.parse(existing)
          state.lastActivity = Date.now()
          localStorage.setItem(SESSION_KEY, JSON.stringify(state))
        } catch {
          // ignore
        }
      }
    }

    // Update on user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true })
    })

    // Heartbeat interval
    const heartbeat = setInterval(() => {
      const existing = localStorage.getItem(SESSION_KEY)
      if (existing) {
        try {
          const state = JSON.parse(existing)
          // Only update if user was active recently
          if (Date.now() - lastActivityRef.current < HEARTBEAT_INTERVAL * 2) {
            state.lastActivity = Date.now()
            localStorage.setItem(SESSION_KEY, JSON.stringify(state))
          }
        } catch {
          // ignore
        }
      }
    }, HEARTBEAT_INTERVAL)

    // Handle visibility change - save state when tab becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateActivity()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
      clearInterval(heartbeat)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  return { saveState, loadState, clearState }
}
