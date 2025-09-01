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
  const [currentProvider, setCurrentProvider] = useState<"elevenlabs" | "browser">("elevenlabs")
  const [settings, setSettings] = useState<TTSSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tts-settings")
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    }
    return DEFAULT_SETTINGS
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const saveSettings = useCallback(
    (newSettings: Partial<TTSSettings>) => {
      const updated = { ...settings, ...newSettings }
      setSettings(updated)
      localStorage.setItem("tts-settings", JSON.stringify(updated))
    },
    [settings],
  )

  const logTTSEvent = useCallback((event: string, details: any) => {
    console.log(`[TTS] ${event}:`, details)
    // In production, you might want to send this to a logging service
  }, [])

  const stopSpeech = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (utteranceRef.current) {
      speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }, [])

  const speakWithBrowser = useCallback(
    (text: string, language = "id-ID") => {
      return new Promise<void>((resolve, reject) => {
        if (!("speechSynthesis" in window)) {
          const error = "Browser TTS not supported"
          logTTSEvent("BROWSER_TTS_ERROR", { error, text: text.substring(0, 50) })
          reject(new Error(error))
          return
        }

        stopSpeech()
        setCurrentProvider("browser")

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

  const speakWithElevenLabs = useCallback(
    async (text: string) => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          stopSpeech()
          setCurrentProvider("elevenlabs")

          logTTSEvent("ELEVENLABS_TTS_START", { text: text.substring(0, 50) })

          const response = await fetch("/api/tts/elevenlabs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              voice_id: "21m00Tcm4TlvDq8ikWAM", // Rachel voice - good for Indonesian
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            const error = errorData.error || `HTTP ${response.status}`

            // Log specific error types for monitoring
            if (response.status === 429) {
              logTTSEvent("ELEVENLABS_RATE_LIMIT", { error, text: text.substring(0, 50) })
            } else if (response.status === 402) {
              logTTSEvent("ELEVENLABS_CREDIT_LIMIT", { error, text: text.substring(0, 50) })
            } else {
              logTTSEvent("ELEVENLABS_API_ERROR", { error, status: response.status, text: text.substring(0, 50) })
            }

            throw new Error(error)
          }

          const data = await response.json()

          // Create and play audio
          const audio = new Audio(data.audio)
          audio.volume = settings.volume

          audio.onloadstart = () => {
            setIsPlaying(true)
            logTTSEvent("ELEVENLABS_AUDIO_START", { text: text.substring(0, 50) })
          }

          audio.onended = () => {
            setIsPlaying(false)
            logTTSEvent("ELEVENLABS_AUDIO_END", { text: text.substring(0, 50) })
            resolve()
          }

          audio.onerror = () => {
            setIsPlaying(false)
            const error = "Audio playback failed"
            logTTSEvent("ELEVENLABS_AUDIO_ERROR", { error, text: text.substring(0, 50) })
            reject(new Error(error))
          }

          audioRef.current = audio
          await audio.play()
        } catch (error) {
          setIsPlaying(false)
          reject(error)
        }
      })
    },
    [settings.volume, stopSpeech, logTTSEvent],
  )

  const speak = useCallback(
    async (text: string, language = "id-ID") => {
      if (!settings.autoPlay) return

      setIsLoading(true)

      try {
        // Try ElevenLabs first
        await speakWithElevenLabs(text)
        logTTSEvent("TTS_SUCCESS", { provider: "elevenlabs", text: text.substring(0, 50) })
      } catch (elevenLabsError) {
        logTTSEvent("ELEVENLABS_FALLBACK_TRIGGERED", {
          error: elevenLabsError instanceof Error ? elevenLabsError.message : "Unknown error",
          text: text.substring(0, 50),
        })

        try {
          // Fallback to browser TTS
          await speakWithBrowser(text, language)
          logTTSEvent("TTS_SUCCESS", { provider: "browser", text: text.substring(0, 50) })

          // Show user notification about fallback (optional)
          toast({
            title: "Using Browser Voice",
            description: "Premium voice temporarily unavailable, using device voice.",
            duration: 3000,
          })
        } catch (browserError) {
          logTTSEvent("TTS_COMPLETE_FAILURE", {
            elevenLabsError: elevenLabsError instanceof Error ? elevenLabsError.message : "Unknown error",
            browserError: browserError instanceof Error ? browserError.message : "Unknown error",
            text: text.substring(0, 50),
          })

          // Silent failure - don't show error to user for better UX
          console.error("All TTS methods failed:", { elevenLabsError, browserError })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [settings.autoPlay, speakWithElevenLabs, speakWithBrowser, logTTSEvent, toast],
  )

  const manualSpeak = useCallback(
    async (text: string, language = "id-ID") => {
      setIsLoading(true)

      try {
        // Try ElevenLabs first
        await speakWithElevenLabs(text)
        logTTSEvent("MANUAL_TTS_SUCCESS", { provider: "elevenlabs", text: text.substring(0, 50) })
      } catch (elevenLabsError) {
        logTTSEvent("MANUAL_ELEVENLABS_FALLBACK", {
          error: elevenLabsError instanceof Error ? elevenLabsError.message : "Unknown error",
          text: text.substring(0, 50),
        })

        try {
          // Fallback to browser TTS
          await speakWithBrowser(text, language)
          logTTSEvent("MANUAL_TTS_SUCCESS", { provider: "browser", text: text.substring(0, 50) })

          toast({
            title: "Using Browser Voice",
            description: "Premium voice temporarily unavailable, using device voice.",
            duration: 3000,
          })
        } catch (browserError) {
          logTTSEvent("MANUAL_TTS_FAILURE", {
            elevenLabsError: elevenLabsError instanceof Error ? elevenLabsError.message : "Unknown error",
            browserError: browserError instanceof Error ? browserError.message : "Unknown error",
            text: text.substring(0, 50),
          })

          toast({
            title: "Voice Unavailable",
            description: "Unable to play audio at this time. Please try again later.",
            variant: "destructive",
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [speakWithElevenLabs, speakWithBrowser, logTTSEvent, toast],
  )

  return {
    speak,
    manualSpeak,
    stopSpeech,
    isPlaying,
    isLoading,
    currentProvider,
    settings: { autoPlay: settings.autoPlay },
    saveSettings: (newSettings: { autoPlay: boolean }) => saveSettings(newSettings),
  }
}
