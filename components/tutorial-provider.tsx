"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"

interface TutorialStep {
  id: string
  titleEn: string
  titleId: string
  descriptionEn: string
  descriptionId: string
  targetSelector?: string
  targetPage?: string
  position?: "top" | "bottom" | "left" | "right" | "center"
  action?: "click" | "navigate" | "observe"
}

interface TutorialContextType {
  isActive: boolean
  currentStep: number
  totalSteps: number
  startTutorial: () => void
  endTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  hasCompletedTutorial: boolean
  markAsCompleted: () => void
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider")
  }
  return context
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    titleEn: "Welcome to ANSWA",
    titleId: "Selamat Datang di ANSWA",
    descriptionEn:
      "ANSWA (Asisten Keperawatan Jiwa) is your AI-powered mental health assistant for hypertension management. Let's walk through how to use this app effectively.",
    descriptionId:
      "ANSWA (Asisten Keperawatan Jiwa) adalah asisten kesehatan mental bertenaga AI untuk pengelolaan hipertensi. Mari kita pelajari cara menggunakan aplikasi ini secara efektif.",
    position: "center",
    action: "observe",
  },
  {
    id: "register",
    titleEn: "Step 1: Register",
    titleId: "Langkah 1: Daftar",
    descriptionEn:
      "Create your secure account by clicking the 'Register' button. You'll need to provide your phone number and create a password. Then complete your health profile.",
    descriptionId:
      "Buat akun aman Anda dengan mengklik tombol 'Daftar'. Anda perlu memberikan nomor telepon dan membuat kata sandi. Kemudian lengkapi profil kesehatan Anda.",
    targetSelector: "[data-tutorial='register-btn']",
    targetPage: "/",
    position: "bottom",
    action: "click",
  },
  {
    id: "assessment",
    titleEn: "Step 2: Take Assessment",
    titleId: "Langkah 2: Ikuti Asesmen",
    descriptionEn:
      "Navigate to the Assessment page to take our comprehensive hypertension and mental health assessment. This helps us understand your condition better.",
    descriptionId:
      "Buka halaman Asesmen untuk mengikuti asesmen hipertensi dan kesehatan mental komprehensif kami. Ini membantu kami memahami kondisi Anda dengan lebih baik.",
    targetSelector: "[data-tutorial='nav-assessment']",
    targetPage: "/assessment",
    position: "bottom",
    action: "navigate",
  },
  {
    id: "ai-chat",
    titleEn: "Step 3: AI Support",
    titleId: "Langkah 3: Dukungan AI",
    descriptionEn:
      "Chat with our AI assistant for personalized hypertension guidance. You can ask questions, get recommendations, and receive support 24/7.",
    descriptionId:
      "Ngobrol dengan asisten AI kami untuk panduan hipertensi yang dipersonalisasi. Anda dapat bertanya, mendapatkan rekomendasi, dan menerima dukungan 24/7.",
    targetSelector: "[data-tutorial='nav-edukasi']",
    targetPage: "/self-help",
    position: "bottom",
    action: "navigate",
  },
  {
    id: "monitoring",
    titleEn: "Step 4: Track Your Health",
    titleId: "Langkah 4: Lacak Kesehatan Anda",
    descriptionEn:
      "Use the Monitoring page to track your blood pressure, medications, and daily activities. Regular tracking helps you see your progress.",
    descriptionId:
      "Gunakan halaman Pemantauan untuk melacak tekanan darah, obat, dan aktivitas harian Anda. Pelacakan rutin membantu Anda melihat kemajuan.",
    targetSelector: "[data-tutorial='nav-monitoring']",
    targetPage: "/monitoring",
    position: "bottom",
    action: "navigate",
  },
  {
    id: "reports",
    titleEn: "Step 5: View Reports",
    titleId: "Langkah 5: Lihat Laporan",
    descriptionEn:
      "Check your progress reports to see detailed analytics, AI-generated insights, and recommendations for your health journey.",
    descriptionId:
      "Periksa laporan kemajuan Anda untuk melihat analitik terperinci, wawasan yang dihasilkan AI, dan rekomendasi untuk perjalanan kesehatan Anda.",
    targetSelector: "[data-tutorial='nav-reports']",
    targetPage: "/reports",
    position: "bottom",
    action: "navigate",
  },
  {
    id: "emergency",
    titleEn: "Emergency Support",
    titleId: "Dukungan Darurat",
    descriptionEn:
      "In case of emergency, click the yellow Emergency button (⚠️) at the bottom right corner. It provides crisis hotlines and helps you find nearby healthcare facilities.",
    descriptionId:
      "Dalam keadaan darurat, klik tombol Darurat kuning (⚠️) di sudut kanan bawah. Ini menyediakan hotline krisis dan membantu Anda menemukan fasilitas kesehatan terdekat.",
    targetSelector: "[data-tutorial='emergency-btn']",
    position: "left",
    action: "observe",
  },
  {
    id: "complete",
    titleEn: "You're Ready!",
    titleId: "Anda Siap!",
    descriptionEn:
      "Congratulations! You now know how to use ANSWA. Remember, we're here to support your health journey. Start by taking your first assessment!",
    descriptionId:
      "Selamat! Anda sekarang tahu cara menggunakan ANSWA. Ingat, kami di sini untuk mendukung perjalanan kesehatan Anda. Mulai dengan mengambil asesmen pertama Anda!",
    position: "center",
    action: "observe",
  },
]

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const { language } = useLanguage()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("answa-tutorial-completed")
      setHasCompletedTutorial(completed === "true")
    }
  }, [])

  // Update highlight position when step changes
  useEffect(() => {
    if (!isActive) {
      setHighlightRect(null)
      return
    }

    const step = tutorialSteps[currentStep]
    if (step?.targetSelector) {
      const element = document.querySelector(step.targetSelector)
      if (element) {
        const rect = element.getBoundingClientRect()
        setHighlightRect(rect)

        // Scroll element into view
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      } else {
        setHighlightRect(null)
      }
    } else {
      setHighlightRect(null)
    }
  }, [isActive, currentStep])

  const startTutorial = useCallback(() => {
    setIsActive(true)
    setCurrentStep(0)
  }, [])

  const endTutorial = useCallback(() => {
    setIsActive(false)
    setCurrentStep(0)
    setHighlightRect(null)
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      endTutorial()
      markAsCompleted()
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < tutorialSteps.length) {
      setCurrentStep(step)
    }
  }, [])

  const markAsCompleted = useCallback(() => {
    setHasCompletedTutorial(true)
    if (typeof window !== "undefined") {
      localStorage.setItem("answa-tutorial-completed", "true")
    }
  }, [])

  const step = tutorialSteps[currentStep]
  const title = language === "id" ? step?.titleId : step?.titleEn
  const description = language === "id" ? step?.descriptionId : step?.descriptionEn

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: tutorialSteps.length,
        startTutorial,
        endTutorial,
        nextStep,
        prevStep,
        goToStep,
        hasCompletedTutorial,
        markAsCompleted,
      }}
    >
      {children}

      {/* Tutorial Overlay */}
      {isActive && (
        <>
          {/* Dark overlay with cutout for highlighted element */}
          <div className="fixed inset-0 z-[9998] pointer-events-none">
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <mask id="tutorial-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {highlightRect && (
                    <rect
                      x={highlightRect.left - 8}
                      y={highlightRect.top - 8}
                      width={highlightRect.width + 16}
                      height={highlightRect.height + 16}
                      rx="8"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.7)" mask="url(#tutorial-mask)" />
            </svg>

            {/* Highlight border animation */}
            {highlightRect && (
              <div
                className="absolute border-2 border-red-500 rounded-lg animate-pulse pointer-events-none"
                style={{
                  left: highlightRect.left - 8,
                  top: highlightRect.top - 8,
                  width: highlightRect.width + 16,
                  height: highlightRect.height + 16,
                  boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
                }}
              />
            )}
          </div>

          {/* Tutorial Card */}
          <div className="fixed z-[9999] pointer-events-auto" style={getCardPosition(step?.position, highlightRect)}>
            <Card className="w-[320px] sm:w-[400px] shadow-2xl border-2 border-red-200 bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {currentStep + 1} / {tutorialSteps.length}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={endTutorial}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm text-gray-600 leading-relaxed">{description}</CardDescription>

                {/* Step indicators */}
                <div className="flex justify-center gap-1.5">
                  {tutorialSteps.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentStep ? "bg-red-600 w-4" : idx < currentStep ? "bg-red-300" : "bg-gray-300"
                      }`}
                      onClick={() => goToStep(idx)}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex-1 bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {language === "id" ? "Sebelumnya" : "Previous"}
                  </Button>
                  <Button size="sm" onClick={nextStep} className="flex-1 bg-red-600 hover:bg-red-700">
                    {currentStep === tutorialSteps.length - 1 ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        {language === "id" ? "Selesai" : "Finish"}
                      </>
                    ) : (
                      <>
                        {language === "id" ? "Selanjutnya" : "Next"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Skip button */}
                <Button
                  variant="link"
                  size="sm"
                  onClick={endTutorial}
                  className="w-full text-gray-500 hover:text-gray-700"
                >
                  {language === "id" ? "Lewati Tutorial" : "Skip Tutorial"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </TutorialContext.Provider>
  )
}

function getCardPosition(position?: string, highlightRect?: DOMRect | null): React.CSSProperties {
  if (!position || position === "center" || !highlightRect) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }
  }

  const padding = 20
  const cardWidth = 400
  const cardHeight = 280

  switch (position) {
    case "top":
      return {
        left: Math.max(
          padding,
          Math.min(
            highlightRect.left + highlightRect.width / 2 - cardWidth / 2,
            window.innerWidth - cardWidth - padding,
          ),
        ),
        bottom: window.innerHeight - highlightRect.top + padding,
      }
    case "bottom":
      return {
        left: Math.max(
          padding,
          Math.min(
            highlightRect.left + highlightRect.width / 2 - cardWidth / 2,
            window.innerWidth - cardWidth - padding,
          ),
        ),
        top: highlightRect.bottom + padding,
      }
    case "left":
      return {
        right: window.innerWidth - highlightRect.left + padding,
        top: Math.max(
          padding,
          Math.min(
            highlightRect.top + highlightRect.height / 2 - cardHeight / 2,
            window.innerHeight - cardHeight - padding,
          ),
        ),
      }
    case "right":
      return {
        left: highlightRect.right + padding,
        top: Math.max(
          padding,
          Math.min(
            highlightRect.top + highlightRect.height / 2 - cardHeight / 2,
            window.innerHeight - cardHeight - padding,
          ),
        ),
      }
    default:
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
  }
}
