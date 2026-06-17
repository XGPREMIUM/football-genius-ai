import { NextRequest, NextResponse } from "next/server"
import { askAgent } from "@/lib/agent"

export async function POST(req: NextRequest) {
  try {
    const { query, mode, history } = await req.json()

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const response = await askAgent(query, mode || "general", history || [])
    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Error al procesar la consulta. Intenta de nuevo." },
      { status: 500 }
    )
  }
}
