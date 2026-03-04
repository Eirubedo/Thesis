/**
 * complete-monev-session
 *
 * Called by Dify at the END of a Monev session (after CLOSING phase confirms).
 * This function:
 *   1. Marks the monev_session as "completed"
 *   2. Writes/upserts a monev_action_plan row with the final planning variables
 *   3. Returns the completed session + action plan for Dify to confirm
 *
 * POST body (JSON):
 * {
 *   user_id:               string (required)
 *   session_id:            string (required)
 *   conversation_id:       string (optional)
 *
 *   // Final session closing values
 *   kesimpulan_dipahami:   string
 *   kesediaan_kembali:     string
 *
 *   // Action plan to persist
 *   diagnosis_code:        string
 *   new_ability_text:      string
 *   new_ability_id:        number (optional)
 *   rencana_mulai:         string  (ISO date string e.g. "2025-03-10")
 *   scheduled_time:        string  (HH:MM e.g. "08:00")
 *   frequency:             string  (e.g. "setiap hari")
 *   anticipated_barriers:  string
 *   proposed_solutions:    string
 *   komitmen:              string  (e.g. "ya" | "tidak")
 * }
 *
 * Returns: { success: true, session: object, action_plan: object }
 */

import {
  getSupabaseClient,
  corsHeaders,
  jsonResponse,
  errorResponse,
} from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? undefined;

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed. Use POST.", 405, origin);
  }

  try {
    const body = await req.json();
    const { user_id, session_id, conversation_id } = body;

    if (!user_id || !session_id) {
      return errorResponse("user_id and session_id are required", 400, origin);
    }

    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    // ── 1. Mark monev_session as completed ───────────────────────────────────
    const sessionUpdate: Record<string, unknown> = {
      session_status: "completed",
      updated_at: now,
    };

    if (body.kesimpulan_dipahami !== undefined) {
      sessionUpdate.kesimpulan_dipahami = body.kesimpulan_dipahami;
    }
    if (body.kesediaan_kembali !== undefined) {
      sessionUpdate.kesediaan_kembali = body.kesediaan_kembali;
    }

    const { data: completedSession, error: sessionError } = await supabase
      .from("monev_sessions")
      .update(sessionUpdate)
      .eq("id", session_id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (sessionError) {
      return errorResponse(sessionError.message, 500, origin);
    }

    // ── 2. Upsert monev_action_plan ───────────────────────────────────────────
    // Only create an action plan if a diagnosis_code is provided
    let actionPlan = null;

    if (body.diagnosis_code) {
      const actionPlanPayload: Record<string, unknown> = {
        user_id,
        conversation_id: conversation_id ?? completedSession.conversation_id,
        diagnosis_code: body.diagnosis_code,
        status: "active",
        created_at: now,
        updated_at: now,
      };

      if (body.new_ability_text !== undefined) {
        actionPlanPayload.new_ability_text = body.new_ability_text;
      }
      if (body.new_ability_id !== undefined) {
        actionPlanPayload.new_ability_id = body.new_ability_id;
      }
      if (body.rencana_mulai !== undefined) {
        actionPlanPayload.start_date = body.rencana_mulai;
      }
      if (body.scheduled_time !== undefined) {
        actionPlanPayload.scheduled_time = body.scheduled_time;
      }
      if (body.frequency !== undefined) {
        actionPlanPayload.frequency = body.frequency;
      }
      if (body.anticipated_barriers !== undefined) {
        actionPlanPayload.anticipated_barriers = body.anticipated_barriers;
      }
      if (body.proposed_solutions !== undefined) {
        actionPlanPayload.proposed_solutions = body.proposed_solutions;
      }
      if (body.komitmen !== undefined) {
        // Store komitmen as completion_rate proxy: "ya" = 100, otherwise 0
        actionPlanPayload.completion_rate =
          String(body.komitmen).toLowerCase() === "ya" ? 100 : 0;
      }

      const { data: plan, error: planError } = await supabase
        .from("monev_action_plans")
        .insert(actionPlanPayload)
        .select()
        .single();

      if (planError) {
        // Non-fatal: log the error but still return the completed session
        console.error("[complete-monev-session] action plan insert error:", planError.message);
      } else {
        actionPlan = plan;
      }
    }

    // ── 3. Update assessment_progress to reflect Monev completion ────────────
    if (conversation_id) {
      await supabase
        .from("assessment_progress")
        .update({
          status: "completed",
          completed_at: now,
          updated_at: now,
        })
        .eq("conversation_id", conversation_id)
        .eq("user_id", user_id)
        .eq("assessment_type", "monev");
    }

    return jsonResponse(
      {
        success: true,
        session: completedSession,
        action_plan: actionPlan,
      },
      200,
      origin
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
