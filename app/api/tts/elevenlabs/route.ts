import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id = "21m00Tcm4TlvDq8ikWAM" } = await request.json() // Default to Rachel voice

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("ElevenLabs TTS API error:", errorText)
      return NextResponse.json({ error: "Failed to generate speech" }, { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      audio: `data:audio/mp3;base64,${base64Audio}`,
      provider: "elevenlabs",
    })
  } catch (error) {
    console.error("ElevenLabs TTS error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
