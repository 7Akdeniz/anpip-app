-- ============================================================================
-- MARKET TEST-VIDEOS EINFÜGEN
-- ============================================================================
-- Fügt 5 Test-Market-Videos ein, damit der Market-Tab funktioniert
-- ============================================================================

-- Prüfe zuerst ob Videos existieren
DO $$
DECLARE
  video_count INTEGER;
  test_user_id UUID;
BEGIN
  -- Hole ersten User oder erstelle Dummy-User
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'Kein User gefunden - überspringe Market-Video-Erstellung';
    RETURN;
  END IF;
  
  -- Prüfe ob schon Market-Videos existieren
  SELECT COUNT(*) INTO video_count FROM videos WHERE is_market_item = TRUE;
  
  IF video_count > 0 THEN
    RAISE NOTICE 'Market-Videos existieren bereits (%) - überspringe', video_count;
    RETURN;
  END IF;
  
  -- Füge 5 Test-Market-Videos ein
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
    location_lon,
    location_display_name,
    views_count,
    likes_count,
    comments_count,
    shares_count
  ) VALUES
  (
    test_user_id,
    'https://vlibyocpdguxpretjvnz.supabase.co/storage/v1/object/public/videos/video_1763737025046.mp4',
    'https://via.placeholder.com/720x1280/FF6B6B/FFFFFF?text=iPhone+14+Pro',
    '📱 iPhone 14 Pro - 256GB - Neuwertig! Nur 3 Monate alt. Mit Originalverpackung und Zubehör. €799 VB',
    'public',
    TRUE,
    'electronics',
    'München',
    'Deutschland',
    48.1351,
    11.5820,
    'München, Bayern, Deutschland',
    0,
    0,
    0,
    0
  ),
  (
    test_user_id,
    'https://vlibyocpdguxpretjvnz.supabase.co/storage/v1/object/public/videos/video_1763737025046.mp4',
    'https://via.placeholder.com/720x1280/4ECDC4/FFFFFF?text=BMW+3er',
    '🚗 BMW 3er Touring - 2019 - 45.000 km - Vollausstattung, Leder, Navi. €28.500',
    'public',
    TRUE,
    'vehicles',
    'München',
    'Deutschland',
    48.1351,
    11.5820,
    'München, Bayern, Deutschland',
    0,
    0,
    0,
    0
  ),
  (
    test_user_id,
    'https://vlibyocpdguxpretjvnz.supabase.co/storage/v1/object/public/videos/video_1763737025046.mp4',
    'https://via.placeholder.com/720x1280/95E1D3/FFFFFF?text=Designer+Sofa',
    '🛋️ Designer-Sofa - Echtleder - Neupreis €2.500 - Jetzt nur €850! Abholung in München.',
    'public',
    TRUE,
    'home-garden',
    'München',
    'Deutschland',
    48.1351,
    11.5820,
    'München, Bayern, Deutschland',
    0,
    0,
    0,
    0
  ),
  (
    test_user_id,
    'https://vlibyocpdguxpretjvnz.supabase.co/storage/v1/object/public/videos/video_1763737025046.mp4',
    'https://via.placeholder.com/720x1280/F38181/FFFFFF?text=Nike+Air+Max',
    '👟 Nike Air Max 2024 - Größe 42 - Ungetragen - Limited Edition. €120',
    'public',
    TRUE,
    'fashion-beauty',
    'Berlin',
    'Deutschland',
    52.5200,
    13.4050,
    'Berlin, Deutschland',
    0,
    0,
    0,
    0
  ),
  (
    test_user_id,
    'https://vlibyocpdguxpretjvnz.supabase.co/storage/v1/object/public/videos/video_1763737025046.mp4',
    'https://via.placeholder.com/720x1280/AA96DA/FFFFFF?text=MacBook+Pro',
    '💻 MacBook Pro 16" M3 Max - 1TB SSD - 64GB RAM - Wie neu! Nur 2 Monate alt. €3.200',
    'public',
    TRUE,
    'electronics',
    'Hamburg',
    'Deutschland',
    53.5511,
    9.9937,
    'Hamburg, Deutschland',
    0,
    0,
    0,
    0
  );
  
  RAISE NOTICE '✅ 5 Market-Test-Videos erfolgreich eingefügt';
END $$;
