import { createClient } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"
import {
  getNextVariable,
  shouldAskVariable,
  captureVariable,
  getPhaseProgress,
  type AskiVariable,
} from "@/lib/aski-variable-tracker"

// GET - Retrieve Aski assessment state for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    const conversation_id = searchParams.get("conversation_id")

    if (!user_id || !conversation_id) {
      return NextResponse.json(
        { error: "user_id and conversation_id are required" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from("aski_assessment_state")
      .select("*")
      .eq("user_id", user_id)
      .eq("conversation_id", conversation_id)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no state exists, initialize it
    if (!data) {
      const newState = {
        user_id,
        conversation_id,
        current_phase: "orientation",
        captured_variables: {},
        current_variable: null,
      }

      const { data: created, error: createError } = await supabase
        .from("aski_assessment_state")
        .insert(newState)
        .select()
        .single()

      if (createError) {
        console.error("Error creating assessment state:", createError)
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      // Determine first variable to ask
      const firstVar = getNextVariable("orientation", {})
      return NextResponse.json({
        state: {
          ...created,
          current_variable: firstVar,
        },
      })
    }

    // Determine next variable if current is null
    if (!data.current_variable) {
      const nextVar = getNextVariable(data.current_phase, data.captured_variables)
      data.current_variable = nextVar
    }

    return NextResponse.json({ state: data })
  } catch (error) {
    console.error("Aski assessment state API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Update captured variable and get next variable to ask
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, conversation_id, variable, value, phase } = body

    if (!user_id || !conversation_id || !variable) {
      return NextResponse.json(
        { error: "user_id, conversation_id, and variable are required" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get current state
    const { data: currentState, error: getError } = await supabase
      .from("aski_assessment_state")
      .select("*")
      .eq("user_id", user_id)
      .eq("conversation_id", conversation_id)
      .single()

    if (getError && getError.code !== "PGRST116") {
      console.error("Database error:", getError)
      return NextResponse.json({ error: getError.message }, { status: 500 })
    }

    // Initialize state if doesn't exist
    let state = currentState || {
      user_id,
      conversation_id,
      current_phase: phase || "orientation",
      captured_variables: {},
      current_variable: variable,
    }

    // Capture the variable
    const updatedVars = captureVariable(
      variable as AskiVariable,
      value,
      state.captured_variables || {}
    )

    // Determine next variable
    let nextPhase = state.current_phase
    let nextVariable = getNextVariable(nextPhase, updatedVars)

    // If no more variables in current phase, move to next phase
    if (!nextVariable) {
      const phases = ["orientation", "interaksi", "screening", "cssrs", "insight", "closing"]
      const currentPhaseIndex = phases.indexOf(nextPhase)
      if (currentPhaseIndex < phases.length - 1) {
        nextPhase = phases[currentPhaseIndex + 1]
        nextVariable = getNextVariable(nextPhase, updatedVars)
      }
    }

    // Update state in database
    const updatePayload = {
      captured_variables: updatedVars,
      current_phase: nextPhase,
      current_variable: nextVariable,
      updated_at: new Date().toISOString(),
    }

    let result
    if (currentState) {
      // Update existing
      result = await supabase
        .from("aski_assessment_state")
        .update(updatePayload)
        .eq("user_id", user_id)
        .eq("conversation_id", conversation_id)
        .select()
        .single()
    } else {
      // Insert new
      result = await supabase
        .from("aski_assessment_state")
        .insert({ ...state, ...updatePayload })
        .select()
        .single()
    }

    if (result.error) {
      console.error("Error updating assessment state:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    // Get phase progress
    const progress = getPhaseProgress(nextPhase, updatedVars)

    return NextResponse.json({
      state: result.data,
      captured_variable: variable,
      captured_value: value,
      next_variable: nextVariable,
      next_phase: nextPhase,
      phase_progress: progress,
    })
  } catch (error) {
    console.error("Aski assessment state API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update safety status or phase
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, conversation_id, is_high_risk, safety_acknowledged, current_phase } = body

    if (!user_id || !conversation_id) {
      return NextResponse.json(
        { error: "user_id and conversation_id are required" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    }

    if (is_high_risk !== undefined) updatePayload.is_high_risk = is_high_risk
    if (safety_acknowledged !== undefined) updatePayload.safety_acknowledged = safety_acknowledged
    if (current_phase) updatePayload.current_phase = current_phase

    const { data, error } = await supabase
      .from("aski_assessment_state")
      .update(updatePayload)
      .eq("user_id", user_id)
      .eq("conversation_id", conversation_id)
      .select()
      .single()

    if (error) {
      console.error("Error updating assessment state:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ state: data })
  } catch (error) {
    console.error("Aski assessment state API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
