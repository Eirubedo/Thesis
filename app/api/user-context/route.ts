import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch user profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("full_name, gender, birth_date, address, postal_code")
      .eq("id", userId)
      .single()

    if (userError && userError.code !== "PGRST116") {
      console.error("Error fetching user:", userError)
    }

    // Fetch hypertension profile
    const { data: hypertensionProfile, error: hpError } = await supabase
      .from("hypertension_profiles")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (hpError && hpError.code !== "PGRST116") {
      console.error("Error fetching hypertension profile:", hpError)
    }

    // Fetch recent BP readings (last 10)
    const { data: bpReadings, error: bpError } = await supabase
      .from("bp_readings")
      .select("systolic, diastolic, heart_rate, category, measurement_date, notes")
      .eq("user_id", userId)
      .order("measurement_date", { ascending: false })
      .limit(10)

    if (bpError && bpError.code !== "PGRST116") {
      console.error("Error fetching BP readings:", bpError)
    }

    // Fetch active medications
    const { data: medications, error: medError } = await supabase
      .from("medications")
      .select("name, dosage, notes, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)

    if (medError && medError.code !== "PGRST116") {
      console.error("Error fetching medications:", medError)
    }

    // Fetch recent activity schedules
    const { data: schedules, error: schedError } = await supabase
      .from("activity_schedules")
      .select("title, activity_type, scheduled_time, scheduled_days, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(10)

    if (schedError && schedError.code !== "PGRST116") {
      console.error("Error fetching schedules:", schedError)
    }

    // Fetch full assessment data
    const { data: fullAssessment, error: assessError } = await supabase
      .from("full_assessments")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (assessError) {
      console.error("Error fetching full assessment:", assessError)
    }

    // Calculate age if birth_date exists
    let age = null
    if (user?.birth_date) {
      const birthDate = new Date(user.birth_date)
      const today = new Date()
      age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
    }

    // Calculate average BP if readings exist
    let avgBP = null
    if (bpReadings && bpReadings.length > 0) {
      const avgSystolic = Math.round(bpReadings.reduce((sum, r) => sum + r.systolic, 0) / bpReadings.length)
      const avgDiastolic = Math.round(bpReadings.reduce((sum, r) => sum + r.diastolic, 0) / bpReadings.length)
      const avgHeartRate = bpReadings[0]?.heart_rate
        ? Math.round(
            bpReadings.reduce((sum, r) => sum + (r.heart_rate || 0), 0) / bpReadings.filter((r) => r.heart_rate).length,
          )
        : null
      avgBP = { systolic: avgSystolic, diastolic: avgDiastolic, heartRate: avgHeartRate }
    }

    // Build context object
    const context = {
      profile: {
        name: user?.full_name || null,
        gender: user?.gender || null,
        age: age,
        location: user?.postal_code || null,
      },
      hypertension: {
        familyHistory: hypertensionProfile?.family_history || false,
        riskFactors: hypertensionProfile?.risk_factors || [],
        medicalHistory: hypertensionProfile?.medical_history || null,
        smokingStatus: hypertensionProfile?.smoking_status || null,
        alcoholConsumption: hypertensionProfile?.alcohol_consumption || null,
        exerciseFrequency: hypertensionProfile?.exercise_frequency || null,
        stressLevel: hypertensionProfile?.stress_level || null,
      },
      bloodPressure: {
        recentReadings: bpReadings || [],
        average: avgBP,
        latestReading: bpReadings?.[0] || null,
        latestCategory: bpReadings?.[0]?.category || null,
      },
      medications: medications || [],
      activities: schedules || [],
      fullAssessment: fullAssessment || null,
    }

    return NextResponse.json(context)
  } catch (error) {
    console.error("User context API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
