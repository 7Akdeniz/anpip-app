-- ============================================================================
-- 🗄️ COMPLETE DATABASE SCHEMA 2025
-- ============================================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Fuzzy Text Search

-- ============================================================================
-- 📊 ANALYTICS & TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  watch_percentage INTEGER DEFAULT 0 CHECK (watch_percentage >= 0 AND watch_percentage <= 100),
  watch_time_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_views_video_id ON video_views(video_id);
CREATE INDEX idx_video_views_user_id ON video_views(user_id);
CREATE INDEX idx_video_views_created_at ON video_views(created_at DESC);

-- User Preferences (für AI-Recommendation)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'watch', 'skip', 'share')),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  category TEXT,
  tags TEXT[],
  language TEXT,
  location JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_action ON user_preferences(action);

-- ============================================================================
-- 🛡️ SECURITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT,
  blocked_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blocked_ips_address ON blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_until ON blocked_ips(blocked_until);

-- ============================================================================
-- 🌐 TRANSLATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(video_id, language)
);

CREATE INDEX idx_video_translations_video_id ON video_translations(video_id);
CREATE INDEX idx_video_translations_language ON video_translations(language);

-- ============================================================================
-- 🤖 AI METADATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_ai_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE UNIQUE,
  
  -- AI-Generated Content
  ai_title TEXT,
  ai_description TEXT,
  ai_tags TEXT[],
  ai_category TEXT,
  
  -- Analysis
  entities TEXT[], -- Erkannte Personen, Orte, Marken
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(5,2), -- -1 bis +1
  
  -- Engagement Prediction
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  
  -- Transcription
  transcript TEXT,
  transcript_language TEXT,
  
  -- Chapters
  chapters JSONB, -- Array von {timestamp, title, description}
  
  -- Thumbnail
  best_thumbnail_timestamp INTEGER, -- Sekunde
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_ai_metadata_video_id ON video_ai_metadata(video_id);

-- ============================================================================
-- 📈 FUNCTIONS & PROCEDURES
-- ============================================================================

-- Increment Video Views (Atomic)
CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos
  SET views_count = views_count + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Get Personalized Feed
CREATE OR REPLACE FUNCTION get_personalized_feed(
  p_user_id UUID,
  p_watched_videos UUID[],
  p_liked_categories TEXT[],
  p_liked_tags TEXT[],
  p_blocked_users UUID[],
  p_category TEXT DEFAULT NULL,
  p_language TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_following_only BOOLEAN DEFAULT false,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  user_avatar TEXT,
  video_url TEXT,
  hls_url TEXT,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  tags TEXT[],
  location_country TEXT,
  location_city TEXT,
  language TEXT,
  views_count INTEGER,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  engagement_score INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.user_id,
    u.username,
    u.avatar_url as user_avatar,
    v.video_url,
    v.hls_url,
    v.thumbnail_url,
    v.title,
    v.description,
    v.category,
    v.tags,
    v.location_country,
    v.location_city,
    v.language,
    v.views_count,
    v.likes_count,
    v.comments_count,
    v.shares_count,
    COALESCE(ai.engagement_score, 50) as engagement_score,
    v.created_at
  FROM videos v
  LEFT JOIN auth.users u ON v.user_id = u.id
  LEFT JOIN video_ai_metadata ai ON v.id = ai.video_id
  WHERE 
    v.status = 'published'
    AND NOT (v.id = ANY(p_watched_videos)) -- Nicht bereits gesehen
    AND NOT (v.user_id = ANY(p_blocked_users)) -- Nicht blockiert
    AND (p_category IS NULL OR v.category = p_category)
    AND (p_language IS NULL OR v.language = p_language)
    AND (p_country IS NULL OR v.location_country = p_country)
    AND (p_city IS NULL OR v.location_city = p_city)
  ORDER BY 
    -- Relevanz-Scoring
    CASE 
      WHEN v.category = ANY(p_liked_categories) THEN 20
      ELSE 0
    END +
    CASE 
      WHEN v.tags && p_liked_tags THEN 15
      ELSE 0
    END +
    COALESCE(ai.engagement_score, 50) * 0.5
    DESC,
    v.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 🔒 ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_ai_metadata ENABLE ROW LEVEL SECURITY;

-- Views: Jeder kann einfügen, nur eigene lesen
CREATE POLICY "Anyone can track views"
  ON video_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own views"
  ON video_views FOR SELECT
  USING (auth.uid() = user_id);

-- Preferences: Nur eigene
CREATE POLICY "Users manage own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Translations: Jeder kann lesen
CREATE POLICY "Translations are viewable by everyone"
  ON video_translations FOR SELECT
  USING (true);

-- AI Metadata: Jeder kann lesen
CREATE POLICY "AI metadata is viewable by everyone"
  ON video_ai_metadata FOR SELECT
  USING (true);

-- ============================================================================
-- 📡 REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE video_views;
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;

-- ============================================================================
-- 🎯 SAMPLE DATA
-- ============================================================================

COMMENT ON TABLE video_views IS 'Tracking video views and watch time';
COMMENT ON TABLE user_preferences IS 'User preferences for AI recommendation engine';
COMMENT ON TABLE video_translations IS 'Multi-language translations of video metadata';
COMMENT ON TABLE video_ai_metadata IS 'AI-generated metadata and analysis';

-- ============================================================================
-- ✅ COMPLETE!
-- ============================================================================
