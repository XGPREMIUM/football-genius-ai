"use client"

import { useState, useEffect, useCallback } from "react"

interface NewsItem {
  title: string
  link: string
  content: string
  source: string
  published: string
}

interface LiveData {
  news: NewsItem[]
  matches: { home: string; away: string; score?: string; status: string; competition: string }[]
  updatedAt: string
}

export default function LiveFeed({ open, onClose, t }: { open: boolean; onClose: () => void; t: any }) {
  const [data, setData] = useState<LiveData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"news" | "matches">("news")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/live")
      const d = await res.json()
      setData(d)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open) fetchData()
  }, [open, fetchData])

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return d.toLocaleDateString()
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />}
      <div className={`fixed top-0 right-0 z-50 h-full w-80 sm:w-96 bg-gray-950 border-l border-gray-800/50 transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-800/50 shrink-0">
          <h2 className="text-sm font-bold text-text-primary">⚡ {t("live")}</h2>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t("refresh")}>
              {loading ? <span className="inline-block animate-spin">⟳</span> : "⟳"}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all">✕</button>
          </div>
        </div>

        <div className="flex border-b border-gray-800/50 shrink-0">
          <button onClick={() => setActiveTab("news")}
            className={`flex-1 py-2.5 text-xs font-medium transition-all ${activeTab === "news" ? "text-amber-400 border-b-2 border-amber-400" : "text-text-secondary hover:text-gray-200"}`}>
            📰 {t("news")}
          </button>
          <button onClick={() => setActiveTab("matches")}
            className={`flex-1 py-2.5 text-xs font-medium transition-all ${activeTab === "matches" ? "text-amber-400 border-b-2 border-amber-400" : "text-text-secondary hover:text-gray-200"}`}>
            ⚽ {t("matches")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin">
          {loading && !data && (
            <div className="flex items-center justify-center py-12">
              <div className="typing-indicator scale-75"><span></span><span></span><span></span></div>
            </div>
          )}

          {activeTab === "news" && (
            <>
              {data?.news.length === 0 && !loading && (
                <div className="text-center py-12 text-xs text-gray-600">{t("noNews")}</div>
              )}
              {data?.news.map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                  className="block p-3 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all group">
                  <div className="text-xs font-medium text-text-primary group-hover:text-amber-400 transition-colors line-clamp-2 mb-1">{item.title}</div>
                  <div className="text-[10px] text-gray-500 line-clamp-2 mb-1.5">{item.content}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">{item.source}</span>
                    <span className="text-[10px] text-gray-600">{formatTime(item.published)}</span>
                  </div>
                </a>
              ))}
            </>
          )}

          {activeTab === "matches" && (
            <>
              {data?.matches.length === 0 && !loading && (
                <div className="text-center py-12 text-xs text-gray-600">{t("noMatches")}</div>
              )}
              {data?.matches.map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-900/50 border border-gray-800/50">
                  <div className="flex items-center justify-between text-xs font-medium text-text-primary">
                    <span className="flex-1 truncate">{m.home}</span>
                    <span className="mx-2 px-2 py-0.5 rounded bg-gray-800 text-amber-400 font-bold text-sm">{m.score || "vs"}</span>
                    <span className="flex-1 truncate text-right">{m.away}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-gray-500">{m.competition}</span>
                    <span className="text-[10px] text-gray-500">{m.status}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {data?.updatedAt && (
          <div className="px-4 py-2 border-t border-gray-800/50 text-[10px] text-gray-600 text-center shrink-0">
            {t("updated")}: {new Date(data.updatedAt).toLocaleTimeString()}
          </div>
        )}
      </div>
    </>
  )
}