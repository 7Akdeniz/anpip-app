/**
 * SEO & PERFORMANCE MIGRATION 2025
 * Fügt alle notwendigen Felder und Indizes hinzu
 */

-- ==================== VIDEOS TABLE ====================

-- Neue Felder für SEO
ALTER TABLE videos 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS location_country TEXT,
  ADD COLUMN IF NOT EXISTS location_city TEXT,
  ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS duration INTEGER, -- Sekunden
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Performance-Indizes
CREATE INDEX IF NOT EXISTS idx_videos_location 
  ON videos(location_country, location_city);

CREATE INDEX IF NOT EXISTS idx_videos_category 
  ON videos(category);

CREATE INDEX IF NOT EXISTS idx_videos_created 
  ON videos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_videos_views 
  ON videos(view_count DESC);

CREATE INDEX IF NOT EXISTS idx_videos_visibility 
  ON videos(visibility) WHERE visibility = 'public';

-- GIN Index für Tag-Suche
CREATE INDEX IF NOT EXISTS idx_videos_tags 
  ON videos USING GIN(tags);

-- Updated_at automatisch setzen
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== CATEGORIES TABLE ====================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  icon TEXT, -- Icon-Name oder URL
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = true;

-- Updated_at Trigger
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== EXAMPLE CATEGORIES ====================

INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Fahrzeuge', 'fahrzeuge', 'Autos, Motorräder, LKW und mehr', 1),
  ('Elektronik', 'elektronik', 'Smartphones, Laptops, TV, Audio', 2),
  ('Immobilien', 'immobilien', 'Wohnungen, Häuser, Grundstücke', 3),
  ('Mode & Accessoires', 'mode', 'Kleidung, Schuhe, Schmuck', 4),
  ('Haushalt & Garten', 'haushalt', 'Möbel, Deko, Gartengeräte', 5),
  ('Sport & Freizeit', 'sport', 'Sportgeräte, Outdoor, Fitness', 6),
  ('Dienstleistungen', 'dienstleistungen', 'Handwerker, Reinigung, Transport', 7),
  ('Jobs', 'jobs', 'Stellenangebote und Jobanzeigen', 8)
ON CONFLICT (slug) DO NOTHING;

-- Unterkategorien für Fahrzeuge
INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Auto', 'auto', id, 1 FROM categories WHERE slug = 'fahrzeuge'
UNION ALL
SELECT 'Motorrad', 'motorrad', id, 2 FROM categories WHERE slug = 'fahrzeuge'
UNION ALL
SELECT 'LKW & Transporter', 'lkw', id, 3 FROM categories WHERE slug = 'fahrzeuge'
UNION ALL
SELECT 'Wohnmobile & Caravans', 'wohnmobile', id, 4 FROM categories WHERE slug = 'fahrzeuge'
ON CONFLICT (slug) DO NOTHING;

-- Unterkategorien für Elektronik
INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Smartphones & Tablets', 'smartphones', id, 1 FROM categories WHERE slug = 'elektronik'
UNION ALL
SELECT 'Computer & Laptops', 'computer', id, 2 FROM categories WHERE slug = 'elektronik'
UNION ALL
SELECT 'TV & Audio', 'tv-audio', id, 3 FROM categories WHERE slug = 'elektronik'
UNION ALL
SELECT 'Kameras & Foto', 'kameras', id, 4 FROM categories WHERE slug = 'elektronik'
ON CONFLICT (slug) DO NOTHING;

-- ==================== USER PROFILES ====================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_public 
  ON profiles(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_profiles_username 
  ON profiles(username);

-- Updated_at Trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== ANALYTICS TABLE ====================

CREATE TABLE IF NOT EXISTS analytics_vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lcp DECIMAL(10, 2), -- Largest Contentful Paint (ms)
  fid DECIMAL(10, 2), -- First Input Delay (ms)
  cls DECIMAL(10, 4), -- Cumulative Layout Shift
  inp DECIMAL(10, 2), -- Interaction to Next Paint (ms)
  ttfb DECIMAL(10, 2), -- Time to First Byte (ms)
  fcp DECIMAL(10, 2), -- First Contentful Paint (ms)
  user_agent TEXT,
  page_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_created 
  ON analytics_vitals(created_at DESC);

-- ==================== PWA INSTALLS TABLE ====================

CREATE TABLE IF NOT EXISTS pwa_installs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_agent TEXT,
  platform TEXT,
  installed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pwa_installed 
  ON pwa_installs(installed_at DESC);

-- ==================== VIEWS & STATISTICS ====================

-- View-Tracking Function
CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE videos 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql;

-- ==================== RLS POLICIES ====================

-- Categories sind öffentlich lesbar
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true);

-- Analytics nur für authenticated users
ALTER TABLE analytics_vitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Analytics insert for everyone" ON analytics_vitals;
CREATE POLICY "Analytics insert for everyone"
  ON analytics_vitals FOR INSERT
  WITH CHECK (true);

-- PWA Installs
ALTER TABLE pwa_installs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PWA installs insert for everyone" ON pwa_installs;
CREATE POLICY "PWA installs insert for everyone"
  ON pwa_installs FOR INSERT
  WITH CHECK (true);

-- ==================== FUNCTIONS ====================

-- Funktion für Full-Text-Suche
CREATE OR REPLACE FUNCTION search_videos(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  country_filter TEXT DEFAULT NULL,
  city_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  category TEXT,
  location_country TEXT,
  location_city TEXT,
  view_count INTEGER,
  created_at TIMESTAMP,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.description,
    v.video_url,
    v.thumbnail_url,
    v.category,
    v.location_country,
    v.location_city,
    v.view_count,
    v.created_at,
    ts_rank(
      to_tsvector('german', COALESCE(v.title, '') || ' ' || COALESCE(v.description, '')),
      plainto_tsquery('german', search_query)
    ) AS rank
  FROM videos v
  WHERE 
    v.visibility = 'public'
    AND (
      to_tsvector('german', COALESCE(v.title, '') || ' ' || COALESCE(v.description, '')) 
      @@ plainto_tsquery('german', search_query)
    )
    AND (category_filter IS NULL OR v.category = category_filter)
    AND (country_filter IS NULL OR v.location_country = country_filter)
    AND (city_filter IS NULL OR v.location_city = city_filter)
  ORDER BY rank DESC, v.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ==================== COMPLETE ====================

-- Statistik-View
CREATE OR REPLACE VIEW video_statistics AS
SELECT
  COUNT(*) as total_videos,
  COUNT(DISTINCT location_country) as countries,
  COUNT(DISTINCT location_city) as cities,
  COUNT(DISTINCT category) as categories,
  SUM(view_count) as total_views,
  AVG(view_count) as avg_views_per_video
FROM videos
WHERE visibility = 'public';

-- Grant Permissions
GRANT SELECT ON video_statistics TO anon, authenticated;

-- Done!
SELECT 'SEO & Performance Migration 2025 - Completed!' as status;
