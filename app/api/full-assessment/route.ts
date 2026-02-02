import { createClient } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

// POST - Save or update full assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, ...assessmentData } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if assessment already exists
    const { data: existing } = await supabase
      .from("full_assessments")
      .select("id")
      .eq("user_id", user_id)
      .single()

    let result

    if (existing) {
      // Update existing assessment
      result = await supabase
        .from("full_assessments")
        .update({
          ...assessmentData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .select()
        .single()
    } else {
      // Insert new assessment
      result = await supabase
        .from("full_assessments")
        .insert({
          user_id,
          ...assessmentData,
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error("Database error:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Full assessment API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Retrieve full assessment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from("full_assessments")
      .select("*")
      .eq("user_id", user_id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No assessment found
        return NextResponse.json({ assessment: null })
      }
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ assessment: data })
  } catch (error) {
    console.error("Full assessment API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
