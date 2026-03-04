/**
 * get-monev-context
 *
 * Called by Dify at the START of a Monev session.
 * Returns ALL static context variables from full_assessments (including pola_makan),
 * the user's active diagnoses, the most recent prior monev_session (for continuity),
 * and any existing symptom/ability/action-plan snapshots.
 *
 * Query params:
 *   user_id (required)
 *   conversation_id (optional — if provided, fetches the specific assessment tied to that conversation)
 */

import {
  getSupabaseClient,
  corsHeaders,
  jsonResponse,
  errorResponse,
} from "../_shared/supabase.ts";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? undefined;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    const conversationId = url.searchParams.get("conversation_id");

    if (!userId) {
      return errorResponse("user_id is required", 400, origin);
    }

    const supabase = getSupabaseClient();

    // ── 1. Full assessment (static context variables) ──────────────────────
    let assessmentQuery = supabase
      .from("full_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("assessment_date", { ascending: false })
      .limit(1);

    if (conversationId) {
      assessmentQuery = supabase
        .from("full_assessments")
        .select("*")
        .eq("user_id", userId)
        .eq("conversation_id", conversationId)
        .limit(1);
    }

    const { data: assessments, error: assessmentError } = await assessmentQuery;

    if (assessmentError) {
      return errorResponse(assessmentError.message, 500, origin);
    }

    const assessment = assessments?.[0] ?? null;

    // ── 2. Active diagnoses (for diagnosis_queue + diagnosis_pilihan) ───────
    const { data: diagnoses, error: diagnosesError } = await supabase
      .from("user_diagnoses")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (diagnosesError) {
      return errorResponse(diagnosesError.message, 500, origin);
    }

    // ── 3. Latest prior monev session (for continuity memory) ───────────────
    const { data: priorSessions, error: priorSessionError } = await supabase
      .from("monev_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("session_status", "completed")
      .order("updated_at", { ascending: false })
      .limit(1);

    if (priorSessionError) {
      return errorResponse(priorSessionError.message, 500, origin);
    }

    const priorSession = priorSessions?.[0] ?? null;

    // ── 4. Latest symptom assessment ─────────────────────────────────────────
    const { data: symptomAssessments, error: symptomError } = await supabase
      .from("symptom_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("assessment_date", { ascending: false })
      .limit(1);

    if (symptomError) {
      return errorResponse(symptomError.message, 500, origin);
    }

    const latestSymptoms = symptomAssessments?.[0] ?? null;

    // ── 5. Latest ability assessment ─────────────────────────────────────────
    const { data: abilityAssessments, error: abilityError } = await supabase
      .from("ability_assessments")
      .select("*")
      .eq("user_id", userId)
      .order("assessment_date", { ascending: false })
      .limit(1);

    if (abilityError) {
      return errorResponse(abilityError.message, 500, origin);
    }

    const latestAbilities = abilityAssessments?.[0] ?? null;

    // ── 6. Latest monev action plans ─────────────────────────────────────────
    const { data: actionPlans, error: actionPlansError } = await supabase
      .from("monev_action_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (actionPlansError) {
      return errorResponse(actionPlansError.message, 500, origin);
    }

    // ── 7. Compose Dify-ready context object ─────────────────────────────────
    // All keys map directly to {{variable}} names in the Dify Monev prompt.
    const context = {
      // -- Patient profile
      nama_pasien: assessment?.nama_pasien ?? null,
      usia: assessment?.usia ?? null,
      jenis_kelamin: assessment?.jenis_kelamin ?? null,
      tanggal_lahir: assessment?.tanggal_lahir ?? null,
      pendidikan: assessment?.pendidikan ?? null,
      pekerjaan: assessment?.pekerjaan ?? null,

      // -- Clinical history
      keluhan: assessment?.keluhan ?? null,
      penyakit_fisik: assessment?.penyakit_fisik ?? null,
      upaya_pengobatan: assessment?.upaya_pengobatan ?? null,
      perubahan: assessment?.perubahan ?? null,
      pola_makan: assessment?.pola_makan ?? null,

      // -- Psychological symptoms
      tidur: assessment?.tidur ?? null,
      nafsu_makan: assessment?.nafsu_makan ?? null,
      sakit_kepala: assessment?.sakit_kepala ?? null,
      cemas: assessment?.cemas ?? null,
      gemetar: assessment?.gemetar ?? null,
      gangguan_perut: assessment?.gangguan_perut ?? null,
      mudah_lelah: assessment?.mudah_lelah ?? null,
      anhedonia: assessment?.anhedonia ?? null,
      menangis: assessment?.menangis ?? null,
      menikmati_aktivitas: assessment?.menikmati_aktivitas ?? null,
      hilang_minat: assessment?.hilang_minat ?? null,
      tidak_berharga: assessment?.tidak_berharga ?? null,
      merasa_gagal: assessment?.merasa_gagal ?? null,
      pandangan_diri: assessment?.pandangan_diri ?? null,
      berpikir_jernih: assessment?.berpikir_jernih ?? null,
      perubahan_tubuh: assessment?.perubahan_tubuh ?? null,
      benci_tubuh: assessment?.benci_tubuh ?? null,
      cemas_penampilan: assessment?.cemas_penampilan ?? null,

      // -- Social & spiritual
      hubungan_pasangan: assessment?.hubungan_pasangan ?? null,
      hubungan_orang_tua: assessment?.hubungan_orang_tua ?? null,
      hubungan_saudara: assessment?.hubungan_saudara ?? null,
      hubungan_teman: assessment?.hubungan_teman ?? null,
      hubungan_tetangga: assessment?.hubungan_tetangga ?? null,
      aktivitas_terbengkalai: assessment?.aktivitas_terbengkalai ?? null,
      kegiatan_sosial: assessment?.kegiatan_sosial ?? null,
      motivasi: assessment?.motivasi ?? null,
      ibadah: assessment?.ibadah ?? null,
      keyakinan: assessment?.keyakinan ?? null,
      harapan_ke_depan: assessment?.harapan_ke_depan ?? null,

      // -- Safety indicators
      harapan_mati: assessment?.harapan_mati ?? null,
      pikiran_bunuhdiri: assessment?.pikiran_bunuhdiri ?? null,

      // -- Diagnoses
      diagnoses: diagnoses ?? [],
      diagnosis_queue: diagnoses?.map((d) => d.diagnosis_code) ?? [],
      diagnosis_pilihan: diagnoses?.[0]?.diagnosis_code ?? null,

      // -- Symptom summary
      symptom_summary: latestSymptoms
        ? {
            symptoms_data: latestSymptoms.symptoms_data,
            total_symptoms: latestSymptoms.total_symptoms,
            symptoms_present: latestSymptoms.symptoms_present,
            assessment_date: latestSymptoms.assessment_date,
          }
        : null,

      // -- Ability summary
      ability_summary: latestAbilities
        ? {
            abilities_data: latestAbilities.abilities_data,
            abilities_known: latestAbilities.abilities_known,
            abilities_done: latestAbilities.abilities_done,
            assessment_date: latestAbilities.assessment_date,
          }
        : null,

      // -- Prior Monev session memory (for greeting continuity)
      prior_session: priorSession
        ? {
            kabar_terkini: priorSession.kabar_terkini,
            perkembangan_keluhan: priorSession.perkembangan_keluhan,
            prioritas_diagnosis: priorSession.prioritas_diagnosis,
            kemampuan_baru_dipilih: priorSession.kemampuan_baru_dipilih,
            rencana_mulai: priorSession.rencana_mulai,
            kendala_diperkirakan: priorSession.kendala_diperkirakan,
            solusi_kendala: priorSession.solusi_kendala,
            komitmen: priorSession.komitmen,
            kesimpulan_dipahami: priorSession.kesimpulan_dipahami,
            kesediaan_kembali: priorSession.kesediaan_kembali,
            updated_at: priorSession.updated_at,
          }
        : null,

      // -- Recent action plans
      action_plans: actionPlans ?? [],

      // -- Metadata
      assessment_id: assessment?.id ?? null,
      assessment_date: assessment?.assessment_date ?? null,
    };

    return jsonResponse({ success: true, context }, 200, origin);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
