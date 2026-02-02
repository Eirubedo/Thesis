import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, diagnosis_type, abilities_known, abilities_practiced, practice_details, assessment_id } = body

    if (!user_id || !diagnosis_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Save or update abilities
    const { data, error } = await supabase
      .from("ability_assessments")
      .upsert({
        user_id,
        diagnosis_type,
        abilities_known: abilities_known || [],
        abilities_practiced: abilities_practiced || [],
        assessment_id,
        assessed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,diagnosis_type',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) throw error

    // Save practice details if provided
    if (practice_details && practice_details.length > 0) {
      const detailsWithIds = practice_details.map((detail: any) => ({
        ...detail,
        ability_assessment_id: data.id,
        user_id,
      }))

      const { error: detailsError } = await supabase
        .from("ability_practice_details")
        .upsert(detailsWithIds, {
          onConflict: 'ability_assessment_id,ability_name',
          ignoreDuplicates: false
        })

      if (detailsError) console.error("Error saving practice details:", detailsError)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error saving abilities:", error)
    return NextResponse.json(
      { error: "Failed to save abilities" },
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
      .from("ability_assessments")
      .select(`
        *,
        ability_practice_details (*)
      `)
      .eq("user_id", user_id)
      .order("assessed_at", { ascending: false })

    if (diagnosis_type) {
      query = query.eq("diagnosis_type", diagnosis_type)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching abilities:", error)
    return NextResponse.json(
      { error: "Failed to fetch abilities" },
      { status: 500 }
    )
  }
}
