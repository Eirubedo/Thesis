import { type NextRequest, NextResponse } from "next/server"

const DIFY_TOKEN = process.env.DIFY_API_KEY ?? "app-Ty9G7BhGSbRGno6RAWPPXIh0"

function buildContextString(userContext: any): string {
  if (!userContext) return ""

  const parts: string[] = []

  // Profile info
  if (userContext.profile?.name) {
    parts.push(`Nama klien: ${userContext.profile.name}`)
  }
  if (userContext.profile?.gender) {
    const genderText =
      userContext.profile.gender === "male"
        ? "Laki-laki"
        : userContext.profile.gender === "female"
          ? "Perempuan"
          : userContext.profile.gender
    parts.push(`Jenis kelamin: ${genderText}`)
  }
  if (userContext.profile?.age) {
    parts.push(`Usia: ${userContext.profile.age} tahun`)
  }

  // Hypertension info
  if (userContext.hypertension) {
    const hp = userContext.hypertension
    if (hp.familyHistory) {
      parts.push("Memiliki riwayat keluarga hipertensi")
    }
    if (hp.riskFactors && hp.riskFactors.length > 0) {
      parts.push(`Faktor risiko: ${hp.riskFactors.join(", ")}`)
    }
    if (hp.smokingStatus && hp.smokingStatus !== "never") {
      parts.push(`Status merokok: ${hp.smokingStatus}`)
    }
    if (hp.stressLevel) {
      const stressText = hp.stressLevel <= 3 ? "rendah" : hp.stressLevel <= 6 ? "sedang" : "tinggi"
      parts.push(`Tingkat stres: ${stressText} (${hp.stressLevel}/10)`)
    }
    if (hp.exerciseFrequency) {
      parts.push(`Frekuensi olahraga: ${hp.exerciseFrequency}`)
    }
  }

  // Blood pressure info
  if (userContext.bloodPressure) {
    const bp = userContext.bloodPressure
    if (bp.latestReading) {
      parts.push(
        `Tekanan darah terakhir: ${bp.latestReading.systolic}/${bp.latestReading.diastolic} mmHg (${bp.latestCategory || "belum dikategorikan"})`,
      )
      if (bp.latestReading.heart_rate) {
        parts.push(`Detak jantung terakhir: ${bp.latestReading.heart_rate} bpm`)
      }
    }
    if (bp.average) {
      parts.push(`Rata-rata tekanan darah: ${bp.average.systolic}/${bp.average.diastolic} mmHg`)
    }
  }

  // Medications
  if (userContext.medications && userContext.medications.length > 0) {
    const medList = userContext.medications.map((m: any) => `${m.name} (${m.dosage})`).join(", ")
    parts.push(`Obat yang dikonsumsi: ${medList}`)
  }

  // Activities
  if (userContext.activities && userContext.activities.length > 0) {
    const actList = userContext.activities.map((a: any) => a.title).join(", ")
    parts.push(`Aktivitas terjadwal: ${actList}`)
  }

  // Full Assessment Data
  if (userContext.fullAssessment) {
    const fa = userContext.fullAssessment

    // Clinical History
    if (fa.chief_complaint) parts.push(`Keluhan utama: ${fa.chief_complaint}`)
    if (fa.illness_history) parts.push(`Riwayat penyakit: ${fa.illness_history}`)
    if (fa.medical_history) parts.push(`Riwayat medis: ${fa.medical_history}`)
    if (fa.family_medical_history) parts.push(`Riwayat medis keluarga: ${fa.family_medical_history}`)

    // Psychological Symptoms
    if (fa.hallucinations) parts.push(`Halusinasi: ${fa.hallucinations}`)
    if (fa.delusions) parts.push(`Waham: ${fa.delusions}`)
    if (fa.thought_disorders) parts.push(`Gangguan pikiran: ${fa.thought_disorders}`)
    if (fa.memory_issues) parts.push(`Masalah memori: ${fa.memory_issues}`)
    if (fa.orientation_issues) parts.push(`Masalah orientasi: ${fa.orientation_issues}`)
    if (fa.consciousness_level) parts.push(`Tingkat kesadaran: ${fa.consciousness_level}`)

    // Emotional State
    if (fa.mood_description) parts.push(`Suasana hati: ${fa.mood_description}`)
    if (fa.affect_description) parts.push(`Afek: ${fa.affect_description}`)
    if (fa.anxiety_level) parts.push(`Tingkat kecemasan: ${fa.anxiety_level}`)
    if (fa.depression_symptoms) parts.push(`Gejala depresi: ${fa.depression_symptoms}`)

    // Self-Perception
    if (fa.self_concept) parts.push(`Konsep diri: ${fa.self_concept}`)
    if (fa.ideal_self) parts.push(`Diri ideal: ${fa.ideal_self}`)
    if (fa.self_esteem) parts.push(`Harga diri: ${fa.self_esteem}`)
    if (fa.identity_confusion) parts.push(`Kebingungan identitas: ${fa.identity_confusion}`)

    // Body Image
    if (fa.body_image_perception) parts.push(`Persepsi citra tubuh: ${fa.body_image_perception}`)
    if (fa.physical_concerns) parts.push(`Kekhawatiran fisik: ${fa.physical_concerns}`)

    // Social Relationships
    if (fa.family_relationships) parts.push(`Hubungan keluarga: ${fa.family_relationships}`)
    if (fa.social_relationships) parts.push(`Hubungan sosial: ${fa.social_relationships}`)
    if (fa.communication_patterns) parts.push(`Pola komunikasi: ${fa.communication_patterns}`)
    if (fa.social_support) parts.push(`Dukungan sosial: ${fa.social_support}`)

    // Activities & Daily Living
    if (fa.daily_activities) parts.push(`Aktivitas harian: ${fa.daily_activities}`)
    if (fa.work_status) parts.push(`Status pekerjaan: ${fa.work_status}`)
    if (fa.hobbies) parts.push(`Hobi: ${fa.hobbies}`)
    if (fa.sleep_pattern) parts.push(`Pola tidur: ${fa.sleep_pattern}`)
    if (fa.appetite_pattern) parts.push(`Pola makan: ${fa.appetite_pattern}`)

    // Spiritual Aspects
    if (fa.spiritual_beliefs) parts.push(`Keyakinan spiritual: ${fa.spiritual_beliefs}`)
    if (fa.spiritual_practices) parts.push(`Praktik spiritual: ${fa.spiritual_practices}`)
    if (fa.spiritual_support) parts.push(`Dukungan spiritual: ${fa.spiritual_support}`)

    // Safety & Risk Assessment
    if (fa.suicidal_ideation !== null) {
      parts.push(`Ide bunuh diri: ${fa.suicidal_ideation ? "Ya" : "Tidak"}`)
    }
    if (fa.self_harm_history !== null) {
      parts.push(`Riwayat menyakiti diri: ${fa.self_harm_history ? "Ya" : "Tidak"}`)
    }
    if (fa.violence_risk !== null) {
      parts.push(`Risiko kekerasan: ${fa.violence_risk ? "Ya" : "Tidak"}`)
    }
    if (fa.safety_concerns) parts.push(`Kekhawatiran keselamatan: ${fa.safety_concerns}`)

    // Coping & Stress
    if (fa.coping_mechanisms) parts.push(`Mekanisme koping: ${fa.coping_mechanisms}`)
    if (fa.stress_management) parts.push(`Manajemen stres: ${fa.stress_management}`)

    // Vital Signs
    if (fa.blood_pressure) parts.push(`Tekanan darah: ${fa.blood_pressure}`)
    if (fa.heart_rate) parts.push(`Detak jantung: ${fa.heart_rate}`)
    if (fa.temperature) parts.push(`Suhu: ${fa.temperature}`)
    if (fa.respiratory_rate) parts.push(`Laju pernapasan: ${fa.respiratory_rate}`)

    // Assessment Notes
    if (fa.nursing_diagnosis) parts.push(`Diagnosis keperawatan: ${fa.nursing_diagnosis}`)
    if (fa.assessment_notes) parts.push(`Catatan asesmen: ${fa.assessment_notes}`)
  }

  if (parts.length === 0) return ""

  return `\n\n[KONTEKS KLIEN]\n${parts.join("\n")}\n\n[Catatan: Gunakan informasi di atas untuk memberikan respons yang lebih personal dan relevan. Tidak perlu menyebutkan semua informasi, fokus pada yang relevan dengan pertanyaan.]`
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_id, user_id, userContext } = await request.json()

    if (!DIFY_TOKEN) {
      return NextResponse.json({ error: "Dify API key not configured" }, { status: 500 })
    }

    const contextString = buildContextString(userContext)
    const enhancedMessage = contextString ? `${message}${contextString}` : message

    // Use blocking mode to wait for complete response
    const blockingResponse = await fetch("https://api.dify.ai/v1/chat-messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: enhancedMessage,
        response_mode: "blocking",
        conversation_id: conversation_id || "",
        user: user_id || "anonymous",
      }),
    })

    if (!blockingResponse.ok) {
      const errorText = await blockingResponse.text()
      console.error("Dify API error:", errorText)
      return NextResponse.json({ error: "Failed to get response from AI assistant" }, { status: blockingResponse.status })
    }

    const data = await blockingResponse.json()

    return NextResponse.json({
      message: data.answer || "Saya disini untuk membantu Anda. Apakah bisa diulangi lagi pertanyaannya?",
      conversation_id: data.conversation_id,
      message_id: data.id,
      mode: "blocking",
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
