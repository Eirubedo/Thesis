import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, assessment_type } = body

    if (!user_id || !assessment_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // For quick-assessment, we need to check if symptoms AND abilities have been recorded
    if (assessment_type === "quick-assessment") {
      // Check if symptoms exist for any diagnosis
      const { data: symptoms } = await supabase
        .from("symptom_assessments")
        .select("id")
        .eq("user_id", user_id)
        .limit(1)

      // Check if abilities exist for any diagnosis
      const { data: abilities } = await supabase
        .from("ability_assessments")
        .select("id")
        .eq("user_id", user_id)
        .limit(1)

      const hasSymptoms = symptoms && symptoms.length > 0
      const hasAbilities = abilities && abilities.length > 0
      const shouldMarkAssessed = hasSymptoms && hasAbilities

      return NextResponse.json({
        assessed: shouldMarkAssessed,
        hasSymptoms,
        hasAbilities,
      })
    }

    // For other assessment types, check if any data exists
    const { data: symptoms } = await supabase
      .from("symptom_assessments")
      .select("id")
      .eq("user_id", user_id)
      .limit(1)

    const { data: abilities } = await supabase
      .from("ability_assessments")
      .select("id")
      .eq("user_id", user_id)
      .limit(1)

    const assessed = (symptoms && symptoms.length > 0) || (abilities && abilities.length > 0)

    return NextResponse.json({ assessed })
  } catch (error) {
    console.error("Error checking assessed status:", error)
    return NextResponse.json(
      { error: "Failed to check assessed status" },
      { status: 500 }
    )
  }
}
