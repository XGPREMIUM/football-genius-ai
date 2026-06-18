import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("user_id")
    const sessionId = req.nextUrl.searchParams.get("session_id")

    if (sessionId) {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("session_id", sessionId)
        .single()
      if (error && error.code !== "PGRST116") throw error
      return NextResponse.json(data || null)
    }

    let query = supabase
      .from("chat_sessions")
      .select("session_id, title, mode, created_at, updated_at")
      .order("updated_at", { ascending: false })

    if (userId) {
      query = query.eq("user_id", userId)
    } else {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (e: any) {
    console.error("GET sessions error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session_id, user_id, title, mode } = await req.json()
    if (!session_id) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("chat_sessions")
      .upsert({
        session_id,
        user_id: user_id || null,
        title: title || "New Chat",
        mode: mode || "general",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: any) {
    console.error("POST sessions error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id")
    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 })
    }

    const { error: msgErr } = await supabase
      .from("conversations")
      .delete()
      .eq("session_id", sessionId)
    if (msgErr) throw msgErr

    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("session_id", sessionId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("DELETE sessions error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}