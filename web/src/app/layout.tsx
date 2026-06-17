import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Football Genius AI",
  description: "El agente virtual de fútbol más completo del mundo",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#0d1117] text-[#e6edf3] antialiased">
        {children}
      </body>
    </html>
  )
}
