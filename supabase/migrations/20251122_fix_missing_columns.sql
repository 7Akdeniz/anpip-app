-- ============================================
-- ANPIP.COM - FIX MISSING COLUMNS & FUNCTIONS
-- Behebt: is_live, get_friend_suggestions
-- ============================================

-- 1. Füge is_live Spalte zu videos Tabelle hinzu (falls nicht vorhanden)
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;

-- Index für schnelle Live-Video Queries
CREATE INDEX IF NOT EXISTS idx_videos_is_live ON videos(is_live) WHERE is_live = TRUE;

-- 2. Erstelle get_friend_suggestions Funktion
CREATE OR REPLACE FUNCTION get_friend_suggestions(
  current_user_id UUID,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  followers_count INTEGER,
  videos_count INTEGER,
  mutual_friends_count INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_following AS (
    -- Personen denen current_user folgt
    SELECT following_id 
    FROM follows 
    WHERE follower_id = current_user_id
  ),
  mutual_connections AS (
    -- Finde Nutzer die von Leuten gefolgt werden, denen ich folge
    SELECT 
      f.following_id AS suggested_user_id,
      COUNT(*) AS mutual_count
    FROM follows f
    WHERE f.follower_id IN (SELECT following_id FROM user_following)
      AND f.following_id != current_user_id  -- nicht der User selbst
      AND f.following_id NOT IN (SELECT following_id FROM user_following)  -- nicht bereits gefolgt
    GROUP BY f.following_id
  ),
  user_stats AS (
    -- Berechne Stats für vorgeschlagene User
    SELECT 
      u.id,
      u.email as username,
      COALESCE(u.raw_user_meta_data->>'display_name', u.email) as display_name,
      u.raw_user_meta_data->>'avatar_url' as avatar_url,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
      (SELECT COUNT(*) FROM videos WHERE user_id = u.id) as videos_count
    FROM auth.users u
    WHERE u.id != current_user_id
      AND u.id NOT IN (SELECT following_id FROM user_following)
  )
  SELECT 
    us.id,
    us.username,
    us.display_name,
    us.avatar_url,
    us.followers_count,
    us.videos_count,
    COALESCE(mc.mutual_count, 0)::INTEGER as mutual_friends_count
  FROM user_stats us
  LEFT JOIN mutual_connections mc ON us.id = mc.suggested_user_id
  ORDER BY 
    COALESCE(mc.mutual_count, 0) DESC,  -- Sortiere nach gegenseitigen Verbindungen
    us.followers_count DESC,             -- dann nach Popularität
    us.videos_count DESC                 -- dann nach Aktivität
  LIMIT result_limit;
END;
$$;

-- 3. Setze RLS Policies für is_live
-- Videos mit is_live=true können öffentlich gesehen werden
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann öffentliche Videos sehen (inkl. Live)
DROP POLICY IF EXISTS "Public videos are viewable by everyone" ON videos;
CREATE POLICY "Public videos are viewable by everyone"
  ON videos FOR SELECT
  USING (visibility = 'public' OR is_live = TRUE);

-- 4. Grant Permissions
GRANT EXECUTE ON FUNCTION get_friend_suggestions TO authenticated;
GRANT EXECUTE ON FUNCTION get_friend_suggestions TO anon;

-- ============================================
-- KOMMENTAR
-- ============================================
COMMENT ON COLUMN videos.is_live IS 'Gibt an ob das Video ein Live-Stream ist';
COMMENT ON FUNCTION get_friend_suggestions IS 'Gibt Freundesvorschläge basierend auf gegenseitigen Verbindungen zurück';
