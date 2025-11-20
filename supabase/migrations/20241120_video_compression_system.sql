-- Video Compression System für Server-seitige Komprimierung
-- Fügt compression_status und Größen-Tracking hinzu

-- 1. Neue Spalten zur videos Tabelle hinzufügen
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS compression_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS original_size_mb NUMERIC,
ADD COLUMN IF NOT EXISTS compressed_size_mb NUMERIC,
ADD COLUMN IF NOT EXISTS raw_video_path TEXT;

-- 2. Index für schnelle Status-Abfragen
CREATE INDEX IF NOT EXISTS idx_videos_compression_status 
ON videos(compression_status) 
WHERE compression_status IN ('pending', 'processing');

-- 3. Kommentare für Dokumentation
COMMENT ON COLUMN videos.compression_status IS 'Status: pending, processing, completed, failed';
COMMENT ON COLUMN videos.original_size_mb IS 'Original Video Größe in MB vor Komprimierung';
COMMENT ON COLUMN videos.compressed_size_mb IS 'Komprimierte Video Größe in MB';
COMMENT ON COLUMN videos.raw_video_path IS 'Pfad zum Original-Video in videos-raw Bucket (vor Komprimierung)';

-- 4. Storage Bucket für Raw Videos (wird via Dashboard erstellt, hier nur Dokumentation)
-- Bucket Name: videos-raw
-- Public: false
-- File Size Limit: 500 MB (Pro Plan)
-- Allowed MIME Types: video/mp4, video/quicktime

-- 5. RLS Policy für videos-raw Bucket
-- Nutzer können nur ihre eigenen Videos hochladen
CREATE POLICY "Users can upload own videos to raw bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos-raw' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Nutzer können ihre eigenen Raw Videos lesen
CREATE POLICY "Users can read own raw videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'videos-raw' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Service Role kann alle Raw Videos löschen (für Edge Function)
CREATE POLICY "Service role can delete raw videos"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'videos-raw');

-- 6. PostgreSQL Funktion: Edge Function aufrufen
CREATE OR REPLACE FUNCTION trigger_video_compression()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
BEGIN
  -- Nur triggern wenn Video zu videos-raw hochgeladen wurde
  IF NEW.bucket_id = 'videos-raw' THEN
    
    -- Edge Function URL (wird automatisch gesetzt)
    function_url := current_setting('app.settings.supabase_url') || '/functions/v1/compress-video';
    
    -- Edge Function asynchron aufrufen (pg_net extension)
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
          'videoPath', NEW.name,
          'userId', (storage.foldername(NEW.name))[1],
          'videoId', NEW.id
        )
      );
    
    -- Log für Debugging
    RAISE NOTICE 'Compression triggered for video: %', NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger: Automatisch bei Upload zu videos-raw
CREATE TRIGGER on_video_upload_trigger_compression
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'videos-raw')
EXECUTE FUNCTION trigger_video_compression();

-- 8. Cleanup Function: Alte pending Videos (>24h) auf failed setzen
CREATE OR REPLACE FUNCTION cleanup_stale_compressions()
RETURNS void AS $$
BEGIN
  UPDATE videos
  SET compression_status = 'failed'
  WHERE compression_status IN ('pending', 'processing')
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 9. Beispiel: Manueller Cleanup-Aufruf (optional via Cron Job)
-- SELECT cron.schedule('cleanup-stale-compressions', '0 2 * * *', 'SELECT cleanup_stale_compressions()');
