"use client"

import { useState, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface TTSSettings {
  volume: number
  autoPlay: boolean
}

const DEFAULT_SETTINGS: TTSSettings = {
  volume: 0.8,
  autoPlay: true,
}

export function useTTS() {
  const { toast } = useToast()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentProvider] = useState<"browser">("browser")
  const [settings, setSettings] = useState<TTSSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tts-settings")
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    }
    return DEFAULT_SETTINGS
  })

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const saveSettings = useCallback(
    (newSettings: Partial<TTSSettings>) => {
      const updated = { ...settings, ...newSettings }
      setSettings(updated)
      if (typeof window !== "undefined") {
        localStorage.setItem("tts-settings", JSON.stringify(updated))
      }
    },
    [settings],
  )

  const logTTSEvent = useCallback((event: string, details: any) => {
    console.log(`[TTS] ${event}:`, details)
  }, [])

  const stopSpeech = useCallback(() => {
    try {
      if (utteranceRef.current) {
        speechSynthesis.cancel()
      }
    } catch {
      // ignore
    }
    setIsPlaying(false)
  }, [])

  const speakWithBrowser = useCallback(
    (text: string, language = "id-ID") => {
      return new Promise<void>((resolve, reject) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          const error = "Browser TTS not supported"
          logTTSEvent("BROWSER_TTS_ERROR", { error, text: text.substring(0, 50) })
          reject(new Error(error))
          return
        }

        // stop any current speech
        stopSpeech()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = language
        utterance.volume = settings.volume
        utterance.rate = 1.0
        utterance.pitch = 1.0

        utterance.onstart = () => {
          setIsPlaying(true)
          logTTSEvent("BROWSER_TTS_START", { text: text.substring(0, 50), language })
        }

        utterance.onend = () => {
          setIsPlaying(false)
          logTTSEvent("BROWSER_TTS_END", { text: text.substring(0, 50) })
          resolve()
        }

        utterance.onerror = (event) => {
          setIsPlaying(false)
          const error = `Browser TTS error: ${event.error}`
          logTTSEvent("BROWSER_TTS_ERROR", { error, text: text.substring(0, 50) })
          reject(new Error(error))
        }

        utteranceRef.current = utterance
        speechSynthesis.speak(utterance)
      })
    },
    [settings.volume, stopSpeech, logTTSEvent],
  )

  const speak = useCallback(
    async (text: string, language = "id-ID") => {
      if (!settings.autoPlay) return
      setIsLoading(true)
      try {
        await speakWithBrowser(text, language)
        logTTSEvent("TTS_SUCCESS", { provider: "browser", text: text.substring(0, 50) })
      } catch (error) {
        console.error("Browser TTS failed:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [settings.autoPlay, speakWithBrowser, logTTSEvent],
  )

  const manualSpeak = useCallback(
    async (text: string, language = "id-ID") => {
      setIsLoading(true)
      try {
        await speakWithBrowser(text, language)
        logTTSEvent("MANUAL_TTS_SUCCESS", { provider: "browser", text: text.substring(0, 50) })
        toast({
          title: "Using Browser Voice",
          description: "Audio is played using your device's built-in voice.",
          duration: 2500,
        })
      } catch (error) {
        logTTSEvent("MANUAL_TTS_FAILURE", {
          browserError: error instanceof Error ? error.message : "Unknown error",
          text: text.substring(0, 50),
        })
        toast({
          title: "Voice Unavailable",
          description: "Unable to play audio at this time. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [speakWithBrowser, logTTSEvent, toast],
  )

  return {
    speak,
    manualSpeak,
    stopSpeech,
    isPlaying,
    isLoading,
    currentProvider, // always "browser"
    settings: { autoPlay: settings.autoPlay },
    saveSettings: (newSettings: { autoPlay: boolean }) => saveSettings(newSettings),
  }
}
