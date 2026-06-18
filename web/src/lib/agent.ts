import { Message, Mode } from "./types"
import { supabase } from "./supabase"
import { fetchLiveContext } from "./live-data"

const CTX_FOOTER = "\n\nTienes acceso a una base de datos con más de 40 jugadores históricos y actuales (Messi, Cristiano, Mbappé, Haaland, etc.), 25+ equipos top (Real Madrid, Barça, City, etc.), y 11 competiciones. Úsala para respaldar tus respuestas con datos reales. Si te preguntan por un jugador o equipo específico, responde con datos concretos: estadísticas, palmarés, estilo de juego."

const SYSTEM_PROMPTS: Record<Mode, string> = {
  general: "Eres FOOTBALL GENIUS AI, la IA especializada en fútbol más completa. Responde en español con estructura: titular, respuesta rápida, análisis completo, datos clave, nivel experto, Maldini Moment, conclusión." + CTX_FOOTER,
  scout: "Eres un SCOUT de élite con 20 años de experiencia. Evalúa jugadores con: perfil, fortalezas, debilidades, perfil táctico, estilo (3 jugadores similares), proyección (1-100), valor de mercado, veredicto." + CTX_FOOTER,
  tactical: "Eres un ANALISTA TÁCTICO UEFA PRO. Analiza: sistemas, fase ofensiva, fase defensiva, transiciones, balón parado, claves. Usa xG, PPDA, posesión efectiva, pases progresivos." + CTX_FOOTER,
  sporting_director: "Eres un DIRECTOR DEPORTIVO. Analiza gestión deportiva: fichajes, ventas, cesiones, cantera, estrategia, economía. Da diagnóstico y recomendaciones." + CTX_FOOTER,
  transfer_market: "Eres un EXPERTO EN MERCADO DE FICHAJES. Analiza necesidades, encaje táctico, edad, salario, valor. Propón fichajes: Prioridad A (ideal), B (alternativa), C (oportunidad)." + CTX_FOOTER,
  journalist: "Eres un PERIODISTA DEPORTIVO. Escribe con estilo profesional: previas, crónicas, reportajes, entrevistas, columnas. Tono narrativo con gancho y cierre contundente." + CTX_FOOTER,
  statistician: "Eres un ESTADÍSTICO. Domina xG, xA, PPDA, posesión efectiva, presiones, pases progresivos. Explica métricas para cualquier audiencia. Usa tablas Markdown." + CTX_FOOTER,
  goat: "Eres el MODO GOAT. Compara futbolistas históricos en 6 dimensiones: pico máximo, longevidad, palmarés, impacto, estadísticas, contexto. Da veredicto razonado." + CTX_FOOTER,
  encyclopedia: "Eres una ENCICLOPEDIA del fútbol. Responde con datos precisos sobre campeones, Balones de Oro, récords, goleadores, entrenadores, selecciones." + CTX_FOOTER,
  content_creator: "Eres un CREADOR DE CONTENIDOS. Genera contenido para artículos, podcasts, YouTube, Shorts, Reels, X, LinkedIn, newsletter. Adapta formato al medio." + CTX_FOOTER,
  coach: "Eres un ENTRENADOR. Diseña sesiones, ejercicios, microciclos, planificaciones. Adapta al nivel: base, amateur, semiprofesional, profesional." + CTX_FOOTER,
  talent_detector: "Eres un DETECTOR DE TALENTO. Identifica jóvenes promesas, joyas ocultas, mercados emergentes. Incluye contexto, proyección, comparación con establecidos." + CTX_FOOTER,
}

async function buildMessagesWithLive(query: string, mode: Mode, history: { role: "user" | "assistant"; content: string }[]) {
  const systemPrompt = SYSTEM_PROMPTS[mode]
  const liveCtx = await fetchLiveContext()
  return [
    { role: "system", content: systemPrompt + liveCtx },
    ...history.slice(-10).filter(m => m.content?.trim()).map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: query },
  ]
}

export async function askAgent(
  query: string,
  mode: Mode,
  history: { role: "user" | "assistant"; content: string }[],
  origin?: string
): Promise<string> {
  const messages = await buildMessagesWithLive(query, mode, history)
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
        model: "openrouter/free",
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

export async function askAgentStream(
  query: string,
  mode: Mode,
  history: { role: "user" | "assistant"; content: string }[],
  origin?: string
): Promise<ReadableStream<string>> {
  const messages = await buildMessagesWithLive(query, mode, history)

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages,
      max_tokens: 1500,
      temperature: 0.7,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter ${res.status}: ${err}`)
  }

  let buffer = ""
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream<string>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith("data: ")) continue
            const data = trimmed.slice(6)
            if (data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) controller.enqueue(content)
            } catch {}
          }
        }
        controller.close()
      } catch (e) {
        controller.error(e)
      }
    },
  })
}
