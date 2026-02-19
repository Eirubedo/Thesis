import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return Response.json({ error: "user_id is required" }, { status: 400 })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from("conversations")
      .select("started_at, message_count")
      .eq("user_id", userId)
      .gte("started_at", thirtyDaysAgo.toISOString())
      .order("started_at", { ascending: true })

    if (error) {
      console.error("Error fetching conversations:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Group conversations by day
    const groupedByDay: { [key: string]: { count: number; messages: number } } = {}
    
    if (data && data.length > 0) {
      data.forEach((conv: any) => {
        const date = new Date(conv.started_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
        if (!groupedByDay[date]) {
          groupedByDay[date] = { count: 0, messages: 0 }
        }
        groupedByDay[date].count += 1
        groupedByDay[date].messages += conv.message_count || 0
      })
    }

    const chartData = Object.entries(groupedByDay).map(([date, data]) => ({
      date,
      sessions: data.count,
      messages: data.messages,
    }))

    return Response.json(chartData, {
      headers: {
        "Cache-Control": "max-age=0, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error in chat activity API:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
