import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const { data, error } = await supabase
    .from("players")
    .select("id, name, nationality, career_goals, career_assists")
    .order("career_goals", { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ranked = data.map((p, i) => ({
    rank: i + 1,
    id: p.id,
    name: p.name,
    nationality: p.nationality,
    total: (p.career_goals || 0) + (p.career_assists || 0),
    goals: p.career_goals,
    assists: p.career_assists,
  }))

  return NextResponse.json(ranked)
}
