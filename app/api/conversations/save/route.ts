import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { conversation_id, user_id, conversation_type, dify_conversation_id, message, title } = await request.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    // Get or create conversation record
    let convId = conversation_id

    if (!convId) {
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id,
          conversation_type,
          dify_conversation_id,
          title: title || `${conversation_type} Conversation - ${new Date().toLocaleDateString()}`,
        })
        .select()
        .single()

      if (convError) {
        console.error("Create conversation error:", convError)
        throw convError
      }
      convId = newConversation.id
    }

    // Save the message
    const { error: messageError } = await supabase.from("conversation_messages").insert({
      conversation_id: convId,
      message_id: message.message_id,
      content: message.content,
      role: message.role,
    })

    if (messageError) {
      console.error("Save message error:", messageError)
      throw messageError
    }

    // Update message count
    const { error: updateError } = await supabase.rpc("increment_message_count", { conv_id: convId })

    if (updateError) {
      console.error("Update count error:", updateError)
    }

    return NextResponse.json({ conversation_id: convId, success: true })
  } catch (error) {
    console.error("Save conversation error:", error)
    return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 })
  }
}
