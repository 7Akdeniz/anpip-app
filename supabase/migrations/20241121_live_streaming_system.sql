-- ============================================================================
-- 🔴 LIVE STREAMING SYSTEM - Database Schema
-- ============================================================================

-- Live-Streams Tabelle
CREATE TABLE IF NOT EXISTS live_streams (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  user_avatar TEXT,
  
  -- Stream Info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'de',
  
  -- Location
  location_country TEXT,
  location_city TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'live', 'ended', 'replay')),
  scheduled_time TIMESTAMPTZ,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  
  -- Streaming URLs
  webrtc_url TEXT,
  hls_url TEXT,
  rtmp_url TEXT,
  stream_key TEXT UNIQUE,
  
  -- Stats
  viewer_count INTEGER DEFAULT 0,
  peak_viewer_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Features
  feature_chat BOOLEAN DEFAULT true,
  feature_shopping BOOLEAN DEFAULT false,
  feature_qa BOOLEAN DEFAULT false,
  feature_donations BOOLEAN DEFAULT false,
  feature_polls BOOLEAN DEFAULT false,
  feature_subtitles BOOLEAN DEFAULT false,
  
  -- Moderation
  moderator_ids UUID[] DEFAULT '{}',
  banned_user_ids UUID[] DEFAULT '{}',
  slow_mode INTEGER,
  subscriber_only BOOLEAN DEFAULT false,
  
  -- Replay
  replay_video_id UUID REFERENCES videos(id),
  auto_replay BOOLEAN DEFAULT true,
  
  -- Monetization
  is_paid BOOLEAN DEFAULT false,
  ticket_price DECIMAL(10, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live Chat Messages
CREATE TABLE IF NOT EXISTS live_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id TEXT NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  user_avatar TEXT,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('message', 'emoji', 'donation', 'join', 'leave', 'moderator', 'system')),
  
  -- Metadata
  donation_amount DECIMAL(10, 2),
  emoji_id TEXT,
  is_moderator BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false
);

-- Live Products (Shopping)
CREATE TABLE IF NOT EXISTS live_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id TEXT NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  image_url TEXT,
  stock_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live Q&A Questions
CREATE TABLE IF NOT EXISTS live_qa_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id TEXT NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  question TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  answered BOOLEAN DEFAULT false,
  likes INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false
);

-- Live Stream Viewers (für Tracking)
CREATE TABLE IF NOT EXISTS live_stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id TEXT NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  watch_duration INTEGER DEFAULT 0, -- in Sekunden
  
  UNIQUE(stream_id, user_id, joined_at)
);

-- ============================================================================
-- INDEXES für Performance
-- ============================================================================

-- Live Streams
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_user_id ON live_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_category ON live_streams(category);
CREATE INDEX IF NOT EXISTS idx_live_streams_language ON live_streams(language);
CREATE INDEX IF NOT EXISTS idx_live_streams_location ON live_streams(location_country, location_city);
CREATE INDEX IF NOT EXISTS idx_live_streams_scheduled_time ON live_streams(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_live_streams_viewer_count ON live_streams(viewer_count DESC);
CREATE INDEX IF NOT EXISTS idx_live_streams_created_at ON live_streams(created_at DESC);

-- Chat Messages (für Realtime)
CREATE INDEX IF NOT EXISTS idx_live_chat_stream_id ON live_chat_messages(stream_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_live_chat_user_id ON live_chat_messages(user_id);

-- Products
CREATE INDEX IF NOT EXISTS idx_live_products_stream_id ON live_products(stream_id);

-- Q&A
CREATE INDEX IF NOT EXISTS idx_live_qa_stream_id ON live_qa_questions(stream_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_live_qa_likes ON live_qa_questions(likes DESC);

-- Viewers
CREATE INDEX IF NOT EXISTS idx_live_viewers_stream_id ON live_stream_viewers(stream_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_qa_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_viewers ENABLE ROW LEVEL SECURITY;

-- Live Streams: Jeder kann lesen, nur Eigentümer kann ändern
CREATE POLICY "Live streams are viewable by everyone"
  ON live_streams FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own streams"
  ON live_streams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streams"
  ON live_streams FOR UPDATE
  USING (auth.uid() = user_id);

-- Chat: Jeder kann lesen, authentifizierte User können schreiben
CREATE POLICY "Chat messages are viewable by everyone"
  ON live_chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send chat messages"
  ON live_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Products: Jeder kann sehen, nur Stream-Owner kann verwalten
CREATE POLICY "Products are viewable by everyone"
  ON live_products FOR SELECT
  USING (true);

CREATE POLICY "Stream owner can manage products"
  ON live_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM live_streams
      WHERE live_streams.id = live_products.stream_id
      AND live_streams.user_id = auth.uid()
    )
  );

-- Q&A: Jeder kann sehen, authentifizierte User können Fragen stellen
CREATE POLICY "QA questions are viewable by everyone"
  ON live_qa_questions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can ask questions"
  ON live_qa_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Increment Total Views Function
CREATE OR REPLACE FUNCTION increment_total_views(stream_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE live_streams
  SET total_views = total_views + 1
  WHERE id = stream_id;
END;
$$ LANGUAGE plpgsql;

-- Auto-Update Timestamp
CREATE OR REPLACE FUNCTION update_live_stream_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_live_stream_timestamp
  BEFORE UPDATE ON live_streams
  FOR EACH ROW
  EXECUTE FUNCTION update_live_stream_timestamp();

-- Auto-Calculate Watch Duration on Viewer Leave
CREATE OR REPLACE FUNCTION calculate_watch_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    NEW.watch_duration = EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_watch_duration
  BEFORE UPDATE ON live_stream_viewers
  FOR EACH ROW
  EXECUTE FUNCTION calculate_watch_duration();

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable Realtime for Chat & Viewer Count
ALTER PUBLICATION supabase_realtime ADD TABLE live_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE live_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE live_qa_questions;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Kategorien für Live-Streams
-- (falls noch nicht vorhanden, nutzt existierende Kategorien)

COMMENT ON TABLE live_streams IS 'Live-Streaming System: WebRTC/HLS Streams';
COMMENT ON TABLE live_chat_messages IS 'Live-Chat mit Echtzeit-Synchronisation';
COMMENT ON TABLE live_products IS 'Live-Shopping Produkte';
COMMENT ON TABLE live_qa_questions IS 'Live-Q&A Fragen';
COMMENT ON TABLE live_stream_viewers IS 'Viewer-Tracking für Analytics';
