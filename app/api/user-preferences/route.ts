import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json(data || { user_id: userId, keep_logged_in: false, notifications_enabled: false })
  } catch (error) {
    console.error("Error fetching preferences:", error)
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, keep_logged_in, notifications_enabled, reminder_times } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id,
          keep_logged_in: keep_logged_in ?? false,
          notifications_enabled: notifications_enabled ?? false,
          reminder_times: reminder_times ?? [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating preferences:", error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}
