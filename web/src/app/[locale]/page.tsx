"use client"

import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/routing"
import { MODES } from "@/lib/data"
import { fetchPlayers, fetchTeams } from "@/lib/api"
import Toast, { showToast } from "@/components/Toast"
import type { Message, Mode } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

const ChatView = lazy(() => import("@/components/ChatView"))
const HistorySidebar = lazy(() => import("@/components/HistorySidebar"))
const LiveFeed = lazy(() => import("@/components/LiveFeed"))

const NAV_MODES = ["general", "scout", "tactical", "goat", "encyclopedia", "coach", "transfer_market"] as Mode[]

const MODE_META: Record<Mode, { icon: string; gradient: string }> = {
  general: { icon: "🎙️", gradient: "from-amber-400 to-yellow-500" },
  scout: { icon: "🔍", gradient: "from-blue-400 to-cyan-500" },
  tactical: { icon: "📋", gradient: "from-orange-400 to-red-500" },
  sporting_director: { icon: "👔", gradient: "from-purple-400 to-pink-500" },
  transfer_market: { icon: "💰", gradient: "from-green-400 to-emerald-500" },
  journalist: { icon: "📰", gradient: "from-sky-400 to-indigo-500" },
  statistician: { icon: "📊", gradient: "from-teal-400 to-cyan-500" },
  goat: { icon: "🏆", gradient: "from-amber-300 to-yellow-600" },
  encyclopedia: { icon: "📚", gradient: "from-violet-400 to-purple-500" },
  content_creator: { icon: "🎬", gradient: "from-pink-400 to-rose-500" },
  coach: { icon: "🧠", gradient: "from-emerald-400 to-teal-500" },
  talent_detector: { icon: "🌟", gradient: "from-yellow-400 to-amber-500" },
}

export default function Home() {
  const t = useTranslations("Home")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>("general")
  const [showChat, setShowChat] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [dark, setDark] = useState(true)
  const [playerCount, setPlayerCount] = useState<number | null>(null)
  const [teamCount, setTeamCount] = useState<number | null>(null)
  const [statsLoaded, setStatsLoaded] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [userScrolledUp, setUserScrolledUp] = useState(false)
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const [sessionId, setSessionId] = useState<string>("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authError, setAuthError] = useState("")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [liveOpen, setLiveOpen] = useState(false)

  useEffect(() => {
    let sid = localStorage.getItem("session_id")
    if (!sid) { sid = crypto.randomUUID(); localStorage.setItem("session_id", sid) }
    setSessionId(sid)
  }, [])

  useEffect(() => {
    if (!sessionId) return
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from("conversations")
          .select("role, content, mode, created_at")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true })
        if (data && !error) {
          setMessages(data.map(m => ({ role: m.role as "user" | "assistant", content: m.content, mode: m.mode as Mode })))
          if (data.length > 0) setShowChat(true)
        }
      } catch {}
    })()
  }, [sessionId])

  const saveMessage = useCallback(async (msg: Message) => {
    if (!sessionId) return
    try {
      const body: any = {
        session_id: sessionId,
        role: msg.role,
        content: msg.content,
        mode: msg.mode || mode,
      }
      if (user?.id) body.user_id = user.id
      await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    } catch {}
  }, [sessionId, mode, user?.id])

  useEffect(() => {
    fetchPlayers().then(p => { setPlayerCount(p.length); setStatsLoaded(true) }).catch(() => setStatsLoaded(true))
    fetchTeams().then(t => setTeamCount(t.length)).catch(() => {})
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const isDark = saved ? saved === "dark" : true
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
    document.documentElement.classList.toggle("light", !isDark)
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem("theme", next ? "dark" : "light")
    document.documentElement.classList.toggle("dark", next)
    document.documentElement.classList.toggle("light", !next)
  }
  const [speakingId, setSpeakingId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (!userScrolledUp) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, userScrolledUp])

  useEffect(() => {
    const el = chatContainerRef.current
    if (!el) return
    const handler = () => {
      const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
      setUserScrolledUp(!bottom)
    }
    el.addEventListener("scroll", handler, { passive: true })
    return () => el.removeEventListener("scroll", handler)
  }, [])

  const ensureSession = useCallback(async (firstMsg: string) => {
    try {
      const title = firstMsg.length > 60 ? firstMsg.slice(0, 57) + "..." : firstMsg
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, user_id: user?.id || null, title, mode }),
      })
    } catch {}
  }, [sessionId, user?.id, mode])

  const handleSelectSession = useCallback(async (newSessionId: string) => {
    localStorage.setItem("session_id", newSessionId)
    setSessionId(newSessionId)
    setShowChat(true)
    speechSynthesis.cancel()
  }, [])

  const startNewChat = useCallback(() => {
    if (sessionId) {
      fetch(`/api/sessions?session_id=${sessionId}`, { method: "DELETE" }).catch(() => {})
    }
    const newId = crypto.randomUUID()
    localStorage.setItem("session_id", newId)
    setSessionId(newId)
    setMessages([])
    setShowChat(false)
    speechSynthesis.cancel()
  }, [sessionId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "n") { e.preventDefault(); startNewChat() }
      if (e.key === "/" && document.activeElement !== inputRef.current && showChat) { e.preventDefault(); inputRef.current?.focus() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [showChat, startNewChat])

  // Speech Recognition
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = locale === "es" ? "es-ES" : "en-US"
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e: any) => {
      setInput((prev) => prev + e.results[0][0].transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [locale])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  // Speech Synthesis
  const speak = useCallback((text: string, id: number) => {
    if (speakingId === id) { speechSynthesis.cancel(); setSpeakingId(null); return }
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_\[\]]/g, ""))
    utterance.lang = locale === "es" ? "es-ES" : "en-US"
    utterance.rate = 0.9
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    setSpeakingId(id)
    speechSynthesis.speak(utterance)
  }, [locale, speakingId])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: "user", content: input.trim(), mode }
    setMessages(p => [...p, userMsg])
    saveMessage(userMsg)
    if (messages.length === 0) ensureSession(userMsg.content)
    setInput(""); setLoading(true); setShowChat(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.content, mode, history: messages.map(m => ({ role: m.role, content: m.content })) }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || t("connectionError"))
      }

      const contentType = res.headers.get("Content-Type") || ""

      if (contentType.includes("text/plain")) {
        let fullContent = ""
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()

        setMessages(p => [...p, { role: "assistant", content: "", mode }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullContent += decoder.decode(value, { stream: true })
          setMessages(p => {
            const updated = [...p]
            if (updated.length > 0) updated[updated.length - 1] = { role: "assistant", content: fullContent, mode }
            return updated
          })
        }

        saveMessage({ role: "assistant", content: fullContent, mode })
      } else {
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        const assistantMsg: Message = { role: "assistant", content: data.response, mode }
        setMessages(p => [...p, assistantMsg])
        saveMessage(assistantMsg)
      }
    } catch (e: any) {
      const errMsg = e?.message || t("connectionError")
      setMessages(p => [...p, { role: "assistant", content: errMsg, mode }])
      showToast(errMsg, "error")
    } finally { setLoading(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const copyChat = () => {
    const text = messages.map(m => `${m.role === "user" ? t("you") : t("agent")}: ${m.content}`).join("\n\n")
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const shareChat = async () => {
    const text = messages.map(m => `${m.role === "user" ? t("you") : t("agent")}: ${m.content}`).join("\n\n")
    if (navigator.share) {
      try { await navigator.share({ title: "Football Genius AI", text }) } catch {}
    } else {
      copyChat()
    }
  }

  const exportChat = () => {
    const text = messages.map(m => `### ${m.role === "user" ? t("you") : t("agent")} (${m.mode})\n${m.content}`).join("\n\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" }))
    a.download = `football-genius-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
  }

  const switchLocale = (l: "es" | "en") => {
    router.replace(pathname, { locale: l })
  }

  const handleSignIn = async (provider: "google" | "github") => {
    setAuthError("")
    try {
      await signIn(provider)
    } catch (e: any) {
      setAuthError(e?.message || t("connectionError"))
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary selection:bg-amber-500/30">
      <Toast />
      {/* History Sidebar */}
      <Suspense fallback={null}>
        <HistorySidebar
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          currentSessionId={sessionId}
          onSelectSession={handleSelectSession}
          t={t}
        />
      </Suspense>
      {/* Live Feed */}
      <Suspense fallback={null}>
        <LiveFeed open={liveOpen} onClose={() => setLiveOpen(false)} t={t} />
      </Suspense>
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">⚽</div>
              <h2 className="text-lg font-bold text-text-primary">{t("signIn")}</h2>
              <p className="text-xs text-text-secondary mt-1">Football Genius AI</p>
            </div>
            <div className="space-y-2">
              <button onClick={() => handleSignIn("google")} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-500/30 text-text-primary hover:bg-gray-700/50 transition-all text-sm font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button onClick={() => handleSignIn("github")} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-500/30 text-text-primary hover:bg-gray-700/50 transition-all text-sm font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </button>
            </div>
            {authError && <p className="text-xs text-red-400 text-center mt-3">{authError}</p>}
            <p className="text-[10px] text-gray-600 text-center mt-4">{t("signInDesc")}</p>
          </div>
        </div>
      )}
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-4">
            <button onClick={() => { setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }} className="flex items-center gap-2 shrink-0 group">
              <span className="text-xl">⚽</span>
              <span className="font-bold text-sm tracking-tight text-text-primary group-hover:text-white transition-colors hidden sm:inline">{t("title")}</span>
            </button>
            <nav className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto py-1">
              {NAV_MODES.map((mid, i) => (
                <button key={mid} onClick={() => { setMode(mid); setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }}
                  title={(t.raw("nav") as string[])[i]}
                  className={`px-2 py-1.5 rounded-lg text-sm transition-all ${mode === mid ? "bg-amber-500/10 text-amber-400" : "text-text-secondary hover:text-gray-200 hover:bg-gray-800/50"}`}>
                  {MODE_META[mid].icon}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2 ml-auto">
              {/* Auth */}
              {!authLoading && (
                user ? (
                  <div className="relative group">
                    <button className="w-7 h-7 rounded-full overflow-hidden border border-gray-700 hover:border-amber-500/50 transition-all">
                      <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || "U")}&background=amber&color=000&size=28`}
                        alt="" className="w-full h-full object-cover" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-40 bg-gray-900 border border-gray-800 rounded-xl p-1 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="px-3 py-2 text-xs text-text-secondary truncate border-b border-gray-800 mb-1">{user.email}</div>
                      <button onClick={signOut} className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:text-red-400 hover:bg-gray-800/50 rounded-lg transition-all">🚪 {t("signOut")}</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAuthModal(true)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all">
                    {t("signIn")}
                  </button>
                )
              )}
              {/* History + Live */}
              <button onClick={() => setHistoryOpen(true)} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t("history")}>
                📋
              </button>
              <button onClick={() => setLiveOpen(true)} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all relative" title={t("live")}>
                ⚡
              </button>
              {/* Theme toggle */}
              <button onClick={toggleTheme} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={dark ? t("darkTitle") : t("lightTitle")}>
                {dark ? "☀️" : "🌙"}
              </button>
              {/* Lang */}
              <div className="flex items-center bg-gray-800/50 rounded-lg p-0.5 border border-gray-700/50">
                <button onClick={() => switchLocale("es")} className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${locale === "es" ? "bg-amber-500 text-black" : "text-text-secondary hover:text-gray-200"}`} title="Español">ES</button>
                <button onClick={() => switchLocale("en")} className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${locale === "en" ? "bg-amber-500 text-black" : "text-text-secondary hover:text-gray-200"}`} title="English">EN</button>
              </div>
              {showChat && messages.length > 0 && (<button onClick={startNewChat} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t("newChat")}>✕</button>)}
              <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-1.5 rounded-lg text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-gray-800/50 bg-gray-900/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-4 gap-1">
              {NAV_MODES.map((mid, i) => (
                <button key={mid} onClick={() => { setMode(mid); setShowChat(true); setMobileMenu(false); setTimeout(() => inputRef.current?.focus(), 100) }}
                  title={(t.raw("nav") as string[])[i]}
                  className={`px-2 py-3 rounded-lg text-sm transition-all text-center ${mode === mid ? "bg-amber-500/10 text-amber-400" : "text-text-secondary hover:text-gray-200"}`}>
                  <div className="text-lg">{MODE_META[mid].icon}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col min-h-0 relative">
        {!showChat ? (
          <>
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute top-1/4 left-1/4 text-8xl font-black text-amber-500 select-none">⚽</div>
                <div className="absolute bottom-1/4 right-1/4 text-7xl font-black text-amber-500 select-none">🏆</div>
              </div>
              <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-16">
                <button onClick={() => { setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/20 mb-6 hover:scale-110 transition-transform cursor-pointer">
                  <span className="text-3xl">⚽</span>
                </button>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4">
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">{t("title")}</span>
                </h1>
                <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed mb-8">{t("desc")}</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button onClick={() => { setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black shadow-lg shadow-amber-500/20 transition-all">
                    ⚡ {t("cta")}
                  </button>
                  <button onClick={() => document.getElementById("modes")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm border border-gray-600 text-gray-300 hover:bg-gray-800 transition-all">
                    📋 {t("modesBtn")}
                  </button>
                </div>
                <div className="flex justify-center gap-8 sm:gap-12 mt-12">
                  {[{ value: playerCount, label: (t.raw("stats") as string[])[0], icon: "👤" }, { value: teamCount, label: (t.raw("stats") as string[])[1], icon: "🏟️" }, { value: MODES.length, label: (t.raw("stats") as string[])[2], icon: "🎯" }].map(s => (
                    <button key={s.label} onClick={() => { setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }} className="text-center group">
                      <div className="text-3xl sm:text-4xl font-black text-text-primary group-hover:text-amber-400 transition-colors">
                        {s.value !== null ? s.value : <span className="inline-block w-12 h-9 rounded shimmer align-middle" />}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 group-hover:text-text-secondary transition-colors">{s.icon} {s.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <section id="modes" className="py-16 px-4 border-t border-gray-800/50">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t("modesTitle")}</h2>
                  <p className="text-sm text-text-secondary">{t("modesDesc")}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {MODES.map(m => {
                    const meta = MODE_META[m.id]
                    return (
                      <button key={m.id} onClick={() => { setMode(m.id); setShowChat(true) }}
                        className="group text-left p-4 rounded-xl border border-gray-800/50 bg-gray-900/30 hover:border-gray-700/50 transition-all">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform`}>{meta.icon}</div>
                        <div className="text-sm font-semibold text-text-primary mb-0.5">{m.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-2">{m.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>
            <section className="py-12 px-4 border-t border-gray-800/50 bg-gray-900/20">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-sm text-text-secondary mb-4">{t("tryQuestions")}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(t.raw("questions") as string[]).map((s: string) => (
                    <button key={s} onClick={() => { setInput(s); setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }}
                      className="px-3.5 py-2 text-xs rounded-lg bg-gray-800/50 text-text-secondary hover:text-gray-200 hover:bg-gray-700/50 transition-all border border-gray-700/50">{s}</button>
                  ))}
                </div>
              </div>
            </section>
            <footer className="border-t border-gray-800/50 bg-canvas/80 py-8 px-4">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500"><span>⚽</span><span>{t("title")}</span></div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>© 2026</span><span>·</span>
                  <button onClick={() => { setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }} className="hover:text-text-secondary transition-colors">{t("newChat")}</button>
                  <span>·</span><span>Ctrl+Shift+N</span>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="typing-indicator"><span></span><span></span><span></span></div></div>}>
            <ChatView
              messages={messages} loading={loading} mode={mode} lang={locale} speakingId={speakingId}
              inputRef={inputRef as React.RefObject<HTMLInputElement | null>}
              chatContainerRef={chatContainerRef as React.RefObject<HTMLDivElement | null>}
              messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement | null>}
              onSend={handleSend} onInputChange={setInput} onKeyDown={handleKeyDown}
              onSpeak={speak} onCopy={copyChat} onShare={shareChat} onExport={exportChat}
              onNewChat={startNewChat}
              isListening={isListening} onStartListening={startListening} onStopListening={stopListening}
              input={input} copied={copied} t={t}
            />
          </Suspense>
        )}
      </main>

      {/* Floating Agent */}
      <button onClick={() => { if (!showChat) { setShowChat(true) } else { inputRef.current?.focus() } }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 shadow-2xl shadow-amber-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
        <div className="relative">
          <span className="text-2xl">🤖</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-950">
            <span className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
          </span>
        </div>
      </button>
    </div>
  )
}
