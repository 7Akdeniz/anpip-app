-- ============================================
-- MIXKIT MUSIC INTEGRATION
-- ============================================
-- Kostenlose, kommerziell erlaubte Musik von Mixkit.co
-- Hosting auf eigenem Storage (Supabase/Cloudflare R2)

-- ============================================
-- MIXKIT TRACKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS mixkit_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Track Identifikation
  mixkit_id TEXT UNIQUE NOT NULL,  -- Original Mixkit Identifier (z.B. "mixkit-123")
  title TEXT NOT NULL,
  description TEXT,
  
  -- Audio Details
  duration_seconds INTEGER NOT NULL,
  bpm INTEGER,
  key TEXT,  -- Musikalischer Ton (C, D, E, etc.)
  
  -- Kategorisierung
  genre TEXT NOT NULL,  -- rock, electronic, ambient, cinematic, etc.
  mood TEXT,  -- happy, sad, energetic, calm, epic, etc.
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Storage URLs
  storage_url TEXT NOT NULL,  -- Hauptspeicherort (Supabase/R2)
  storage_provider TEXT DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 'cloudflare-r2')),
  cdn_url TEXT,  -- Optional: CDN-beschleunigte URL
  file_size_bytes BIGINT NOT NULL,
  file_format TEXT DEFAULT 'mp3' CHECK (file_format IN ('mp3', 'wav', 'ogg')),
  
  -- Metadaten
  artist TEXT DEFAULT 'Mixkit',
  album TEXT,
  year INTEGER,
  
  -- Lizenz & Attribution
  license TEXT DEFAULT 'Mixkit License' NOT NULL,
  license_url TEXT DEFAULT 'https://mixkit.co/license/#sfxFree',
  attribution_required BOOLEAN DEFAULT false,
  commercial_use_allowed BOOLEAN DEFAULT true,
  original_url TEXT,  -- Link zur Original Mixkit-Seite
  
  -- Audio-Analyse (optional, kann später hinzugefügt werden)
  waveform_data JSONB,  -- Für Waveform-Visualisierung
  audio_features JSONB,  -- Tempo-Variationen, Lautstärke-Profile, etc.
  
  -- Performance & Quality
  quality TEXT DEFAULT 'high' CHECK (quality IN ('low', 'medium', 'high', 'lossless')),
  sample_rate INTEGER DEFAULT 44100,
  bitrate_kbps INTEGER DEFAULT 320,
  
  -- Status & Moderation
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted', 'processing')),
  download_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_played_at TIMESTAMPTZ,
  
  -- Admin
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderation_notes TEXT
);

-- ============================================
-- INDEXES
-- ============================================

-- Performance-kritische Indexes
CREATE INDEX IF NOT EXISTS idx_mixkit_tracks_genre 
  ON mixkit_tracks(genre);

CREATE INDEX IF NOT EXISTS idx_mixkit_tracks_mood 
  ON mixkit_tracks(mood);

CREATE INDEX IF NOT EXISTS idx_mixkit_tracks_status 
  ON mixkit_tracks(status);

CREATE INDEX IF NOT EXISTS idx_mixkit_tracks_created_at 
  ON mixkit_tracks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mixkit_tracks_play_count 
  ON mixkit_tracks(play_count DESC);

CREATE INDEX IF NOT EXISTS idx_mixkit_tracks_favorite_count 
  ON mixkit_tracks(favorite_count DESC);

-- Full-text search auf Title + Description
CREATE INDEX IF NOT EXISTS idx_mixkit_tracks_search 
  ON mixkit_tracks USING GIN (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  );

-- Array-Suche auf Tags
CREATE INDEX IF NOT EXISTS idx_mixkit_tracks_tags_gin 
  ON mixkit_tracks USING GIN (tags);

-- Composite Index für häufige Queries
CREATE INDEX IF NOT EXISTS idx_mixkit_tracks_genre_status 
  ON mixkit_tracks(genre, status);

-- ============================================
-- USER MIXKIT FAVORITES
-- ============================================

CREATE TABLE IF NOT EXISTS user_mixkit_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES mixkit_tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_mixkit_favorites_user_id 
  ON user_mixkit_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_mixkit_favorites_track_id 
  ON user_mixkit_favorites(track_id);

CREATE INDEX IF NOT EXISTS idx_mixkit_favorites_created_at 
  ON user_mixkit_favorites(created_at DESC);

-- ============================================
-- MIXKIT ANALYTICS
-- ============================================

CREATE TABLE IF NOT EXISTS mixkit_track_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID NOT NULL REFERENCES mixkit_tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('play', 'download', 'favorite', 'select_for_video', 'share', 'preview')),
  duration_seconds INTEGER,  -- Wie lange wurde abgespielt
  completion_percentage INTEGER,  -- Wie viel % des Tracks
  source TEXT DEFAULT 'app',  -- app, web, api
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mixkit_analytics_track_id 
  ON mixkit_track_analytics(track_id);

CREATE INDEX IF NOT EXISTS idx_mixkit_analytics_user_id 
  ON mixkit_track_analytics(user_id);

CREATE INDEX IF NOT EXISTS idx_mixkit_analytics_action 
  ON mixkit_track_analytics(action);

CREATE INDEX IF NOT EXISTS idx_mixkit_analytics_created_at 
  ON mixkit_track_analytics(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Mixkit Tracks: Alle können lesen, nur Admins können schreiben
ALTER TABLE mixkit_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active mixkit tracks" ON mixkit_tracks;
CREATE POLICY "Anyone can view active mixkit tracks"
  ON mixkit_tracks FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Admins can insert mixkit tracks" ON mixkit_tracks;
CREATE POLICY "Admins can insert mixkit tracks"
  ON mixkit_tracks FOR INSERT
  WITH CHECK (true);  -- TODO: Admin-Check hinzufügen

DROP POLICY IF EXISTS "Admins can update mixkit tracks" ON mixkit_tracks;
CREATE POLICY "Admins can update mixkit tracks"
  ON mixkit_tracks FOR UPDATE
  USING (true)  -- TODO: Admin-Check hinzufügen
  WITH CHECK (true);

-- User Favorites: Standard User-Policies
ALTER TABLE user_mixkit_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own mixkit favorites" ON user_mixkit_favorites;
CREATE POLICY "Users can view own mixkit favorites"
  ON user_mixkit_favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own mixkit favorites" ON user_mixkit_favorites;
CREATE POLICY "Users can insert own mixkit favorites"
  ON user_mixkit_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own mixkit favorites" ON user_mixkit_favorites;
CREATE POLICY "Users can delete own mixkit favorites"
  ON user_mixkit_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Analytics: Jeder kann schreiben, nur eigene lesen
ALTER TABLE mixkit_track_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert mixkit analytics" ON mixkit_track_analytics;
CREATE POLICY "Anyone can insert mixkit analytics"
  ON mixkit_track_analytics FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own mixkit analytics" ON mixkit_track_analytics;
CREATE POLICY "Users can view own mixkit analytics"
  ON mixkit_track_analytics FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Updated At Trigger
CREATE OR REPLACE FUNCTION update_mixkit_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_mixkit_tracks_timestamp ON mixkit_tracks;
CREATE TRIGGER update_mixkit_tracks_timestamp
  BEFORE UPDATE ON mixkit_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_mixkit_tracks_updated_at();

-- Increment Play Count
CREATE OR REPLACE FUNCTION increment_mixkit_play_count(p_track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE mixkit_tracks
  SET 
    play_count = play_count + 1,
    last_played_at = NOW()
  WHERE id = p_track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment Favorite Count
CREATE OR REPLACE FUNCTION update_mixkit_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mixkit_tracks
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.track_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mixkit_tracks
    SET favorite_count = favorite_count - 1
    WHERE id = OLD.track_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_mixkit_favorite_count_trigger ON user_mixkit_favorites;
CREATE TRIGGER update_mixkit_favorite_count_trigger
  AFTER INSERT OR DELETE ON user_mixkit_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_mixkit_favorite_count();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Search Mixkit Tracks
CREATE OR REPLACE FUNCTION search_mixkit_tracks(
  p_query TEXT DEFAULT NULL,
  p_genre TEXT DEFAULT NULL,
  p_mood TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_min_bpm INTEGER DEFAULT NULL,
  p_max_bpm INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  mixkit_id TEXT,
  title TEXT,
  description TEXT,
  duration_seconds INTEGER,
  bpm INTEGER,
  genre TEXT,
  mood TEXT,
  tags TEXT[],
  storage_url TEXT,
  cdn_url TEXT,
  play_count INTEGER,
  favorite_count INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.mixkit_id,
    t.title,
    t.description,
    t.duration_seconds,
    t.bpm,
    t.genre,
    t.mood,
    t.tags,
    t.storage_url,
    t.cdn_url,
    t.play_count,
    t.favorite_count,
    CASE 
      WHEN p_query IS NOT NULL THEN
        ts_rank(
          to_tsvector('english', coalesce(t.title, '') || ' ' || coalesce(t.description, '')),
          plainto_tsquery('english', p_query)
        )
      ELSE 0
    END AS relevance
  FROM mixkit_tracks t
  WHERE t.status = 'active'
    AND (p_query IS NULL OR to_tsvector('english', coalesce(t.title, '') || ' ' || coalesce(t.description, '')) @@ plainto_tsquery('english', p_query))
    AND (p_genre IS NULL OR t.genre = p_genre)
    AND (p_mood IS NULL OR t.mood = p_mood)
    AND (p_tags IS NULL OR t.tags && p_tags)
    AND (p_min_bpm IS NULL OR t.bpm >= p_min_bpm)
    AND (p_max_bpm IS NULL OR t.bpm <= p_max_bpm)
  ORDER BY 
    CASE WHEN p_query IS NOT NULL THEN relevance ELSE 0 END DESC,
    t.play_count DESC,
    t.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Popular Tracks
CREATE OR REPLACE FUNCTION get_popular_mixkit_tracks(
  p_limit INTEGER DEFAULT 20,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  genre TEXT,
  play_count INTEGER,
  favorite_count INTEGER,
  recent_plays BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.genre,
    t.play_count,
    t.favorite_count,
    COUNT(a.id)::BIGINT as recent_plays
  FROM mixkit_tracks t
  LEFT JOIN mixkit_track_analytics a 
    ON a.track_id = t.id 
    AND a.action = 'play'
    AND a.created_at > NOW() - (p_days || ' days')::INTERVAL
  WHERE t.status = 'active'
  GROUP BY t.id
  ORDER BY recent_plays DESC, t.favorite_count DESC, t.play_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get User Favorites
CREATE OR REPLACE FUNCTION get_user_mixkit_favorites(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  mixkit_id TEXT,
  title TEXT,
  genre TEXT,
  mood TEXT,
  duration_seconds INTEGER,
  storage_url TEXT,
  favorited_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.mixkit_id,
    t.title,
    t.genre,
    t.mood,
    t.duration_seconds,
    t.storage_url,
    f.created_at as favorited_at
  FROM user_mixkit_favorites f
  JOIN mixkit_tracks t ON t.id = f.track_id
  WHERE f.user_id = p_user_id
    AND t.status = 'active'
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE mixkit_tracks IS 'Mixkit.co music tracks hosted on own storage';
COMMENT ON TABLE user_mixkit_favorites IS 'User favorite Mixkit tracks';
COMMENT ON TABLE mixkit_track_analytics IS 'Track play/interaction analytics';
COMMENT ON COLUMN mixkit_tracks.license IS 'Mixkit License - Free for commercial use without attribution';
COMMENT ON COLUMN mixkit_tracks.storage_url IS 'Permanent storage URL (Supabase/R2)';
COMMENT ON COLUMN mixkit_tracks.cdn_url IS 'Optional CDN-accelerated URL for faster streaming';
