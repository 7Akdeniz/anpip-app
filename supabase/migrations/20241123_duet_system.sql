-- ============================================================================
-- VIDEO DUET TABLES
-- ============================================================================

-- Add Duet columns to videos table
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS is_duet BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS duet_original_video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS duet_layout TEXT DEFAULT 'side-by-side' CHECK (duet_layout IN ('side-by-side', 'top-bottom', 'picture-in-picture', 'green-screen')),
ADD COLUMN IF NOT EXISTS allow_duets BOOLEAN DEFAULT true;

-- Index für schnelle Duet-Queries
CREATE INDEX IF NOT EXISTS idx_videos_is_duet ON videos(is_duet) WHERE is_duet = true;
CREATE INDEX IF NOT EXISTS idx_videos_duet_original ON videos(duet_original_video_id) WHERE duet_original_video_id IS NOT NULL;

-- Funktion: Zähle Duets für ein Video
CREATE OR REPLACE FUNCTION get_duet_count(video_uuid UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM videos 
  WHERE duet_original_video_id = video_uuid 
  AND visibility = 'public';
$$ LANGUAGE SQL;

-- ============================================================================
-- DONE
-- ============================================================================

SELECT 'Duet tables updated successfully!' as status;
