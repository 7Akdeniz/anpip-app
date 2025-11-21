-- Migration: Recommendation Engine Tables
-- User Behaviors für personalisierte Feeds

-- User Behaviors Tabelle
CREATE TABLE IF NOT EXISTS user_behaviors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'like', 'share', 'comment', 'skip', 'watch_complete')),
  watch_time INTEGER DEFAULT 0, -- in seconds
  watch_percentage INTEGER DEFAULT 0 CHECK (watch_percentage >= 0 AND watch_percentage <= 100),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location TEXT,
  category TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes für Performance (<100ms)
CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_id ON user_behaviors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_video_id ON user_behaviors(video_id);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_timestamp ON user_behaviors(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_action ON user_behaviors(action);
CREATE INDEX IF NOT EXISTS idx_user_behaviors_user_video ON user_behaviors(user_id, video_id);

-- Composite Index für schnelle Abfragen
CREATE INDEX IF NOT EXISTS idx_user_behaviors_composite ON user_behaviors(user_id, timestamp DESC, action);

-- User Preferences Cache (Pre-computed)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_categories JSONB DEFAULT '{}'::jsonb,
  preferred_locations JSONB DEFAULT '{}'::jsonb,
  avg_watch_time DECIMAL(10,2) DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Stats Cache (Pre-computed für schnellere Feeds)
CREATE TABLE IF NOT EXISTS video_stats (
  video_id UUID PRIMARY KEY REFERENCES videos(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  avg_watch_time DECIMAL(10,2) DEFAULT 0,
  avg_watch_percentage DECIMAL(5,2) DEFAULT 0,
  engagement_score DECIMAL(5,4) DEFAULT 0,
  trending_score DECIMAL(5,4) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_stats_trending ON video_stats(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_video_stats_engagement ON video_stats(engagement_score DESC);

-- Function: Update Video Stats
CREATE OR REPLACE FUNCTION update_video_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update video stats on new behavior
  INSERT INTO video_stats (video_id, view_count, like_count, share_count, comment_count)
  VALUES (NEW.video_id, 0, 0, 0, 0)
  ON CONFLICT (video_id) DO UPDATE SET
    view_count = CASE 
      WHEN NEW.action = 'view' THEN video_stats.view_count + 1 
      ELSE video_stats.view_count 
    END,
    like_count = CASE 
      WHEN NEW.action = 'like' THEN video_stats.like_count + 1 
      ELSE video_stats.like_count 
    END,
    share_count = CASE 
      WHEN NEW.action = 'share' THEN video_stats.share_count + 1 
      ELSE video_stats.share_count 
    END,
    comment_count = CASE 
      WHEN NEW.action = 'comment' THEN video_stats.comment_count + 1 
      ELSE video_stats.comment_count 
    END,
    last_updated = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update video stats
CREATE TRIGGER trigger_update_video_stats
AFTER INSERT ON user_behaviors
FOR EACH ROW
EXECUTE FUNCTION update_video_stats();

-- Function: Update User Preferences (Background Job)
CREATE OR REPLACE FUNCTION refresh_user_preferences(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_category_scores JSONB;
  v_location_scores JSONB;
  v_avg_watch DECIMAL;
  v_engagement DECIMAL;
BEGIN
  -- Calculate category preferences
  SELECT jsonb_object_agg(category, score)
  INTO v_category_scores
  FROM (
    SELECT 
      category,
      SUM(CASE 
        WHEN action = 'watch_complete' THEN 1.0
        WHEN action = 'like' THEN 0.8
        WHEN action = 'share' THEN 0.9
        WHEN action = 'comment' THEN 0.7
        WHEN action = 'view' THEN 0.3
        WHEN action = 'skip' THEN -0.5
        ELSE 0
      END) / GREATEST(COUNT(*), 1) as score
    FROM user_behaviors
    WHERE user_id = p_user_id AND category IS NOT NULL
    GROUP BY category
  ) cat_scores;
  
  -- Calculate location preferences
  SELECT jsonb_object_agg(location, score)
  INTO v_location_scores
  FROM (
    SELECT 
      location,
      SUM(CASE 
        WHEN action = 'watch_complete' THEN 1.0
        WHEN action = 'like' THEN 0.8
        WHEN action = 'share' THEN 0.9
        WHEN action = 'comment' THEN 0.7
        WHEN action = 'view' THEN 0.3
        WHEN action = 'skip' THEN -0.5
        ELSE 0
      END) / GREATEST(COUNT(*), 1) as score
    FROM user_behaviors
    WHERE user_id = p_user_id AND location IS NOT NULL
    GROUP BY location
  ) loc_scores;
  
  -- Calculate avg watch time
  SELECT AVG(watch_time)
  INTO v_avg_watch
  FROM user_behaviors
  WHERE user_id = p_user_id;
  
  -- Calculate engagement rate
  SELECT 
    COUNT(*) FILTER (WHERE action IN ('like', 'share', 'comment'))::DECIMAL / 
    GREATEST(COUNT(*), 1)
  INTO v_engagement
  FROM user_behaviors
  WHERE user_id = p_user_id;
  
  -- Upsert preferences
  INSERT INTO user_preferences (
    user_id, 
    preferred_categories, 
    preferred_locations, 
    avg_watch_time, 
    engagement_rate,
    last_updated
  )
  VALUES (
    p_user_id,
    COALESCE(v_category_scores, '{}'::jsonb),
    COALESCE(v_location_scores, '{}'::jsonb),
    COALESCE(v_avg_watch, 0),
    COALESCE(v_engagement, 0),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    preferred_categories = EXCLUDED.preferred_categories,
    preferred_locations = EXCLUDED.preferred_locations,
    avg_watch_time = EXCLUDED.avg_watch_time,
    engagement_rate = EXCLUDED.engagement_rate,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Trending Score
CREATE OR REPLACE FUNCTION calculate_trending_score(p_video_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_score DECIMAL;
  v_age_hours DECIMAL;
  v_decay DECIMAL;
BEGIN
  -- Get video age in hours
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600
  INTO v_age_hours
  FROM videos
  WHERE id = p_video_id;
  
  -- Calculate decay factor (48h half-life)
  v_decay := EXP(-v_age_hours / 48);
  
  -- Calculate trending score
  SELECT 
    (
      (LOG(GREATEST(view_count, 1)) / 5.0) +
      (LOG(GREATEST(like_count, 1)) / 3.0) +
      (LOG(GREATEST(share_count, 1)) / 2.0)
    ) / 3.0 * v_decay
  INTO v_score
  FROM video_stats
  WHERE video_id = p_video_id;
  
  RETURN LEAST(COALESCE(v_score, 0), 1.0);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE user_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_stats ENABLE ROW LEVEL SECURITY;

-- Users können ihre eigenen Behaviors sehen/erstellen
CREATE POLICY "Users can view own behaviors"
  ON user_behaviors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own behaviors"
  ON user_behaviors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users können ihre eigenen Preferences sehen
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Video Stats sind öffentlich lesbar
CREATE POLICY "Video stats are publicly readable"
  ON video_stats FOR SELECT
  USING (true);

-- Service Role hat vollen Zugriff
CREATE POLICY "Service role has full access to behaviors"
  ON user_behaviors FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to preferences"
  ON user_preferences FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to video_stats"
  ON video_stats FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Performance Optimierung: Partitionierung nach Datum (optional)
-- Für sehr große Datenmengen (Millionen Behaviors)
-- CREATE TABLE user_behaviors_2025_01 PARTITION OF user_behaviors
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
