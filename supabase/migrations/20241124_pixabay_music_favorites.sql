-- Pixabay Music Favorites Schema
-- Tabelle für User Music Favorites

-- Create user_music_favorites table
CREATE TABLE IF NOT EXISTS user_music_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id BIGINT NOT NULL,
  track_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, track_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_music_favorites_user_id ON user_music_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_music_favorites_track_id ON user_music_favorites(track_id);
CREATE INDEX IF NOT EXISTS idx_music_favorites_created_at ON user_music_favorites(created_at DESC);

-- RLS Policies
ALTER TABLE user_music_favorites ENABLE ROW LEVEL SECURITY;

-- Users can only see their own favorites
CREATE POLICY "Users can view own favorites"
  ON user_music_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON user_music_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON user_music_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_music_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_music_favorites_timestamp
  BEFORE UPDATE ON user_music_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_music_favorites_updated_at();

-- Kommentar
COMMENT ON TABLE user_music_favorites IS 'Stores user favorite music tracks from Pixabay Music API';
COMMENT ON COLUMN user_music_favorites.track_data IS 'Complete track data as JSON (PixabayMusicTrack interface)';
