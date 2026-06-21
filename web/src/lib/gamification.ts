import { supabase } from "./supabase"

export interface UserProgress {
  xp: number
  level: number
  streak: number
  title: string
}

const LEVEL_XP_BASE = 300 // XP needed for level 1 -> 2. Scales up by level.

export function getXpRequiredForLevel(level: number): number {
  return level * LEVEL_XP_BASE
}

export function getTitleForLevel(level: number): string {
  if (level <= 1) return "Aficionado de Sillón 📺"
  if (level <= 3) return "Ojeador Amateur 🔍"
  if (level <= 5) return "Scout de Cantera 🌟"
  if (level <= 7) return "Segundo Entrenador 📋"
  if (level <= 9) return "Director Deportivo 👔"
  if (level <= 12) return "Mánager UEFA PRO 🧠"
  return "Maldini Legend 🏆"
}

// Local fallback methods for anonymous users
export function getLocalProgress(): UserProgress {
  if (typeof window === "undefined") {
    return { xp: 0, level: 1, streak: 0, title: getTitleForLevel(1) }
  }
  const xp = parseInt(localStorage.getItem("fg_xp") || "0")
  const level = parseInt(localStorage.getItem("fg_level") || "1")
  const streak = parseInt(localStorage.getItem("fg_streak") || "0")
  return {
    xp,
    level,
    streak,
    title: getTitleForLevel(level)
  }
}

export function saveLocalProgress(xp: number, level: number, streak: number) {
  if (typeof window === "undefined") return
  localStorage.setItem("fg_xp", xp.toString())
  localStorage.setItem("fg_level", level.toString())
  localStorage.setItem("fg_streak", streak.toString())
}

// Global/Unified fetcher
export async function fetchProgress(userId?: string): Promise<UserProgress> {
  if (!userId) {
    return getLocalProgress()
  }

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("xp, level, streak")
      .eq("user_id", userId)
      .single()

    if (data && !error) {
      return {
        xp: data.xp,
        level: data.level,
        streak: data.streak,
        title: getTitleForLevel(data.level)
      }
    } else {
      // Create profile in Supabase if it doesn't exist
      const local = getLocalProgress()
      await supabase.from("user_profiles").insert({
        user_id: userId,
        xp: local.xp,
        level: local.level,
        streak: local.streak
      })
      return local
    }
  } catch {
    return getLocalProgress()
  }
}

// Add XP logic
export async function addExperience(amount: number, userId?: string): Promise<UserProgress & { leveledUp: boolean }> {
  let progress = await fetchProgress(userId)
  let newXp = progress.xp + amount
  let newLevel = progress.level
  let leveledUp = false

  while (newXp >= getXpRequiredForLevel(newLevel)) {
    newXp -= getXpRequiredForLevel(newLevel)
    newLevel += 1
    leveledUp = true
  }

  if (userId) {
    try {
      await supabase
        .from("user_profiles")
        .upsert({
          user_id: userId,
          xp: newXp,
          level: newLevel,
          streak: progress.streak,
          updated_at: new Date().toISOString()
        })
    } catch (err) {
      console.error("Failed to save progress in DB, using fallback", err)
    }
  }

  // Always save locally to keep local storage in sync
  saveLocalProgress(newXp, newLevel, progress.streak)

  return {
    xp: newXp,
    level: newLevel,
    streak: progress.streak,
    title: getTitleForLevel(newLevel),
    leveledUp
  }
}
