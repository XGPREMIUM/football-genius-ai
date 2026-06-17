import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")
  const limit = parseInt(searchParams.get("limit") || "50")

  let query = supabase.from("players").select("*").order("name")
  if (q) query = query.or(`name.ilike.%${q}%,nationality.ilike.%${q}%`)
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
