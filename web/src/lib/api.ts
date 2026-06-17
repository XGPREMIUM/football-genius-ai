import type { Player, Team, Competition } from "./types"

const TIMEOUT = 8000

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), TIMEOUT)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

export async function fetchPlayers(q?: string): Promise<Player[]> {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  params.set("limit", "200")
  try {
    const res = await fetchWithTimeout(`/api/players?${params}`)
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export async function fetchTeams(q?: string): Promise<Team[]> {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  params.set("limit", "100")
  try {
    const res = await fetchWithTimeout(`/api/teams?${params}`)
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export async function fetchCompetitions(): Promise<Competition[]> {
  try {
    const res = await fetchWithTimeout("/api/competitions")
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}
