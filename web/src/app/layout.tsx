import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Football Genius AI",
  description: "El agente virtual de fútbol más completo del mundo",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
