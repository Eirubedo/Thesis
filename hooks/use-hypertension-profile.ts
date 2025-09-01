"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./use-auth"
import type { HypertensionProfile } from "@/types/database"

export function useHypertensionProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<HypertensionProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("hypertension_profiles").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading hypertension profile:", error)
        return
      }

      setProfile(data || null)
    } catch (error) {
      console.error("Error loading hypertension profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (
    profileData: Partial<HypertensionProfile>,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not authenticated" }

    try {
      if (profile) {
        // Update existing profile
        const { error } = await supabase.from("hypertension_profiles").update(profileData).eq("user_id", user.id)

        if (error) {
          return { success: false, error: "Failed to update profile" }
        }

        setProfile({ ...profile, ...profileData } as HypertensionProfile)
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("hypertension_profiles")
          .insert({
            user_id: user.id,
            ...profileData,
          })
          .select()
          .single()

        if (error || !data) {
          return { success: false, error: "Failed to create profile" }
        }

        setProfile(data)
      }

      return { success: true }
    } catch (error) {
      console.error("Profile update error:", error)
      return { success: false, error: "An error occurred while updating profile" }
    }
  }

  return {
    profile,
    isLoading,
    updateProfile,
    loadProfile,
  }
}
