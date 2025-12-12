import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversation_id = searchParams.get("conversation_id")

    if (!conversation_id) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversation_id)
      .single()

    if (convError) {
      console.error("Fetch conversation error:", convError)
      throw convError
    }

    const { data: messages, error: messagesError } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("Fetch messages error:", messagesError)
      throw messagesError
    }

    return NextResponse.json({ conversation, messages })
  } catch (error) {
    console.error("Fetch conversation detail error:", error)
    return NextResponse.json({ error: "Failed to fetch conversation details" }, { status: 500 })
  }
}
