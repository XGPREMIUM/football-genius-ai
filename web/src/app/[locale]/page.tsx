"use client"

import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/routing"
import { MODES } from "@/lib/data"
import { fetchPlayers, fetchTeams } from "@/lib/api"
import Toast, { showToast } from "@/components/Toast"
import type { Message, Mode } from "@/lib/types"

const ChatView = lazy(() => import("@/components/ChatView"))

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "n") { e.preventDefault(); setMessages([]); setShowChat(false) }
      if (e.key === "/" && document.activeElement !== inputRef.current && showChat) { e.preventDefault(); inputRef.current?.focus() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [showChat])

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
    setInput(""); setLoading(true); setShowChat(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.content, mode, history: messages.map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMessages(p => [...p, { role: "assistant", content: data.response, mode }])
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

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary selection:bg-amber-500/30">
      <Toast />
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-4">
            <button onClick={() => { setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }} className="flex items-center gap-2 shrink-0 group">
              <span className="text-xl">⚽</span>
              <span className="font-bold text-sm tracking-tight text-text-primary group-hover:text-white transition-colors hidden sm:inline">{t("title")}</span>
            </button>
            <nav className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto py-1">
              {NAV_MODES.map(mid => (
                <button key={mid} onClick={() => { setMode(mid); setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${mode === mid ? "bg-amber-500/10 text-amber-400" : "text-text-secondary hover:text-gray-200 hover:bg-gray-800/50"}`}>
                  {MODE_META[mid].icon} {t("nav")[NAV_MODES.indexOf(mid)]}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2 ml-auto">
              {/* Theme toggle */}
              <button onClick={toggleTheme} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={dark ? t("darkTitle") : t("lightTitle")}>
                {dark ? "☀️" : "🌙"}
              </button>
              {/* Lang */}
              <div className="flex items-center bg-gray-800/50 rounded-lg p-0.5 border border-gray-700/50">
                <button onClick={() => switchLocale("es")} className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${locale === "es" ? "bg-amber-500 text-black" : "text-text-secondary hover:text-gray-200"}`}>ES</button>
                <button onClick={() => switchLocale("en")} className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${locale === "en" ? "bg-amber-500 text-black" : "text-text-secondary hover:text-gray-200"}`}>EN</button>
              </div>
              {showChat && messages.length > 0 && (
                <div className="flex items-center gap-1">
                  <button onClick={shareChat} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t("share")}>📤</button>
                  <button onClick={copyChat} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t("copied")}>{copied ? "✅" : "📋"}</button>
                  <button onClick={exportChat} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t("export")}>📥</button>
                  <button onClick={() => { setMessages([]); setShowChat(false); speechSynthesis.cancel() }} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t("newChat")}>✕</button>
                </div>
              )}
              <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-1.5 rounded-lg text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-gray-800/50 bg-gray-900/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-3 gap-1">
              {NAV_MODES.map(mid => (
                <button key={mid} onClick={() => { setMode(mid); setShowChat(true); setMobileMenu(false); setTimeout(() => inputRef.current?.focus(), 100) }}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all text-center ${mode === mid ? "bg-amber-500/10 text-amber-400" : "text-text-secondary hover:text-gray-200"}`}>
                  <div className="text-base mb-0.5">{MODE_META[mid].icon}</div>
                  <div>{t("nav")[NAV_MODES.indexOf(mid)]}</div>
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
                  {[{ value: playerCount, label: t("stats")[0], icon: "👤" }, { value: teamCount, label: t("stats")[1], icon: "🏟️" }, { value: MODES.length, label: t("stats")[2], icon: "🎯" }].map(s => (
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
              onNewChat={() => { setMessages([]); setShowChat(false); speechSynthesis.cancel() }}
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
