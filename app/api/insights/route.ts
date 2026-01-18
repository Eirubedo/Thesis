import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const dynamic = "force-dynamic"
export const revalidate = 0

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
    const [userResult, hpResult, bpResult, medsResult, logsResult, conversationsResult, schedulesResult, messagesResult] =
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
          .select("id, conversation_type, title, message_count, started_at, summary")
          .eq("user_id", userId)
          .order("started_at", { ascending: false })
          .limit(20),
        supabase
          .from("activity_schedules")
          .select("title, activity_type, scheduled_time, is_active")
          .eq("user_id", userId)
          .eq("is_active", true),
        // Fetch daily summaries for context (latest 30 days)
        supabase
          .from("daily_summaries")
          .select("summary_date, summary_text, conversation_types, key_topics, message_count")
          .eq("user_id", userId)
          .order("summary_date", { ascending: false })
          .limit(30),
      ])

    const user = userResult.data
    const hypertensionProfile = hpResult.data
    const bpReadings = bpResult.data || []
    const medications = medsResult.data || []
    const medicationLogs = logsResult.data || []
    const conversations = conversationsResult.data || []
    const schedules = schedulesResult.data || []
    const dailySummaries = messagesResult.data || []

    // Format daily summaries for AI context
    const summariesForContext = dailySummaries.map((s: any) => ({
      date: s.summary_date,
      summary: s.summary_text,
      types: s.conversation_types,
      topics: s.key_topics,
      messageCount: s.message_count,
    }))

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

    // Fetch recent chat history for context
    const messagesByType = conversations.reduce((acc, c) => {
      if (!acc[c.conversation_type]) {
        acc[c.conversation_type] = []
      }
      acc[c.conversation_type].push(c.summary)
      return acc
    }, {} as Record<string, string[]>)

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
      dailySummaries: summariesForContext,
    }

    // Generate insights using OpenAI
    const systemPrompt =
      lang === "id"
        ? `Anda adalah asisten kesehatan jiwa yang memberikan wawasan dan rekomendasi berdasarkan data kesehatan pengguna. Berikan respons dalam Bahasa Indonesia yang mudah dipahami.

Tugas Anda:
1. Analisis RINGKASAN HARIAN (dailySummaries) untuk memahami perjalanan kesehatan pengguna dari waktu ke waktu
2. Identifikasi pola dan tren dari data tekanan darah, kepatuhan obat, dan aktivitas
3. Berdasarkan ringkasan percakapan, evaluasi:
   - Pemahaman pengguna tentang hipertensi (dari tes pengetahuan)
   - Kondisi mental dan emosional (dari asesmen dan monitoring)
   - Topik-topik kesehatan yang sering dibahas
4. Berikan gambaran trajektori kondisi kesehatan: apakah membaik, stabil, atau perlu perhatian
5. Rekomendasikan fitur ANSWA yang relevan berdasarkan kebutuhan spesifik
6. Berikan saran konkret dan actionable

PENTING: Gunakan ringkasan harian untuk melihat perkembangan kondisi pengguna dari hari ke hari. Identifikasi perubahan positif dan area yang perlu ditingkatkan.

Format respons dalam paragraf yang mengalir natural. Maksimal 4 paragraf.`
        : `You are a mental health assistant providing insights and recommendations based on user health data. Respond in clear, easy-to-understand English.

Your tasks:
1. Analyze DAILY SUMMARIES (dailySummaries) to understand user's health journey over time
2. Identify patterns and trends from blood pressure, medication adherence, and activities
3. Based on conversation summaries, evaluate:
   - User's understanding of hypertension (from knowledge tests)
   - Mental and emotional condition (from assessments and monitoring)
   - Frequently discussed health topics
4. Provide trajectory overview: improving, stable, or needs attention
5. Recommend relevant ANSWA features based on specific needs
6. Give concrete, actionable advice

IMPORTANT: Use daily summaries to see user's condition progress day by day. Identify positive changes and areas for improvement.

Format response in naturally flowing paragraphs. Maximum 4 paragraphs.`

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
