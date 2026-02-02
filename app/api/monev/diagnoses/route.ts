import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, diagnosis_type, diagnosed_date, notes } = body

    if (!user_id || !diagnosis_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Save or update user diagnosis
    const { data, error } = await supabase
      .from("user_diagnoses")
      .upsert({
        user_id,
        diagnosis_type,
        diagnosed_date: diagnosed_date || new Date().toISOString(),
        notes,
        is_active: true,
      }, {
        onConflict: 'user_id,diagnosis_type',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error saving diagnosis:", error)
    return NextResponse.json(
      { error: "Failed to save diagnosis" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("user_diagnoses")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true)
      .order("diagnosed_date", { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching diagnoses:", error)
    return NextResponse.json(
      { error: "Failed to fetch diagnoses" },
      { status: 500 }
    )
  }
}
