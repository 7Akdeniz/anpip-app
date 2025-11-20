-- Add Location fields to videos table for Market listings
-- Using OpenStreetMap Nominatim data structure

ALTER TABLE videos 
  ADD COLUMN IF NOT EXISTS location_city TEXT,
  ADD COLUMN IF NOT EXISTS location_country TEXT,
  ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS location_lon DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS location_display_name TEXT,
  ADD COLUMN IF NOT EXISTS location_postcode TEXT;

-- Create index for location-based queries (useful for nearby search later)
CREATE INDEX IF NOT EXISTS idx_videos_location 
  ON videos(location_city, location_country) 
  WHERE is_market_item = TRUE;

-- Create index for geo queries
CREATE INDEX IF NOT EXISTS idx_videos_geo 
  ON videos(location_lat, location_lon) 
  WHERE is_market_item = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN videos.location_city IS 'City name from OpenStreetMap Nominatim';
COMMENT ON COLUMN videos.location_country IS 'Country name from OpenStreetMap Nominatim';
COMMENT ON COLUMN videos.location_lat IS 'Latitude coordinate from Nominatim';
COMMENT ON COLUMN videos.location_lon IS 'Longitude coordinate from Nominatim';
COMMENT ON COLUMN videos.location_display_name IS 'Full display name from Nominatim (e.g., "Berlin, Deutschland")';
COMMENT ON COLUMN videos.location_postcode IS 'Postal code if available from Nominatim';
