import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Football Genius AI",
    short_name: "Futbol AI",
    description: "El agente virtual de fútbol con IA más completo del mundo",
    start_url: "/es",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#f59e0b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
