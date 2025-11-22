-- ============================================
-- ANPIP.COM - DATENBANK SCHEMA
-- Migrations für neue Features
-- ============================================

-- ============================================
-- 1. VIDEO LIKES
-- ============================================
CREATE TABLE IF NOT EXISTS video_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_video_likes_user ON video_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_video ON video_likes(video_id);

-- ============================================
-- 2. FOLLOWS
-- ============================================
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- ============================================
-- 3. SAVED VIDEOS
-- ============================================
CREATE TABLE IF NOT EXISTS saved_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_videos_user ON saved_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_videos_video ON saved_videos(video_id);

-- ============================================
-- 4. ACTIVITY LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'like', 'comment', 'share', 'gift')),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_video ON activity_logs(video_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action_type);

-- ============================================
-- 5. USER COINS
-- ============================================
CREATE TABLE IF NOT EXISTS user_coins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_coins_user ON user_coins(user_id);

-- ============================================
-- 6. GIFT TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS gift_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  gift_id TEXT NOT NULL,
  coins INTEGER NOT NULL CHECK (coins > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_gift_transactions_sender ON gift_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_receiver ON gift_transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_video ON gift_transactions(video_id, created_at DESC);

-- ============================================
-- 7. SOUNDS/MUSIC
-- ============================================
CREATE TABLE IF NOT EXISTS sounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  artist TEXT,
  audio_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  source_video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sounds_usage ON sounds(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_sounds_created ON sounds(created_at DESC);

-- ============================================
-- 8. SAVED SOUNDS
-- ============================================
CREATE TABLE IF NOT EXISTS saved_sounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sound_id UUID NOT NULL REFERENCES sounds(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sound_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_sounds_user ON saved_sounds(user_id);

-- ============================================
-- 9. ALTER VIDEOS TABLE - Add new columns
-- ============================================
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS sound_id UUID REFERENCES sounds(id) ON DELETE SET NULL;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS gifts_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_videos_live ON videos(is_live) WHERE is_live = TRUE;
CREATE INDEX IF NOT EXISTS idx_videos_sound ON videos(sound_id);

-- ============================================
-- 10. ALTER PROFILES TABLE - Add location fields
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_lon DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location_lat, location_lon);

-- ============================================
-- STORED PROCEDURES / FUNCTIONS
-- ============================================

-- Increment video likes counter
CREATE OR REPLACE FUNCTION increment_likes(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos
  SET likes_count = likes_count + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement video likes counter
CREATE OR REPLACE FUNCTION decrement_likes(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Increment video views counter
CREATE OR REPLACE FUNCTION increment_views(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos
  SET views_count = views_count + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Increment video shares counter
CREATE OR REPLACE FUNCTION increment_shares(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos
  SET shares_count = shares_count + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- Send gift transaction (atomic)
CREATE OR REPLACE FUNCTION send_gift_transaction(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_video_id UUID,
  p_gift_id TEXT,
  p_coins INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Check sender balance
  IF (SELECT balance FROM user_coins WHERE user_id = p_sender_id) < p_coins THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;

  -- Deduct from sender
  UPDATE user_coins
  SET balance = balance - p_coins,
      total_spent = total_spent + p_coins,
      updated_at = NOW()
  WHERE user_id = p_sender_id;

  -- Add to receiver
  INSERT INTO user_coins (user_id, balance, total_earned)
  VALUES (p_receiver_id, p_coins, p_coins)
  ON CONFLICT (user_id) DO UPDATE
  SET balance = user_coins.balance + p_coins,
      total_earned = user_coins.total_earned + p_coins,
      updated_at = NOW();

  -- Record transaction
  INSERT INTO gift_transactions (sender_id, receiver_id, video_id, gift_id, coins)
  VALUES (p_sender_id, p_receiver_id, p_video_id, p_gift_id, p_coins);

  -- Increment video gifts count
  UPDATE videos
  SET gifts_count = COALESCE(gifts_count, 0) + 1
  WHERE id = p_video_id;
END;
$$ LANGUAGE plpgsql;

-- Add coins to user (for purchases)
CREATE OR REPLACE FUNCTION add_user_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_id TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_coins (user_id, balance, total_earned)
  VALUES (p_user_id, p_amount, 0)
  ON CONFLICT (user_id) DO UPDATE
  SET balance = user_coins.balance + p_amount,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Get nearby users (requires PostGIS or custom calculation)
CREATE OR REPLACE FUNCTION get_nearby_users(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_km DOUBLE PRECISION,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  followers_count INTEGER,
  distance DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.followers_count,
    (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(p.location_lat)) * 
        cos(radians(p.location_lon) - radians(user_lon)) + 
        sin(radians(user_lat)) * 
        sin(radians(p.location_lat))
      )
    ) AS distance
  FROM profiles p
  WHERE p.location_lat IS NOT NULL 
    AND p.location_lon IS NOT NULL
    AND p.id != (SELECT id FROM profiles WHERE location_lat = user_lat AND location_lon = user_lon LIMIT 1)
  HAVING distance <= radius_km
  ORDER BY distance ASC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Get friend suggestions
CREATE OR REPLACE FUNCTION get_friend_suggestions(
  current_user_id UUID,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  followers_count INTEGER,
  mutual_friends INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_following AS (
    SELECT following_id FROM follows WHERE follower_id = current_user_id
  ),
  mutual_followers AS (
    SELECT 
      f2.following_id AS suggested_user_id,
      COUNT(DISTINCT f2.follower_id) AS mutual_count
    FROM follows f1
    JOIN follows f2 ON f1.following_id = f2.follower_id
    WHERE f1.follower_id = current_user_id
      AND f2.following_id NOT IN (SELECT following_id FROM user_following)
      AND f2.following_id != current_user_id
    GROUP BY f2.following_id
  )
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.followers_count,
    COALESCE(mf.mutual_count, 0)::INTEGER AS mutual_friends
  FROM profiles p
  LEFT JOIN mutual_followers mf ON p.id = mf.suggested_user_id
  WHERE p.id != current_user_id
    AND p.id NOT IN (SELECT following_id FROM user_following)
  ORDER BY mutual_friends DESC, p.followers_count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Video likes
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes"
  ON video_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own likes"
  ON video_likes FOR ALL
  USING (auth.uid() = user_id);

-- Follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own follows"
  ON follows FOR ALL
  USING (auth.uid() = follower_id);

-- Saved videos
ALTER TABLE saved_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved videos"
  ON saved_videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saved videos"
  ON saved_videos FOR ALL
  USING (auth.uid() = user_id);

-- Activity logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User coins
ALTER TABLE user_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coins"
  ON user_coins FOR SELECT
  USING (auth.uid() = user_id);

-- Gift transactions
ALTER TABLE gift_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gifts they sent or received"
  ON gift_transactions FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send gifts"
  ON gift_transactions FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Sounds
ALTER TABLE sounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view sounds"
  ON sounds FOR SELECT
  USING (true);

-- Saved sounds
ALTER TABLE saved_sounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved sounds"
  ON saved_sounds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saved sounds"
  ON saved_sounds FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update sound usage count when video is created
CREATE OR REPLACE FUNCTION update_sound_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sound_id IS NOT NULL THEN
    UPDATE sounds
    SET usage_count = usage_count + 1
    WHERE id = NEW.sound_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sound_usage
  AFTER INSERT ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_sound_usage();

-- Update user_coins updated_at on balance change
CREATE OR REPLACE FUNCTION update_coins_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_coins_timestamp
  BEFORE UPDATE ON user_coins
  FOR EACH ROW
  EXECUTE FUNCTION update_coins_timestamp();
