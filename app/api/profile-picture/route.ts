import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { user_id, profile_picture } = await request.json()

    if (!user_id || !profile_picture) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update user profile picture
    const { error } = await supabase
      .from("users")
      .update({ profile_picture })
      .eq("id", user_id)

    if (error) {
      console.error("Error updating profile picture:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile picture update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("users")
      .select("profile_picture")
      .eq("id", user_id)
      .single()

    if (error) {
      console.error("Error fetching profile picture:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile_picture: data?.profile_picture || null })
  } catch (error) {
    console.error("Profile picture fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
