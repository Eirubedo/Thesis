import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    const conversation_type = searchParams.get("type")

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    let query = supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_archived", false)
      .order("started_at", { ascending: false })

    if (conversation_type) {
      query = query.eq("conversation_type", conversation_type)
    }

    const { data, error } = await query

    if (error) {
      console.error("Fetch conversations error:", error)
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("List conversations error:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}
