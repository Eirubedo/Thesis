import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { EmergencySupport } from "@/components/emergency-support"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ASKED - AI Mental Health Assistant",
  description: "AI-powered mental health support with RAG chatbot",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <EmergencySupport />
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
