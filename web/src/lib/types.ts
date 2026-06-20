export interface Player {
  id: string
  name: string
  fullName: string
  birthDate: string
  nationality: string
  position: string
  dominantFoot: string
  height: number
  currentClub: string | null
  marketValue: string
  careerGoals: number
  careerAssists: number
  caps: number
  ballonDors: number
  worldCups: number
  championsLeague: number
  description: string
  strengths: string
  playingStyle: string
}

export interface Team {
  id: string
  name: string
  fullName: string
  country: string
  stadium: string
  stadiumCapacity: number
  foundedYear: number
  league: string
  manager: string
  titlesDomestic: number
  titlesInternational: number
  description: string
}

export interface Competition {
  id: string
  name: string
  type: string
  region: string
  foundedYear: number
  currentChampion: string
  mostTitles: string
  mostTitlesCount: number
  description: string
}

export type Mode = 
  | "general" 
  | "scout" 
  | "tactical" 
  | "sporting_director" 
  | "transfer_market" 
  | "journalist" 
  | "statistician" 
  | "goat" 
  | "encyclopedia" 
  | "content_creator" 
  | "coach" 
  | "talent_detector"
  | "fantasy_manager"
  | "referee"

export interface ModeInfo {
  id: Mode
  icon: string
  name: string
  description: string
}

export interface Message {
  role: "user" | "assistant"
  content: string
  mode?: Mode
}
