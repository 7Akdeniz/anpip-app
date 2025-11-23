-- ============================================================================
-- MARKET TEST-VIDEOS (Vereinfacht)
-- ============================================================================
-- Kopiere diese SQL und führe sie im Supabase SQL Editor aus:
-- https://app.supabase.com/project/_/sql/new
-- ============================================================================

-- Hole ersten User
WITH first_user AS (
  SELECT id FROM auth.users LIMIT 1
)
INSERT INTO videos (
  user_id,
  video_url,
  thumbnail_url,
  description,
  visibility,
  is_market_item,
  market_category,
  location_city,
  location_country,
  location_lat,
  location_lon
)
SELECT 
  first_user.id,
  'https://vlibyocpdguxpretjvnz.supabase.co/storage/v1/object/public/videos/video_1763737025046.mp4',
  '',
  '📱 iPhone 14 Pro - 256GB - Neuwertig! €799',
  'public',
  TRUE,
  'electronics',
  'München',
  'Deutschland',
  48.1351,
  11.5820
FROM first_user
WHERE NOT EXISTS (
  SELECT 1 FROM videos WHERE is_market_item = TRUE LIMIT 1
);

-- 4 weitere Market-Videos
WITH first_user AS (
  SELECT id FROM auth.users LIMIT 1
)
INSERT INTO videos (user_id, video_url, description, visibility, is_market_item, market_category, location_city, location_country, location_lat, location_lon)
SELECT id, 
  'https://vlibyocpdguxpretjvnz.supabase.co/storage/v1/object/public/videos/video_1763737025046.mp4',
  '🚗 BMW 3er Touring - 2019 - €28.500',
  'public', TRUE, 'vehicles', 'München', 'Deutschland', 48.1351, 11.5820
FROM first_user
UNION ALL
SELECT id, 
  'https://vlibyocpdguxpretjvnz.supabase.co/storage/v1/object/public/videos/video_1763737025046.mp4',
  '🛋️ Designer-Sofa - Echtleder - €850',
  'public', TRUE, 'home-garden', 'München', 'Deutschland', 48.1351, 11.5820
FROM first_user
UNION ALL
SELECT id, 
  'https://vlibyocpdguxpretjvnz.supabase.co/storage/v1/object/public/videos/video_1763737025046.mp4',
  '👟 Nike Air Max 2024 - Größe 42 - €120',
  'public', TRUE, 'fashion-beauty', 'Berlin', 'Deutschland', 52.5200, 13.4050
FROM first_user
UNION ALL
SELECT id, 
  'https://vlibyocpdguxpretjvnz.supabase.co/storage/v1/object/public/videos/video_1763737025046.mp4',
  '💻 MacBook Pro 16" M3 Max - €3.200',
  'public', TRUE, 'electronics', 'Hamburg', 'Deutschland', 53.5511, 9.9937
FROM first_user;

-- Prüfe Ergebnis
SELECT 
  id,
  description,
  is_market_item,
  market_category,
  location_city,
  created_at
FROM videos
WHERE is_market_item = TRUE
ORDER BY created_at DESC;
