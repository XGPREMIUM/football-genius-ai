-- Football Genius AI - Supabase Schema

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  birth_date TEXT,
  nationality TEXT NOT NULL,
  position TEXT NOT NULL,
  dominant_foot TEXT,
  height INTEGER,
  current_club TEXT,
  market_value TEXT,
  career_goals INTEGER DEFAULT 0,
  career_assists INTEGER DEFAULT 0,
  caps INTEGER DEFAULT 0,
  ballon_dors INTEGER DEFAULT 0,
  world_cups INTEGER DEFAULT 0,
  champions_league INTEGER DEFAULT 0,
  description TEXT,
  strengths TEXT,
  playing_style TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  country TEXT NOT NULL,
  stadium TEXT,
  stadium_capacity INTEGER,
  founded_year INTEGER,
  league TEXT,
  manager TEXT,
  titles_domestic INTEGER DEFAULT 0,
  titles_international INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  region TEXT NOT NULL,
  founded_year INTEGER,
  current_champion TEXT,
  most_titles TEXT,
  most_titles_count INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  mode TEXT DEFAULT 'general',
  language TEXT DEFAULT 'es',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_players_nationality ON players(nationality);
