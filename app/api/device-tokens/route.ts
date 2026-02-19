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
      .from("device_tokens")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching device tokens:", error)
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, device_name, subscription_json } = await request.json()

    if (!user_id || !subscription_json) {
      return NextResponse.json({ error: "User ID and subscription required" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if this subscription already exists
    const { data: existing } = await supabase
      .from("device_tokens")
      .select("id")
      .eq("user_id", user_id)
      .eq("subscription_json", subscription_json)
      .single()

    if (existing) {
      // Update last seen
      await supabase
        .from("device_tokens")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", existing.id)

      return NextResponse.json(existing)
    }

    // Create new token
    const { data, error } = await supabase
      .from("device_tokens")
      .insert({
        user_id,
        device_name: device_name || `Device ${new Date().toLocaleDateString()}`,
        subscription_json,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating device token:", error)
    return NextResponse.json({ error: "Failed to register device" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { token_id } = await request.json()

    if (!token_id) {
      return NextResponse.json({ error: "Token ID required" }, { status: 400 })
    }

    const supabase = createClient()

    const { error } = await supabase.from("device_tokens").delete().eq("id", token_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting device token:", error)
    return NextResponse.json({ error: "Failed to delete token" }, { status: 500 })
  }
}
