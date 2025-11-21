-- ========================================
-- WORLD TIMELINE ENGINE - DATABASE SCHEMA
-- ========================================

-- Tabelle für globale Events
CREATE TABLE IF NOT EXISTS world_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('trending', 'breaking', 'viral', 'disaster', 'sports', 'music', 'politics', 'culture')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Location Data (JSONB für Flexibilität)
  location JSONB NOT NULL,
  
  -- Video References
  videos TEXT[] NOT NULL DEFAULT '{}',
  
  -- Metrics
  intensity INTEGER NOT NULL CHECK (intensity >= 0 AND intensity <= 100),
  participants INTEGER NOT NULL DEFAULT 0,
  ai_confidence INTEGER NOT NULL CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  
  -- Tags & Sentiment
  tags TEXT[] DEFAULT '{}',
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Spatial Index
  latitude DECIMAL(10, 8) GENERATED ALWAYS AS ((location->>'lat')::decimal) STORED,
  longitude DECIMAL(11, 8) GENERATED ALWAYS AS ((location->>'lng')::decimal) STORED
);

-- Tabelle für Trend-Heatmaps
CREATE TABLE IF NOT EXISTS trend_heatmaps (
  id SERIAL PRIMARY KEY,
  region TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Metrics
  intensity INTEGER NOT NULL CHECK (intensity >= 0 AND intensity <= 100),
  video_count INTEGER NOT NULL DEFAULT 0,
  view_count BIGINT NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  growth_rate INTEGER NOT NULL DEFAULT 0, -- Prozent pro Stunde
  
  -- Top Tags
  top_tags TEXT[] DEFAULT '{}',
  
  -- Peak Time
  peak_time TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Live-Reportagen
CREATE TABLE IF NOT EXISTS live_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT REFERENCES world_events(id) ON DELETE CASCADE,
  
  -- Reporter Info
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Video Stream
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  stream_url TEXT,
  
  -- Report Details
  title TEXT NOT NULL,
  description TEXT,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('preparing', 'live', 'ended', 'paused')) DEFAULT 'preparing',
  
  -- Metrics
  viewer_count INTEGER NOT NULL DEFAULT 0,
  max_viewers INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle für Event-Participants (User die an Event teilnehmen)
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT REFERENCES world_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  
  -- Contribution Type
  contribution_type TEXT CHECK (contribution_type IN ('video', 'report', 'comment', 'share')),
  
  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, user_id, video_id)
);

-- Tabelle für Event-Subscriptions (User die Events folgen)
CREATE TABLE IF NOT EXISTS event_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES world_events(id) ON DELETE CASCADE,
  
  -- Notification Preferences
  notify_updates BOOLEAN DEFAULT TRUE,
  notify_new_videos BOOLEAN DEFAULT TRUE,
  notify_reports BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, event_id)
);

-- ==================== INDEXES ====================

-- Spatial Indexes für geografische Suchen
CREATE INDEX IF NOT EXISTS idx_world_events_location 
  ON world_events USING GIST (ll_to_earth(latitude, longitude));

CREATE INDEX IF NOT EXISTS idx_trend_heatmaps_location 
  ON trend_heatmaps USING GIST (ll_to_earth(latitude, longitude));

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_world_events_type ON world_events(type);
CREATE INDEX IF NOT EXISTS idx_world_events_intensity ON world_events(intensity DESC);
CREATE INDEX IF NOT EXISTS idx_world_events_created_at ON world_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_world_events_tags ON world_events USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_trend_heatmaps_region ON trend_heatmaps(region);
CREATE INDEX IF NOT EXISTS idx_trend_heatmaps_intensity ON trend_heatmaps(intensity DESC);
CREATE INDEX IF NOT EXISTS idx_trend_heatmaps_created_at ON trend_heatmaps(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_reports_status ON live_reports(status);
CREATE INDEX IF NOT EXISTS idx_live_reports_event_id ON live_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_live_reports_user_id ON live_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_event_subscriptions_user_id ON event_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_event_id ON event_subscriptions(event_id);

-- ==================== RLS POLICIES ====================

-- World Events: Public Read
ALTER TABLE world_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view world events"
  ON world_events FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Authenticated can create world events"
  ON world_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trend Heatmaps: Public Read
ALTER TABLE trend_heatmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view heatmaps"
  ON trend_heatmaps FOR SELECT
  TO PUBLIC
  USING (true);

-- Live Reports: Public Read, Creator Can Modify
ALTER TABLE live_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view live reports"
  ON live_reports FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can create their own reports"
  ON live_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON live_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Event Participants
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view participants"
  ON event_participants FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can add themselves as participants"
  ON event_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Event Subscriptions
ALTER TABLE event_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON event_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions"
  ON event_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== FUNCTIONS ====================

-- Funktion: Auto-Update Timestamps
CREATE OR REPLACE FUNCTION update_world_timeline_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für Auto-Update
CREATE TRIGGER update_world_events_timestamp
  BEFORE UPDATE ON world_events
  FOR EACH ROW
  EXECUTE FUNCTION update_world_timeline_timestamp();

CREATE TRIGGER update_trend_heatmaps_timestamp
  BEFORE UPDATE ON trend_heatmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_world_timeline_timestamp();

CREATE TRIGGER update_live_reports_timestamp
  BEFORE UPDATE ON live_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_world_timeline_timestamp();

-- Funktion: Get Events in Radius
CREATE OR REPLACE FUNCTION get_events_in_radius(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_radius_km DECIMAL DEFAULT 50
)
RETURNS TABLE (
  id TEXT,
  type TEXT,
  title TEXT,
  description TEXT,
  location JSONB,
  intensity INTEGER,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    we.id,
    we.type,
    we.title,
    we.description,
    we.location,
    we.intensity,
    earth_distance(
      ll_to_earth(p_lat, p_lng),
      ll_to_earth(we.latitude, we.longitude)
    ) / 1000 AS distance_km
  FROM world_events we
  WHERE earth_box(ll_to_earth(p_lat, p_lng), p_radius_km * 1000) @> ll_to_earth(we.latitude, we.longitude)
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Funktion: Get Trending Events (Top Intensity)
CREATE OR REPLACE FUNCTION get_trending_events(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id TEXT,
  type TEXT,
  title TEXT,
  description TEXT,
  location JSONB,
  intensity INTEGER,
  participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    we.id,
    we.type,
    we.title,
    we.description,
    we.location,
    we.intensity,
    we.participants,
    we.created_at
  FROM world_events we
  WHERE we.created_at > NOW() - INTERVAL '24 hours'
  ORDER BY we.intensity DESC, we.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Funktion: Get Regional Heatmap
CREATE OR REPLACE FUNCTION get_regional_heatmap(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_radius_km DECIMAL DEFAULT 100
)
RETURNS TABLE (
  region TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  intensity INTEGER,
  video_count INTEGER,
  top_tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    th.region,
    th.latitude,
    th.longitude,
    th.intensity,
    th.video_count,
    th.top_tags
  FROM trend_heatmaps th
  WHERE earth_box(ll_to_earth(p_lat, p_lng), p_radius_km * 1000) @> ll_to_earth(th.latitude, th.longitude)
  ORDER BY th.intensity DESC;
END;
$$ LANGUAGE plpgsql;

-- ==================== SAMPLE DATA (Optional) ====================

-- Beispiel Event (kann später entfernt werden)
INSERT INTO world_events (id, type, title, description, location, videos, intensity, participants, ai_confidence, tags, sentiment)
VALUES (
  'event_sample_berlin',
  'music',
  '🎵 Music Festival in Berlin',
  'Live music event with 50+ videos',
  '{"lat": 52.5200, "lng": 13.4050, "city": "Berlin", "country": "Germany", "region": "Europe"}',
  ARRAY['video1', 'video2', 'video3'],
  85,
  50,
  92,
  ARRAY['music', 'festival', 'live', 'berlin'],
  'positive'
) ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE world_events IS 'Stores detected global events from video clusters';
COMMENT ON TABLE trend_heatmaps IS 'Stores regional trend intensity data';
COMMENT ON TABLE live_reports IS 'Stores live reporter streams for events';
COMMENT ON TABLE event_participants IS 'Tracks user participation in events';
COMMENT ON TABLE event_subscriptions IS 'Manages user event subscriptions';
