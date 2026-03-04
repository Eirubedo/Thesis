/**
 * get-monev-session
 *
 * Called by Dify to resume or inspect a Monev session mid-conversation.
 * Returns the full monev_sessions row for a given session_id or the most
 * recent in-progress session for a user — enabling Dify to reload all
 * previously captured runtime variables when a conversation is resumed.
 *
 * Query params (GET):
 *   user_id      (required)
 *   session_id   (optional — if omitted, returns the latest in-progress session)
 *   status       (optional filter: "in_progress" | "completed" | "aborted")
 *
 * Returns: { success: true, session: object | null }
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

  if (req.method !== "GET") {
    return errorResponse("Method not allowed. Use GET.", 405, origin);
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    const sessionId = url.searchParams.get("session_id");
    const statusFilter = url.searchParams.get("status");

    if (!userId) {
      return errorResponse("user_id is required", 400, origin);
    }

    const supabase = getSupabaseClient();

    if (sessionId) {
      // Fetch specific session by ID
      const { data, error } = await supabase
        .from("monev_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = row not found — return null gracefully
        return errorResponse(error.message, 500, origin);
      }

      return jsonResponse({ success: true, session: data ?? null }, 200, origin);
    }

    // No session_id — return the most recent session matching status filter
    let query = supabase
      .from("monev_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (statusFilter) {
      query = query.eq("session_status", statusFilter);
    }

    const { data: sessions, error } = await query;

    if (error) {
      return errorResponse(error.message, 500, origin);
    }

    const session = sessions?.[0] ?? null;

    // Also return a flat variables map for direct Dify variable injection
    const variables = session
      ? {
          session_id: session.id,
          kabar_terkini: session.kabar_terkini,
          perkembangan_keluhan: session.perkembangan_keluhan,
          diagnosis_pilihan: session.diagnosis_pilihan,
          diagnosis_queue: session.diagnosis_queue,
          prioritas_diagnosis: session.prioritas_diagnosis,
          kemampuan_baru_dipilih: session.kemampuan_baru_dipilih,
          rencana_mulai: session.rencana_mulai,
          kendala_diperkirakan: session.kendala_diperkirakan,
          solusi_kendala: session.solusi_kendala,
          komitmen: session.komitmen,
          kesimpulan_dipahami: session.kesimpulan_dipahami,
          kesediaan_kembali: session.kesediaan_kembali,
          session_status: session.session_status,
          created_at: session.created_at,
          updated_at: session.updated_at,
        }
      : null;

    return jsonResponse(
      { success: true, session, variables },
      200,
      origin
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
