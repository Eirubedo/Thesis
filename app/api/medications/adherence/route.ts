import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { calculateDailyAdherence, calculateAdherencePercentage, getTodayAdherence } from "@/lib/medication-adherence"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("user_id")
  const days = parseInt(searchParams.get("days") || "7")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const supabase = createClient()

    // Fetch all medications with their logs
    const { data: medications, error } = await supabase
      .from("medications")
      .select(`
        id,
        name,
        logs:medication_logs(
          id,
          taken_at,
          was_taken,
          scheduled_at
        )
      `)
      .eq("user_id", userId)

    if (error) throw error

    // Calculate adherence
    const dailyAdherence = calculateDailyAdherence(medications || [], days)
    const adherencePercentage = calculateAdherencePercentage(dailyAdherence)
    const todayAdherence = getTodayAdherence(medications || [])

    return NextResponse.json({
      daily: dailyAdherence,
      percentage: adherencePercentage,
      today: todayAdherence,
    })
  } catch (error) {
    console.error("Error calculating medication adherence:", error)
    return NextResponse.json({ error: "Failed to calculate adherence" }, { status: 500 })
  }
}
