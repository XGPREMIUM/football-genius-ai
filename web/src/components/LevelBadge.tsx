"use client"

import { getXpRequiredForLevel } from "@/lib/gamification"

interface LevelBadgeProps {
  xp: number
  level: number
  title: string
}

export default function LevelBadge({ xp, level, title }: LevelBadgeProps) {
  const reqXp = getXpRequiredForLevel(level)
  const pct = Math.min(100, Math.round((xp / reqXp) * 100))

  return (
    <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-1.5 hover:border-amber-500/30 transition-all select-none group">
      {/* Level Shield badge */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-black font-black text-sm shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
        {level}
      </div>

      {/* Progress & Title */}
      <div className="flex flex-col min-w-[100px] sm:min-w-[130px]">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-tight">
          <span className="text-amber-400 truncate max-w-[85px] sm:max-w-[110px]" title={title}>{title}</span>
          <span className="text-text-secondary">{xp}/{reqXp} XP</span>
        </div>
        
        {/* Progress bar background */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
