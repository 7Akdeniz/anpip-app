/**
 * ============================================================================
 * API: VIDEO FEED
 * ============================================================================
 * 
 * GET /api/videos/feed
 * 
 * Liefert eine Liste von fertigen Videos für den Feed
 */

import { supabase } from '../../../lib/supabase';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const userId = url.searchParams.get('userId'); // Optional: nur Videos eines Users

    // use shared supabase client from `lib/supabase`

    // Query bauen
    let query = supabase
      .from('videos')
      .select(`
        id,
        cloudflare_uid,
        title,
        description,
        duration,
        width,
        height,
        playback_url,
        thumbnail_url,
        view_count,
        like_count,
        comment_count,
        share_count,
        location_name,
        tags,
        created_at,
        user_id
      `)
      .eq('status', 'ready')
      .eq('is_public', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Optional: Filter nach User
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: videos, error } = await query;

    if (error) {
      console.error('Feed Query Error:', error);
      return new Response(
        JSON.stringify({ error: 'Fehler beim Laden des Feeds' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        videos: videos || [],
        count: videos?.length || 0,
        limit,
        offset,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Feed Error:', error);
    return new Response(
      JSON.stringify({ error: 'Interner Server-Fehler' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
