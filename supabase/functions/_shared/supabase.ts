import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export function corsHeaders(origin?: string) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  };
}

export function jsonResponse(
  data: unknown,
  status = 200,
  origin?: string
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

export function errorResponse(
  message: string,
  status = 400,
  origin?: string
): Response {
  return jsonResponse({ error: message }, status, origin);
}
