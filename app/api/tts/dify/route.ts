import { type NextRequest, NextResponse } from "next/server"

const DIFY_TOKEN = process.env.DIFY_API_KEY ?? "app-Ty9G7BhGSbRGno6RAWPPXIh0"

export async function POST(request: NextRequest) {
  try {
    const { text, message_id, user_id } = await request.json()

    console.log("[v0] Dify TTS request:", { has_text: !!text, has_message_id: !!message_id, user_id })

    if (!DIFY_TOKEN) {
      console.error("[v0] Dify API key not configured")
      return NextResponse.json({ error: "Dify API key not configured" }, { status: 500 })
    }

    // Prepare request body - prioritize message_id if available
    const requestBody: { user: string; message_id?: string; text?: string } = {
      user: user_id || "anonymous",
    }

    if (message_id) {
      requestBody.message_id = message_id
    } else if (text) {
      requestBody.text = text
    } else {
      console.error("[v0] Neither message_id nor text provided")
      return NextResponse.json({ error: "Either message_id or text is required" }, { status: 400 })
    }

    console.log("[v0] Calling Dify TTS with:", requestBody)

    // Call Dify's text-to-audio endpoint
    const response = await fetch("https://api.dify.ai/v1/text-to-audio", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Dify TTS error:", response.status, errorText)
      return NextResponse.json({ error: "Failed to generate speech", details: errorText }, { status: response.status })
    }

    // Get the audio blob (Dify returns binary audio/wav)
    const audioBlob = await response.blob()
    console.log("[v0] Audio blob received:", audioBlob.type, audioBlob.size, "bytes")

    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const mimeType = audioBlob.type || "audio/wav"
    const audioDataUrl = `data:${mimeType};base64,${base64}`

    console.log("[v0] Audio data URL created, length:", audioDataUrl.length)

    return NextResponse.json({
      audio: audioDataUrl,
      provider: "dify",
    })
  } catch (error) {
    console.error("[v0] Dify TTS API error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
