/**
 * Dynamic XML Sitemap Generator für Anpip.com
 * Generiert mehrsprachige Sitemaps mit Video-URLs
 */

import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'all';
  
  try {
    // Basis-URLs
    const baseUrl = 'https://anpip.com';
    const now = new Date().toISOString();
    
    // Statische Seiten
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/explore', priority: 0.9, changefreq: 'hourly' },
      { url: '/market', priority: 0.9, changefreq: 'daily' },
      { url: '/music-browser', priority: 0.8, changefreq: 'weekly' },
      { url: '/settings', priority: 0.5, changefreq: 'monthly' },
      { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
      { url: '/terms', priority: 0.3, changefreq: 'yearly' },
    ];
    
    // Video-URLs abrufen
    let videoQuery = supabase
      .from('videos')
      .select('id, created_at, location_name, location_country')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50000); // Google Limit
    
    const { data: videos } = await videoQuery;
    
    // Benutzerprofile abrufen
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, updated_at')
      .not('username', 'is', null)
      .limit(10000);
    
    // XML generieren
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;
    
    // Statische Seiten hinzufügen
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
`;
      
      // Hreflang für mehrsprachige Seiten
      const languages = ['de', 'en', 'es', 'fr', 'tr', 'ru', 'zh', 'ja', 'ar'];
      languages.forEach(language => {
        xml += `    <xhtml:link rel="alternate" hreflang="${language}" href="${baseUrl}${page.url}?lang=${language}" />
`;
      });
      
      xml += `  </url>
`;
    });
    
    // Video-URLs hinzufügen
    videos?.forEach(video => {
      const videoUrl = `${baseUrl}/video/${video.id}`;
      const thumbnailUrl = `${baseUrl}/api/thumbnail/${video.id}.jpg`;
      
      xml += `  <url>
    <loc>${videoUrl}</loc>
    <lastmod>${new Date(video.created_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <video:video>
      <video:thumbnail_loc>${thumbnailUrl}</video:thumbnail_loc>
      <video:title>Video from ${video.location_name || 'Anpip'}</video:title>
      <video:description>Vertical video content from ${video.location_name || 'worldwide'} on Anpip - the world's #1 vertical video platform</video:description>
      <video:content_loc>${baseUrl}/api/video/${video.id}.mp4</video:content_loc>
      <video:player_loc>${videoUrl}</video:player_loc>
      <video:duration>60</video:duration>
      <video:publication_date>${new Date(video.created_at).toISOString()}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:requires_subscription>no</video:requires_subscription>
      <video:live>no</video:live>
    </video:video>
  </url>
`;
    });
    
    // Benutzerprofile hinzufügen
    profiles?.forEach(profile => {
      const profileUrl = `${baseUrl}/profile/${profile.username}`;
      
      xml += `  <url>
    <loc>${profileUrl}</loc>
    <lastmod>${new Date(profile.updated_at || now).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });
    
    xml += `</urlset>`;
    
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
    
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
