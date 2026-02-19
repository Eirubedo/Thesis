import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { TutorialProvider } from "@/components/tutorial-provider"
import { EmergencySupport } from "@/components/emergency-support"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ANSWA - Asisten Keperawatan Jiwa | Answering Your Mental Health Needs",
  description:
    "Menjawab kebutuhan kesehatan jiwa Anda. ANSWA adalah platform komprehensif pengelolaan hipertensi dengan dukungan AI untuk kesehatan fisik dan mental Anda.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            <AuthProvider>
              <TutorialProvider>
                {children}
                <EmergencySupport />
                <Toaster />
              </TutorialProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
