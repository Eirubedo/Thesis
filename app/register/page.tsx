"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Phone, Lock, User, Calendar, MapPin } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"

export default function RegisterPage() {
  const { register, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    phone_number: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    gender: "",
    birth_date: "",
    address: "",
    postal_code: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("register.passwordMismatch") || "Password Mismatch",
        description: t("register.passwordMismatchDesc") || "Passwords do not match",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      toast({
        title: t("register.weakPassword") || "Weak Password",
        description: t("register.weakPasswordDesc") || "Password must be at least 6 characters long",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const { confirmPassword, ...userData } = formData
      const result = await register(userData)

      if (result.success) {
        toast({
          title: t("register.successTitle") || "Registration Successful",
          description: t("register.successDesc") || "Your account has been created successfully!",
        })
        router.push("/")
      } else {
        toast({
          title: t("register.failedTitle") || "Registration Failed",
          description: result.error || t("register.failedDesc") || "Failed to create account",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("register.errorTitle") || "Error",
        description: t("register.errorDesc") || "An unexpected error occurred",
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
          <p className="mt-2 text-gray-600">{t("register.loading") || "Loading..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="flex justify-end">
          <LanguageSelector />
        </div>

        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{t("register.title")}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("register.alreadyHaveAccount")}{" "}
            <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
              {t("register.signInHere")}
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("register.registerTitle")}</CardTitle>
            <CardDescription>{t("register.registerDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number">{t("register.phoneNumber")} *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder={t("register.phoneNumberPlaceholder")}
                    value={formData.phone_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone_number: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">{t("register.fullName")} *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder={t("register.fullNamePlaceholder")}
                    value={formData.full_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Gender and Birth Date */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">{t("register.gender")}</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("register.genderPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("register.male")}</SelectItem>
                      <SelectItem value="female">{t("register.female")}</SelectItem>
                      <SelectItem value="other">{t("register.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">{t("register.birthDate")}</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, birth_date: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">{t("register.address")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="address"
                    placeholder={t("register.addressPlaceholder")}
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    className="pl-10"
                    rows={3}
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <Label htmlFor="postal_code">{t("register.postalCode")}</Label>
                <Input
                  id="postal_code"
                  type="text"
                  placeholder={t("register.postalCodePlaceholder")}
                  value={formData.postal_code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, postal_code: e.target.value }))}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t("register.password")} *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("register.passwordPlaceholder")}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("register.confirmPassword")} *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("register.confirmPasswordPlaceholder")}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                {isSubmitting ? t("register.creatingAccount") : t("register.createAccount")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
