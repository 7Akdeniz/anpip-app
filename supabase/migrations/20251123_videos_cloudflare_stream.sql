-- ============================================================================
-- VIDEOS TABELLE - Cloudflare Stream Integration
-- ============================================================================
-- 
-- Diese Tabelle speichert alle Video-Metadaten für Anpip.com
-- Die eigentlichen Videos liegen bei Cloudflare Stream (CDN + Transcoding)
-- ============================================================================

-- Videos Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.videos (
  -- IDs
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cloudflare_uid TEXT UNIQUE, -- Cloudflare Stream Video ID
  
  -- Metadaten
  title TEXT,
  description TEXT,
  
  -- Status (State Machine)
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (
    status IN ('uploading', 'processing', 'ready', 'error', 'deleted')
  ),
  
  -- Video-Details
  duration NUMERIC, -- in Sekunden
  width INTEGER,
  height INTEGER,
  size_bytes BIGINT,
  
  -- Cloudflare Stream URLs
  playback_url TEXT, -- HLS m3u8 URL
  dash_url TEXT, -- DASH URL
  thumbnail_url TEXT,
  embed_url TEXT,
  
  -- Upload-Tracking
  upload_url TEXT, -- Temporäre Direct Upload URL (wird nach Upload gelöscht)
  upload_started_at TIMESTAMPTZ,
  upload_completed_at TIMESTAMPTZ,
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  
  -- Fehlerbehandlung
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Moderation & Sicherheit
  moderation_status TEXT DEFAULT 'pending' CHECK (
    moderation_status IN ('pending', 'approved', 'rejected', 'flagged')
  ),
  is_public BOOLEAN DEFAULT true,
  
  -- Engagement-Metriken (können später von anderen Tabellen kommen)
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  share_count BIGINT DEFAULT 0,
  
  -- Geo & Discovery
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_name TEXT,
  tags TEXT[], -- Array von Tags
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES für Performance
-- ============================================================================

-- User's Videos schnell finden
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);

-- Cloudflare UID für Webhook-Lookups
CREATE INDEX IF NOT EXISTS idx_videos_cloudflare_uid ON public.videos(cloudflare_uid);

-- Status-basierte Queries (z.B. Feed nur "ready" Videos)
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status) WHERE deleted_at IS NULL;

-- Feed-Queries: ready Videos, sortiert nach created_at
CREATE INDEX IF NOT EXISTS idx_videos_feed ON public.videos(status, created_at DESC) 
  WHERE status = 'ready' AND deleted_at IS NULL AND is_public = true;

-- Geo-Suche (für lokale Feeds)
CREATE INDEX IF NOT EXISTS idx_videos_location ON public.videos 
  USING gist(ll_to_earth(location_lat, location_lng))
  WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

-- Tag-basierte Suche
CREATE INDEX IF NOT EXISTS idx_videos_tags ON public.videos USING gin(tags);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- RLS aktivieren
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann öffentliche, fertige Videos sehen
CREATE POLICY "Öffentliche Videos sehen"
  ON public.videos
  FOR SELECT
  USING (
    is_public = true 
    AND status = 'ready' 
    AND deleted_at IS NULL
  );

-- Policy: Eigene Videos sehen (auch private & in Bearbeitung)
CREATE POLICY "Eigene Videos sehen"
  ON public.videos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Nur eingeloggte User können Videos erstellen
CREATE POLICY "Videos erstellen"
  ON public.videos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Nur eigene Videos bearbeiten
CREATE POLICY "Eigene Videos bearbeiten"
  ON public.videos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Nur eigene Videos löschen (Soft-Delete)
CREATE POLICY "Eigene Videos löschen"
  ON public.videos
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER für updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER videos_updated_at_trigger
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION update_videos_updated_at();

-- ============================================================================
-- HELPER VIEWS (Optional)
-- ============================================================================

-- View: Alle fertigen Videos mit User-Infos
CREATE OR REPLACE VIEW public.feed_videos AS
SELECT 
  v.id,
  v.cloudflare_uid,
  v.title,
  v.description,
  v.duration,
  v.width,
  v.height,
  v.playback_url,
  v.thumbnail_url,
  v.view_count,
  v.like_count,
  v.comment_count,
  v.share_count,
  v.location_name,
  v.tags,
  v.created_at,
  -- User-Infos (aus auth.users oder public.profiles falls vorhanden)
  u.id AS user_id,
  u.email AS user_email
FROM public.videos v
JOIN auth.users u ON v.user_id = u.id
WHERE 
  v.status = 'ready'
  AND v.deleted_at IS NULL
  AND v.is_public = true
  AND v.moderation_status = 'approved'
ORDER BY v.created_at DESC;

-- ============================================================================
-- BEISPIEL-QUERIES
-- ============================================================================

-- Feed-Videos holen (paginiert)
-- SELECT * FROM public.feed_videos LIMIT 20 OFFSET 0;

-- Videos eines Users
-- SELECT * FROM public.videos WHERE user_id = 'xxx' ORDER BY created_at DESC;

-- Video-Status checken
-- SELECT id, status, error_message FROM public.videos WHERE cloudflare_uid = 'xxx';

-- Videos, die auf Processing warten
-- SELECT * FROM public.videos WHERE status = 'processing' AND processing_started_at > NOW() - INTERVAL '1 hour';
