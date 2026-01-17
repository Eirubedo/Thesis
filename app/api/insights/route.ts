import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    const lang = searchParams.get("lang") || "id"

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all user data for comprehensive insights
    const [userResult, hpResult, bpResult, medsResult, logsResult, conversationsResult, schedulesResult] =
      await Promise.all([
        supabase.from("users").select("full_name, gender, birth_date, address, postal_code").eq("id", userId).single(),
        supabase.from("hypertension_profiles").select("*").eq("user_id", userId).single(),
        supabase
          .from("bp_readings")
          .select("systolic, diastolic, heart_rate, category, measurement_date, notes")
          .eq("user_id", userId)
          .order("measurement_date", { ascending: false })
          .limit(30),
        supabase.from("medications").select("name, dosage, notes, is_active").eq("user_id", userId),
        supabase
          .from("medication_logs")
          .select("medication_id, taken_at, was_taken")
          .eq("user_id", userId)
          .order("taken_at", { ascending: false })
          .limit(60),
        supabase
          .from("conversations")
          .select("conversation_type, title, message_count, started_at, summary")
          .eq("user_id", userId)
          .order("started_at", { ascending: false })
          .limit(20),
        supabase
          .from("activity_schedules")
          .select("title, activity_type, scheduled_time, is_active")
          .eq("user_id", userId)
          .eq("is_active", true),
      ])

    const user = userResult.data
    const hypertensionProfile = hpResult.data
    const bpReadings = bpResult.data || []
    const medications = medsResult.data || []
    const medicationLogs = logsResult.data || []
    const conversations = conversationsResult.data || []
    const schedules = schedulesResult.data || []

    // Calculate age
    let age = null
    if (user?.birth_date) {
      const birthDate = new Date(user.birth_date)
      const today = new Date()
      age = today.getFullYear() - birthDate.getFullYear()
    }

    // Calculate BP statistics
    let bpStats = null
    if (bpReadings.length > 0) {
      const avgSystolic = Math.round(bpReadings.reduce((sum, r) => sum + r.systolic, 0) / bpReadings.length)
      const avgDiastolic = Math.round(bpReadings.reduce((sum, r) => sum + r.diastolic, 0) / bpReadings.length)
      const latestReading = bpReadings[0]
      const oldestReading = bpReadings[bpReadings.length - 1]

      // Calculate trend
      let trend = "stable"
      if (bpReadings.length >= 5) {
        const recentAvg = bpReadings.slice(0, 5).reduce((sum, r) => sum + r.systolic, 0) / 5
        const olderAvg = bpReadings.slice(-5).reduce((sum, r) => sum + r.systolic, 0) / 5
        if (recentAvg > olderAvg + 5) trend = "increasing"
        else if (recentAvg < olderAvg - 5) trend = "decreasing"
      }

      bpStats = {
        avgSystolic,
        avgDiastolic,
        latestReading,
        trend,
        totalReadings: bpReadings.length,
        categories: bpReadings.reduce(
          (acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
      }
    }

    // Calculate medication adherence
    const activeMeds = medications.filter((m) => m.is_active)
    const takenLogs = medicationLogs.filter((l) => l.was_taken)
    const adherenceRate =
      medicationLogs.length > 0 ? Math.round((takenLogs.length / medicationLogs.length) * 100) : null

    // Summarize conversation activity
    const conversationSummary = {
      totalConversations: conversations.length,
      assessments: conversations.filter((c) => c.conversation_type === "assessment").length,
      monitoring: conversations.filter((c) => c.conversation_type === "quick-assessment").length,
      knowledgeTests: conversations.filter((c) => c.conversation_type === "knowledge-test").length,
      education: conversations.filter((c) => c.conversation_type === "education").length,
    }

    // Build context for AI
    const contextData = {
      user: {
        name: user?.full_name || "Pengguna",
        gender: user?.gender,
        age,
      },
      hypertension: hypertensionProfile
        ? {
            familyHistory: hypertensionProfile.family_history,
            riskFactors: hypertensionProfile.risk_factors,
            medicalHistory: hypertensionProfile.medical_history,
            smokingStatus: hypertensionProfile.smoking_status,
            alcoholConsumption: hypertensionProfile.alcohol_consumption,
            exerciseFrequency: hypertensionProfile.exercise_frequency,
            stressLevel: hypertensionProfile.stress_level,
          }
        : null,
      bloodPressure: bpStats,
      medications: {
        active: activeMeds.map((m) => ({ name: m.name, dosage: m.dosage })),
        adherenceRate,
      },
      activities: schedules.map((s) => ({ title: s.title, type: s.activity_type })),
      conversations: conversationSummary,
    }

    // Generate insights using OpenAI
    const systemPrompt =
      lang === "id"
        ? `Anda adalah asisten kesehatan jiwa yang memberikan wawasan dan rekomendasi berdasarkan data kesehatan pengguna. Berikan respons dalam Bahasa Indonesia yang mudah dipahami.

Tugas Anda:
1. Analisis data kesehatan pengguna secara menyeluruh
2. Identifikasi pola dan tren dari data tekanan darah, kepatuhan obat, dan aktivitas
3. Berikan wawasan tentang kondisi kesehatan mental dan fisik
4. Rekomendasikan fitur-fitur aplikasi ANSWA yang relevan:
   - Asesmen AI Lengkap untuk evaluasi mendalam
   - Monitoring & Evaluasi untuk pemantauan rutin
   - Edukasi untuk belajar teknik relaksasi
   - Penjadwalan Aktivitas untuk rutinitas sehat
5. Berikan saran konkret dan actionable

Format respons dalam paragraf yang mengalir natural, bukan poin-poin. Maksimal 4 paragraf.`
        : `You are a mental health assistant providing insights and recommendations based on user health data. Respond in clear, easy-to-understand English.

Your tasks:
1. Analyze user health data comprehensively
2. Identify patterns and trends from blood pressure, medication adherence, and activity data
3. Provide insights about mental and physical health condition
4. Recommend relevant ANSWA app features:
   - Full AI Assessment for in-depth evaluation
   - Monitoring & Evaluation for routine check-ups
   - Education for learning relaxation techniques
   - Activity Scheduling for healthy routines
5. Give concrete, actionable advice

Format response in naturally flowing paragraphs, not bullet points. Maximum 4 paragraphs.`

    const userPrompt =
      lang === "id"
        ? `Berdasarkan data kesehatan berikut, berikan wawasan dan rekomendasi untuk pengguna:

${JSON.stringify(contextData, null, 2)}

Berikan analisis yang personal dan rekomendasi yang spesifik berdasarkan kondisi pengguna. Jika ada data yang kurang, sarankan pengguna untuk melengkapi melalui fitur aplikasi.`
        : `Based on the following health data, provide insights and recommendations for the user:

${JSON.stringify(contextData, null, 2)}

Provide personalized analysis and specific recommendations based on the user's condition. If data is incomplete, suggest the user to complete it through app features.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const text = completion.choices[0]?.message?.content || ""

    return NextResponse.json({
      insights: text,
      data: {
        bpStats,
        adherenceRate,
        conversationSummary,
        activeMedications: activeMeds.length,
        activeSchedules: schedules.length,
      },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Insights API error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
