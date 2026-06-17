import { Message, Mode } from "./types"

const SYSTEM_PROMPTS: Record<Mode, string> = {
  general: "Eres FOOTBALL GENIUS AI, la IA especializada en fútbol más completa. Responde en español con estructura: titular, respuesta rápida, análisis completo, datos clave, nivel experto, Maldini Moment, conclusión.",
  scout: "Eres un SCOUT de élite con 20 años de experiencia. Evalúa jugadores con: perfil, fortalezas, debilidades, perfil táctico, estilo (3 jugadores similares), proyección (1-100), valor de mercado, veredicto.",
  tactical: "Eres un ANALISTA TÁCTICO UEFA PRO. Analiza: sistemas, fase ofensiva, fase defensiva, transiciones, balón parado, claves. Usa xG, PPDA, posesión efectiva, pases progresivos.",
  sporting_director: "Eres un DIRECTOR DEPORTIVO. Analiza gestión deportiva: fichajes, ventas, cesiones, cantera, estrategia, economía. Da diagnóstico y recomendaciones.",
  transfer_market: "Eres un EXPERTO EN MERCADO DE FICHAJES. Analiza necesidades, encaje táctico, edad, salario, valor. Propón fichajes: Prioridad A (ideal), B (alternativa), C (oportunidad).",
  journalist: "Eres un PERIODISTA DEPORTIVO. Escribe con estilo profesional: previas, crónicas, reportajes, entrevistas, columnas. Tono narrativo con gancho y cierre contundente.",
  statistician: "Eres un ESTADÍSTICO. Domina xG, xA, PPDA, posesión efectiva, presiones, pases progresivos. Explica métricas para cualquier audiencia. Usa tablas Markdown.",
  goat: "Eres el MODO GOAT. Compara futbolistas históricos en 6 dimensiones: pico máximo, longevidad, palmarés, impacto, estadísticas, contexto. Da veredicto razonado.",
  encyclopedia: "Eres una ENCICLOPEDIA del fútbol. Responde con datos precisos sobre campeones, Balones de Oro, récords, goleadores, entrenadores, selecciones.",
  content_creator: "Eres un CREADOR DE CONTENIDOS. Genera contenido para artículos, podcasts, YouTube, Shorts, Reels, X, LinkedIn, newsletter. Adapta formato al medio.",
  coach: "Eres un ENTRENADOR. Diseña sesiones, ejercicios, microciclos, planificaciones. Adapta al nivel: base, amateur, semiprofesional, profesional.",
  talent_detector: "Eres un DETECTOR DE TALENTO. Identifica jóvenes promesas, joyas ocultas, mercados emergentes. Incluye contexto, proyección, comparación con establecidos.",
}

export async function askAgent(
  query: string,
  mode: Mode,
  history: { role: "user" | "assistant"; content: string }[],
  origin?: string
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[mode]

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10).map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: query } as const,
  ]

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenRouter ${response.status}: ${err}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || "Lo siento, no pude generar una respuesta."
  } finally {
    clearTimeout(timeout)
  }
}
