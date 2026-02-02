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

    // Try streaming first with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout

    try {
      const difyResponse = await fetch("https://api.dify.ai/v1/chat-messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DIFY_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {},
          query: enhancedMessage,
          response_mode: "streaming",
          conversation_id: conversation_id || "",
          user: user_id || "anonymous",
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!difyResponse.ok) {
        throw new Error(`Dify API returned status ${difyResponse.status}`)
      }

      // Return the streaming response directly
      return new Response(difyResponse.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      })
    } catch (streamError: any) {
      clearTimeout(timeoutId)
      console.log("[v0] Streaming failed, falling back to blocking mode:", streamError.message)

      // Fallback to blocking mode if streaming fails
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
        console.error("Dify API error (blocking mode):", errorText)
        return NextResponse.json({ error: "Failed to get response from AI assistant" }, { status: blockingResponse.status })
      }

      const data = await blockingResponse.json()

      return NextResponse.json({
        message: data.answer || "Saya disini untuk membantu Anda. Apakah bisa diulangi lagi pertanyaannya?",
        conversation_id: data.conversation_id,
        message_id: data.id,
        mode: "blocking",
      })
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
