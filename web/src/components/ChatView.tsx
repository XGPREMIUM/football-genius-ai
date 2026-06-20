"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useTranslations, useLocale } from "next-intl"
import { MODES } from "@/lib/data"
import type { Message, Mode } from "@/lib/types"
import Toast, { showToast } from "@/components/Toast"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import PlayerCard from "./PlayerCard"

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
  fantasy_manager: { icon: "🎩", gradient: "from-indigo-400 to-purple-500" },
  referee: { icon: "🟨", gradient: "from-yellow-400 to-red-500" },
}

function parseMessageContent(content: string) {
  const match = content.match(/\[SUGERENCIAS\]([\s\S]*)$/i)
  let mainContent = content
  let suggestions: string[] = []
  if (match) {
    mainContent = content.slice(0, match.index).trim()
    const rawSuggestions = match[1] || ""
    suggestions = rawSuggestions
      .split("|")
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  const cardMatch = mainContent.match(/\[PLAYER_CARD:\s*([a-zA-Z0-9_-]+)\]/i)
  let playerCards: string[] = []
  if (cardMatch) {
    const regex = /\[PLAYER_CARD:\s*([a-zA-Z0-9_-]+)\]/gi
    let m
    while ((m = regex.exec(mainContent)) !== null) {
      playerCards.push(m[1])
    }
    mainContent = mainContent.replace(/\[PLAYER_CARD:\s*[a-zA-Z0-9_-]+\]/gi, "").trim()
  }

  return { mainContent, suggestions, playerCards }
}

export default function ChatView({
  messages, loading, mode, lang, speakingId,
  inputRef, chatContainerRef, messagesEndRef,
  onSend, onInputChange, onKeyDown,
  onSpeak, onCopy, onShare, onExport, onNewChat,
  isListening, onStartListening, onStopListening,
  input, copied, t,
}: {
  messages: Message[]; loading: boolean; mode: Mode; lang: string; speakingId: number | null
  inputRef: React.RefObject<HTMLInputElement | null>
  chatContainerRef: React.RefObject<HTMLDivElement | null>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onSend: (text?: string) => void; onInputChange: (v: string) => void; onKeyDown: (e: React.KeyboardEvent) => void
  onSpeak: (text: string, id: number) => void
  onCopy: () => void; onShare: () => void; onExport: () => void; onNewChat: () => void
  isListening: boolean; onStartListening: () => void; onStopListening: () => void
  input: string; copied: boolean; t: any
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-canvas">
      {/* Active Mode Pill Indicator */}
      <div className="flex-none bg-gray-900/10 border-b border-gray-800/40 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Modo actual:</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${MODE_META[mode]?.gradient} text-black font-semibold shadow-sm`}>
            <span>{MODE_META[mode]?.icon}</span>
            <span>{MODES.find(m => m.id === mode)?.name || mode}</span>
          </span>
        </div>
        {messages.length > 0 && (
          <button onClick={onNewChat} className="text-xs text-text-secondary hover:text-red-400 transition-colors flex items-center gap-1">
            ✕ {t("newChat")}
          </button>
        )}
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-4xl mx-auto w-full scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[60vh] text-center">
            <div>
              <div className="text-6xl mb-4">⚽</div>
              <p className="text-text-secondary text-sm">{t("startChat")}</p>
              <p className="text-text-muted text-xs mt-2">{t("currentMode", { mode: MODES.find(m => m.id === mode)?.name || "" })}</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => {
          const parsed = parseMessageContent(msg.content)
          return (
            <div key={i} className={`message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-md ${msg.role === "user" ? "bg-amber-500/10 border border-amber-500/20 text-text-primary rounded-br-sm" : "bg-gray-900/60 border border-gray-800/60 text-gray-200 rounded-bl-sm"}`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.role === "user" ? (
                    parsed.mainContent
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({node, ...props}) => <div className="overflow-x-auto my-3 rounded-xl border border-gray-800/80 shadow-inner"><table className="min-w-full divide-y divide-gray-800 text-xs text-left" {...props} /></div>,
                        thead: ({node, ...props}) => <thead className="bg-gray-950/80 text-gray-300 font-bold border-b border-gray-800" {...props} />,
                        tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-800/50 bg-gray-900/10" {...props} />,
                        tr: ({node, ...props}) => <tr className="hover:bg-gray-800/20 transition-colors" {...props} />,
                        th: ({node, ...props}) => <th className="px-3.5 py-2.5 font-semibold text-gray-400 uppercase tracking-wider" {...props} />,
                        td: ({node, ...props}) => <td className="px-3.5 py-2.5 text-gray-300 font-medium" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1.5" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1.5" {...props} />,
                        li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0 text-gray-300/95" {...props} />,
                        a: ({node, ...props}) => <a className="text-amber-400 hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-base font-extrabold text-white mt-4 mb-2 border-b border-gray-800/50 pb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-sm font-bold text-white mt-3 mb-1.5" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xs font-bold text-gray-200 mt-2.5 mb-1" {...props} />,
                        code: ({node, ...props}) => <code className="bg-gray-950 px-1.5 py-0.5 rounded text-[11px] font-mono text-amber-300 border border-gray-800/40" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-500 bg-amber-500/5 px-3 py-1.5 rounded-r-lg my-2 text-xs italic text-gray-400" {...props} />,
                      }}
                    >
                      {parsed.mainContent}
                    </ReactMarkdown>
                  )}
                  {msg.role === "assistant" && loading && i === messages.length - 1 && (
                    <span className="inline-block w-[2px] h-[1em] ml-0.5 bg-amber-400 animate-blink align-text-bottom" />
                  )}
                </div>

                {msg.role === "assistant" && parsed.playerCards && parsed.playerCards.length > 0 && (
                  <div className="space-y-3 mt-3 border-t border-gray-800/40 pt-3">
                    {parsed.playerCards.map((cardId) => (
                      <PlayerCard key={cardId} playerId={cardId} t={t} />
                    ))}
                  </div>
                )}

                {/* Suggested questions inside the last assistant bubble */}
                {msg.role === "assistant" && i === messages.length - 1 && parsed.suggestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-800/60">
                    <p className="text-[10px] text-text-secondary mb-2 font-semibold tracking-wider uppercase">💡 Preguntas sugeridas:</p>
                    <div className="flex flex-col gap-1.5">
                      {parsed.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!loading) {
                              onSend(sug)
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-gray-850 hover:bg-amber-500/10 text-xs text-left text-text-secondary hover:text-amber-400 transition-all border border-gray-800 hover:border-amber-500/25 active:scale-[0.99] font-medium"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/30">
                  {msg.role === "assistant" ? (
                    <div className="text-[10px] text-gray-600 flex items-center gap-1">
                      <span>{msg.mode ? MODE_META[msg.mode]?.icon : "🎙️"}</span>
                      <span>{MODES.find(m => m.id === msg.mode)?.name}</span>
                    </div>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    {msg.role === "assistant" && (
                      <>
                        <button onClick={() => onSpeak(parsed.mainContent, i)}
                          className="text-[10px] text-gray-600 hover:text-amber-400 transition-colors flex items-center gap-1">
                          {speakingId === i ? "🔊" : "🔈"}
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(parsed.mainContent); showToast(t("copied"), "success") }}
                          className="text-[10px] text-gray-600 hover:text-amber-400 transition-colors" title={t("copied")}>📋</button>
                        <button onClick={() => {
                          const text = `### ${t("agent")} (${msg.mode || mode})\n${parsed.mainContent}`
                          const a = document.createElement("a")
                          a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" }))
                          a.download = `football-genius-msg-${i+1}.md`
                          a.click()
                        }} className="text-[10px] text-gray-600 hover:text-amber-400 transition-colors" title={t("export")}>📥</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {loading && (messages.length === 0 || messages[messages.length - 1].role !== "assistant") && (
          <div className="flex justify-start message-enter">
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-sm">
              <div className="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex-none border-t border-gray-800/50 bg-canvas px-4 py-2">
        {/* Chat action toolbar */}
        {messages.length > 0 && (
          <div className="max-w-4xl mx-auto flex items-center gap-2 pb-2">
            <button onClick={onShare} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t("share")}>📤 {t("share")}</button>
            <button onClick={onCopy} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t("copied")}>{copied ? "✅" : "📋"} {t("copied")}</button>
            <button onClick={onExport} className="p-1.5 rounded-lg text-xs text-text-secondary hover:text-gray-200 hover:bg-gray-800/50 transition-all" title={t("export")}>📥 {t("export")}</button>
          </div>
        )}
        <div className="max-w-4xl mx-auto flex gap-2.5 items-center">
          <div className="flex-1 relative flex items-center gap-2">
            <input ref={inputRef} value={input} onChange={e => onInputChange(e.target.value)} onKeyDown={onKeyDown}
              placeholder={t("followUp")}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-text-primary placeholder-gray-500 focus:outline-none focus:border-amber-500/40 focus:bg-gray-800/80 text-sm transition-all"
              disabled={loading} />
            <button onClick={isListening ? onStopListening : onStartListening}
              className={`p-2.5 rounded-xl transition-all ${isListening ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" : "bg-gray-800/50 text-text-secondary hover:text-gray-200 hover:bg-gray-700/50 border border-gray-700/50"}`}
              title={isListening ? t("listening") : t("voiceTitle")}>
              🎤
            </button>
          </div>
          <button onClick={() => onSend()} disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/10">
            {loading ? <span className="flex items-center gap-1"><span className="animate-pulse">···</span></span> : t("send")}
          </button>
        </div>
      </div>
    </div>
  )
}
