-- Migration: Background Jobs System
-- Async Job Queue für Video-Verarbeitung

CREATE TABLE IF NOT EXISTS background_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN (
    'video-processing',
    'thumbnail-generation',
    'ai-content-generation',
    'transcription',
    'seo-generation',
    'video-repair',
    'audio-enhancement',
    'chapter-detection',
    'translation'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'retry'
  )),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  payload JSONB NOT NULL,
  result JSONB,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  processed_by TEXT
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_type ON background_jobs(type);
CREATE INDEX IF NOT EXISTS idx_background_jobs_priority ON background_jobs(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_background_jobs_created_at ON background_jobs(created_at DESC);

-- Composite Index für Job-Queue Abfragen
CREATE INDEX IF NOT EXISTS idx_background_jobs_queue 
ON background_jobs(status, priority DESC, created_at ASC)
WHERE status IN ('pending', 'retry');

-- Function: Cleanup alte abgeschlossene Jobs (7 Tage)
CREATE OR REPLACE FUNCTION cleanup_old_jobs()
RETURNS void AS $$
BEGIN
  DELETE FROM background_jobs
  WHERE status IN ('completed', 'failed')
  AND completed_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Scheduled Job für Cleanup (täglich um 3 Uhr nachts)
-- Benötigt pg_cron Extension
-- SELECT cron.schedule('cleanup-old-jobs', '0 3 * * *', 'SELECT cleanup_old_jobs()');

-- RLS Policies
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

-- Service Role hat vollen Zugriff
CREATE POLICY "Service role has full access to jobs"
  ON background_jobs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Authenticated users können ihre eigenen Jobs sehen
CREATE POLICY "Users can view jobs for their content"
  ON background_jobs FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      payload->>'userId' = auth.uid()::text
      OR payload->>'user_id' = auth.uid()::text
    )
  );
