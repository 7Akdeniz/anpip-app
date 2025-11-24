/**
 * DEMO-VIDEOS EINFÜGEN (KORREKTES SCHEMA)
 * 
 * Nutzt das tatsächliche Datenbank-Schema
 * 
 * Usage: node scripts/seed-demo-videos-fixed.js
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Demo-Videos mit KORREKTEM Schema
const demoVideos = [
  {
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    title: 'Berlin Schöne Aussicht',
    description: 'Demo Video 1 - Schöne Aussicht in Berlin 🌆',
    visibility: 'public',
    views_count: 1234,
    likes_count: 56,
    comments_count: 12,
    shares_count: 8,
    is_market_item: false,
    location_city: 'Berlin',
    location_country: 'Deutschland',
    location_lat: 52.5200,
    location_lon: 13.4050,
    location_display_name: 'Berlin, Deutschland',
    duration: 120,
  },
  {
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    title: 'München Marienplatz',
    description: 'Demo Video 2 - München Marienplatz ⛪',
    visibility: 'public',
    views_count: 2345,
    likes_count: 78,
    comments_count: 23,
    shares_count: 15,
    is_market_item: false,
    location_city: 'München',
    location_country: 'Deutschland',
    location_lat: 48.1351,
    location_lon: 11.5820,
    location_display_name: 'München, Deutschland',
    duration: 150,
  },
  {
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    title: 'Hamburg Hafen',
    description: 'Demo Video 3 - Hamburg Hafen 🚢',
    visibility: 'public',
    views_count: 3456,
    likes_count: 120,
    comments_count: 34,
    shares_count: 22,
    is_market_item: false,
    location_city: 'Hamburg',
    location_country: 'Deutschland',
    location_lat: 53.5511,
    location_lon: 9.9937,
    location_display_name: 'Hamburg, Deutschland',
    duration: 90,
  },
  {
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    title: 'Kölner Dom',
    description: 'Demo Video 4 - Kölner Dom 🏛️',
    visibility: 'public',
    views_count: 4567,
    likes_count: 156,
    comments_count: 45,
    shares_count: 28,
    is_market_item: false,
    location_city: 'Köln',
    location_country: 'Deutschland',
    location_lat: 50.9375,
    location_lon: 6.9603,
    location_display_name: 'Köln, Deutschland',
    duration: 180,
  },
  {
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    title: 'Frankfurt Skyline',
    description: 'Demo Video 5 - Frankfurt Skyline 🌃',
    visibility: 'public',
    views_count: 5678,
    likes_count: 189,
    comments_count: 56,
    shares_count: 35,
    is_market_item: false,
    location_city: 'Frankfurt',
    location_country: 'Deutschland',
    location_lat: 50.1109,
    location_lon: 8.6821,
    location_display_name: 'Frankfurt, Deutschland',
    duration: 110,
  },
  {
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    title: 'Neuestes Video!',
    description: 'Demo Video 6 - Neuestes Video! 🆕',
    visibility: 'public',
    views_count: 45,
    likes_count: 3,
    comments_count: 1,
    shares_count: 0,
    is_market_item: false,
    location_city: 'Hamburg',
    location_country: 'Deutschland',
    location_lat: 53.5511,
    location_lon: 9.9937,
    location_display_name: 'Hamburg, Deutschland',
    duration: 200,
  },
  {
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
    title: 'Stuttgart Schlossplatz',
    description: 'Demo Video 7 - Stuttgart Schlossplatz 🏰',
    visibility: 'public',
    views_count: 6789,
    likes_count: 234,
    comments_count: 67,
    shares_count: 42,
    is_market_item: false,
    location_city: 'Stuttgart',
    location_country: 'Deutschland',
    location_lat: 48.7758,
    location_lon: 9.1829,
    location_display_name: 'Stuttgart, Deutschland',
    duration: 95,
  },
  {
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    title: 'Dresden Frauenkirche',
    description: 'Demo Video 8 - Dresden Frauenkirche ⛪',
    visibility: 'public',
    views_count: 7890,
    likes_count: 267,
    comments_count: 78,
    shares_count: 48,
    is_market_item: false,
    location_city: 'Dresden',
    location_country: 'Deutschland',
    location_lat: 51.0504,
    location_lon: 13.7373,
    location_display_name: 'Dresden, Deutschland',
    duration: 300,
  },
  {
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    title: 'Fahrrad zu verkaufen',
    description: 'Demo Video 9 - Fahrrad zu verkaufen 🚲 250€',
    visibility: 'public',
    views_count: 890,
    likes_count: 23,
    comments_count: 8,
    shares_count: 3,
    is_market_item: true,
    market_category: 'vehicles',
    location_city: 'Berlin',
    location_country: 'Deutschland',
    location_lat: 52.5200,
    location_lon: 13.4050,
    location_display_name: 'Berlin, Deutschland',
    duration: 85,
  },
  {
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
    title: 'Sofa zu verschenken',
    description: 'Demo Video 10 - Sofa zu verschenken 🛋️ Gratis!',
    visibility: 'public',
    views_count: 567,
    likes_count: 12,
    comments_count: 4,
    shares_count: 1,
    is_market_item: true,
    market_category: 'furniture',
    location_city: 'München',
    location_country: 'Deutschland',
    location_lat: 48.1351,
    location_lon: 11.5820,
    location_display_name: 'München, Deutschland',
    duration: 120,
  },
];

async function seedDemoVideos() {
  console.log('🎬 Füge Demo-Videos in Supabase ein...\n');

  try {
    // Teste Verbindung
    const { data: testData, error: testError } = await supabase
      .from('videos')
      .select('id')
      .limit(1);

    if (testError) {
      throw new Error(`Verbindung fehlgeschlagen: ${testError.message}`);
    }

    console.log('✅ Verbindung zu Supabase erfolgreich\n');

    // Füge Videos ein (BATCH)
    console.log('📤 Füge 10 Demo-Videos ein...\n');
    
    const { data, error } = await supabase
      .from('videos')
      .insert(demoVideos)
      .select();

    if (error) {
      console.error('❌ Fehler beim Einfügen:', error.message);
      console.error('Details:', JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log(`✅ ${data?.length || 0} Videos erfolgreich eingefügt!\n`);
    
    if (data && data.length > 0) {
      console.log('🎥 Eingefügte Videos:');
      data.forEach((video, index) => {
        console.log(`  ${index + 1}. ${video.title} (${video.location_city})`);
      });
    }

    console.log('\n📱 Jetzt die App neu laden um die Videos zu sehen!');
    console.log('💡 In der App einfach nach unten ziehen (Pull-to-Refresh)\n');

  } catch (error) {
    console.error('\n❌ Fehler:', error.message);
    process.exit(1);
  }
}

seedDemoVideos();
