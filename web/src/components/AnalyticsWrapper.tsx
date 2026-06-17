"use client"

import { Analytics } from "@vercel/analytics/react"
import { Component, type ReactNode, useEffect } from "react"

class AnalyticsErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch() { /* suppress INVALID_MESSAGE from web vitals */ }
  render() { return this.state.hasError ? null : this.props.children }
}

function Suppressor() {
  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      if (e.message?.includes?.("INVALID_MESSAGE")) e.preventDefault()
    }
    window.addEventListener("error", handler)
    return () => window.removeEventListener("error", handler)
  }, [])
  return null
}

export default function AnalyticsWrapper() {
  return (
    <AnalyticsErrorBoundary>
      <Suppressor />
      <Analytics />
    </AnalyticsErrorBoundary>
  )
}
