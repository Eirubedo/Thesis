import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const dynamic = "force-dynamic"

// GET: Fetch assessment progress for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    const assessmentType = searchParams.get("assessment_type")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase
      .from("assessment_progress")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (assessmentType) {
      query = query.eq("assessment_type", assessmentType)
    }

    const { data, error } = await query

    if (error) {
      console.error("Fetch assessment progress error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return the most recent progress for each assessment type if no specific type requested
    if (!assessmentType && data) {
      const latestByType: Record<string, any> = {}
      data.forEach((progress) => {
        if (!latestByType[progress.assessment_type]) {
          latestByType[progress.assessment_type] = progress
        }
      })
      return NextResponse.json(Object.values(latestByType))
    }

    return NextResponse.json(data?.[0] || null)
  } catch (error) {
    console.error("Assessment progress GET error:", error)
    return NextResponse.json({ error: "Failed to fetch assessment progress" }, { status: 500 })
  }
}

// POST: Create or update assessment progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, assessment_type, status, conversation_id } = body

    if (!user_id || !assessment_type || !status) {
      return NextResponse.json({ error: "User ID, assessment type, and status required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if there's an existing in-progress assessment
    const { data: existing } = await supabase
      .from("assessment_progress")
      .select("*")
      .eq("user_id", user_id)
      .eq("assessment_type", assessment_type)
      .neq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (existing && status === "started") {
      // Return existing progress if starting and one already exists
      return NextResponse.json(existing)
    }

    if (existing) {
      // Update existing progress
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === "assessed") {
        updateData.assessed_at = new Date().toISOString()
      } else if (status === "completed") {
        updateData.completed_at = new Date().toISOString()
      }

      if (conversation_id) {
        updateData.conversation_id = conversation_id
      }

      const { data, error } = await supabase
        .from("assessment_progress")
        .update(updateData)
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("Update assessment progress error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    // Create new progress
    const { data, error } = await supabase
      .from("assessment_progress")
      .insert({
        user_id,
        assessment_type,
        status,
        conversation_id,
        started_at: status === "started" ? new Date().toISOString() : null,
        assessed_at: status === "assessed" ? new Date().toISOString() : null,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      console.error("Create assessment progress error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Assessment progress POST error:", error)
    return NextResponse.json({ error: "Failed to save assessment progress" }, { status: 500 })
  }
}
