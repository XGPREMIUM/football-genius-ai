"use client"

import { useEffect, useState } from "react"

export type ToastType = "error" | "success" | "info"

let toastQueue: { message: string; type: ToastType; id: number }[] = []
let setGlobalToast: ((t: { message: string; type: ToastType; id: number }) => void) | null = null
let idCounter = 0

export function showToast(message: string, type: ToastType = "error") {
  if (setGlobalToast) {
    setGlobalToast({ message, type, id: ++idCounter })
  } else {
    toastQueue.push({ message, type, id: ++idCounter })
  }
}

export default function Toast() {
  const [item, setItem] = useState<{ message: string; type: ToastType; id: number } | null>(null)

  useEffect(() => {
    setGlobalToast = (t) => setItem(t)
    toastQueue.forEach(t => setItem(t))
    toastQueue = []
    return () => { setGlobalToast = null }
  }, [])

  useEffect(() => {
    if (!item) return
    const id = setTimeout(() => setItem(null), 4000)
    return () => clearTimeout(id)
  }, [item])

  if (!item) return null

  const colors: Record<ToastType, string> = {
    error: "border-red-500/30 bg-red-500/10 text-red-400",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    info: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-fade-in">
      <div className={`px-4 py-2.5 rounded-xl border text-sm font-medium backdrop-blur-md shadow-xl ${colors[item.type]}`}>
        <div className="flex items-center gap-2">
          <span>{item.type === "error" ? "⚠️" : item.type === "success" ? "✅" : "ℹ️"}</span>
          <span>{item.message}</span>
        </div>
      </div>
    </div>
  )
}
