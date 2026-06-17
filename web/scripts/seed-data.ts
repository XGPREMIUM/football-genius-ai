import { createClient } from "@supabase/supabase-js"
import { PLAYERS, TEAMS, COMPETITIONS } from "../src/lib/data"

const supabase = createClient(
  "https://kbckildmtvlisfdaqega.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiY2tpbGRtdHZsaXNmZGFxZWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY1MTA4OCwiZXhwIjoyMDk3MjI3MDg4fQ.mEs2QzqQBHs2IHBtPvvQUn2TU42PJmhmbZOZ4LuIyHU",
  { auth: { persistSession: false } }
)

async function seed() {
  console.log("Seeding data...")

  // Clear existing data
  await supabase.from("players").delete().neq("id", "")
  await supabase.from("teams").delete().neq("id", "")
  await supabase.from("competitions").delete().neq("id", "")
  console.log("Cleared existing data")

  // Insert players in batches of 10
  const batchSize = 10
  for (let i = 0; i < PLAYERS.length; i += batchSize) {
    const batch = PLAYERS.slice(i, i + batchSize).map(p => ({
      id: p.id, name: p.name, full_name: p.fullName,
      birth_date: p.birthDate, nationality: p.nationality,
      position: p.position, dominant_foot: p.dominantFoot,
      height: p.height, current_club: p.currentClub,
      market_value: p.marketValue, career_goals: p.careerGoals,
      career_assists: p.careerAssists, caps: p.caps,
      ballon_dors: p.ballonDors, world_cups: p.worldCups,
      champions_league: p.championsLeague, description: p.description,
      strengths: p.strengths, playing_style: p.playingStyle,
    }))
    const { error } = await supabase.from("players").insert(batch)
    if (error) { console.error("Player insert error:", error); return }
    console.log(`  Players ${i + 1}-${i + batch.length}/${PLAYERS.length}`)
  }

  // Insert teams
  for (let i = 0; i < TEAMS.length; i += batchSize) {
    const batch = TEAMS.slice(i, i + batchSize).map(t => ({
      id: t.id, name: t.name, full_name: t.fullName,
      country: t.country, stadium: t.stadium,
      stadium_capacity: t.stadiumCapacity, founded_year: t.foundedYear,
      league: t.league, manager: t.manager,
      titles_domestic: t.titlesDomestic,
      titles_international: t.titlesInternational,
      description: t.description,
    }))
    const { error } = await supabase.from("teams").insert(batch)
    if (error) { console.error("Team insert error:", error); return }
  }
  console.log(`✅ ${TEAMS.length} teams`)

  // Insert competitions
  const comps = COMPETITIONS.map(c => ({
    id: c.id, name: c.name, type: c.type, region: c.region,
    founded_year: c.foundedYear, current_champion: c.currentChampion,
    most_titles: c.mostTitles, most_titles_count: c.mostTitlesCount,
    description: c.description,
  }))
  const { error: compError } = await supabase.from("competitions").insert(comps)
  if (compError) { console.error("Comp insert error:", compError); return }
  console.log(`✅ ${COMPETITIONS.length} competitions`)

  console.log("🎉 Seed complete!")
}

seed()
