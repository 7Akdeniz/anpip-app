/**
 * DEMO-VIDEOS EINFÜGEN
 * 
 * Erstellt Test-Videos direkt über die Supabase API
 * 
 * Usage: node scripts/seed-demo-videos.js
 */

// Lade .env Variablen
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY in .env fehlen!');
  process.exit(1);
}

// Demo-Videos (öffentliche Sample-Videos von Google)
const demoVideos = [
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    title: 'Berlin Schöne Aussicht',
    description: 'Demo Video 1 - Schöne Aussicht in Berlin 🌆',
    status: 'ready',
    is_public: true,
    moderation_status: 'approved',
    view_count: 1234,
    like_count: 56,
    comment_count: 12,
    share_count: 8,
    location_lat: 52.5200,
    location_lng: 13.4050,
    location_name: 'Berlin, Deutschland',
    tags: ['berlin', 'deutschland', 'lifestyle', 'stadt'],
    duration: 120,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    title: 'München Marienplatz',
    description: 'Demo Video 2 - München Marienplatz ⛪',
    status: 'ready',
    is_public: true,
    moderation_status: 'approved',
    view_count: 2345,
    like_count: 78,
    comment_count: 23,
    share_count: 15,
    location_lat: 48.1351,
    location_lng: 11.5820,
    location_name: 'München, Deutschland',
    tags: ['münchen', 'travel', 'kirche'],
    duration: 150,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    title: 'Hamburg Hafen',
    description: 'Demo Video 3 - Hamburg Hafen 🚢',
    status: 'ready',
    is_public: true,
    moderation_status: 'approved',
    view_count: 3456,
    like_count: 120,
    comment_count: 34,
    share_count: 22,
    location_lat: 53.5511,
    location_lng: 9.9937,
    location_name: 'Hamburg, Deutschland',
    tags: ['hamburg', 'hafen', 'natur', 'wasser'],
    duration: 90,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    title: 'Kölner Dom',
    description: 'Demo Video 4 - Kölner Dom 🏛️',
    status: 'ready',
    is_public: true,
    moderation_status: 'approved',
    view_count: 4567,
    like_count: 156,
    comment_count: 45,
    share_count: 28,
    location_lat: 50.9375,
    location_lng: 6.9603,
    location_name: 'Köln, Deutschland',
    tags: ['köln', 'dom', 'kultur', 'architektur'],
    duration: 180,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    title: 'Frankfurt Skyline',
    description: 'Demo Video 5 - Frankfurt Skyline 🌃',
    status: 'ready',
    is_public: true,
    moderation_status: 'approved',
    view_count: 5678,
    like_count: 189,
    comment_count: 56,
    share_count: 35,
    location_lat: 50.1109,
    location_lng: 8.6821,
    location_name: 'Frankfurt, Deutschland',
    tags: ['frankfurt', 'skyline', 'urban', 'city'],
    duration: 110,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    title: 'Neuestes Video!',
    description: 'Demo Video 6 - Neuestes Video! 🆕',
    status: 'ready',
    is_public: true,
    moderation_status: 'approved',
    view_count: 45,
    like_count: 3,
    comment_count: 1,
    share_count: 0,
    location_lat: 53.5511,
    location_lng: 9.9937,
    location_name: 'Hamburg, Deutschland',
    tags: ['neu', 'entertainment', 'animation'],
    duration: 200,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
    title: 'Stuttgart Schlossplatz',
    description: 'Demo Video 7 - Stuttgart Schlossplatz 🏰',
    status: 'ready',
    is_public: true,
    moderation_status: 'approved',
    view_count: 6789,
    like_count: 234,
    comment_count: 67,
    share_count: 42,
    location_lat: 48.7758,
    location_lng: 9.1829,
    location_name: 'Stuttgart, Deutschland',
    tags: ['stuttgart', 'architektur', 'platz'],
    duration: 95,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    title: 'Dresden Frauenkirche',
    description: 'Demo Video 8 - Dresden Frauenkirche ⛪',
    status: 'ready',
    is_public: true,
    moderation_status: 'approved',
    view_count: 7890,
    like_count: 267,
    comment_count: 78,
    share_count: 48,
    location_lat: 51.0504,
    location_lng: 13.7373,
    location_name: 'Dresden, Deutschland',
    tags: ['dresden', 'kirche', 'historie', 'sehenswürdigkeit'],
    duration: 300,
  },
];

async function seedDemoVideos() {
  console.log('🎬 Füge Demo-Videos in Supabase ein...\n');

  try {
    // Teste Verbindung
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/videos?limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!testResponse.ok) {
      throw new Error(`Verbindung fehlgeschlagen: ${testResponse.status} ${testResponse.statusText}`);
    }

    console.log('✅ Verbindung zu Supabase erfolgreich\n');

    // Hole ersten User (oder erstelle Demo-User)
    console.log('📋 Hole User-ID...');
    const usersResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    let userId = '00000000-0000-0000-0000-000000000000'; // Fallback UUID
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      if (usersData.users && usersData.users.length > 0) {
        userId = usersData.users[0].id;
        console.log(`✅ Verwende User-ID: ${userId}\n`);
      } else {
        console.log(`⚠️ Kein User gefunden, verwende Fallback UUID\n`);
      }
    }

    // Füge Videos einzeln ein
    let successCount = 0;
    for (const video of demoVideos) {
      try {
        const videoWithUser = { ...video, user_id: userId };
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/videos`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(videoWithUser),
        });

        if (response.ok) {
          successCount++;
          console.log(`✅ ${successCount}/${demoVideos.length} - ${video.title}`);
        } else {
          const error = await response.text();
          console.log(`❌ Fehler bei "${video.title}": ${error}`);
        }
      } catch (error) {
        console.log(`❌ Fehler bei "${video.title}":`, error.message);
      }
    }

    console.log(`\n🎉 ${successCount} von ${demoVideos.length} Videos erfolgreich eingefügt!`);

  } catch (error) {
    console.error('\n❌ Fehler:', error.message);
    process.exit(1);
  }
}

seedDemoVideos();
