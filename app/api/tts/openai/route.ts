import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "alloy", language = "id" } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // OpenAI TTS voices: alloy, echo, fable, onyx, nova, shimmer
    // For Indonesian, we'll use 'alloy' or 'nova' as they work well with multiple languages
    const selectedVoice = language === "id" ? "nova" : voice

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1", // or "tts-1-hd" for higher quality
        input: text,
        voice: selectedVoice,
        response_format: "mp3",
        speed: 1.0,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI TTS API error:", errorText)
      return NextResponse.json({ error: "Failed to generate speech" }, { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      audio: `data:audio/mp3;base64,${base64Audio}`,
      provider: "openai",
      voice: selectedVoice,
    })
  } catch (error) {
    console.error("OpenAI TTS error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
