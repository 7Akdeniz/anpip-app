/**
 * VIDEOS SITEMAP API
 * Alle Video-Inhalte mit Video-SEO
 */

import { generateVideosSitemap, generateXMLFromURLs, VideoEntry } from '@/lib/sitemap-2025';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 1000;

    // Videos aus Datenbank laden
    const { data: videos, error } = await supabase
      .from('videos')
      .select(`
        id,
        description,
        thumbnail_url,
        video_url,
        created_at,
        updated_at,
        duration,
        views_count,
        category,
        location_country,
        location_city,
        tags
      `)
      .eq('visibility', 'public')
      .eq('is_market_item', false)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('Error loading videos:', error);
      return new Response('Error generating sitemap', { status: 500 });
    }

    const videoEntries: VideoEntry[] = (videos || []).map(video => ({
      id: video.id,
      title: video.description || 'Anpip Video',
      description: video.description || 'Video auf Anpip',
      thumbnailUrl: video.thumbnail_url || `${baseUrl}/assets/icons/icon-512x512.png`,
      contentUrl: video.video_url,
      uploadDate: video.created_at,
      duration: video.duration,
      viewCount: video.views_count || 0,
      category: video.category,
      location: video.location_country && video.location_city ? {
        country: video.location_country,
        city: video.location_city,
      } : undefined,
      tags: video.tags,
    }));

    const urls = generateVideosSitemap(baseUrl, videoEntries, page, pageSize);
    const xml = generateXMLFromURLs(urls);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Video sitemap generation error:', error);
    return new Response('Error generating video sitemap', { status: 500 });
  }
}
