-- FMA Music Integration Database Schema
-- Erstellt Tabellen für FMA Favoriten und User Preferences

-- ============================================
-- FMA FAVORITES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_fma_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_fma_favorites_user_id 
  ON user_fma_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_fma_favorites_created_at 
  ON user_fma_favorites(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fma_favorites_track_id 
  ON user_fma_favorites(track_id);

-- Full-text search auf track_data
CREATE INDEX IF NOT EXISTS idx_fma_favorites_track_data_gin 
  ON user_fma_favorites USING GIN (track_data);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_fma_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users können nur eigene Favoriten sehen
DROP POLICY IF EXISTS "Users can view own FMA favorites" ON user_fma_favorites;
CREATE POLICY "Users can view own FMA favorites"
  ON user_fma_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users können eigene Favoriten erstellen
DROP POLICY IF EXISTS "Users can insert own FMA favorites" ON user_fma_favorites;
CREATE POLICY "Users can insert own FMA favorites"
  ON user_fma_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users können eigene Favoriten löschen
DROP POLICY IF EXISTS "Users can delete own FMA favorites" ON user_fma_favorites;
CREATE POLICY "Users can delete own FMA favorites"
  ON user_fma_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Users können eigene Favoriten updaten
DROP POLICY IF EXISTS "Users can update own FMA favorites" ON user_fma_favorites;
CREATE POLICY "Users can update own FMA favorites"
  ON user_fma_favorites FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USER MUSIC PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS user_music_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_source TEXT DEFAULT 'fma' CHECK (preferred_source IN ('fma', 'pixabay', 'both')),
  preferred_licenses TEXT[] DEFAULT ARRAY['cc-by', 'cc-by-sa'],
  preferred_genres TEXT[] DEFAULT ARRAY[]::TEXT[],
  auto_attribution BOOLEAN DEFAULT true,
  commercial_use_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_music_preferences_user_id 
  ON user_music_preferences(user_id);

-- RLS
ALTER TABLE user_music_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own music preferences" ON user_music_preferences;
CREATE POLICY "Users can view own music preferences"
  ON user_music_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own music preferences" ON user_music_preferences;
CREATE POLICY "Users can insert own music preferences"
  ON user_music_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own music preferences" ON user_music_preferences;
CREATE POLICY "Users can update own music preferences"
  ON user_music_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für user_fma_favorites
DROP TRIGGER IF EXISTS update_fma_favorites_updated_at ON user_fma_favorites;
CREATE TRIGGER update_fma_favorites_updated_at
  BEFORE UPDATE ON user_fma_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger für user_music_preferences
DROP TRIGGER IF EXISTS update_music_preferences_updated_at ON user_music_preferences;
CREATE TRIGGER update_music_preferences_updated_at
  BEFORE UPDATE ON user_music_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ANALYTICS & STATS (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS fma_track_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_name TEXT,
  artist_name TEXT,
  license TEXT,
  action TEXT CHECK (action IN ('play', 'favorite', 'download', 'select_for_video', 'share')),
  source TEXT DEFAULT 'fma',
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fma_analytics_user_id 
  ON fma_track_analytics(user_id);

CREATE INDEX IF NOT EXISTS idx_fma_analytics_track_id 
  ON fma_track_analytics(track_id);

CREATE INDEX IF NOT EXISTS idx_fma_analytics_created_at 
  ON fma_track_analytics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fma_analytics_action 
  ON fma_track_analytics(action);

-- RLS
ALTER TABLE fma_track_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert analytics" ON fma_track_analytics;
CREATE POLICY "Anyone can insert analytics"
  ON fma_track_analytics FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own analytics" ON fma_track_analytics;
CREATE POLICY "Users can view own analytics"
  ON fma_track_analytics FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get user's favorite tracks count
CREATE OR REPLACE FUNCTION get_fma_favorites_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM user_fma_favorites
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get most popular FMA tracks (by favorites)
CREATE OR REPLACE FUNCTION get_popular_fma_tracks(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  track_id TEXT,
  track_data JSONB,
  favorite_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.track_id,
    f.track_data,
    COUNT(*)::BIGINT as favorite_count
  FROM user_fma_favorites f
  GROUP BY f.track_id, f.track_data
  ORDER BY favorite_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's music stats
CREATE OR REPLACE FUNCTION get_user_music_stats(p_user_id UUID)
RETURNS TABLE (
  fma_favorites INTEGER,
  pixabay_favorites INTEGER,
  total_plays INTEGER,
  preferred_source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM user_fma_favorites WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM user_music_favorites WHERE user_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM fma_track_analytics WHERE user_id = p_user_id AND action = 'play'),
    (SELECT preferred_source FROM user_music_preferences WHERE user_id = p_user_id)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_fma_favorites TO authenticated;
GRANT ALL ON user_music_preferences TO authenticated;
GRANT ALL ON fma_track_analytics TO authenticated;

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Beispiel: Default Preferences für neue User
CREATE OR REPLACE FUNCTION create_default_music_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_music_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-create preferences for new users
DROP TRIGGER IF EXISTS create_music_preferences_on_signup ON auth.users;
CREATE TRIGGER create_music_preferences_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_music_preferences();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_fma_favorites', 'user_music_preferences', 'fma_track_analytics');

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_fma_favorites', 'user_music_preferences', 'fma_track_analytics');

-- Verify indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('user_fma_favorites', 'user_music_preferences', 'fma_track_analytics');

-- ============================================
-- DONE
-- ============================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ FMA Integration Database Setup Complete!';
  RAISE NOTICE '📊 Tables: user_fma_favorites, user_music_preferences, fma_track_analytics';
  RAISE NOTICE '🔒 RLS Policies: Enabled';
  RAISE NOTICE '📈 Indexes: Created';
  RAISE NOTICE '⚡ Triggers: Active';
END $$;
