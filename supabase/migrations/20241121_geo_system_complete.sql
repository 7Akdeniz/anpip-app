-- =====================================================
-- GEO-LOCATION SYSTEM - ERWEITERT
-- =====================================================
-- Globale Stadt-DB, Länder, Lokale Kategorien
-- =====================================================

-- Länder-Tabelle
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- ISO 3166-1 alpha-2 (DE, US, FR, etc.)
  name TEXT NOT NULL,
  name_de TEXT,
  name_en TEXT,
  continent TEXT,
  population BIGINT,
  area_km2 REAL,
  latitude REAL,
  longitude REAL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_countries_code ON countries(code);
CREATE INDEX idx_countries_is_active ON countries(is_active);

-- Städte-Tabelle (erweitert)
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID REFERENCES countries(id),
  name TEXT NOT NULL,
  name_ascii TEXT, -- ASCII-Version für URLs
  state_province TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  population BIGINT,
  timezone TEXT,
  is_capital BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false, -- Top-Städte
  slug TEXT UNIQUE, -- URL-freundlich: "berlin", "new-york"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cities_country_id ON cities(country_id);
CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_cities_is_featured ON cities(is_featured);
CREATE INDEX idx_cities_location ON cities USING GIST (ll_to_earth(latitude, longitude));

-- Lokale Kategorien (Stadt-spezifisch)
CREATE TABLE IF NOT EXISTS local_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  videos_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, category_id)
);

CREATE INDEX idx_local_categories_city_id ON local_categories(city_id);
CREATE INDEX idx_local_categories_category_id ON local_categories(category_id);

-- Video-Geo-Lokationen (erweitert)
ALTER TABLE videos ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS postal_code TEXT;

CREATE INDEX idx_videos_country_id ON videos(country_id);
CREATE INDEX idx_videos_city_id ON videos(city_id);

-- SEO Landing Pages
CREATE TABLE IF NOT EXISTS seo_landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_type TEXT NOT NULL, -- 'country', 'city', 'city_category'
  country_id UUID REFERENCES countries(id),
  city_id UUID REFERENCES cities(id),
  category_id UUID REFERENCES categories(id),
  url_path TEXT UNIQUE NOT NULL, -- '/de/berlin' oder '/de/berlin/fahrzeuge'
  title TEXT NOT NULL,
  description TEXT,
  h1 TEXT,
  seo_text TEXT, -- Auto-generierter SEO-Text
  meta_keywords TEXT[],
  canonical_url TEXT,
  og_image_url TEXT,
  videos_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seo_landing_pages_url_path ON seo_landing_pages(url_path);
CREATE INDEX idx_seo_landing_pages_country_id ON seo_landing_pages(country_id);
CREATE INDEX idx_seo_landing_pages_city_id ON seo_landing_pages(city_id);
CREATE INDEX idx_seo_landing_pages_category_id ON seo_landing_pages(category_id);

-- Funktion: Video-Anzahl pro Stadt/Kategorie aktualisieren
CREATE OR REPLACE FUNCTION update_local_category_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update oder Insert local_categories
    INSERT INTO local_categories (city_id, category_id, videos_count, last_updated)
    VALUES (NEW.city_id, NEW.category_id, 1, NOW())
    ON CONFLICT (city_id, category_id) 
    DO UPDATE SET 
      videos_count = local_categories.videos_count + 1,
      last_updated = NOW();
      
    -- Update SEO Landing Page
    UPDATE seo_landing_pages
    SET videos_count = videos_count + 1, last_updated = NOW()
    WHERE city_id = NEW.city_id AND category_id = NEW.category_id;
  END IF;
  
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE local_categories
    SET videos_count = GREATEST(0, videos_count - 1), last_updated = NOW()
    WHERE city_id = OLD.city_id AND category_id = OLD.category_id;
    
    UPDATE seo_landing_pages
    SET videos_count = GREATEST(0, videos_count - 1), last_updated = NOW()
    WHERE city_id = OLD.city_id AND category_id = OLD.category_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_local_categories_on_video_change
  AFTER INSERT OR UPDATE OF city_id, category_id OR DELETE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_local_category_counts();

-- Seed: Top-Länder
INSERT INTO countries (code, name, name_de, name_en, continent, is_active) VALUES
  ('DE', 'Deutschland', 'Deutschland', 'Germany', 'Europe', true),
  ('US', 'Vereinigte Staaten', 'Vereinigte Staaten', 'United States', 'North America', true),
  ('GB', 'Vereinigtes Königreich', 'Vereinigtes Königreich', 'United Kingdom', 'Europe', true),
  ('FR', 'Frankreich', 'Frankreich', 'France', 'Europe', true),
  ('ES', 'Spanien', 'Spanien', 'Spain', 'Europe', true),
  ('IT', 'Italien', 'Italien', 'Italy', 'Europe', true),
  ('CH', 'Schweiz', 'Schweiz', 'Switzerland', 'Europe', true),
  ('AT', 'Österreich', 'Österreich', 'Austria', 'Europe', true)
ON CONFLICT (code) DO NOTHING;

-- Seed: Top-Städte Deutschland
INSERT INTO cities (country_id, name, name_ascii, latitude, longitude, population, is_featured, slug)
SELECT 
  c.id,
  city_data.name,
  city_data.name_ascii,
  city_data.lat,
  city_data.lng,
  city_data.pop,
  true,
  city_data.slug
FROM countries c,
  (VALUES
    ('Berlin', 'Berlin', 52.5200, 13.4050, 3700000, 'berlin'),
    ('Hamburg', 'Hamburg', 53.5511, 9.9937, 1800000, 'hamburg'),
    ('München', 'Muenchen', 48.1351, 11.5820, 1500000, 'muenchen'),
    ('Köln', 'Koeln', 50.9375, 6.9603, 1100000, 'koeln'),
    ('Frankfurt', 'Frankfurt', 50.1109, 8.6821, 750000, 'frankfurt'),
    ('Stuttgart', 'Stuttgart', 48.7758, 9.1829, 630000, 'stuttgart'),
    ('Düsseldorf', 'Duesseldorf', 51.2277, 6.7735, 620000, 'duesseldorf'),
    ('Dortmund', 'Dortmund', 51.5136, 7.4653, 590000, 'dortmund'),
    ('Essen', 'Essen', 51.4556, 7.0116, 580000, 'essen'),
    ('Leipzig', 'Leipzig', 51.3397, 12.3731, 600000, 'leipzig')
  ) AS city_data(name, name_ascii, lat, lng, pop, slug)
WHERE c.code = 'DE'
ON CONFLICT (slug) DO NOTHING;

-- RLS Policies
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_landing_pages ENABLE ROW LEVEL SECURITY;

-- Jeder kann Länder/Städte lesen
CREATE POLICY "Public can view countries" ON countries FOR SELECT USING (true);
CREATE POLICY "Public can view cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Public can view local categories" ON local_categories FOR SELECT USING (true);
CREATE POLICY "Public can view SEO landing pages" ON seo_landing_pages FOR SELECT USING (is_published = true);

COMMENT ON TABLE countries IS 'Global list of countries';
COMMENT ON TABLE cities IS 'Global cities database with geo coordinates';
COMMENT ON TABLE local_categories IS 'Video counts per city and category for local landing pages';
COMMENT ON TABLE seo_landing_pages IS 'SEO-optimized landing pages for countries, cities, and local categories';
