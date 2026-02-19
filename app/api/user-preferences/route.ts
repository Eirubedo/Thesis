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

    return NextResponse.json(data || { 
      user_id: userId, 
      keep_logged_in: false, 
      notification_medications: false,
      notification_activities: false,
      notification_daily_summary: false
    })
  } catch (error) {
    console.error("Error fetching preferences:", error)
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      user_id, 
      keep_logged_in, 
      notification_medications,
      notification_activities,
      notification_daily_summary,
      reminder_time
    } = body

    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = createClient()

    // Build update object with only provided fields
    const updateData: any = {
      user_id,
      updated_at: new Date().toISOString(),
    }

    if (keep_logged_in !== undefined) updateData.keep_logged_in = keep_logged_in
    if (notification_medications !== undefined) updateData.notification_medications = notification_medications
    if (notification_activities !== undefined) updateData.notification_activities = notification_activities
    if (notification_daily_summary !== undefined) updateData.notification_daily_summary = notification_daily_summary
    if (reminder_time !== undefined) updateData.reminder_time = reminder_time

    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(updateData, { onConflict: "user_id" })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating preferences:", error)
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
  }
}
