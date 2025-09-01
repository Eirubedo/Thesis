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
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login, register } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let success = false

      if (isLogin) {
        success = await login(email, password)
      } else {
        success = await register(email, password, name)
      }

      if (success) {
        toast({
          title: "Success!",
          description: isLogin ? "Welcome back!" : "Account created successfully!",
        })
        router.push("/assessment")
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-sky-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-sky-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-sky-600">{t("login.title")}</CardTitle>
          <CardDescription>{isLogin ? t("login.subtitle") : t("login.subtitleRegister")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">{t("login.fullName")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("login.fullName")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("login.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("login.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLogin ? t("login.signIn") : t("login.createAccount")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sky-600 hover:text-sky-800 text-sm"
            >
              {isLogin ? t("login.noAccount") : t("login.hasAccount")}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm">
              {t("login.backHome")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
