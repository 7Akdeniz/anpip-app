-- =====================================================
-- VIDEO PROCESSING TABLES
-- =====================================================

-- Processing Queue
CREATE TABLE IF NOT EXISTS processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  upload_id TEXT,
  upload_path TEXT NOT NULL,
  task_type TEXT NOT NULL, -- 'combine_chunks', 'transcode', 'thumbnail', 'hls_dash'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
  chunks_count INTEGER,
  worker_id TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_processing_queue_status ON processing_queue(status);
CREATE INDEX idx_processing_queue_priority ON processing_queue(priority, created_at);
CREATE INDEX idx_processing_queue_video_id ON processing_queue(video_id);

-- Video Variants (verschiedene Qualitäten)
CREATE TABLE IF NOT EXISTS video_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  quality TEXT NOT NULL, -- '240p', '360p', '480p', '720p', '1080p', '1440p', '4k'
  width INTEGER,
  height INTEGER,
  bitrate INTEGER, -- in kbps
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration REAL, -- in seconds
  codec TEXT, -- 'h264', 'h265', 'vp9', 'av1'
  format TEXT, -- 'mp4', 'webm'
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_variants_video_id ON video_variants(video_id);
CREATE INDEX idx_video_variants_quality ON video_variants(quality);

-- Video Thumbnails
CREATE TABLE IF NOT EXISTS video_thumbnails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  thumbnail_type TEXT NOT NULL, -- 'poster', 'sprite', 'animated'
  file_path TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  timestamp_seconds REAL, -- Position im Video
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_thumbnails_video_id ON video_thumbnails(video_id);

-- Video Chapters (Auto-generiert für lange Videos)
CREATE TABLE IF NOT EXISTS video_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time REAL NOT NULL, -- in seconds
  end_time REAL,
  thumbnail_path TEXT,
  is_auto_generated BOOLEAN DEFAULT true,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_chapters_video_id ON video_chapters(video_id);
CREATE INDEX idx_video_chapters_start_time ON video_chapters(start_time);

-- HLS/DASH Manifest Dateien
CREATE TABLE IF NOT EXISTS video_streaming_manifests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  manifest_type TEXT NOT NULL, -- 'hls', 'dash'
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_streaming_manifests_video_id ON video_streaming_manifests(video_id);

-- Update videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS processing_job_id TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMPTZ;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration REAL; -- in seconds
ALTER TABLE videos ADD COLUMN IF NOT EXISTS original_width INTEGER;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS original_height INTEGER;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS has_audio BOOLEAN DEFAULT true;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS codec_name TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS bitrate INTEGER; -- in kbps

-- RLS Policies
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_thumbnails ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_streaming_manifests ENABLE ROW LEVEL SECURITY;

-- Jeder kann Varianten/Thumbnails seiner eigenen Videos sehen
CREATE POLICY "Users can view own video variants"
  ON video_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos WHERE videos.id = video_variants.video_id AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own video thumbnails"
  ON video_thumbnails FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos WHERE videos.id = video_thumbnails.video_id AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own video chapters"
  ON video_chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos WHERE videos.id = video_chapters.video_id AND videos.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own streaming manifests"
  ON video_streaming_manifests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos WHERE videos.id = video_streaming_manifests.video_id AND videos.user_id = auth.uid()
    )
  );

-- Kommentare
COMMENT ON TABLE processing_queue IS 'Queue for asynchronous video processing tasks';
COMMENT ON TABLE video_variants IS 'Different quality versions of videos (240p, 480p, 720p, etc.)';
COMMENT ON TABLE video_thumbnails IS 'Thumbnails and preview images for videos';
COMMENT ON TABLE video_chapters IS 'Auto-generated chapters for long videos';
COMMENT ON TABLE video_streaming_manifests IS 'HLS/DASH manifest files for adaptive streaming';
