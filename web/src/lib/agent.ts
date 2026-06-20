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
  fantasy_manager: "Eres un ASESOR DE FANTASY FOOTBALL (Biwenger, Comunio, LaLiga Fantasy, FPL). Analiza: estado de forma, precio, recomendación de fichar/vender (Chollo, Apuesta, Evitar), puntuación esperada, consejos de capitanía y alineación." + CTX_FOOTER,
  referee: "Eres un ÁRBITRO DE ÉLITE e instructor VAR. Analiza jugadas polémicas, tarjetas, penaltis, fueras de juego y decisiones del VAR basándote en las Reglas de Juego de la IFAB vigentes. Sé neutral, objetivo y didáctico." + CTX_FOOTER,
}

async function fetchDbContext(query: string): Promise<string> {
  const words = query
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
    .split(/\s+/)
    .filter(w => w.length >= 3)

  if (words.length === 0) return ""

  try {
    const playerPromises = words.map(word => 
      supabase.from("players").select("*").or(`name.ilike.%${word}%,full_name.ilike.%${word}%`).limit(2)
    )
    const teamPromises = words.map(word => 
      supabase.from("teams").select("*").or(`name.ilike.%${word}%,full_name.ilike.%${word}%`).limit(2)
    )

    const playerResults = await Promise.allSettled(playerPromises)
    const teamResults = await Promise.allSettled(teamPromises)

    const uniquePlayers = new Map<string, any>()
    const uniqueTeams = new Map<string, any>()

    for (const res of playerResults) {
      if (res.status === "fulfilled" && res.value.data) {
        res.value.data.forEach(p => uniquePlayers.set(p.id, p))
      }
    }

    for (const res of teamResults) {
      if (res.status === "fulfilled" && res.value.data) {
        res.value.data.forEach(t => uniqueTeams.set(t.id, t))
      }
    }

    let ctx = ""
    if (uniquePlayers.size > 0) {
      ctx += "\n\n--- DATOS DE JUGADORES ENCONTRADOS EN LA BD ---\n"
      Array.from(uniquePlayers.values()).slice(0, 4).forEach(p => {
        ctx += `- ID del Jugador: "${p.id}". Nombre: ${p.full_name} (${p.nationality}, ${p.position}). Club actual: ${p.current_club || "Ninguno"}. Goles carrera: ${p.career_goals || 0}, Asistencias: ${p.career_assists || 0}, Balones de Oro: ${p.ballon_dors || 0}, Champions: ${p.champions_league || 0}, Mundial: ${p.world_cups || 0}. Valor de mercado: ${p.market_value || "N/A"}.\n  Estilo de juego: ${p.playing_style || ""}\n  Fortalezas: ${p.strengths || ""}\n`
      })
    }

    if (uniqueTeams.size > 0) {
      ctx += "\n\n--- DATOS DE EQUIPOS ENCONTRADOS EN LA BD ---\n"
      Array.from(uniqueTeams.values()).slice(0, 4).forEach(t => {
        ctx += `- ${t.full_name} (País: ${t.country}): Estadio: ${t.stadium || "N/A"} (Capacidad: ${t.stadium_capacity || 0}). Fundado en: ${t.founded_year || "N/A"}. Entrenador: ${t.manager || "N/A"}. Títulos nacionales: ${t.titles_domestic || 0}, Títulos internacionales: ${t.titles_international || 0}.\n  Descripción: ${t.description || ""}\n`
      })
    }

    return ctx
  } catch (error) {
    console.error("Error fetching db context:", error)
    return ""
  }
}

async function buildMessagesWithLive(query: string, mode: Mode, history: { role: "user" | "assistant"; content: string }[]) {
  const systemPrompt = SYSTEM_PROMPTS[mode]
  const liveCtx = await fetchLiveContext()
  const dbCtx = await fetchDbContext(query)

  const cardInstruction = "\n\nIMPORTANTE: Si el usuario te pregunta sobre un jugador específico y sus datos están presentes en los DATOS DE JUGADORES ENCONTRADOS EN LA BD, al final de tu respuesta de texto (pero antes del bloque de [SUGERENCIAS]) debes escribir exactamente la etiqueta `[PLAYER_CARD: id_del_jugador]` usando el ID del Jugador indicado (por ejemplo: `[PLAYER_CARD: messi]`). Nunca inventes el ID; usa solo los provistos en la BD. Esto renderizará su ficha técnica y gráfico de radar."

  const suggestionInstruction = "\n\nIMPORTANTE: Al final de tu respuesta, obligatoriamente genera exactamente 3 preguntas sugeridas de seguimiento que sean interesantes, realistas y relacionadas con la consulta. Debes usar exactamente este formato en una línea al final (sin negritas ni prefijos extra): [SUGERENCIAS] Pregunta 1 | Pregunta 2 | Pregunta 3"

  return [
    { role: "system", content: systemPrompt + liveCtx + dbCtx + cardInstruction + suggestionInstruction },
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
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 2500,
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
      model: "google/gemini-2.5-flash",
      messages,
      max_tokens: 2500,
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
