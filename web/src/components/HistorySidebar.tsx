"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"

interface Session {
  session_id: string
  title: string
  mode: string
  created_at: string
  updated_at: string
}

export default function HistorySidebar({
  open, onClose, currentSessionId, onSelectSession, t,
}: {
  open: boolean; onClose: () => void; currentSessionId: string
  onSelectSession: (sessionId: string) => Promise<void>
  t: any
}) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const fetchSessions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/sessions?user_id=${user.id}`)
      const data = await res.json()
      if (Array.isArray(data)) setSessions(data)
    } catch {}
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (open && user) fetchSessions()
  }, [open, user, fetchSessions])

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/sessions?session_id=${sessionId}`, { method: "DELETE" })
      setSessions(p => p.filter(s => s.session_id !== sessionId))
      if (sessionId === currentSessionId) onSelectSession(crypto.randomUUID())
    } catch {}
  }

  const handleRename = async (sessionId: string) => {
    if (!renameValue.trim()) { setRenaming(null); return }
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, title: renameValue.trim(), user_id: user?.id }),
      })
      setSessions(p => p.map(s => s.session_id === sessionId ? { ...s, title: renameValue.trim() } : s))
    } catch {}
    setRenaming(null)
  }

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" })
    return d.toLocaleDateString([], { day: "numeric", month: "short" })
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />}
      <div className={`fixed top-0 left-0 z-50 h-full w-72 sm:w-80 bg-gray-950 border-r border-gray-800/50 transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-800/50 shrink-0">
          <h2 className="text-sm font-bold text-text-primary">📋 {t("history")}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all">✕</button>
        </div>

        <div className="px-3 pt-3 pb-2 shrink-0">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("searchHistory")}
            className="w-full px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-text-primary placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500/40 transition-all" />
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-thin">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="typing-indicator scale-75"><span></span><span></span><span></span></div>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-gray-600">
              {search ? t("noResults") : t("noHistory")}
            </div>
          )}
          {filtered.map(s => (
            <div key={s.session_id}
              onClick={() => { if (s.session_id !== currentSessionId) onSelectSession(s.session_id); onClose() }}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs ${s.session_id === currentSessionId ? "bg-amber-500/10 text-amber-400" : "text-text-secondary hover:bg-gray-800/50 hover:text-gray-200"}`}>
              <span className="shrink-0">💬</span>
              <div className="flex-1 min-w-0">
                {renaming === s.session_id ? (
                  <input value={renameValue} onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => handleRename(s.session_id)}
                    onKeyDown={e => { if (e.key === "Enter") handleRename(s.session_id); if (e.key === "Escape") setRenaming(null) }}
                    className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-amber-500/40 text-text-primary text-xs focus:outline-none"
                    autoFocus onClick={e => e.stopPropagation()} />
                ) : (
                  <div className="truncate font-medium">{s.title}</div>
                )}
                <div className="text-[10px] text-gray-600 mt-0.5">{formatDate(s.updated_at)}</div>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={e => { e.stopPropagation(); setRenaming(s.session_id); setRenameValue(s.title) }}
                  className="p-1 rounded text-gray-600 hover:text-amber-400 transition-colors" title={t("rename")}>✏️</button>
                <button onClick={e => handleDelete(s.session_id, e)}
                  className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors" title={t("delete")}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {!user && (
          <div className="px-4 py-3 border-t border-gray-800/50 text-center">
            <p className="text-[10px] text-gray-600">{t("signInForHistory")}</p>
          </div>
        )}
      </div>
    </>
  )
}