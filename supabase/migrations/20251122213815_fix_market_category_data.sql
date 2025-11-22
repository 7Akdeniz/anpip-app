-- Fix existing market_category data
-- Convert category names to category_ids

UPDATE videos 
SET market_category = 'real-estate'
WHERE market_category = 'Immobilien';

UPDATE videos 
SET market_category = 'vehicles'
WHERE market_category = 'Fahrzeuge';

UPDATE videos 
SET market_category = 'electronics'
WHERE market_category = 'Elektronik';

UPDATE videos 
SET market_category = 'home-garden'
WHERE market_category = 'Haus & Garten';

UPDATE videos 
SET market_category = 'fashion-beauty'
WHERE market_category = 'Mode & Beauty';

UPDATE videos 
SET market_category = 'family-baby'
WHERE market_category = 'Familie & Baby';

UPDATE videos 
SET market_category = 'animals'
WHERE market_category = 'Tiere';

UPDATE videos 
SET market_category = 'leisure-hobby'
WHERE market_category = 'Freizeit & Hobby';

UPDATE videos 
SET market_category = 'music-media'
WHERE market_category = 'Musik & Medien';

UPDATE videos 
SET market_category = 'jobs-services'
WHERE market_category = 'Jobs & Dienstleistungen';

UPDATE videos 
SET market_category = 'business'
WHERE market_category = 'Business & Gewerbe';

UPDATE videos 
SET market_category = 'free-exchange'
WHERE market_category = 'Verschenken / Tauschen';
