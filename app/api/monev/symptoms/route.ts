import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, diagnosis_type, symptoms, assessment_id } = body

    if (!user_id || !diagnosis_type || !symptoms) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Save or update symptoms
    const { data, error } = await supabase
      .from("symptom_assessments")
      .upsert({
        user_id,
        diagnosis_type,
        symptoms,
        assessment_id,
        assessed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,diagnosis_type',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error saving symptoms:", error)
    return NextResponse.json(
      { error: "Failed to save symptoms" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    const diagnosis_type = searchParams.get("diagnosis_type")

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      )
    }

    let query = supabase
      .from("symptom_assessments")
      .select("*")
      .eq("user_id", user_id)
      .order("assessed_at", { ascending: false })

    if (diagnosis_type) {
      query = query.eq("diagnosis_type", diagnosis_type)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching symptoms:", error)
    return NextResponse.json(
      { error: "Failed to fetch symptoms" },
      { status: 500 }
    )
  }
}
