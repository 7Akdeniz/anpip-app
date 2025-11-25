/**
 * ============================================================================
 * API: CREATE VIDEO UPLOAD
 * ============================================================================
 * 
 * POST /api/videos/create-upload
 * 
 * Erstellt eine Direct Upload URL bei Cloudflare Stream.
 * Der Client lädt dann direkt zu Cloudflare hoch (nicht über unseren Server).
 */

import { createClient } from '@supabase/supabase-js';
import { cloudflareStream } from '@/lib/cloudflare-stream';
import { VIDEO_LIMITS } from '@/config/video-limits';

// Supabase Client mit Service Role für Backend-Operations
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Default Export für Expo Router
export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Methode nicht erlaubt' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return POST(request);
}

export async function POST(request: Request) {
  try {
    // 1. Authentifizierung prüfen
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Nicht authentifiziert' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // User aus Token holen
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Ungültiges Token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Request-Body parsen
    const body = await request.json();
    const { 
      title, 
      description,
      maxDurationSeconds = VIDEO_LIMITS.TECHNICAL_MAX_DURATION_SECONDS, // Use technical max for Cloudflare
      locationLat,
      locationLng,
      locationName,
      tags = []
    } = body;

    // 3. Cloudflare Stream: Direct Upload URL erstellen
    if (!cloudflareStream.isConfigured()) {
      return new Response(
        JSON.stringify({ error: 'Cloudflare Stream ist nicht konfiguriert' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const uploadResponse = await cloudflareStream.createDirectUpload({
      maxDurationSeconds,
      metadata: { name: title || 'Anpip Video' },
      requireSignedURLs: false,
      allowedOrigins: ['https://anpip.com', 'https://www.anpip.com', 'http://localhost:3000'],
    });

    if (!uploadResponse.success) {
      console.error('Cloudflare Stream Error:', uploadResponse.errors);
      return new Response(
        JSON.stringify({ error: 'Fehler beim Erstellen der Upload-URL' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { uid: cloudflareUid, uploadURL } = uploadResponse.result;

    // 4. Video-Eintrag in unserer Datenbank erstellen
    const { data: video, error: dbError } = await supabase
      .from('videos')
      .insert({
        user_id: user.id,
        cloudflare_uid: cloudflareUid,
        title,
        description,
        status: 'uploading',
        upload_url: uploadURL,
        upload_started_at: new Date().toISOString(),
        location_lat: locationLat,
        location_lng: locationLng,
        location_name: locationName,
        tags,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Fehler beim Speichern des Videos' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Response mit Upload-URL zurückgeben
    return new Response(
      JSON.stringify({
        success: true,
        video: {
          id: video.id,
          cloudflare_uid: cloudflareUid,
          upload_url: uploadURL,
          status: 'uploading',
        },
        message: 'Upload-URL erstellt. Sie können jetzt mit dem Upload beginnen.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create Upload Error:', error);
    return new Response(
      JSON.stringify({ error: 'Interner Server-Fehler' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
