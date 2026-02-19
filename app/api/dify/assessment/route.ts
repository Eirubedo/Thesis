import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { getNextVariable, shouldAskVariable, getPhaseProgress } from "@/lib/aski-variable-tracker"
import type { AskiVariable } from "@/lib/aski-variable-tracker"

const DIFY_ASSESSMENT_TOKEN =
  process.env.DIFY_ASSESSMENT_API_KEY || process.env.DIFY_API_KEY || process.env.DIFY_EDU_API_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_id, user_id, variable, value } = await request.json()

    if (!DIFY_ASSESSMENT_TOKEN) {
      return NextResponse.json({ error: "Dify Assessment API key not configured" }, { status: 500 })
    }

    // If a variable capture is provided, update the state first
    if (variable && value !== undefined) {
      const supabase = createClient()

      const { data: currentState, error: getError } = await supabase
        .from("aski_assessment_state")
        .select("*")
        .eq("user_id", user_id)
        .eq("conversation_id", conversation_id)
        .single()

      if (getError && getError.code !== "PGRST116") {
        console.error("Error fetching assessment state:", getError)
      }

      if (currentState) {
        const updatedVars = {
          ...currentState.captured_variables,
          [variable]: value,
        }

        const nextPhase = currentState.current_phase
        const nextVariable = getNextVariable(nextPhase, updatedVars)

        // Update the state with the captured variable
        await supabase
          .from("aski_assessment_state")
          .update({
            captured_variables: updatedVars,
            current_variable: nextVariable,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user_id)
          .eq("conversation_id", conversation_id)
      }
    }

    // Pass captured variables context to Dify for better conversation flow
    let capturedVariablesContext = ""
    if (variable && value) {
      capturedVariablesContext = `\n[Variable captured: {{${variable}}}: ${value}]`
    }

    const difyResponse = await fetch("https://api.dify.ai/v1/chat-messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_ASSESSMENT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: message + capturedVariablesContext,
        response_mode: "blocking",
        conversation_id: conversation_id || "",
        user: user_id || "anonymous",
      }),
    })

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text()
      console.error("Dify Assessment API error:", errorText)
      return NextResponse.json({ error: "Failed to get response from AI assistant" }, { status: difyResponse.status })
    }

    const data = await difyResponse.json()

    return NextResponse.json({
      message: data.answer || "Saya di sini untuk membantu asesmen Anda.",
      conversation_id: data.conversation_id,
      message_id: data.id,
    })
  } catch (error) {
    console.error("Assessment Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
