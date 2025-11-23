/**
 * ============================================================================
 * API: CLOUDFLARE STREAM WEBHOOK
 * ============================================================================
 * 
 * POST /api/videos/webhook/cloudflare-stream
 * 
 * Empfängt Webhooks von Cloudflare Stream (z.B. wenn Transcoding fertig ist)
 * und aktualisiert den Video-Status in unserer Datenbank.
 * 
 * Setup in Cloudflare:
 * 1. Dashboard → Stream → Settings → Webhooks
 * 2. Webhook URL: https://anpip.com/api/videos/webhook/cloudflare-stream
 * 3. Secret setzen (CLOUDFLARE_WEBHOOK_SECRET in .env)
 */

import { createClient } from '@supabase/supabase-js';
import { cloudflareStream } from '@/lib/cloudflare-stream';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Webhook Secret für Sicherheit
const WEBHOOK_SECRET = process.env.CLOUDFLARE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  try {
    // 1. Webhook-Authentifizierung (Optional aber empfohlen)
    const signature = request.headers.get('webhook-signature');
    if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
      console.warn('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Ungültige Signatur' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Webhook-Payload parsen
    const payload = await request.json();
    
    console.log('Cloudflare Stream Webhook:', payload);

    const { uid, status, meta, duration, playback, thumbnail, input } = payload;

    if (!uid) {
      return new Response(
        JSON.stringify({ error: 'Fehlende Video-UID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Video in unserer DB finden
    const { data: video, error: findError } = await supabase
      .from('videos')
      .select('*')
      .eq('cloudflare_uid', uid)
      .single();

    if (findError || !video) {
      console.error('Video nicht in DB gefunden:', uid);
      return new Response(
        JSON.stringify({ error: 'Video nicht gefunden' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Status-Updates basierend auf Cloudflare State
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    // Status-Mapping
    switch (status?.state) {
      case 'pendingupload':
        updates.status = 'uploading';
        break;
      
      case 'downloading':
      case 'queued':
      case 'inprogress':
        updates.status = 'processing';
        if (!video.processing_started_at) {
          updates.processing_started_at = new Date().toISOString();
        }
        if (!video.upload_completed_at) {
          updates.upload_completed_at = new Date().toISOString();
        }
        break;
      
      case 'ready':
        updates.status = 'ready';
        updates.processing_completed_at = new Date().toISOString();
        
        // URLs speichern
        if (playback) {
          updates.playback_url = cloudflareStream.getPlaybackUrl(uid);
          updates.dash_url = cloudflareStream.getDashUrl(uid);
        }
        
        if (thumbnail) {
          updates.thumbnail_url = cloudflareStream.getThumbnailUrl(uid);
        }
        
        // Video-Details
        if (duration) {
          updates.duration = duration;
        }
        
        if (input) {
          updates.width = input.width;
          updates.height = input.height;
        }
        
        // Upload-URL löschen (nicht mehr benötigt)
        updates.upload_url = null;
        break;
      
      case 'error':
        updates.status = 'error';
        updates.error_code = status?.errorReasonCode || 'UNKNOWN';
        updates.error_message = status?.errorReasonText || 'Unbekannter Fehler';
        break;
    }

    // 5. Video in DB aktualisieren
    const { error: updateError } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', video.id);

    if (updateError) {
      console.error('Update Error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Fehler beim Aktualisieren' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Video ${uid} aktualisiert:`, updates.status);

    // 6. Success Response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook verarbeitet',
        video_id: video.id,
        status: updates.status,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(
      JSON.stringify({ error: 'Interner Server-Fehler' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
