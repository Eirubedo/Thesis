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

// GET: Fetch daily summaries for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    const limit = parseInt(searchParams.get("limit") || "30")
    const lang = searchParams.get("lang") || "id"

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch existing summaries
    const { data: summaries, error } = await supabase
      .from("daily_summaries")
      .select("*")
      .eq("user_id", userId)
      .order("summary_date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Fetch summaries error:", error)
      // If table doesn't exist, return empty array
      if (error.code === "42P01") {
        return NextResponse.json([])
      }
      throw error
    }

    return NextResponse.json(summaries || [])
  } catch (error) {
    console.error("Daily summary GET error:", error)
    return NextResponse.json({ error: "Failed to fetch summaries" }, { status: 500 })
  }
}

// POST: Generate summary for a specific date
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, date, lang = "id" } = body

    if (!user_id || !date) {
      return NextResponse.json({ error: "User ID and date required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all messages for that date
    const startOfDay = `${date}T00:00:00.000Z`
    const endOfDay = `${date}T23:59:59.999Z`

    const { data: messages, error: messagesError } = await supabase
      .from("conversation_messages")
      .select(`
        content,
        role,
        created_at,
        conversations!inner (
          conversation_type,
          title,
          user_id
        )
      `)
      .eq("conversations.user_id", user_id)
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("Fetch messages error:", messagesError)
      throw messagesError
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages found for this date" }, { status: 404 })
    }

    // Group messages by conversation type
    const messagesByType: Record<string, string[]> = {}
    const conversationTypes: Set<string> = new Set()

    messages.forEach((msg: any) => {
      const type = msg.conversations?.conversation_type || "chat"
      conversationTypes.add(type)
      if (!messagesByType[type]) {
        messagesByType[type] = []
      }
      const roleLabel = msg.role === "user" ? "Pengguna" : "Asisten"
      messagesByType[type].push(`${roleLabel}: ${msg.content}`)
    })

    // Prepare conversation transcript for AI
    let transcript = ""
    Object.entries(messagesByType).forEach(([type, msgs]) => {
      const typeLabel = getTypeLabel(type, lang)
      transcript += `\n--- ${typeLabel} ---\n`
      transcript += msgs.join("\n").substring(0, 3000) // Limit per type
      transcript += "\n"
    })

    // Generate summary using OpenAI
    const systemPrompt = lang === "id" 
      ? `Anda adalah asisten yang merangkum percakapan kesehatan mental. Buatkan ringkasan singkat (2-3 paragraf) dari percakapan hari ini yang mencakup:
1. Topik utama yang dibahas
2. Kondisi atau perasaan pengguna yang terungkap
3. Saran atau informasi penting yang diberikan
4. Poin-poin kesehatan yang perlu diperhatikan

Tulis dalam bahasa Indonesia yang mudah dipahami. Jangan gunakan poin-poin, tulis dalam paragraf yang mengalir.`
      : `You are an assistant summarizing mental health conversations. Create a brief summary (2-3 paragraphs) of today's conversations including:
1. Main topics discussed
2. User's condition or feelings revealed
3. Important advice or information given
4. Health points to note

Write in clear, flowing paragraphs without bullet points.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Ringkaskan percakapan berikut:\n${transcript}` }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const summaryText = completion.choices[0]?.message?.content || ""

    // Extract key topics (simple extraction from summary)
    const keyTopics = extractKeyTopics(summaryText, lang)

    // Upsert the summary
    const { data: summary, error: upsertError } = await supabase
      .from("daily_summaries")
      .upsert({
        user_id,
        summary_date: date,
        summary_text: summaryText,
        conversation_types: Array.from(conversationTypes),
        message_count: messages.length,
        key_topics: keyTopics,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,summary_date",
      })
      .select()
      .single()

    if (upsertError) {
      console.error("Upsert summary error:", upsertError)
      // If table doesn't exist, just return the generated summary
      if (upsertError.code === "42P01") {
        return NextResponse.json({
          summary_date: date,
          summary_text: summaryText,
          conversation_types: Array.from(conversationTypes),
          message_count: messages.length,
          key_topics: keyTopics,
        })
      }
      throw upsertError
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Daily summary POST error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}

function getTypeLabel(type: string, lang: string): string {
  const labels: Record<string, Record<string, string>> = {
    chat: { id: "Chat AI", en: "AI Chat" },
    assessment: { id: "Asesmen Lengkap", en: "Full Assessment" },
    "quick-assessment": { id: "Monitoring & Evaluasi", en: "Monitoring & Evaluation" },
    "knowledge-test": { id: "Tes Pengetahuan", en: "Knowledge Test" },
    education: { id: "Edukasi", en: "Education" },
  }
  return labels[type]?.[lang] || type
}

function extractKeyTopics(text: string, lang: string): string[] {
  // Simple keyword extraction
  const healthKeywords = lang === "id" 
    ? ["hipertensi", "tekanan darah", "obat", "stres", "tidur", "olahraga", "diet", "relaksasi", "kecemasan", "depresi", "napas", "meditasi"]
    : ["hypertension", "blood pressure", "medication", "stress", "sleep", "exercise", "diet", "relaxation", "anxiety", "depression", "breathing", "meditation"]
  
  const topics: string[] = []
  const lowerText = text.toLowerCase()
  
  healthKeywords.forEach(keyword => {
    if (lowerText.includes(keyword.toLowerCase())) {
      topics.push(keyword)
    }
  })
  
  return topics.slice(0, 5) // Max 5 topics
}
