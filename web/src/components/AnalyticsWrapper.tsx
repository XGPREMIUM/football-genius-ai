"use client"

import { Analytics } from "@vercel/analytics/react"
import { Component, type ReactNode } from "react"

class AnalyticsErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch() { /* suppress INVALID_MESSAGE from web vitals */ }
  render() { return this.state.hasError ? null : this.props.children }
}

export default function AnalyticsWrapper() {
  return (
    <AnalyticsErrorBoundary>
      <Analytics />
    </AnalyticsErrorBoundary>
  )
}
