import { createClient } from "@supabase/supabase-js"
import { PLAYERS, TEAMS, COMPETITIONS } from "../src/lib/data"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
})

async function seed() {
  console.log("⚽ Seeding Supabase...")

  const { error: delPlayers } = await supabase.from("players").delete().neq("id", "")
  if (delPlayers) console.error("Error clearing players:", delPlayers)

  const { error: delTeams } = await supabase.from("teams").delete().neq("id", "")
  if (delTeams) console.error("Error clearing teams:", delTeams)

  const { error: delComps } = await supabase.from("competitions").delete().neq("id", "")
  if (delComps) console.error("Error clearing competitions:", delComps)

  const playersToInsert = PLAYERS.map(p => ({
    id: p.id,
    name: p.name,
    full_name: p.fullName,
    birth_date: p.birthDate,
    nationality: p.nationality,
    position: p.position,
    dominant_foot: p.dominantFoot,
    height: p.height,
    current_club: p.currentClub,
    market_value: p.marketValue,
    career_goals: p.careerGoals,
    career_assists: p.careerAssists,
    caps: p.caps,
    ballon_dors: p.ballonDors,
    world_cups: p.worldCups,
    champions_league: p.championsLeague,
    description: p.description,
    strengths: p.strengths,
    playing_style: p.playingStyle,
  }))

  const { error: errPlayers } = await supabase.from("players").insert(playersToInsert)
  if (errPlayers) { console.error("Error inserting players:", errPlayers); return }
  console.log(`✅ ${PLAYERS.length} players inserted`)

  const teamsToInsert = TEAMS.map(t => ({
    id: t.id,
    name: t.name,
    full_name: t.fullName,
    country: t.country,
    stadium: t.stadium,
    stadium_capacity: t.stadiumCapacity,
    founded_year: t.foundedYear,
    league: t.league,
    manager: t.manager,
    titles_domestic: t.titlesDomestic,
    titles_international: t.titlesInternational,
    description: t.description,
  }))

  const { error: errTeams } = await supabase.from("teams").insert(teamsToInsert)
  if (errTeams) { console.error("Error inserting teams:", errTeams); return }
  console.log(`✅ ${TEAMS.length} teams inserted`)

  const compsToInsert = COMPETITIONS.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    region: c.region,
    founded_year: c.foundedYear,
    current_champion: c.currentChampion,
    most_titles: c.mostTitles,
    most_titles_count: c.mostTitlesCount,
    description: c.description,
  }))

  const { error: errComps } = await supabase.from("competitions").insert(compsToInsert)
  if (errComps) { console.error("Error inserting competitions:", errComps); return }
  console.log(`✅ ${COMPETITIONS.length} competitions inserted`)
  console.log("🎉 Seed complete!")
}

seed()
