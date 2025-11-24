-- TEMPORÄR RLS FÜR DEMO-VIDEOS DEAKTIVIEREN
-- Führe dies im Supabase SQL Editor aus: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- RLS temporär deaktivieren
ALTER TABLE public.videos DISABLE ROW LEVEL SECURITY;

-- Demo-Videos einfügen
INSERT INTO public.videos (
  video_url, 
  thumbnail_url, 
  title, 
  description, 
  visibility, 
  views_count, 
  likes_count, 
  comments_count, 
  shares_count, 
  is_market_item, 
  location_city, 
  location_country, 
  location_lat, 
  location_lon, 
  location_display_name, 
  duration
) VALUES
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg', 'Berlin Schöne Aussicht', 'Demo Video 1 - Schöne Aussicht in Berlin 🌆', 'public', 1234, 56, 12, 8, false, 'Berlin', 'Deutschland', 52.5200, 13.4050, 'Berlin, Deutschland', 120),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg', 'München Marienplatz', 'Demo Video 2 - München Marienplatz ⛪', 'public', 2345, 78, 23, 15, false, 'München', 'Deutschland', 48.1351, 11.5820, 'München, Deutschland', 150),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg', 'Hamburg Hafen', 'Demo Video 3 - Hamburg Hafen 🚢', 'public', 3456, 120, 34, 22, false, 'Hamburg', 'Deutschland', 53.5511, 9.9937, 'Hamburg, Deutschland', 90),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg', 'Kölner Dom', 'Demo Video 4 - Kölner Dom 🏛️', 'public', 4567, 156, 45, 28, false, 'Köln', 'Deutschland', 50.9375, 6.9603, 'Köln, Deutschland', 180),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg', 'Frankfurt Skyline', 'Demo Video 5 - Frankfurt Skyline 🌃', 'public', 5678, 189, 56, 35, false, 'Frankfurt', 'Deutschland', 50.1109, 8.6821, 'Frankfurt, Deutschland', 110),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg', 'Neuestes Video!', 'Demo Video 6 - Neuestes Video! 🆕', 'public', 45, 3, 1, 0, false, 'Hamburg', 'Deutschland', 53.5511, 9.9937, 'Hamburg, Deutschland', 200),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg', 'Stuttgart Schlossplatz', 'Demo Video 7 - Stuttgart Schlossplatz 🏰', 'public', 6789, 234, 67, 42, false, 'Stuttgart', 'Deutschland', 48.7758, 9.1829, 'Stuttgart, Deutschland', 95),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg', 'Dresden Frauenkirche', 'Demo Video 8 - Dresden Frauenkirche ⛪', 'public', 7890, 267, 78, 48, false, 'Dresden', 'Deutschland', 51.0504, 13.7373, 'Dresden, Deutschland', 300),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg', 'Fahrrad zu verkaufen', 'Demo Video 9 - Fahrrad zu verkaufen 🚲 250€', 'public', 890, 23, 8, 3, true, 'Berlin', 'Deutschland', 52.5200, 13.4050, 'Berlin, Deutschland', 85),
('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg', 'Sofa zu verschenken', 'Demo Video 10 - Sofa zu verschenken 🛋️ Gratis!', 'public', 567, 12, 4, 1, true, 'München', 'Deutschland', 48.1351, 11.5820, 'München, Deutschland', 120);

-- RLS wieder aktivieren
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Zeige Ergebnis
SELECT COUNT(*) as total_demo_videos FROM public.videos WHERE description LIKE 'Demo Video%';
