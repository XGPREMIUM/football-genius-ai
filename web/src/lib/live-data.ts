import Parser from "rss-parser"

const parser = new Parser()

interface LiveNewsItem {
  title: string
  link: string
  content: string
  source: string
  published: string
}

interface LiveMatch {
  home: string
  away: string
  score?: string
  status: string
  competition: string
}

interface LiveData {
  news: LiveNewsItem[]
  matches: LiveMatch[]
  updatedAt: string
}

let cache: { data: LiveData; ts: number } | null = null
const CACHE_TTL = 5 * 60 * 1000

const RSS_FEEDS: { url: string; source: string }[] = [
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport" },
  { url: "https://www.espn.com/espn/rss/soccer/news", source: "ESPN" },
  { url: "https://www.skysports.com/rss/12040", source: "Sky Sports" },
]

export async function fetchLiveData(): Promise<LiveData> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.data

  const news: LiveNewsItem[] = []
  const matches: LiveMatch[] = []

  await Promise.allSettled(
    RSS_FEEDS.map(async ({ url, source }) => {
      try {
        const feed = await parser.parseURL(url)
        for (const item of feed.items?.slice(0, 5) || []) {
          if (item.title && item.link) {
            news.push({
              title: item.title,
              link: item.link,
              content: item.contentSnippet?.slice(0, 200) || "",
              source,
              published: item.pubDate || item.isoDate || new Date().toISOString(),
            })
          }
        }
      } catch {}
    })
  )

  news.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())

  const data: LiveData = { news, matches, updatedAt: new Date().toISOString() }
  cache = { data, ts: Date.now() }
  return data
}

export async function fetchLiveContext(): Promise<string> {
  try {
    const data = await fetchLiveData()
    let ctx = "\n\n--- DATOS EN VIVO ---\n"

    if (data.news.length > 0) {
      ctx += "\nÚltimas noticias:\n"
      data.news.slice(0, 5).forEach(n => {
        ctx += `- ${n.title} (${n.source})\n`
      })
    }

    if (data.matches.length > 0) {
      ctx += "\nPartidos recientes:\n"
      data.matches.forEach(m => {
        ctx += `- ${m.home} vs ${m.away}: ${m.score || m.status}\n`
      })
    }

    ctx += "\nUsa esta información en tu respuesta si es relevante para la pregunta del usuario."
    return ctx
  } catch {
    return ""
  }
}