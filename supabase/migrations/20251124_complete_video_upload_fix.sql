-- ============================================================================
-- KOMPLETTER VIDEO UPLOAD FIX
-- ============================================================================
-- Kombiniert alle notwendigen Fixes für Video-Upload:
-- 1. Schema-Erweiterung (fehlende Spalten)
-- 2. RLS Policies (INSERT Permission)
-- 3. Storage Policies (Public Access)
-- ============================================================================

-- ============================================================================
-- TEIL 1: SCHEMA FIXES
-- ============================================================================

-- Fehlende Spalten hinzufügen
ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ready';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_market_item BOOLEAN DEFAULT false;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS market_category TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS market_subcategory TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS location_country TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS location_postcode TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS location_display_name TEXT;

-- location_lon falls noch nicht vorhanden
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='videos' AND column_name='location_lon') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='videos' AND column_name='location_lng') THEN
      ALTER TABLE videos RENAME COLUMN location_lng TO location_lon;
    ELSE
      ALTER TABLE videos ADD COLUMN location_lon DOUBLE PRECISION;
    END IF;
  END IF;
END $$;

-- DEFAULT für user_id setzen (wichtig für RLS)
ALTER TABLE videos ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_videos_video_url ON videos(video_url);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

-- ============================================================================
-- TEIL 2: RLS POLICIES
-- ============================================================================

-- Alte Policies löschen
DROP POLICY IF EXISTS "Users can insert own videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can create videos" ON videos;
DROP POLICY IF EXISTS "Users can update own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;
DROP POLICY IF EXISTS "Public videos are viewable by everyone" ON videos;
DROP POLICY IF EXISTS "Videos sind öffentlich lesbar" ON videos;

-- INSERT: Authenticated users können Videos erstellen
CREATE POLICY "video_insert_policy"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- SELECT: Alle können öffentliche Videos sehen
CREATE POLICY "video_select_public_policy"
  ON videos FOR SELECT
  TO public
  USING (
    (visibility = 'public' OR is_public = true)
  );

-- SELECT: User sieht eigene Videos (auch private)
CREATE POLICY "video_select_own_policy"
  ON videos FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- UPDATE: Nur eigene Videos
CREATE POLICY "video_update_policy"
  ON videos FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Nur eigene Videos
CREATE POLICY "video_delete_policy"
  ON videos FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS aktivieren (falls noch nicht aktiv)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TEIL 3: STORAGE POLICIES (videos bucket)
-- ============================================================================

-- Alte Storage Policies löschen falls vorhanden
DROP POLICY IF EXISTS "Public Access to videos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to videos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own videos in bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own videos in bucket" ON storage.objects;
DROP POLICY IF EXISTS "videos_bucket_select" ON storage.objects;
DROP POLICY IF EXISTS "videos_bucket_insert" ON storage.objects;
DROP POLICY IF EXISTS "videos_bucket_update" ON storage.objects;
DROP POLICY IF EXISTS "videos_bucket_delete" ON storage.objects;

-- SELECT: Jeder kann Videos lesen (public bucket)
CREATE POLICY "videos_bucket_select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'videos');

-- INSERT: Authenticated users können uploaden
CREATE POLICY "videos_bucket_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'videos');

-- UPDATE: User kann eigene Dateien updaten
CREATE POLICY "videos_bucket_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- DELETE: User kann eigene Dateien löschen
CREATE POLICY "videos_bucket_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- TEIL 4: KOMMENTARE
-- ============================================================================

COMMENT ON COLUMN videos.video_url IS 'Direct Upload URL (Supabase Storage oder Cloudflare)';
COMMENT ON COLUMN videos.visibility IS 'public, private, friends';
COMMENT ON COLUMN videos.is_market_item IS 'Ist dies ein Market-Listing?';

COMMENT ON POLICY "video_insert_policy" ON videos IS 
  'Authenticated users können Videos erstellen';

COMMENT ON POLICY "video_select_public_policy" ON videos IS 
  'Öffentliche Videos sind für alle sichtbar';

COMMENT ON POLICY "video_select_own_policy" ON videos IS 
  'User können ihre eigenen Videos sehen (auch private)';

-- ============================================================================
-- ERFOLGSMELDUNG
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Video Upload Fix erfolgreich angewendet!';
  RAISE NOTICE 'Schema: ✅ Fehlende Spalten hinzugefügt';
  RAISE NOTICE 'RLS: ✅ Policies konfiguriert';
  RAISE NOTICE 'Storage: ✅ Bucket Policies gesetzt';
END $$;
