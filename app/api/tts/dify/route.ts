import { type NextRequest, NextResponse } from "next/server"

const DIFY_TOKEN = process.env.DIFY_API_KEY ?? "app-Ty9G7BhGSbRGno6RAWPPXIh0"

export async function POST(request: NextRequest) {
  try {
    const { text, message_id, user_id } = await request.json()

    if (!DIFY_TOKEN) {
      return NextResponse.json({ error: "Dify API key not configured" }, { status: 500 })
    }

    // Call Dify's text-to-audio endpoint
    const response = await fetch("https://api.dify.ai/v1/text-to-audio", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        message_id,
        user: user_id || "anonymous",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Dify TTS error:", errorText)
      return NextResponse.json({ error: "Failed to generate speech" }, { status: response.status })
    }

    // Get the audio blob
    const audioBlob = await response.blob()

    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const audioDataUrl = `data:${audioBlob.type};base64,${base64}`

    return NextResponse.json({
      audio: audioDataUrl,
      provider: "dify",
    })
  } catch (error) {
    console.error("Dify TTS API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
