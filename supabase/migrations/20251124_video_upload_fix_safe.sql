-- ============================================================================
-- SAFE VIDEO UPLOAD FIX - Nur fehlende Teile
-- ============================================================================
-- Führt nur Änderungen durch, die noch nicht existieren
-- ============================================================================

-- ============================================================================
-- TEIL 1: SCHEMA FIXES (mit IF NOT EXISTS)
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

-- Indizes für Performance (mit IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_videos_video_url ON videos(video_url);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

-- ============================================================================
-- TEIL 2: RLS POLICIES FIX
-- ============================================================================

-- 🔥 WICHTIG: Bestehende Policies erst prüfen, dann ersetzen
DO $$
BEGIN
  -- Lösche nur wenn vorhanden, dann neu erstellen
  DROP POLICY IF EXISTS "video_insert_policy" ON videos;
  
  CREATE POLICY "video_insert_policy"
    ON videos FOR INSERT
    TO authenticated
    WITH CHECK (true);
    
  RAISE NOTICE '✅ INSERT Policy erstellt';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ INSERT Policy Fehler: %', SQLERRM;
END $$;

-- SELECT Policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "video_select_public_policy" ON videos;
  
  CREATE POLICY "video_select_public_policy"
    ON videos FOR SELECT
    TO public
    USING ((visibility = 'public' OR is_public = true));
    
  RAISE NOTICE '✅ SELECT PUBLIC Policy erstellt';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ SELECT PUBLIC Policy Fehler: %', SQLERRM;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "video_select_own_policy" ON videos;
  
  CREATE POLICY "video_select_own_policy"
    ON videos FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
    
  RAISE NOTICE '✅ SELECT OWN Policy erstellt';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ SELECT OWN Policy Fehler: %', SQLERRM;
END $$;

-- UPDATE Policy
DO $$
BEGIN
  DROP POLICY IF EXISTS "video_update_policy" ON videos;
  
  CREATE POLICY "video_update_policy"
    ON videos FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
    
  RAISE NOTICE '✅ UPDATE Policy erstellt';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ UPDATE Policy Fehler: %', SQLERRM;
END $$;

-- DELETE Policy
DO $$
BEGIN
  DROP POLICY IF EXISTS "video_delete_policy" ON videos;
  
  CREATE POLICY "video_delete_policy"
    ON videos FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
    
  RAISE NOTICE '✅ DELETE Policy erstellt';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ DELETE Policy Fehler: %', SQLERRM;
END $$;

-- RLS aktivieren
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TEIL 3: STORAGE POLICIES (videos bucket)
-- ============================================================================

-- SELECT Policy für Storage
DO $$
BEGIN
  DROP POLICY IF EXISTS "videos_bucket_select" ON storage.objects;
  
  CREATE POLICY "videos_bucket_select"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'videos');
    
  RAISE NOTICE '✅ STORAGE SELECT Policy erstellt';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ STORAGE SELECT Policy Fehler: %', SQLERRM;
END $$;

-- INSERT Policy für Storage
DO $$
BEGIN
  DROP POLICY IF EXISTS "videos_bucket_insert" ON storage.objects;
  
  CREATE POLICY "videos_bucket_insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'videos');
    
  RAISE NOTICE '✅ STORAGE INSERT Policy erstellt';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ STORAGE INSERT Policy Fehler: %', SQLERRM;
END $$;

-- UPDATE Policy für Storage
DO $$
BEGIN
  DROP POLICY IF EXISTS "videos_bucket_update" ON storage.objects;
  
  CREATE POLICY "videos_bucket_update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
    
  RAISE NOTICE '✅ STORAGE UPDATE Policy erstellt';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ STORAGE UPDATE Policy Fehler: %', SQLERRM;
END $$;

-- DELETE Policy für Storage
DO $$
BEGIN
  DROP POLICY IF EXISTS "videos_bucket_delete" ON storage.objects;
  
  CREATE POLICY "videos_bucket_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
    
  RAISE NOTICE '✅ STORAGE DELETE Policy erstellt';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ STORAGE DELETE Policy Fehler: %', SQLERRM;
END $$;

-- ============================================================================
-- ABSCHLUSS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Video Upload Fix abgeschlossen!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Schema: Fehlende Spalten hinzugefügt';
  RAISE NOTICE 'RLS: Policies aktualisiert';
  RAISE NOTICE 'Storage: Bucket Policies gesetzt';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
