-- ============================================================================
-- FIX: Video Upload Schema Mismatch
-- ============================================================================
-- Problem: upload.tsx versucht Felder zu setzen, die in videos Tabelle fehlen
-- Lösung: Alle fehlenden Felder hinzufügen
-- ============================================================================

-- 1. Füge legacy video_url Feld hinzu (für Supabase Storage Uploads)
ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 2. Füge visibility Feld hinzu (public, friends, private)
ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' 
  CHECK (visibility IN ('public', 'friends', 'private', 'blocked'));

-- 3. Füge Market-Felder hinzu
ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS is_market_item BOOLEAN DEFAULT FALSE;

ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS market_category TEXT;

ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS market_subcategory TEXT;

-- 4. Erweitere Location-Felder für Market
ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS location_city TEXT;

ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS location_country TEXT;

ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS location_lon NUMERIC;

ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS location_display_name TEXT;

ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS location_postcode TEXT;

-- 5. Füge Moderation-Felder hinzu (für autoModerateVideo)
ALTER TABLE public.videos 
  ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- 6. Update existing RLS policies to support visibility field
DROP POLICY IF EXISTS "Öffentliche Videos sehen" ON public.videos;

CREATE POLICY "Öffentliche Videos sehen"
  ON public.videos
  FOR SELECT
  USING (
    (is_public = true OR visibility = 'public')
    AND status = 'ready' 
    AND deleted_at IS NULL
    AND (visibility != 'blocked' OR visibility IS NULL)
  );

-- 7. Erstelle Index für Market-Queries
CREATE INDEX IF NOT EXISTS idx_videos_market ON public.videos(is_market_item, market_category) 
  WHERE is_market_item = true AND deleted_at IS NULL;

-- 8. Erstelle Index für Location-based Queries
CREATE INDEX IF NOT EXISTS idx_videos_location_city ON public.videos(location_city) 
  WHERE location_city IS NOT NULL;

-- ============================================================================
-- ERFOLGS-MELDUNG
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Video Upload Schema erfolgreich repariert!';
  RAISE NOTICE '📝 Neue Felder: video_url, visibility, is_market_item, market_category, market_subcategory';
  RAISE NOTICE '📍 Location-Felder: location_city, location_country, location_lon, location_display_name, location_postcode';
  RAISE NOTICE '🛡️ Moderation: block_reason';
END $$;
