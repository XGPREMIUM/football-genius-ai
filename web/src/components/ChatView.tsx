"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useTranslations, useLocale } from "next-intl"
import { MODES } from "@/lib/data"
import type { Message, Mode } from "@/lib/types"

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
  onSend: () => void; onInputChange: (v: string) => void; onKeyDown: (e: React.KeyboardEvent) => void
  onSpeak: (text: string, id: number) => void
  onCopy: () => void; onShare: () => void; onExport: () => void; onNewChat: () => void
  isListening: boolean; onStartListening: () => void; onStopListening: () => void
  input: string; copied: boolean; t: any
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-4xl mx-auto w-full scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[60vh] text-center">
            <div>
              <div className="text-6xl mb-4">⚽</div>
              <p className="text-text-secondary text-sm">{t("startChat")}</p>
              <p className="text-text-muted text-xs mt-2">{t("currentMode", { mode: MODES.find(m => m.id === mode)?.name || "" })}</p>
            </div>
          </div>
        )}
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
                  <button onClick={() => onSpeak(msg.content, i)}
                    className="text-[10px] text-gray-600 hover:text-amber-400 transition-colors flex items-center gap-1">
                    {speakingId === i ? "🔊" : "🔈"} {speakingId === i ? t("detener") : t("leer")}
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
          <button onClick={onSend} disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/10">
            {loading ? <span className="flex items-center gap-1"><span className="animate-pulse">···</span></span> : t("send")}
          </button>
        </div>
      </div>
    </div>
  )
}
