import { NextRequest, NextResponse } from "next/server"

const DIFY_TOKEN = process.env.DIFY_API_KEY

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("file") as File
    const user_id = formData.get("user_id") as string

    console.log("[v0] Dify STT request:", { 
      has_file: !!audioFile, 
      file_type: audioFile?.type,
      file_size: audioFile?.size,
      user_id 
    })

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    if (!DIFY_TOKEN) {
      console.error("[v0] Dify API key not configured")
      return NextResponse.json({ error: "Dify API key not configured" }, { status: 500 })
    }

    // Create form data for Dify
    const difyFormData = new FormData()
    difyFormData.append("file", audioFile)
    difyFormData.append("user", user_id || "anonymous")

    console.log("[v0] Calling Dify STT API...")

    // Call Dify's audio-to-text endpoint
    const response = await fetch("https://api.dify.ai/v1/audio-to-text", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_TOKEN}`,
      },
      body: difyFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Dify STT error:", response.status, errorText)
      return NextResponse.json(
        { error: "Failed to transcribe audio", details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[v0] Dify STT success:", { text_length: data.text?.length })

    return NextResponse.json({
      text: data.text,
      provider: "dify",
    })
  } catch (error) {
    console.error("[v0] Dify STT API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
