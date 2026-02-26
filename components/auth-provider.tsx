"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"

interface AuthContextType {
  user: any
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (userData: any) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
  updateProfile: (profileData: any) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

// Keep the old useAuth export for backward compatibility
export { useAuthContext as useAuth }
