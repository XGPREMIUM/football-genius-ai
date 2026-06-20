"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Player } from "@/lib/types"

interface PlayerCardProps {
  playerId: string
  t: any
}

export default function PlayerCard({ playerId, t }: PlayerCardProps) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPlayer() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .eq("id", playerId)
          .single()
        if (data && !error) {
          setPlayer(data)
        }
      } catch (err) {
        console.error("Error loading player for card:", err)
      } finally {
        setLoading(false)
      }
    }
    if (playerId) loadPlayer()
  }, [playerId])

  if (loading) {
    return (
      <div className="w-full max-w-2xl bg-gray-900/40 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 animate-pulse my-3">
        <div className="w-48 h-72 rounded-2xl bg-gray-800/50 shrink-0" />
        <div className="flex-1 space-y-4 py-2">
          <div className="h-6 bg-gray-800/50 rounded w-3/4" />
          <div className="h-4 bg-gray-800/50 rounded w-1/2" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="h-10 bg-gray-800/50 rounded" />
            <div className="h-10 bg-gray-800/50 rounded" />
          </div>
          <div className="h-20 bg-gray-800/50 rounded pt-4" />
        </div>
      </div>
    )
  }

  if (!player) return null

  // Deterministic ratings
  const stats = getRadarStats(player)
  const overall = Math.round((stats.attack + stats.creation + stats.physical + stats.defense + stats.tactical + stats.mental) / 6)

  // Radar chart SVG config
  const cx = 100
  const cy = 100
  const r = 65
  const points = [
    { label: "ATA", val: stats.attack, angle: 0 },
    { label: "CRE", val: stats.creation, angle: 60 },
    { label: "FÍS", val: stats.physical, angle: 120 },
    { label: "DEF", val: stats.defense, angle: 180 },
    { label: "TÁC", val: stats.tactical, angle: 240 },
    { label: "MEN", val: stats.mental, angle: 300 },
  ]

  // Get SVG coordinate helper
  const getCoords = (value: number, angleDegrees: number) => {
    const angleRad = (angleDegrees - 90) * (Math.PI / 180)
    const distance = (value / 100) * r
    const x = cx + distance * Math.cos(angleRad)
    const y = cy + distance * Math.sin(angleRad)
    return { x, y }
  }

  // Draw polygon paths
  const webPaths = [20, 40, 60, 80, 100].map((level) => {
    return points.map(p => {
      const { x, y } = getCoords(level, p.angle)
      return `${x},${y}`
    }).join(" ")
  })

  const playerPath = points.map(p => {
    const { x, y } = getCoords(p.val, p.angle)
    return `${x},${y}`
  }).join(" ")

  return (
    <div className="w-full max-w-2xl bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row gap-6 my-4 select-none">
      {/* Visual EA FC Style Card */}
      <div className="w-44 sm:w-48 mx-auto md:mx-0 shrink-0 relative flex justify-center">
        <div className="w-44 h-68 rounded-2xl bg-gradient-to-b from-amber-500/20 via-yellow-500/5 to-gray-900 border-2 border-amber-500/40 relative shadow-lg flex flex-col p-4 overflow-hidden group">
          {/* Card background styling */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent opacity-60" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            {/* Header: Rating & Position */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-amber-400 tracking-tighter leading-none">{overall}</span>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-1">
                  {getShortPosition(player.position)}
                </span>
              </div>
              <span className="text-xl">⚽</span>
            </div>

            {/* Middle: Player Name */}
            <div className="text-center my-3">
              <div className="text-lg font-black text-text-primary tracking-tight truncate uppercase leading-tight">
                {player.name}
              </div>
              <div className="text-[9px] font-bold text-amber-500/80 tracking-wider truncate uppercase mt-0.5">
                {player.nationality}
              </div>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 border-t border-gray-800/80 pt-2 text-[10px] font-semibold text-gray-400">
              <div className="flex justify-between"><span>GOL:</span><span className="text-text-primary">{player.careerGoals || 0}</span></div>
              <div className="flex justify-between"><span>AST:</span><span className="text-text-primary">{player.careerAssists || 0}</span></div>
              <div className="flex justify-between"><span>SELE:</span><span className="text-text-primary">{player.caps || 0}</span></div>
              <div className="flex justify-between"><span>CL:</span><span className="text-text-primary">{player.championsLeague || 0}</span></div>
            </div>

            {/* Footer: Club */}
            <div className="border-t border-gray-800/80 pt-2 mt-2 text-center text-[10px] font-bold text-gray-500 truncate uppercase">
              🏟️ {player.currentClub || "Sin equipo"}
            </div>
          </div>
        </div>
      </div>

      {/* Attributes & Radar Chart */}
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-black tracking-tight text-white">{player.fullName}</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            👣 {player.dominantFoot === "left" ? "Izquierdo" : "Derecho"} · 📏 {player.height ? `${player.height / 100}m` : "N/A"} · 💰 {player.marketValue || "S/D"}
          </p>
        </div>

        {/* Radar Graph and attributes list */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* SVG Radar Chart */}
          <div className="w-40 h-40 shrink-0 relative">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Grid Webs */}
              {webPaths.map((path, idx) => (
                <polygon
                  key={idx}
                  points={path}
                  fill="none"
                  stroke="#374151"
                  strokeWidth="0.5"
                  strokeDasharray={idx === 4 ? "none" : "2,2"}
                />
              ))}

              {/* Spider Grid Lines */}
              {points.map((p, idx) => {
                const outer = getCoords(100, p.angle)
                return (
                  <line
                    key={idx}
                    x1={cx}
                    y1={cy}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#374151"
                    strokeWidth="0.5"
                  />
                )
              })}

              {/* Value Polygon */}
              <polygon
                points={playerPath}
                fill="rgba(245, 158, 11, 0.25)"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />

              {/* Data points */}
              {points.map((p, idx) => {
                const coord = getCoords(p.val, p.angle)
                return (
                  <circle
                    key={idx}
                    cx={coord.x}
                    cy={coord.y}
                    r="2.5"
                    fill="#f59e0b"
                  />
                )
              })}

              {/* Labels */}
              {points.map((p, idx) => {
                const offset = 12
                const angleRad = (p.angle - 90) * (Math.PI / 180)
                const x = cx + (r + offset) * Math.cos(angleRad)
                const y = cy + (r + offset) * Math.sin(angleRad) + 3 // small vert adjust
                return (
                  <text
                    key={idx}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="9"
                    fontWeight="bold"
                    className="font-mono"
                  >
                    {p.label}
                  </text>
                )
              })}
            </svg>
          </div>

          {/* Attributes breakdown with rating scale */}
          <div className="flex-1 w-full grid grid-cols-2 gap-2 text-xs font-semibold">
            {points.map((p) => (
              <div key={p.label} className="bg-gray-900/60 border border-gray-800/40 rounded-xl p-2 flex items-center justify-between">
                <span className="text-gray-500 font-mono">{p.label}</span>
                <span className={`text-sm font-black ${p.val >= 85 ? "text-emerald-400" : p.val >= 75 ? "text-amber-400" : "text-gray-300"}`}>
                  {p.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Short tactical bio */}
        <div className="text-xs text-text-secondary leading-relaxed border-t border-gray-800/50 pt-3">
          <strong>Estilo: </strong>{player.playingStyle || "Estilo técnico no registrado."}
          {player.strengths && <div className="mt-1"><strong>Fortalezas: </strong>{player.strengths}</div>}
        </div>
      </div>
    </div>
  )
}

function getShortPosition(pos: string): string {
  const p = (pos || "").toLowerCase()
  if (p.includes("portero") || p.includes("goalkeeper")) return "POR"
  if (p.includes("central") || p.includes("defensa central")) return "DFC"
  if (p.includes("lateral derecho") || p.includes("right back")) return "LD"
  if (p.includes("lateral izquierdo") || p.includes("left back")) return "LI"
  if (p.includes("defensa") || p.includes("defender")) return "DEF"
  if (p.includes("pivote") || p.includes("defensivo")) return "MCD"
  if (p.includes("centrocampista") || p.includes("midfielder")) return "MC"
  if (p.includes("mediapunta") || p.includes("attacking midfielder")) return "MCO"
  if (p.includes("extremo derecho") || p.includes("right winger")) return "ED"
  if (p.includes("extremo izquierdo") || p.includes("left winger")) return "EI"
  if (p.includes("delantero") || p.includes("striker") || p.includes("forward")) return "DC"
  return "MC"
}

function getRadarStats(p: Player) {
  const pos = (p.position || "").toLowerCase()
  
  let attack = 50
  let creation = 50
  let physical = 60
  let defense = 40
  let tactical = 55
  let mental = 50

  if (pos.includes("delantero") || pos.includes("forward") || pos.includes("striker") || pos.includes("extremo")) {
    attack = 80 + Math.min(19, Math.floor((p.careerGoals || 0) / 30))
    creation = 60 + Math.min(35, Math.floor((p.careerAssists || 0) / 10))
    defense = 25 + Math.min(15, p.championsLeague * 3)
  } else if (pos.includes("centrocampista") || pos.includes("midfielder") || pos.includes("volante")) {
    attack = 55 + Math.min(25, Math.floor((p.careerGoals || 0) / 20))
    creation = 75 + Math.min(20, Math.floor((p.careerAssists || 0) / 8))
    defense = 50 + Math.min(25, p.championsLeague * 3)
  } else if (pos.includes("defensa") || pos.includes("defender") || pos.includes("lateral") || pos.includes("central")) {
    attack = 30 + Math.min(20, Math.floor((p.careerGoals || 0) / 5))
    creation = 45 + Math.min(25, Math.floor((p.careerAssists || 0) / 5))
    defense = 80 + Math.min(19, p.caps ? Math.floor(p.caps / 6) : 5)
  } else if (pos.includes("portero") || pos.includes("goalkeeper") || pos.includes("guardameta")) {
    attack = 10
    creation = 40 + Math.min(20, Math.floor((p.careerAssists || 0) / 2))
    defense = 85 + Math.min(14, p.caps ? Math.floor(p.caps / 10) : 5)
    physical = 70 + Math.min(20, Math.floor((p.height - 180) / 2))
  }

  mental = 50 + Math.min(45, (p.ballonDors * 15) + (p.worldCups * 20) + (p.championsLeague * 5) + Math.floor(p.caps / 4))
  physical = Math.max(40, Math.min(99, physical + (p.height > 185 ? 5 : 0) + (p.caps > 50 ? 5 : 0)))
  tactical = Math.max(40, Math.min(99, tactical + (p.championsLeague * 4) + Math.floor(p.caps / 5)))
  
  return {
    attack: Math.min(99, Math.max(30, attack)),
    creation: Math.min(99, Math.max(30, creation)),
    physical: Math.min(99, Math.max(30, physical)),
    defense: Math.min(99, Math.max(30, defense)),
    tactical: Math.min(99, Math.max(30, tactical)),
    mental: Math.min(99, Math.max(30, mental)),
  }
}
