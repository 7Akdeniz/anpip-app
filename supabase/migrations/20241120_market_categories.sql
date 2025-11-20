-- Market Categories and Subcategories Migration
-- Created: 2024-11-20

-- Create categories table
CREATE TABLE IF NOT EXISTS market_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS market_subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES market_categories(category_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON market_subcategories(category_id);

-- Insert main categories
INSERT INTO market_categories (category_id, name, icon, display_order) VALUES
  ('vehicles', 'Fahrzeuge', 'car-outline', 1),
  ('real-estate', 'Immobilien', 'home-outline', 2),
  ('electronics', 'Elektronik', 'phone-portrait-outline', 3),
  ('home-garden', 'Haus & Garten', 'leaf-outline', 4),
  ('fashion-beauty', 'Mode & Beauty', 'shirt-outline', 5),
  ('family-baby', 'Familie & Baby', 'people-outline', 6),
  ('animals', 'Tiere', 'paw-outline', 7),
  ('leisure-hobby', 'Freizeit & Hobby', 'basketball-outline', 8),
  ('music-media', 'Musik & Medien', 'musical-notes-outline', 9),
  ('jobs-services', 'Jobs & Dienstleistungen', 'briefcase-outline', 10),
  ('business', 'Business & Gewerbe', 'business-outline', 11),
  ('free-exchange', 'Verschenken / Tauschen', 'gift-outline', 12)
ON CONFLICT (category_id) DO NOTHING;

-- Insert subcategories for Fahrzeuge
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('vehicles', 'Autos', 1),
  ('vehicles', 'Motorräder & Roller', 2),
  ('vehicles', 'Transporter & Nutzfahrzeuge', 3),
  ('vehicles', 'Fahrräder & E-Bikes', 4),
  ('vehicles', 'Wohnmobile & Camping', 5),
  ('vehicles', 'Bootsfahrzeuge', 6),
  ('vehicles', 'Autoteile & Zubehör', 7),
  ('vehicles', 'Reifen & Felgen', 8);

-- Insert subcategories for Immobilien
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('real-estate', 'Wohnung mieten', 1),
  ('real-estate', 'Wohnung kaufen', 2),
  ('real-estate', 'Haus mieten', 3),
  ('real-estate', 'Haus kaufen', 4),
  ('real-estate', 'WG & Zimmer', 5),
  ('real-estate', 'Gewerbeimmobilien', 6),
  ('real-estate', 'Grundstücke', 7),
  ('real-estate', 'Ferienwohnungen', 8);

-- Insert subcategories for Elektronik
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('electronics', 'Smartphones', 1),
  ('electronics', 'Laptops & Computer', 2),
  ('electronics', 'Spielekonsolen & Gaming', 3),
  ('electronics', 'TV & Audio', 4),
  ('electronics', 'Kameras', 5),
  ('electronics', 'Smart Home', 6),
  ('electronics', 'Haushaltsgeräte', 7),
  ('electronics', 'Zubehör & Kabel', 8);

-- Insert subcategories for Haus & Garten
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('home-garden', 'Möbel', 1),
  ('home-garden', 'Küche & Esszimmer', 2),
  ('home-garden', 'Garten & Pflanzen', 3),
  ('home-garden', 'Werkzeuge', 4),
  ('home-garden', 'Heimwerken & Baumaterial', 5),
  ('home-garden', 'Deko & Wohnen', 6),
  ('home-garden', 'Haushaltsgeräte', 7),
  ('home-garden', 'Bad & Sanitär', 8);

-- Insert subcategories for Mode & Beauty
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('fashion-beauty', 'Damenmode', 1),
  ('fashion-beauty', 'Herrenmode', 2),
  ('fashion-beauty', 'Schuhe', 3),
  ('fashion-beauty', 'Taschen & Accessoires', 4),
  ('fashion-beauty', 'Schmuck', 5),
  ('fashion-beauty', 'Beauty & Pflege', 6),
  ('fashion-beauty', 'Luxusmode', 7),
  ('fashion-beauty', 'Uhren', 8);

-- Insert subcategories for Familie & Baby
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('family-baby', 'Kinderkleidung', 1),
  ('family-baby', 'Kinderwagen & Buggys', 2),
  ('family-baby', 'Babyzimmer & Möbel', 3),
  ('family-baby', 'Spielzeug', 4),
  ('family-baby', 'Schulbedarf', 5),
  ('family-baby', 'Sicherheit & Überwachung', 6),
  ('family-baby', 'Umstandsmode', 7),
  ('family-baby', 'Babyzubehör', 8);

-- Insert subcategories for Tiere
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('animals', 'Hunde', 1),
  ('animals', 'Katzen', 2),
  ('animals', 'Kleintiere', 3),
  ('animals', 'Vögel', 4),
  ('animals', 'Fische & Aquaristik', 5),
  ('animals', 'Terraristik', 6),
  ('animals', 'Tierfutter', 7),
  ('animals', 'Tierzubehör', 8);

-- Insert subcategories for Freizeit & Hobby
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('leisure-hobby', 'Sport & Fitness', 1),
  ('leisure-hobby', 'Outdoor & Camping', 2),
  ('leisure-hobby', 'Spiele & Brettspiele', 3),
  ('leisure-hobby', 'Sammeln & Raritäten', 4),
  ('leisure-hobby', 'Modellbau', 5),
  ('leisure-hobby', 'Events & Aktivitäten', 6),
  ('leisure-hobby', 'Kunst & Basteln', 7),
  ('leisure-hobby', 'Fahrräder', 8);

-- Insert subcategories for Musik & Medien
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('music-media', 'Bücher', 1),
  ('music-media', 'Filme & DVDs', 2),
  ('music-media', 'Musik & CDs', 3),
  ('music-media', 'Musikinstrumente', 4),
  ('music-media', 'Games', 5),
  ('music-media', 'Vinyl', 6),
  ('music-media', 'Noten & Musikzubehör', 7),
  ('music-media', 'Hörbücher', 8);

-- Insert subcategories for Jobs & Dienstleistungen
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('jobs-services', 'Jobangebote', 1),
  ('jobs-services', 'Nebenjobs & Minijobs', 2),
  ('jobs-services', 'Dienstleistungen privat', 3),
  ('jobs-services', 'Handwerk & Bau', 4),
  ('jobs-services', 'Reinigung & Haushalt', 5),
  ('jobs-services', 'Umzug & Transport', 6),
  ('jobs-services', 'Coaching & Unterricht', 7),
  ('jobs-services', 'Beauty & Wellness Services', 8);

-- Insert subcategories for Business & Gewerbe
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('business', 'Büroausstattung', 1),
  ('business', 'Maschinen & Industrie', 2),
  ('business', 'Ladeneinrichtung', 3),
  ('business', 'Gastronomie & Küche', 4),
  ('business', 'Computer & IT', 5),
  ('business', 'Großhandelsposten', 6),
  ('business', 'Werkzeuge', 7),
  ('business', 'Verpackung & Versand', 8);

-- Insert subcategories for Verschenken / Tauschen
INSERT INTO market_subcategories (category_id, name, display_order) VALUES
  ('free-exchange', 'Zu verschenken', 1),
  ('free-exchange', 'Tauschangebote', 2),
  ('free-exchange', 'Möbel', 3),
  ('free-exchange', 'Kleidung', 4),
  ('free-exchange', 'Bücher & Medien', 5),
  ('free-exchange', 'Baby & Kinder', 6),
  ('free-exchange', 'Haushaltsartikel', 7),
  ('free-exchange', 'Sonstiges', 8);

-- Add market fields to videos table
ALTER TABLE videos 
  ADD COLUMN IF NOT EXISTS is_market_item BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS market_category TEXT REFERENCES market_categories(category_id),
  ADD COLUMN IF NOT EXISTS market_subcategory TEXT;

-- Create index for market videos
CREATE INDEX IF NOT EXISTS idx_videos_market ON videos(is_market_item, market_category) WHERE is_market_item = TRUE;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_market_categories_updated_at ON market_categories;
CREATE TRIGGER update_market_categories_updated_at 
  BEFORE UPDATE ON market_categories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_market_subcategories_updated_at ON market_subcategories;
CREATE TRIGGER update_market_subcategories_updated_at 
  BEFORE UPDATE ON market_subcategories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
