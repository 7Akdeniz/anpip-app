-- ========================================
-- AI ACTORS SYSTEM - DATABASE SCHEMA
-- ========================================

-- Tabelle für AI Actors
CREATE TABLE IF NOT EXISTS ai_actors (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- Photos
  front_photo TEXT NOT NULL,
  side_photo TEXT NOT NULL,
  
  -- Generated Models
  avatar_model TEXT,
  voice_model TEXT,
  
  -- Capabilities
  languages TEXT[] DEFAULT '{}',
  styles TEXT[] DEFAULT '{}',
  
  -- Processing Status
  status TEXT NOT NULL CHECK (status IN ('processing', 'ready', 'failed')) DEFAULT 'processing',
  processing_progress INTEGER NOT NULL DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für AI-generierte Videos
CREATE TABLE IF NOT EXISTS ai_generated_videos (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES ai_actors(id) ON DELETE CASCADE,
  
  -- Video Assets
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  
  -- Content
  script TEXT NOT NULL,
  language TEXT NOT NULL,
  duration INTEGER NOT NULL,
  
  -- Metadata
  type TEXT NOT NULL CHECK (type IN ('short', 'reel', 'news', 'review', 'reaction', 'custom')),
  style TEXT NOT NULL,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Timestamps
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für AI Live Streams
CREATE TABLE IF NOT EXISTS ai_live_streams (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES ai_actors(id) ON DELETE CASCADE,
  
  -- Stream Config
  topic TEXT NOT NULL,
  language TEXT NOT NULL,
  style TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('live', 'ended', 'paused', 'failed')) DEFAULT 'live',
  
  -- Stream URLs
  stream_url TEXT,
  playback_url TEXT,
  
  -- Stats
  current_viewers INTEGER DEFAULT 0,
  total_viewers INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für AI-generierte Responses (Comments)
CREATE TABLE IF NOT EXISTS ai_actor_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id TEXT NOT NULL REFERENCES ai_actors(id) ON DELETE CASCADE,
  stream_id TEXT REFERENCES ai_live_streams(id) ON DELETE CASCADE,
  
  -- Original Comment
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  
  -- AI Response
  response_text TEXT NOT NULL,
  response_audio_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Actor Templates (Vordefinierte Stile)
CREATE TABLE IF NOT EXISTS ai_actor_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  
  -- Template Assets
  preview_image TEXT,
  background_template TEXT,
  voice_characteristics JSONB,
  
  -- Popularity
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Automated Content Schedules
CREATE TABLE IF NOT EXISTS ai_content_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id TEXT NOT NULL REFERENCES ai_actors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Schedule Config
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'hourly', 'custom')),
  content_type TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  videos_generated INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_ai_actors_user_id ON ai_actors(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_actors_status ON ai_actors(status);
CREATE INDEX IF NOT EXISTS idx_ai_actors_created_at ON ai_actors(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_generated_videos_actor_id ON ai_generated_videos(actor_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_videos_type ON ai_generated_videos(type);
CREATE INDEX IF NOT EXISTS idx_ai_generated_videos_language ON ai_generated_videos(language);
CREATE INDEX IF NOT EXISTS idx_ai_generated_videos_view_count ON ai_generated_videos(view_count DESC);

CREATE INDEX IF NOT EXISTS idx_ai_live_streams_actor_id ON ai_live_streams(actor_id);
CREATE INDEX IF NOT EXISTS idx_ai_live_streams_status ON ai_live_streams(status);
CREATE INDEX IF NOT EXISTS idx_ai_live_streams_started_at ON ai_live_streams(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_actor_responses_actor_id ON ai_actor_responses(actor_id);
CREATE INDEX IF NOT EXISTS idx_ai_actor_responses_stream_id ON ai_actor_responses(stream_id);

CREATE INDEX IF NOT EXISTS idx_ai_content_schedules_user_id ON ai_content_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_schedules_actor_id ON ai_content_schedules(actor_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_schedules_is_active ON ai_content_schedules(is_active);

-- ==================== RLS POLICIES ====================

-- AI Actors
ALTER TABLE ai_actors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own actors"
  ON ai_actors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own actors"
  ON ai_actors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actors"
  ON ai_actors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own actors"
  ON ai_actors FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- AI Generated Videos
ALTER TABLE ai_generated_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view AI videos"
  ON ai_generated_videos FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Actor owners can create videos"
  ON ai_generated_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_actors
      WHERE ai_actors.id = actor_id
      AND ai_actors.user_id = auth.uid()
    )
  );

-- AI Live Streams
ALTER TABLE ai_live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view live streams"
  ON ai_live_streams FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Actor owners can manage streams"
  ON ai_live_streams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_actors
      WHERE ai_actors.id = actor_id
      AND ai_actors.user_id = auth.uid()
    )
  );

-- AI Actor Responses
ALTER TABLE ai_actor_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view responses"
  ON ai_actor_responses FOR SELECT
  TO PUBLIC
  USING (true);

-- AI Actor Templates
ALTER TABLE ai_actor_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view templates"
  ON ai_actor_templates FOR SELECT
  TO PUBLIC
  USING (true);

-- AI Content Schedules
ALTER TABLE ai_content_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own schedules"
  ON ai_content_schedules FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== FUNCTIONS ====================

-- Auto-Update Timestamps
CREATE OR REPLACE FUNCTION update_ai_actors_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_actors_timestamp
  BEFORE UPDATE ON ai_actors
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_actors_timestamp();

CREATE TRIGGER update_ai_actor_templates_timestamp
  BEFORE UPDATE ON ai_actor_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_actors_timestamp();

CREATE TRIGGER update_ai_content_schedules_timestamp
  BEFORE UPDATE ON ai_content_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_actors_timestamp();

-- Function: Get Popular Actors
CREATE OR REPLACE FUNCTION get_popular_ai_actors(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  actor_id TEXT,
  actor_name TEXT,
  total_videos INTEGER,
  total_views BIGINT,
  average_views INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aa.id AS actor_id,
    aa.name AS actor_name,
    COUNT(av.id)::INTEGER AS total_videos,
    COALESCE(SUM(av.view_count), 0)::BIGINT AS total_views,
    COALESCE(AVG(av.view_count), 0)::INTEGER AS average_views
  FROM ai_actors aa
  LEFT JOIN ai_generated_videos av ON aa.id = av.actor_id
  WHERE aa.status = 'ready'
  GROUP BY aa.id, aa.name
  ORDER BY total_views DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Actor Statistics
CREATE OR REPLACE FUNCTION get_actor_statistics(p_actor_id TEXT)
RETURNS TABLE (
  total_videos INTEGER,
  total_views BIGINT,
  total_likes BIGINT,
  total_shares BIGINT,
  languages_used TEXT[],
  most_popular_style TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER AS total_videos,
    COALESCE(SUM(view_count), 0)::BIGINT AS total_views,
    COALESCE(SUM(like_count), 0)::BIGINT AS total_likes,
    COALESCE(SUM(share_count), 0)::BIGINT AS total_shares,
    ARRAY_AGG(DISTINCT language) AS languages_used,
    (
      SELECT style
      FROM ai_generated_videos
      WHERE actor_id = p_actor_id
      GROUP BY style
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) AS most_popular_style
  FROM ai_generated_videos
  WHERE actor_id = p_actor_id;
END;
$$ LANGUAGE plpgsql;

-- ==================== SAMPLE DATA ====================

-- Sample Templates
INSERT INTO ai_actor_templates (name, description, category, preview_image)
VALUES 
  ('Professional News Anchor', 'Professional news reporting style', 'news', 'https://templates.anpip.com/news_anchor.jpg'),
  ('Comedy Entertainer', 'Funny and engaging comedy style', 'entertainment', 'https://templates.anpip.com/comedy.jpg'),
  ('Educational Teacher', 'Clear and educational presentation', 'education', 'https://templates.anpip.com/teacher.jpg'),
  ('Product Reviewer', 'Professional product review style', 'review', 'https://templates.anpip.com/reviewer.jpg')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE ai_actors IS 'Stores user-created AI actors/avatars';
COMMENT ON TABLE ai_generated_videos IS 'Stores videos created by AI actors';
COMMENT ON TABLE ai_live_streams IS 'Manages AI actor live streams';
COMMENT ON TABLE ai_actor_responses IS 'Stores AI-generated responses to comments';
COMMENT ON TABLE ai_actor_templates IS 'Predefined templates for AI actors';
COMMENT ON TABLE ai_content_schedules IS 'Automated content generation schedules';
