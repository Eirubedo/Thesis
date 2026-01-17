"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Pause, RotateCcw, Clock, CheckCircle, Settings } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useProgressTracking } from "@/hooks/use-progress-tracking"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  duration: defaultDuration,
  description,
  resourceId,
  onComplete,
  className = "",
}: InteractiveTimerProps) {
  const { t } = useLanguage()
  const { startSession, completeSession } = useProgressTracking()
  const [customDuration, setCustomDuration] = useState(defaultDuration)
  const [timeLeft, setTimeLeft] = useState(defaultDuration)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [showCustomize, setShowCustomize] = useState(false)
  const [customMinutes, setCustomMinutes] = useState(Math.floor(defaultDuration / 60))
  const [customSeconds, setCustomSeconds] = useState(defaultDuration % 60)
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
              completeSession(currentSession, customDuration)
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
  }, [isRunning, timeLeft, currentSession, resourceId, completeSession, customDuration, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(customDuration)
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
    setTimeLeft(customDuration)
    setIsCompleted(false)
    setCurrentSession(null)
  }

  const handleApplyCustomDuration = () => {
    const newDuration = customMinutes * 60 + customSeconds
    if (newDuration > 0) {
      setCustomDuration(newDuration)
      setTimeLeft(newDuration)
      setIsCompleted(false)
      setCurrentSession(null)
      setShowCustomize(false)
    }
  }

  const presetDurations = [
    { label: "1 min", seconds: 60 },
    { label: "3 min", seconds: 180 },
    { label: "5 min", seconds: 300 },
    { label: "10 min", seconds: 600 },
    { label: "15 min", seconds: 900 },
    { label: "20 min", seconds: 1200 },
  ]

  const progress = ((customDuration - timeLeft) / customDuration) * 100

  return (
    <Card className={`border-sky-100 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Clock className="w-5 h-5 mr-2 text-sky-600" />
            {title}
          </CardTitle>
          <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 border-sky-300 text-sky-600 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-1.5 bg-transparent"
                disabled={isRunning}
              >
                <Settings className="w-4 h-4" />
                <span className="text-xs font-medium">{t("timer.adjustTimer")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("timer.customizeTimer")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Preset durations */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t("timer.presetDurations")}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {presetDurations.map((preset) => (
                      <Button
                        key={preset.seconds}
                        variant={customDuration === preset.seconds ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCustomMinutes(Math.floor(preset.seconds / 60))
                          setCustomSeconds(preset.seconds % 60)
                          setCustomDuration(preset.seconds)
                          setTimeLeft(preset.seconds)
                          setIsCompleted(false)
                          setCurrentSession(null)
                        }}
                        className={customDuration === preset.seconds ? "bg-sky-500 hover:bg-sky-600" : ""}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom input */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t("timer.customDuration")}</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">{t("timer.minutes")}</Label>
                      <Input
                        type="number"
                        min="0"
                        max="120"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(Math.max(0, Number.parseInt(e.target.value) || 0))}
                        className="mt-1"
                      />
                    </div>
                    <span className="text-2xl font-bold text-gray-400 pt-5">:</span>
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">{t("timer.seconds")}</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={customSeconds}
                        onChange={(e) =>
                          setCustomSeconds(Math.min(59, Math.max(0, Number.parseInt(e.target.value) || 0)))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowCustomize(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={handleApplyCustomDuration} className="bg-sky-500 hover:bg-sky-600">
                    {t("timer.applyDuration")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
          {customDuration !== defaultDuration && (
            <div className="text-xs text-sky-600 mt-1">
              {t("timer.customSet")}: {formatTime(customDuration)}
            </div>
          )}
        </div>

        <Progress value={progress} className="w-full h-2" />

        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="bg-sky-500 hover:bg-sky-600 text-white">
              <Play className="w-4 h-4 mr-2" />
              {timeLeft === customDuration ? t("timer.start") : t("timer.resume")}
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
