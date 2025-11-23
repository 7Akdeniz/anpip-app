/**
 * ============================================================================
 * API: GET VIDEO DETAILS
 * ============================================================================
 * 
 * GET /api/videos/[id]
 * 
 * Holt Details zu einem Video aus unserer DB + Cloudflare Stream
 */

import { createClient } from '@supabase/supabase-js';
import { cloudflareStream } from '@/lib/cloudflare-stream';

// Für Expo Router API Routes
export async function GET(request: Request, { id }: { id: string }) {
  try {
    // Supabase Client
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // Video aus DB holen
    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !video) {
      return new Response(
        JSON.stringify({ error: 'Video nicht gefunden' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Wenn Video bei Cloudflare ist, aktuelle Details holen
    let cloudflareDetails = null;
    if (video.cloudflare_uid && cloudflareStream.isConfigured()) {
      try {
        const response = await cloudflareStream.getVideo(video.cloudflare_uid);
        if (response.success) {
          cloudflareDetails = response.result;
          
          // URLs aktualisieren falls noch nicht in DB
          if (!video.playback_url && cloudflareDetails.playback) {
            video.playback_url = cloudflareDetails.playback.hls;
            video.dash_url = cloudflareDetails.playback.dash;
            video.thumbnail_url = cloudflareDetails.thumbnail;
            video.duration = cloudflareDetails.duration;
            video.width = cloudflareDetails.input?.width;
            video.height = cloudflareDetails.input?.height;
          }
        }
      } catch (err) {
        console.error('Cloudflare Stream Error:', err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        video,
        cloudflare: cloudflareDetails,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get Video Error:', error);
    return new Response(
      JSON.stringify({ error: 'Interner Server-Fehler' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
