import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
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

    // Fetch all messages for the user with conversation info
    const { data: messages, error } = await supabase
      .from("conversation_messages")
      .select(
        `
        *,
        conversations!inner (
          id,
          user_id,
          conversation_type,
          title,
          started_at
        )
      `,
      )
      .eq("conversations.user_id", user_id)
      .eq("conversations.is_archived", false)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Fetch daily conversations error:", error)
      throw error
    }

    // Group messages by date
    const groupedByDate: Record<string, any[]> = {}

    messages?.forEach((message) => {
      const date = new Date(message.created_at).toLocaleDateString("en-CA") // YYYY-MM-DD format
      if (!groupedByDate[date]) {
        groupedByDate[date] = []
      }
      groupedByDate[date].push({
        ...message,
        conversation_type: message.conversations.conversation_type,
        conversation_title: message.conversations.title,
      })
    })

    // Convert to array and sort by date descending
    const dailyRecords = Object.entries(groupedByDate)
      .map(([date, messages]) => ({
        date,
        messageCount: messages.length,
        messages: messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(dailyRecords)
  } catch (error) {
    console.error("Daily conversations error:", error)
    return NextResponse.json({ error: "Failed to fetch daily conversations" }, { status: 500 })
  }
}
