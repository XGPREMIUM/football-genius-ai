-- Football Genius AI - Gamification Schema

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_trivia_stats (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_played INTEGER NOT NULL DEFAULT 0,
  perfect_scores INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Configuration (Optional but recommended for Supabase)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trivia_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow users to read their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to read their own trivia stats"
  ON user_trivia_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own trivia stats"
  ON user_trivia_stats FOR ALL
  USING (auth.uid() = user_id);
