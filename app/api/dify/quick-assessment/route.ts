import { type NextRequest, NextResponse } from "next/server"

const DIFY_QUICK_ASSESSMENT_TOKEN = process.env.DIFY_QUICK_ASSESSMENT_API_KEY || process.env.DIFY_API_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_id, user_id } = await request.json()

    if (!DIFY_QUICK_ASSESSMENT_TOKEN) {
      return NextResponse.json({ error: "Dify Quick Assessment API key not configured" }, { status: 500 })
    }

    const difyResponse = await fetch("https://api.dify.ai/v1/chat-messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_QUICK_ASSESSMENT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: "blocking",
        conversation_id: conversation_id || "",
        user: user_id || "anonymous",
      }),
    })

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text()
      console.error("Dify Quick Assessment API error:", errorText)
      return NextResponse.json({ error: "Failed to get response from AI assistant" }, { status: difyResponse.status })
    }

    const data = await difyResponse.json()

    return NextResponse.json({
      message: data.answer || "Saya di sini untuk membantu asesmen cepat Anda.",
      conversation_id: data.conversation_id,
      message_id: data.id,
    })
  } catch (error) {
    console.error("Quick Assessment API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
