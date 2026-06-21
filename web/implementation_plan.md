# Plan de Implementación — Perfiles Técnicos y Gamificación

Propuesta para convertir **Football Genius AI** en una plataforma interactiva completa a través de dos grandes módulos: **Perfiles Técnicos Visuales** (Fichas de Jugador estilo Football Manager/EA FC) y **Football Genius Academy** (Sistema de Gamificación con niveles, Trivias generadas por IA y predicciones de partidos).

---

## User Review Required

> [!IMPORTANT]
> El sistema de gamificación requiere crear tres nuevas tablas en Supabase (`user_profiles`, `user_trivia_stats` y `match_predictions`). Se adjuntan los scripts SQL necesarios para ejecutar en tu panel de Supabase.

> [!NOTE]
> Para los gráficos de radar táctico (radar charts) y estadísticas de rendimiento, utilizaremos **gráficos SVG dinámicos integrados en React** para evitar recargar el bundle con librerías pesadas y asegurar un diseño 100% responsive, fluido y personalizable con CSS.

---

## Proposed Changes

### Componente 1: Fichas de Perfil Técnico (Scout Cards)

Queremos que cuando el usuario pregunte por Lamine Yamal, Messi o Haaland (o use el modo Scout), el chat renderice un widget interactivo con:
- **EA FC/FM Card**: Una carta visual con su foto/iniciales, media general estimativa (rating), nacionalidad, pie hábil y sus 3 mejores atributos.
- **Radar Chart SVG**: Un gráfico de araña que visualice sus 6 métricas clave: Ataque, Creación, Físico, Defensa, Táctica, Mental.
- **Stats Breakdown**: Desglose detallado de goles, asistencias, partidos y títulos en su carrera.

#### [NEW] [PlayerCard.tsx](file:///c:/Users/param/Documents/FOOTBALL%20IA%20PROJECTS/FOOTBALL%20AI/web/src/components/PlayerCard.tsx)
- Renderizado de la carta de jugador en CSS (Glassmorphism con gradientes personalizados según la rareza/calidad del jugador).
- Gráfico de radar SVG matemático interactivo y responsivo.

#### [MODIFY] [ChatView.tsx](file:///c:/Users/param/Documents/FOOTBALL%20IA%20PROJECTS/FOOTBALL%20AI/web/src/components/ChatView.tsx)
- Interceptar menciones o tags del tipo `[PLAYER_CARD: id_jugador]` que la IA inyecte cuando detecte que el usuario pide un análisis de perfil técnico, y renderizar el componente `PlayerCard`.

---

### Componente 2: Football Genius Academy (Gamificación)

Queremos incentivar al usuario a interactuar diariamente mediante:
1. **Nivel y XP de Manager**: Puntos de experiencia ganados al chatear, comparar jugadores, o acertar trivias. Rangos desde "Aficionado" hasta "Director Deportivo UEFA PRO".
2. **Trivia Diaria IA**: Un modo de juego rápido donde la IA genera 3 preguntas difíciles sobre fútbol. Si el usuario responde bien, gana XP.
3. **Pronósticos de Partidos (Quiniela)**: Utilizando el LiveFeed, permitir que los usuarios pronostiquen el ganador (1X2) de los partidos de hoy y ganen XP si aciertan.

#### [NEW] [user_profiles table](file:///c:/Users/param/Documents/FOOTBALL%20IA%20PROJECTS/FOOTBALL%20AI/web/supabase/gamification_schema.sql)
- Tabla `user_profiles` para asociar a `auth.users(id)` el nivel (`level`), experiencia (`xp`), y rachas de conexión.
- Tabla `match_predictions` para almacenar los pronósticos de los partidos en vivo de los usuarios.

#### [NEW] [TriviaPortal.tsx](file:///c:/Users/param/Documents/FOOTBALL%20IA%20PROJECTS/FOOTBALL%20AI/web/src/components/TriviaPortal.tsx)
- Un modal o vista dentro de la app donde se juega la trivia del día. La IA genera dinámicamente las preguntas a través de un endpoint de API.

#### [MODIFY] [page.tsx](file:///c:/Users/param/Documents/FOOTBALL%20IA%20PROJECTS/FOOTBALL%20AI/web/src/app/%5Blocale%5D/page.tsx)
- Barra de progreso de nivel (`XP / Level`) junto al avatar del usuario logueado en la cabecera principal.

---

## Verification Plan

### Automated Tests
- Ejecutar `npm run build` para asegurar el correcto tipado de los nuevos componentes e integraciones SVG.

### Manual Verification
- Iniciar sesión y comprobar la aparición de la barra de nivel/XP en la cabecera.
- Consultar un jugador en modo Scout para verificar el renderizado del Radar Chart SVG y la carta visual.
- Abrir la sección de trivia, responder y verificar que la base de datos registra el incremento de XP.
