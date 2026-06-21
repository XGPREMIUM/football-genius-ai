import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Eres un historiador y experto de trivias de fútbol. Genera preguntas interesantes, difíciles y con datos precisos."
          },
          {
            role: "user",
            content: "Genera 3 preguntas de trivia sobre fútbol en español (competencias, historia, jugadores, records). Debes devolver estrictamente un objeto JSON (sin bloques de código markdown, sin texto extra, solo el objeto JSON) con la siguiente estructura exacta:\n{\n  \"questions\": [\n    {\n      \"question\": \"Pregunta aquí...\",\n      \"options\": [\"Opción A\", \"Opción B\", \"Opción C\", \"Opción D\"],\n      \"answerIndex\": 0,\n      \"explanation\": \"Explicación detallada de por qué esa es la respuesta correcta.\"\n    }\n  ]\n}"
          }
        ],
        temperature: 0.85,
        max_tokens: 1000
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`OpenRouter error: ${response.status} ${errText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ""
    
    // Strip markdown formatting if the model wrapped it in ```json ... ```
    let cleanedJson = content.trim()
    if (cleanedJson.startsWith("```")) {
      cleanedJson = cleanedJson.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim()
    }

    const parsed = JSON.parse(cleanedJson)
    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error("Trivia API error:", err)
    // Fallback static questions if AI call fails
    return NextResponse.json({
      questions: [
        {
          question: "¿Qué país ganó el primer Mundial de Fútbol en 1930?",
          options: ["Argentina", "Uruguay", "Brasil", "Italia"],
          answerIndex: 1,
          explanation: "Uruguay fue el anfitrión y campeón de la primera Copa del Mundo de 1930 al vencer a Argentina 4-2 en la final."
        },
        {
          question: "¿Quién es el máximo goleador histórico de la Champions League?",
          options: ["Lionel Messi", "Cristiano Ronaldo", "Robert Lewandowski", "Raúl González"],
          answerIndex: 1,
          explanation: "Cristiano Ronaldo ostenta el récord histórico de goles de la UEFA Champions League con 140 anotaciones."
        },
        {
          question: "¿En qué club europeo debutó profesionalmente Zlatan Ibrahimović?",
          options: ["Malmö FF", "Ajax", "Juventus", "Paris Saint-Germain"],
          answerIndex: 1,
          explanation: "Aunque se formó en el Malmö FF de Suecia, su gran debut internacional europeo fue con el Ajax de Ámsterdam en 2001."
        }
      ]
    })
  }
}
