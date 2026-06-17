import { NextRequest, NextResponse } from "next/server"
import { askAgent } from "@/lib/agent"

export async function POST(req: NextRequest) {
  try {
    const { query, mode, history } = await req.json()

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const origin = req.headers.get("origin") || req.headers.get("referer") || undefined
    const response = await askAgent(query, mode || "general", history || [], origin)
    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("Chat API error:", error)
    const msg = error?.message || "Error desconocido"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
