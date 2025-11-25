-- ============================================================================
-- FIX: Videos Schema für Direct Upload (Supabase Storage)
-- ============================================================================
-- Problem: Code verwendet video_url, aber Tabelle hat nur playback_url (Cloudflare)
-- Lösung: Fehlende Spalten hinzufügen
-- ============================================================================

-- Fehlende Spalten hinzufügen
ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_market_item BOOLEAN DEFAULT false;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS market_category TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS market_subcategory TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS location_country TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS location_postcode TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS location_display_name TEXT;

-- location_lat und location_lon existieren schon als location_lat/location_lng
-- Alias erstellen oder umbenennen (falls nötig)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='videos' AND column_name='location_lon') THEN
    ALTER TABLE videos RENAME COLUMN location_lng TO location_lon;
  END IF;
END $$;

-- WICHTIG: DEFAULT für user_id setzen
ALTER TABLE videos ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Index für video_url
CREATE INDEX IF NOT EXISTS idx_videos_video_url ON videos(video_url);

COMMENT ON COLUMN videos.video_url IS 'Direct Upload URL (Supabase Storage oder Cloudflare)';
COMMENT ON COLUMN videos.visibility IS 'public, private, friends';
COMMENT ON COLUMN videos.is_market_item IS 'Ist dies ein Market-Listing?';
