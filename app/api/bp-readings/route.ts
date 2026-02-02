import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("bp_readings")
      .select("*")
      .eq("user_id", userId)
      .order("measurement_date", { ascending: false })
      .limit(30)

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching BP readings:", error)
    return NextResponse.json({ error: "Failed to fetch BP readings" }, { status: 500 })
  }
}
