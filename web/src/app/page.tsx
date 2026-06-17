"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { PLAYERS, MODES } from "@/lib/data"
import type { Message, Mode } from "@/lib/types"

const LANG = {
  es: {
    title: "Football Genius AI", tagline: "El agente de fútbol con IA más completo del mundo",
    desc: "Scout, análisis táctico, GOAT, enciclopedia, coach y mucho más. Pregunta lo que quieras sobre fútbol.",
    cta: "Comenzar Análisis", modesTitle: "Modos de Análisis", modesDesc: "Cada modo activa una personalidad única de IA especializada",
    send: "Enviar", followUp: "Sigue preguntando...", newChat: "Nuevo análisis",
    stats: ["Jugadores", "Equipos", "Modos"],
    nav: ["General", "Scout", "Táctico", "GOAT", "Enciclopedia", "Coach", "Mercado"],
    listening: "Escuchando...", speak: "Leer", stop: "Detener", share: "Compartir chat", copied: "¡Copiado!",
  },
  en: {
    title: "Football Genius AI", tagline: "The most complete AI football agent in the world",
    desc: "Scout, tactical analysis, GOAT, encyclopedia, coach and more. Ask anything about football.",
    cta: "Start Analysis", modesTitle: "Analysis Modes", modesDesc: "Each mode activates a unique specialized AI personality",
    send: "Send", followUp: "Keep asking...", newChat: "New analysis",
    stats: ["Players", "Teams", "Modes"],
    nav: ["General", "Scout", "Tactical", "GOAT", "Encyclopedia", "Coach", "Market"],
    listening: "Listening...", speak: "Read", stop: "Stop", share: "Share chat", copied: "Copied!",
  },
}

type Lang = "es" | "en"
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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>("general")
  const [lang, setLang] = useState<Lang>("es")
  const [showChat, setShowChat] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [dark, setDark] = useState(true)

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

  const t = LANG[lang]

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

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
    recognition.lang = lang === "es" ? "es-ES" : "en-US"
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
  }, [lang])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  // Speech Synthesis
  const speak = useCallback((text: string, id: number) => {
    if (speakingId === id) { speechSynthesis.cancel(); setSpeakingId(null); return }
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_\[\]]/g, ""))
    utterance.lang = lang === "es" ? "es-ES" : "en-US"
    utterance.rate = 0.9
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    setSpeakingId(id)
    speechSynthesis.speak(utterance)
  }, [lang, speakingId])

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
      setMessages(p => [...p, { role: "assistant", content: data.response || data.error || "Error", mode }])
    } catch {
      setMessages(p => [...p, { role: "assistant", content: lang === "es" ? "Error de conexión. Intenta de nuevo." : "Connection error. Try again.", mode }])
    } finally { setLoading(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const copyChat = () => {
    const text = messages.map(m => `${m.role === "user" ? "Tú" : "Football Genius AI"}: ${m.content}`).join("\n\n")
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const shareChat = async () => {
    const text = messages.map(m => `${m.role === "user" ? "Tú" : "Football Genius AI"}: ${m.content}`).join("\n\n")
    if (navigator.share) {
      try { await navigator.share({ title: "Football Genius AI", text }) } catch {}
    } else {
      copyChat()
    }
  }

  const exportChat = () => {
    const text = messages.map(m => `### ${m.role === "user" ? "Tú" : "Football Genius AI"} (${m.mode})\n${m.content}`).join("\n\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" }))
    a.download = `football-genius-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary selection:bg-amber-500/30">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-4">
            <button onClick={() => { setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }} className="flex items-center gap-2 shrink-0 group">
              <span className="text-xl">⚽</span>
              <span className="font-bold text-sm tracking-tight text-text-primary group-hover:text-white transition-colors hidden sm:inline">{t.title}</span>
            </button>
            <nav className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto py-1">
              {NAV_MODES.map(mid => (
                <button key={mid} onClick={() => { setMode(mid); setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${mode === mid ? "bg-amber-500/10 text-amber-400" : "text-text-secondary hover:text-gray-200 hover:bg-gray-800/50"}`}>
                  {MODE_META[mid].icon} {t.nav[NAV_MODES.indexOf(mid)]}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2 ml-auto">
              {/* Theme toggle */}
              <button onClick={toggleTheme} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={dark ? "Modo claro" : "Modo oscuro"}>
                {dark ? "☀️" : "🌙"}
              </button>
              {/* Lang */}
              <div className="flex items-center bg-gray-800/50 rounded-lg p-0.5 border border-gray-700/50">
                <button onClick={() => setLang("es")} className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${lang === "es" ? "bg-amber-500 text-black" : "text-text-secondary hover:text-gray-200"}`}>ES</button>
                <button onClick={() => setLang("en")} className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${lang === "en" ? "bg-amber-500 text-black" : "text-text-secondary hover:text-gray-200"}`}>EN</button>
              </div>
              {showChat && messages.length > 0 && (
                <div className="flex items-center gap-1">
                  <button onClick={shareChat} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t.share}>📤</button>
                  <button onClick={copyChat} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t.copied}>{copied ? "✅" : "📋"}</button>
                  <button onClick={exportChat} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title="Exportar">📥</button>
                  <button onClick={() => { setMessages([]); setShowChat(false); speechSynthesis.cancel() }} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t.newChat}>✕</button>
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
                  <div>{t.nav[NAV_MODES.indexOf(mid)]}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col min-h-0 relative">
        {!showChat || messages.length === 0 ? (
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
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">{t.title}</span>
                </h1>
                <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed mb-8">{t.desc}</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button onClick={() => { setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black shadow-lg shadow-amber-500/20 transition-all">
                    ⚡ {t.cta}
                  </button>
                  <button onClick={() => document.getElementById("modes")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm border border-gray-600 text-gray-300 hover:bg-gray-800 transition-all">
                    📋 Modos de Juego
                  </button>
                </div>
                <div className="flex justify-center gap-8 sm:gap-12 mt-12">
                  {[{ value: PLAYERS.length, label: t.stats[0], icon: "👤" }, { value: PLAYERS.length, label: t.stats[1], icon: "🏟️" }, { value: MODES.length, label: t.stats[2], icon: "🎯" }].map(s => (
                    <button key={s.label} onClick={() => { setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }} className="text-center group">
                      <div className="text-3xl sm:text-4xl font-black text-text-primary group-hover:text-amber-400 transition-colors">{s.value}</div>
                      <div className="text-xs text-gray-500 mt-1 group-hover:text-text-secondary transition-colors">{s.icon} {s.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <section id="modes" className="py-16 px-4 border-t border-gray-800/50">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{t.modesTitle}</h2>
                  <p className="text-sm text-text-secondary">{t.modesDesc}</p>
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
                <p className="text-sm text-text-secondary mb-4">{lang === "es" ? "Prueba estas preguntas:" : "Try these questions:"}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(lang === "es"
                    ? ["Compara a Messi y Cristiano", "Analiza tácticamente al Real Madrid", "¿Quién es el GOAT?", "Scout de Lamine Yamal"]
                    : ["Compare Messi and Ronaldo", "Tactical analysis of Real Madrid", "Who is the GOAT?", "Scout Lamine Yamal"]
                  ).map(s => (
                    <button key={s} onClick={() => { setInput(s); setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }}
                      className="px-3.5 py-2 text-xs rounded-lg bg-gray-800/50 text-text-secondary hover:text-gray-200 hover:bg-gray-700/50 transition-all border border-gray-700/50">{s}</button>
                  ))}
                </div>
              </div>
            </section>
            <footer className="border-t border-gray-800/50 bg-canvas/80 py-8 px-4">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500"><span>⚽</span><span>{t.title}</span></div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>© 2026</span><span>·</span>
                  <button onClick={() => { setShowChat(true); setTimeout(() => inputRef.current?.focus(), 100) }} className="hover:text-text-secondary transition-colors">{t.newChat}</button>
                  <span>·</span><span>Ctrl+Shift+N</span>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-4xl mx-auto w-full">
              {messages.map((msg, i) => (
                <div key={i} className={`message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] sm:max-w-[72%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-amber-500/10 border border-amber-500/20 text-text-primary rounded-br-sm" : "bg-gray-900/50 border border-gray-800/50 text-gray-300 rounded-bl-sm"}`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/50">
                      {msg.role === "assistant" ? (
                        <div className="text-[10px] text-gray-600 flex items-center gap-1">
                          <span>{msg.mode ? MODE_META[msg.mode]?.icon : "🎙️"}</span>
                          <span>{MODES.find(m => m.id === msg.mode)?.name}</span>
                        </div>
                      ) : <div />}
                      {msg.role === "assistant" && (
                        <button onClick={() => speak(msg.content, i)}
                          className="text-[10px] text-gray-600 hover:text-amber-400 transition-colors flex items-center gap-1">
                          {speakingId === i ? "🔊" : "🔈"} {speakingId === i ? (lang === "es" ? "Detener" : "Stop") : (lang === "es" ? "Leer" : "Read")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start message-enter">
                  <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl rounded-bl-sm px-4 py-3.5">
                    <div className="typing-indicator"><span></span><span></span><span></span></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex-none border-t border-gray-800/50 bg-canvas px-4 py-3">
              <div className="max-w-4xl mx-auto flex gap-2.5 items-center">
                <div className="flex-1 relative flex items-center gap-2">
                  <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder={t.followUp}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-text-primary placeholder-gray-500 focus:outline-none focus:border-amber-500/40 focus:bg-gray-800/80 text-sm transition-all"
                    disabled={loading} />
                  <button onClick={isListening ? stopListening : startListening}
                    className={`p-2.5 rounded-xl transition-all ${isListening ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" : "bg-gray-800/50 text-text-secondary hover:text-gray-200 hover:bg-gray-700/50 border border-gray-700/50"}`}
                    title={isListening ? t.listening : "🎤 Voz"}>
                    🎤
                  </button>
                </div>
                <button onClick={handleSend} disabled={loading || !input.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/10">
                  {loading ? <span className="flex items-center gap-1"><span className="animate-pulse">···</span></span> : t.send}
                </button>
              </div>
            </div>
          </div>
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
