import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!process.env.DIFY_API_KEY) {
      return NextResponse.json({ error: "Dify API key not configured" }, { status: 500 })
    }

    const difyResponse = await fetch(`https://api.dify.ai/v1/conversations?user=${user_id || "anonymous"}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text()
      console.error("Dify API error:", errorText)
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: difyResponse.status })
    }

    const data = await difyResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Conversations API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
