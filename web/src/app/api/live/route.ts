import { NextResponse } from "next/server"
import { fetchLiveData } from "@/lib/live-data"

export async function GET() {
  try {
    const data = await fetchLiveData()
    return NextResponse.json(data)
  } catch (e: any) {
    console.error("GET /api/live error:", e)
    return NextResponse.json({ news: [], matches: [], updatedAt: new Date().toISOString(), error: e.message })
  }
}