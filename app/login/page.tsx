"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await login(formData.identifier, formData.password)

      if (result.success) {
        toast({
          title: t("login.successTitle") || "Login Successful",
          description: t("login.successDesc") || "Welcome back!",
        })
        router.push("/")
      } else {
        toast({
          title: t("login.failedTitle") || "Login Failed",
          description: result.error || t("login.invalidCreds") || "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("login.errorTitle") || "Error",
        description: t("login.errorDesc") || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t("login.loading") || "Loading..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-end">
          <LanguageSelector />
        </div>

        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{t("login.title")}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("login.or")}{" "}
            <Link href="/register" className="font-medium text-red-600 hover:text-red-500">
              {t("login.createAccount")}
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("login.signIn")}</CardTitle>
            <CardDescription>{t("login.enterCredentials")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">{t("login.identifier") || "Phone Number or Name"}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder={t("login.identifierPlaceholder") || "Enter phone number or name"}
                    value={formData.identifier}
                    onChange={(e) => setFormData((prev) => ({ ...prev, identifier: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("login.password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.passwordPlaceholder")}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                {isSubmitting ? t("login.signingIn") : t("login.signIn")}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm text-red-600 hover:text-red-500">
                {t("login.forgotPassword")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
