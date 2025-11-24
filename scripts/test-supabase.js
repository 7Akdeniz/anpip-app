/**
 * TESTE SUPABASE VERBINDUNG & SCHEMA
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log('🔍 Teste Supabase-Verbindung und Videos-Schema...\n');

  try {
    // 1. Teste Verbindung
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Fehler beim Laden:', error);
      console.error('\nDetails:', JSON.stringify(error, null, 2));
      
      if (error.message.includes('relation "public.videos" does not exist')) {
        console.log('\n📋 DIE VIDEOS-TABELLE EXISTIERT NICHT!');
        console.log('Du musst zuerst die Migration ausführen:');
        console.log('   npx supabase db push');
        console.log('oder im Supabase Dashboard die Tabelle manuell erstellen.');
      }
    } else {
      console.log('✅ Verbindung erfolgreich!');
      console.log('📊 Anzahl Videos:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('\n🎬 Erstes Video:');
        console.log(JSON.stringify(data[0], null, 2));
        console.log('\n📋 Verfügbare Felder:');
        console.log(Object.keys(data[0]).join(', '));
      } else {
        console.log('\n📭 Keine Videos gefunden - Datenbank ist leer.');
        console.log('\n💡 Tipp: Nutze das Upload-Feature in der App oder führe aus:');
        console.log('   node scripts/seed-demo-videos.js');
      }
    }

  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error.message);
  }
}

testConnection();
