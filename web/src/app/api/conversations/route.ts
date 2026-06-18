import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id")
    const userId = req.nextUrl.searchParams.get("user_id")

    let query = supabase.from("conversations").select("role, content, mode, created_at")

    if (userId) {
      query = query.eq("user_id", userId)
    } else if (sessionId) {
      query = query.eq("session_id", sessionId)
    } else {
      return NextResponse.json({ error: "session_id or user_id is required" }, { status: 400 })
    }

    const { data, error } = await query.order("created_at", { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    console.error("GET conversations error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session_id, user_id, role, content, mode } = await req.json()

    if (!session_id || !role || !content) {
      return NextResponse.json({ error: "session_id, role, and content are required" }, { status: 400 })
    }

    const insertData: any = { session_id, role, content, mode: mode || "general" }
    if (user_id) insertData.user_id = user_id

    const { error } = await supabase
      .from("conversations")
      .insert(insertData)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("POST conversations error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id")
    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("session_id", sessionId)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("DELETE conversations error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
