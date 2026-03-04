/**
 * upsert-monev-session
 *
 * Called by Dify at ANY point during a Monev session to write or update
 * runtime variables in monev_sessions. Supports partial updates — only the
 * fields present in the request body will be written (all others preserved).
 *
 * This is the primary "memory write" endpoint. Dify should call it:
 *   - After the GREETING phase  → write kabar_terkini, perkembangan_keluhan
 *   - After SELECTION phase     → write diagnosis_pilihan, diagnosis_queue
 *   - After each PLANNING loop  → write planning variables
 *   - After CLOSING phase       → write kesimpulan_dipahami, kesediaan_kembali
 *
 * POST body (JSON):
 * {
 *   user_id:               string (required)
 *   conversation_id:       string (optional)
 *   session_id:            string (optional — if omitted, a new session is created)
 *
 *   // GREETING
 *   kabar_terkini:         string
 *   perkembangan_keluhan:  string
 *
 *   // SELECTION
 *   diagnosis_pilihan:     string
 *   diagnosis_queue:       array | string (JSON string accepted)
 *
 *   // PLANNING
 *   prioritas_diagnosis:   string
 *   kemampuan_baru_dipilih: string
 *   rencana_mulai:         string
 *   kendala_diperkirakan:  string
 *   solusi_kendala:        string
 *   komitmen:              string
 *
 *   // CLOSING
 *   kesimpulan_dipahami:   string
 *   kesediaan_kembali:     string
 *
 *   // Optional session control
 *   session_status:        "in_progress" | "completed" | "aborted"
 * }
 *
 * Returns: { success: true, session_id: string, session: object }
 */

import {
  getSupabaseClient,
  corsHeaders,
  jsonResponse,
  errorResponse,
} from "../_shared/supabase.ts";

// Fields that are allowed to be written to monev_sessions
const ALLOWED_FIELDS = [
  "kabar_terkini",
  "perkembangan_keluhan",
  "diagnosis_pilihan",
  "diagnosis_queue",
  "prioritas_diagnosis",
  "kemampuan_baru_dipilih",
  "rencana_mulai",
  "kendala_diperkirakan",
  "solusi_kendala",
  "komitmen",
  "kesimpulan_dipahami",
  "kesediaan_kembali",
  "session_status",
] as const;

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? undefined;

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST" && req.method !== "PATCH") {
    return errorResponse("Method not allowed. Use POST or PATCH.", 405, origin);
  }

  try {
    const body = await req.json();
    const { user_id, conversation_id, session_id } = body;

    if (!user_id) {
      return errorResponse("user_id is required", 400, origin);
    }

    const supabase = getSupabaseClient();

    // Build the update payload from only allowed fields present in body
    const payload: Record<string, unknown> = {
      user_id,
      updated_at: new Date().toISOString(),
    };

    if (conversation_id) {
      payload.conversation_id = conversation_id;
    }

    for (const field of ALLOWED_FIELDS) {
      if (field in body && body[field] !== undefined) {
        // diagnosis_queue can arrive as a JSON string from Dify — parse it
        if (field === "diagnosis_queue" && typeof body[field] === "string") {
          try {
            payload[field] = JSON.parse(body[field]);
          } catch {
            payload[field] = body[field]; // leave as-is if not valid JSON
          }
        } else {
          payload[field] = body[field];
        }
      }
    }

    let sessionData;
    let sessionError;

    if (session_id) {
      // Update existing session (partial update — only provided fields)
      const { data, error } = await supabase
        .from("monev_sessions")
        .update(payload)
        .eq("id", session_id)
        .eq("user_id", user_id) // ownership check
        .select()
        .single();

      sessionData = data;
      sessionError = error;
    } else {
      // Create a new session
      payload.session_status = payload.session_status ?? "in_progress";

      const { data, error } = await supabase
        .from("monev_sessions")
        .insert(payload)
        .select()
        .single();

      sessionData = data;
      sessionError = error;
    }

    if (sessionError) {
      return errorResponse(sessionError.message, 500, origin);
    }

    return jsonResponse(
      {
        success: true,
        session_id: sessionData.id,
        session: sessionData,
      },
      200,
      origin
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
