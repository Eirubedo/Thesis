"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, Clock, CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useProgressTracking } from "@/hooks/use-progress-tracking"

interface InteractiveTimerProps {
  title: string
  duration: number // in seconds
  description?: string
  resourceId?: number
  onComplete?: () => void
  className?: string
}

export function InteractiveTimer({
  title,
  duration,
  description,
  resourceId,
  onComplete,
  className = "",
}: InteractiveTimerProps) {
  const { t } = useLanguage()
  const { startSession, completeSession } = useProgressTracking()
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentSession, setCurrentSession] = useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsCompleted(true)

            // Complete the session
            if (currentSession && resourceId) {
              completeSession(currentSession, duration)
            }

            onComplete?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, currentSession, resourceId, completeSession, duration, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(duration)
      setIsCompleted(false)
    }

    // Start a new session if we have a resourceId
    if (resourceId && !currentSession) {
      const session = startSession(resourceId, "timer")
      setCurrentSession(session)
    }

    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(duration)
    setIsCompleted(false)
    setCurrentSession(null)
  }

  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <Card className={`border-sky-100 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Clock className="w-5 h-5 mr-2 text-sky-600" />
          {title}
        </CardTitle>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-bold ${isCompleted ? "text-green-600" : "text-sky-600"}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {isCompleted ? t("timer.completed") : isRunning ? t("timer.running") : t("timer.ready")}
          </div>
        </div>

        <Progress value={progress} className="w-full h-2" />

        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="bg-sky-500 hover:bg-sky-600 text-white">
              <Play className="w-4 h-4 mr-2" />
              {timeLeft === duration ? t("timer.start") : t("timer.resume")}
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              variant="outline"
              className="border-yellow-500 text-yellow-600 bg-transparent"
            >
              <Pause className="w-4 h-4 mr-2" />
              {t("timer.pause")}
            </Button>
          )}
          <Button onClick={handleReset} variant="outline" className="bg-transparent">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("timer.reset")}
          </Button>
        </div>

        {isCompleted && (
          <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{t("selfHelp.sessionComplete")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
