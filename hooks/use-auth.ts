"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

interface AuthUser {
  id: string
  phone_number: string
  full_name: string
  gender?: "male" | "female" | "other"
  birth_date?: string
  address?: string
  postal_code?: string
  profile_picture?: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      // Check if keep_logged_in preference exists
      const storedUser = localStorage.getItem("auth_user")
      const storedKeepLoggedIn = localStorage.getItem("keep_logged_in")
      
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setKeepLoggedIn(storedKeepLoggedIn === "true")
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (
    phone_number: string,
    password: string,
    keepLogged?: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)

      // Get user by phone number
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("phone_number", phone_number)
        .single()

      if (userError || !userData) {
        return { success: false, error: "Invalid phone number or password" }
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userData.password_hash)
      if (!isValidPassword) {
        return { success: false, error: "Invalid phone number or password" }
      }

      // Set user data (excluding password hash)
      const authUser: AuthUser = {
        id: userData.id,
        phone_number: userData.phone_number,
        full_name: userData.full_name,
        gender: userData.gender,
        birth_date: userData.birth_date,
        address: userData.address,
        postal_code: userData.postal_code,
        profile_picture: userData.profile_picture,
      }

      setUser(authUser)
      setKeepLoggedIn(keepLogged ?? false)
      
      localStorage.setItem("auth_user", JSON.stringify(authUser))
      localStorage.setItem("keep_logged_in", String(keepLogged ?? false))

      // Update user preferences if keep_logged_in changed
      if (keepLogged) {
        await fetch("/api/user-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userData.id,
            keep_logged_in: true,
          }),
        }).catch((error) => console.error("[v0] Failed to update preferences:", error))
      }

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An error occurred during login" }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    phone_number: string
    password: string
    full_name: string
    gender?: "male" | "female" | "other"
    birth_date?: string
    address?: string
    postal_code?: string
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)

      // Check if phone number already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("phone_number", userData.phone_number)
        .single()

      if (existingUser) {
        return { success: false, error: "Phone number already registered" }
      }

      // Hash password
      const password_hash = await bcrypt.hash(userData.password, 10)

      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          phone_number: userData.phone_number,
          password_hash,
          full_name: userData.full_name,
          gender: userData.gender,
          birth_date: userData.birth_date,
          address: userData.address,
          postal_code: userData.postal_code,
        })
        .select()
        .single()

      if (insertError || !newUser) {
        return { success: false, error: "Failed to create account" }
      }

      // Create hypertension profile
      await supabase.from("hypertension_profiles").insert({
        user_id: newUser.id,
        family_history: false,
        smoking_status: "never",
        alcohol_consumption: "none",
        exercise_frequency: "none",
        stress_level: 5,
      })

      // Create user preferences with keep_logged_in = false by default
      await supabase.from("user_preferences").insert({
        user_id: newUser.id,
        keep_logged_in: false,
        notifications_enabled: false,
      })

      // Set user data
      const authUser: AuthUser = {
        id: newUser.id,
        phone_number: newUser.phone_number,
        full_name: newUser.full_name,
        gender: newUser.gender,
        birth_date: newUser.birth_date,
        address: newUser.address,
        postal_code: newUser.postal_code,
        profile_picture: newUser.profile_picture,
      }

      setUser(authUser)
      setKeepLoggedIn(false)
      
      localStorage.setItem("auth_user", JSON.stringify(authUser))
      localStorage.setItem("keep_logged_in", "false")

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An error occurred during registration" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (force: boolean = false) => {
    // Only allow logout if keep_logged_in is false or force is true
    if (!keepLoggedIn || force) {
      setUser(null)
      setKeepLoggedIn(false)
      localStorage.removeItem("auth_user")
      localStorage.removeItem("keep_logged_in")
    } else {
      console.log("[v0] Logout prevented: keep_logged_in is enabled. Update settings to disable.")
    }
  }

  const updateProfile = async (profileData: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not authenticated" }

    try {
      const { error } = await supabase.from("users").update(profileData).eq("id", user.id)

      if (error) {
        return { success: false, error: "Failed to update profile" }
      }

      const updatedUser = { ...user, ...profileData }
      setUser(updatedUser)
      localStorage.setItem("auth_user", JSON.stringify(updatedUser))

      return { success: true }
    } catch (error) {
      console.error("Profile update error:", error)
      return { success: false, error: "An error occurred while updating profile" }
    }
  }

  return {
    user,
    isLoading,
    keepLoggedIn,
    setKeepLoggedIn,
    login,
    register,
    logout,
    updateProfile,
  }
}
