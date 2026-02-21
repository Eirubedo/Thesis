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
  const [currentProvider] = useState<"dify">("dify")
  const [settings, setSettings] = useState<TTSSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tts-settings")
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    }
    return DEFAULT_SETTINGS
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)



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
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    } catch {
      // ignore
    }
    setIsPlaying(false)
  }, [])

  const speakWithDify = useCallback(
    async (text: string, message_id?: string) => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          // stop any current speech
          stopSpeech()

          logTTSEvent("DIFY_TTS_REQUEST", {
            text: text.substring(0, 50),
            message_id,
          })

          const response = await fetch("/api/tts/dify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              message_id,
              user_id: "user",
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to generate speech")
          }

          const data = await response.json()

          // Create audio element and play
          const audio = new Audio(data.audio)
          audio.volume = settings.volume
          audioRef.current = audio

          audio.onplay = () => {
            setIsPlaying(true)
            logTTSEvent("DIFY_TTS_START", {
              text: text.substring(0, 50),
            })
          }

          audio.onended = () => {
            setIsPlaying(false)
            logTTSEvent("DIFY_TTS_END", { text: text.substring(0, 50) })
            resolve()
          }

          audio.onerror = (event) => {
            setIsPlaying(false)
            const error = "Dify TTS playback error"
            logTTSEvent("DIFY_TTS_ERROR", { error, text: text.substring(0, 50) })
            reject(new Error(error))
          }

          await audio.play()
        } catch (error) {
          setIsPlaying(false)
          logTTSEvent("DIFY_TTS_ERROR", {
            error: error instanceof Error ? error.message : "Unknown error",
            text: text.substring(0, 50),
          })
          reject(error)
        }
      })
    },
    [settings.volume, stopSpeech, logTTSEvent],
  )

  const speak = useCallback(
    async (text: string, message_id?: string) => {
      if (!settings.autoPlay) return
      setIsLoading(true)
      try {
        await speakWithDify(text, message_id)
        logTTSEvent("TTS_SUCCESS", { provider: "dify", text: text.substring(0, 50) })
      } catch (error) {
        console.error("Dify TTS failed:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [settings.autoPlay, speakWithDify, logTTSEvent],
  )

  const manualSpeak = useCallback(
    async (text: string, message_id?: string) => {
      setIsLoading(true)
      try {
        await speakWithDify(text, message_id)
        logTTSEvent("MANUAL_TTS_SUCCESS", { provider: "dify", text: text.substring(0, 50) })
      } catch (error) {
        logTTSEvent("MANUAL_TTS_FAILURE", {
          difyError: error instanceof Error ? error.message : "Unknown error",
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
    [speakWithDify, logTTSEvent, toast],
  )

  return {
    speak,
    manualSpeak,
    stopSpeech,
    isPlaying,
    isLoading,
    currentProvider, // always "dify"
    settings: { autoPlay: settings.autoPlay },
    saveSettings: (newSettings: { autoPlay: boolean }) => saveSettings(newSettings),
  }
}
