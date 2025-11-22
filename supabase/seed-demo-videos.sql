-- ============================================================================
-- 🎥 DEMO VIDEOS SEED SCRIPT
-- ============================================================================
-- Fügt 5 Demo-Videos zur Datenbank hinzu, damit die Seite nicht leer ist.
-- 
-- VERWENDUNG:
-- 1. Öffne Supabase Dashboard → SQL Editor
-- 2. Kopiere dieses Script
-- 3. Klicke "Run" oder drücke Cmd+Enter
-- 
-- HINWEIS: 
-- - Diese URLs sind öffentliche Demo-Videos von Google (kostenlos nutzbar)
-- - Videos sind im 16:9 Format (für Tests ausreichend)
-- - Nach dem Einfügen sollte anpip.com sofort Videos anzeigen
-- ============================================================================

-- Lösche alte Demo-Videos (optional, für sauberen Neustart)
DELETE FROM videos WHERE description LIKE '%[DEMO]%';

-- Video 1: Big Buck Bunny (Open Source Film)
INSERT INTO videos (
  video_url,
  thumbnail_url,
  description,
  visibility,
  is_market_item,
  location_city,
  location_country,
  location_lat,
  location_lon
) VALUES (
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
  '[DEMO] Big Buck Bunny - Lustiger Animations-Kurzfilm 🐰 #animation #demo',
  'public',
  false,
  'Berlin',
  'Germany',
  52.520008,
  13.404954
);

-- Video 2: Elephants Dream (Open Source Film)
INSERT INTO videos (
  video_url,
  thumbnail_url,
  description,
  visibility,
  is_market_item,
  location_city,
  location_country,
  location_lat,
  location_lon
) VALUES (
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
  '[DEMO] Elephants Dream - Science Fiction Kurzfilm 🎬 #scifi #demo',
  'public',
  false,
  'Munich',
  'Germany',
  48.137154,
  11.576124
);

-- Video 3: For Bigger Blazes
INSERT INTO videos (
  video_url,
  thumbnail_url,
  description,
  visibility,
  is_market_item,
  location_city,
  location_country,
  location_lat,
  location_lon
) VALUES (
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
  '[DEMO] Beautiful Sunset Timelapse 🌅 #nature #sunset #demo',
  'public',
  false,
  'Hamburg',
  'Germany',
  53.551086,
  9.993682
);

-- Video 4: For Bigger Escape
INSERT INTO videos (
  video_url,
  thumbnail_url,
  description,
  visibility,
  is_market_item,
  location_city,
  location_country,
  location_lat,
  location_lon
) VALUES (
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
  '[DEMO] Travel Adventure Video ✈️ #travel #adventure #demo',
  'public',
  false,
  'Frankfurt',
  'Germany',
  50.110924,
  8.682127
);

-- Video 5: For Bigger Fun
INSERT INTO videos (
  video_url,
  thumbnail_url,
  description,
  visibility,
  is_market_item,
  location_city,
  location_country,
  location_lat,
  location_lon
) VALUES (
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
  '[DEMO] Fun Times & Good Vibes 🎉 #fun #party #demo',
  'public',
  false,
  'Cologne',
  'Germany',
  50.937531,
  6.960279
);

-- Überprüfung: Zeige eingefügte Demo-Videos
SELECT 
  id,
  description,
  location_city,
  created_at
FROM videos
WHERE description LIKE '%[DEMO]%'
ORDER BY created_at DESC;

-- ============================================================================
-- ✅ FERTIG!
-- 
-- Du solltest jetzt 5 Demo-Videos in der Tabelle haben.
-- Öffne anpip.com und die Videos sollten sofort erscheinen!
-- ============================================================================
