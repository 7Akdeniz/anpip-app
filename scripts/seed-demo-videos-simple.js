/**
 * DEMO-VIDEOS EINFÜGEN (MINIMALES SCHEMA)
 * 
 * Nutzt nur Felder die definitiv existieren
 * 
 * Usage: node scripts/seed-demo-videos-simple.js
 */

// Lade .env Variablen
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY in .env fehlen!');
  process.exit(1);
}

// EINFACHE Demo-Videos mit nur den wichtigsten Feldern
const demoVideos = [
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    title: 'Berlin Schöne Aussicht',
    description: 'Demo Video 1 - Schöne Aussicht in Berlin 🌆',
    status: 'ready',
    is_public: true,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    title: 'München Marienplatz',
    description: 'Demo Video 2 - München Marienplatz ⛪',
    status: 'ready',
    is_public: true,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    title: 'Hamburg Hafen',
    description: 'Demo Video 3 - Hamburg Hafen 🚢',
    status: 'ready',
    is_public: true,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    title: 'Kölner Dom',
    description: 'Demo Video 4 - Kölner Dom 🏛️',
    status: 'ready',
    is_public: true,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    title: 'Frankfurt Skyline',
    description: 'Demo Video 5 - Frankfurt Skyline 🌃',
    status: 'ready',
    is_public: true,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    title: 'Neuestes Video!',
    description: 'Demo Video 6 - Neuestes Video! 🆕',
    status: 'ready',
    is_public: true,
  },
  {
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    title: 'Dresden Frauenkirche',
    description: 'Demo Video 7 - Dresden Frauenkirche ⛪',
    status: 'ready',
    is_public: true,
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

    // Hole ersten User (oder verwende Fallback)
    console.log('📋 Hole User-ID...');
    let userId = '00000000-0000-0000-0000-000000000000'; // Fallback UUID
    
    console.log(`⚠️ Verwende Fallback UUID: ${userId}\n`);

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
    
    if (successCount > 0) {
      console.log('\n📱 App neu laden um Videos zu sehen!');
    }

  } catch (error) {
    console.error('\n❌ Fehler:', error.message);
    process.exit(1);
  }
}

seedDemoVideos();
