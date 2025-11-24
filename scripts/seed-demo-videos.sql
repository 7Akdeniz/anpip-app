/**
 * DEMO-VIDEOS FÜR ENTWICKLUNG
 * 
 * Erstellt Test-Videos damit die App nicht leer ist
 */

-- Lösche alte Test-Videos (optional)
DELETE FROM videos WHERE description LIKE 'Demo Video%';

-- Füge 10 Demo-Videos ein
INSERT INTO videos (
  id,
  video_url,
  thumbnail_url,
  description,
  visibility,
  views_count,
  likes_count,
  comments_count,
  shares_count,
  is_market_item,
  is_live,
  location_city,
  location_country,
  location_lat,
  location_lon,
  location_display_name,
  category,
  created_at,
  updated_at
) VALUES

-- Video 1: Berlin
(
  gen_random_uuid(),
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
  'Demo Video 1 - Schöne Aussicht in Berlin 🌆',
  'public',
  1234,
  56,
  12,
  8,
  false,
  false,
  'Berlin',
  'Deutschland',
  52.5200,
  13.4050,
  'Berlin, Deutschland',
  'lifestyle',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
),

-- Video 2: München
(
  gen_random_uuid(),
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
  'Demo Video 2 - München Marienplatz ⛪',
  'public',
  2345,
  78,
  23,
  15,
  false,
  false,
  'München',
  'Deutschland',
  48.1351,
  11.5820,
  'München, Deutschland',
  'travel',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
),

-- Video 3: Hamburg
(
  gen_random_uuid(),
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
  'Demo Video 3 - Hamburg Hafen 🚢',
  'public',
  3456,
  120,
  34,
  22,
  false,
  false,
  'Hamburg',
  'Deutschland',
  53.5511,
  9.9937,
  'Hamburg, Deutschland',
  'nature',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 hours'
),

-- Video 4: Köln
(
  gen_random_uuid(),
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
  'Demo Video 4 - Kölner Dom 🏛️',
  'public',
  4567,
  156,
  45,
  28,
  false,
  false,
  'Köln',
  'Deutschland',
  50.9375,
  6.9603,
  'Köln, Deutschland',
  'culture',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '4 hours'
),

-- Video 5: Frankfurt
(
  gen_random_uuid(),
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
  'Demo Video 5 - Frankfurt Skyline 🌃',
  'public',
  5678,
  189,
  56,
  35,
  false,
  false,
  'Frankfurt',
  'Deutschland',
  50.1109,
  8.6821,
  'Frankfurt, Deutschland',
  'urban',
  NOW() - INTERVAL '5 hours',
  NOW() - INTERVAL '5 hours'
),

-- Video 6: Market Item (Fahrrad)
(
  gen_random_uuid(),
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
  'Demo Video 6 - Fahrrad zu verkaufen 🚲 250€',
  'public',
  890,
  23,
  8,
  3,
  true,
  false,
  'Berlin',
  'Deutschland',
  52.5200,
  13.4050,
  'Berlin, Deutschland',
  'vehicles',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '6 hours'
),

-- Video 7: Market Item (Sofa)
(
  gen_random_uuid(),
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
  'Demo Video 7 - Sofa zu verschenken 🛋️ Gratis',
  'public',
  567,
  12,
  4,
  1,
  true,
  false,
  'München',
  'Deutschland',
  48.1351,
  11.5820,
  'München, Deutschland',
  'furniture',
  NOW() - INTERVAL '7 hours',
  NOW() - INTERVAL '7 hours'
),

-- Video 8: Neueste
(
  gen_random_uuid(),
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
  'Demo Video 8 - Neuestes Video! 🆕',
  'public',
  45,
  3,
  1,
  0,
  false,
  false,
  'Hamburg',
  'Deutschland',
  53.5511,
  9.9937,
  'Hamburg, Deutschland',
  'entertainment',
  NOW() - INTERVAL '10 minutes',
  NOW() - INTERVAL '10 minutes'
),

-- Video 9: Stuttgart
(
  gen_random_uuid(),
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
  'Demo Video 9 - Stuttgart Schlossplatz 🏰',
  'public',
  6789,
  234,
  67,
  42,
  false,
  false,
  'Stuttgart',
  'Deutschland',
  48.7758,
  9.1829,
  'Stuttgart, Deutschland',
  'architecture',
  NOW() - INTERVAL '8 hours',
  NOW() - INTERVAL '8 hours'
),

-- Video 10: Dresden
(
  gen_random_uuid(),
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
  'Demo Video 10 - Dresden Frauenkirche ⛪',
  'public',
  7890,
  267,
  78,
  48,
  false,
  false,
  'Dresden',
  'Deutschland',
  51.0504,
  13.7373,
  'Dresden, Deutschland',
  'history',
  NOW() - INTERVAL '9 hours',
  NOW() - INTERVAL '9 hours'
);

-- Zeige Zusammenfassung
SELECT 
  COUNT(*) as total_videos,
  COUNT(*) FILTER (WHERE is_market_item = true) as market_videos,
  COUNT(*) FILTER (WHERE is_market_item = false) as normal_videos
FROM videos
WHERE description LIKE 'Demo Video%';
