import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://football-genius-ai.vercel.app"

  return [
    { url: `${baseUrl}/es`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  ]
}
