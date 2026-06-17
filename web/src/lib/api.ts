import type { Player, Team, Competition } from "./types"

export async function fetchPlayers(q?: string): Promise<Player[]> {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  params.set("limit", "200")
  const res = await fetch(`/api/players?${params}`)
  if (!res.ok) return []
  return res.json()
}

export async function fetchTeams(q?: string): Promise<Team[]> {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  params.set("limit", "100")
  const res = await fetch(`/api/teams?${params}`)
  if (!res.ok) return []
  return res.json()
}

export async function fetchCompetitions(): Promise<Competition[]> {
  const res = await fetch("/api/competitions")
  if (!res.ok) return []
  return res.json()
}
