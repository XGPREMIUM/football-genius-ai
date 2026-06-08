export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Mode {
  key: string;
  icon: string;
  name: string;
  description: string;
}

export interface QueryRequest {
  query: string;
  mode: string;
  stream?: boolean;
}

export interface QueryResponse {
  response: string;
  mode: string;
}

export const MODES: Mode[] = [
  { key: 'general', icon: '🌍', name: 'General', description: 'Análisis completo con todos los recursos' },
  { key: 'scout', icon: '🔍', name: 'Scout', description: 'Perfil detallado de jugadores' },
  { key: 'tactical', icon: '📋', name: 'Táctico', description: 'Análisis de partidos y sistemas' },
  { key: 'sporting_director', icon: '📊', name: 'Director Deportivo', description: 'Gestión de plantillas' },
  { key: 'transfer_market', icon: '💰', name: 'Mercado', description: 'Recomendaciones de fichajes' },
  { key: 'journalist', icon: '📰', name: 'Periodista', description: 'Crónicas y reportajes' },
  { key: 'statistician', icon: '📈', name: 'Estadístico', description: 'Métricas avanzadas' },
  { key: 'goat', icon: '🏆', name: 'GOAT', description: 'Debates de mejores de la historia' },
  { key: 'encyclopedia', icon: '📚', name: 'Enciclopedia', description: 'Datos históricos y récords' },
  { key: 'content_creator', icon: '🎬', name: 'Content Creator', description: 'Posts, hilos, guiones' },
  { key: 'coach', icon: '🧠', name: 'Entrenador', description: 'Sesiones y planificaciones' },
  { key: 'talent_detector', icon: '⭐', name: 'Talent Scout', description: 'Jóvenes promesas' },
];

export const MODE_QUESTIONS: Record<string, string[]> = {
  general: ['¿Quién es el mejor jugador de la historia?', 'Analiza el mejor partido de la historia', '¿Quién ganará el próximo Mundial?'],
  scout: ['Analiza a Lamine Yamal', 'Scout report: Bellingham vs Pedri', '5 mayores promesas del fútbol mundial'],
  tactical: ['Analiza el 4-3-3 vs 4-4-2', 'Evolución del falso 9', 'Qué es un box midfield'],
  sporting_director: ['Diagnóstico del Manchester United', '¿Qué necesita el Barça?', 'Planificación del Real Madrid'],
  transfer_market: ['Fichajes necesarios para el Real Madrid', 'Top 10 jugadores más valiosos', 'Agentes libres top 2025'],
  journalist: ['Crónica final Champions 2024', 'Impacto de la Eurocopa 2024', 'Columna: ¿El VAR mejora el fútbol?'],
  statistician: ['Compara Messi vs Ronaldo stats', 'Explica xG con ejemplos', 'Los 10 récords más impresionantes'],
  goat: ['Messi vs Maradona', 'Cristiano vs Pelé', 'Top 5 entrenadores de la historia'],
  encyclopedia: ['Todos los campeones del Mundo', 'Máximos goleadores históricos', 'Récords imbatibles'],
  content_creator: ['Hilo de X sobre el 4-3-3', 'Guión para video de 10 min', 'Post LinkedIn: liderazgo'],
  coach: ['Sesión de posesión para juveniles', 'Microciclo semanal profesional', 'Ejercicios salida de balón'],
  talent_detector: ['Joyas ocultas de Sudamérica', 'Promesas africanas', 'Talento emergente en Portugal'],
};
