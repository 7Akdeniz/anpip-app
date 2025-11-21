/**
 * 🌐 ADVANCED SEO/GEO SYSTEM 2025
 * 
 * - Multi-Language Sitemaps
 * - hreflang Tags
 * - Lokale Landingpages
 * - GEO-Targeting
 * - Entity-SEO
 */

import { supabase } from './supabase';
import { LANGUAGES } from '@/i18n/languages';

export class AdvancedSEOGeoService {
  
  /**
   * 🗺️ Multi-Sitemap generieren
   */
  async generateSitemaps(): Promise<{
    pages: string;
    videos: string;
    categories: string;
    locations: string;
    live: string;
  }> {
    
    const baseUrl = 'https://anpip.com';
    const now = new Date().toISOString();
    
    // Pages Sitemap
    const pages = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
    ${this.generateHreflangTags(baseUrl, '')}
  </url>
  <url>
    <loc>${baseUrl}/live</loc>
    <lastmod>${now}</lastmod>
    <changefreq>always</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    
    // Videos Sitemap
    const { data: videos } = await supabase
      .from('videos')
      .select('id, title, description, thumbnail_url, created_at, updated_at, language')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50000);
    
    const videosSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videos?.map(v => `  <url>
    <loc>${baseUrl}/video/${v.id}</loc>
    <lastmod>${v.updated_at}</lastmod>
    <video:video>
      <video:thumbnail_loc>${v.thumbnail_url}</video:thumbnail_loc>
      <video:title>${this.escapeXml(v.title)}</video:title>
      <video:description>${this.escapeXml(v.description)}</video:description>
      <video:publication_date>${v.created_at}</video:publication_date>
    </video:video>
  </url>`).join('\n')}
</urlset>`;
    
    // Categories Sitemap
    const categories = ['news', 'entertainment', 'sports', 'education', 'technology', 'lifestyle'];
    const categoriesSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.map(cat => `  <url>
    <loc>${baseUrl}/category/${cat}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
    
    // Locations Sitemap
    const { data: locations } = await supabase
      .from('videos')
      .select('location_country, location_city')
      .not('location_country', 'is', null)
      .limit(1000);
    
    const uniqueLocations = new Set(
      locations?.map(l => `${l.location_city}, ${l.location_country}`) || []
    );
    
    const locationsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(uniqueLocations).map(loc => `  <url>
    <loc>${baseUrl}/location/${encodeURIComponent(loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return {
      pages,
      videos: videosSitemap,
      categories: categoriesSitemap,
      locations: locationsSitemap,
      live: '', // TODO: Live-Streams Sitemap
    };
  }
  
  /**
   * 🌍 hreflang Tags generieren
   */
  private generateHreflangTags(baseUrl: string, path: string): string {
    return LANGUAGES.map(lang => 
      `    <xhtml:link rel="alternate" hreflang="${lang.code}" href="${baseUrl}/${lang.code}${path}" />`
    ).join('\n');
  }
  
  /**
   * 🏷️ Meta-Tags für SEO generieren
   */
  generateMetaTags(data: {
    title: string;
    description: string;
    image?: string;
    url: string;
    type?: 'website' | 'video' | 'article';
    language?: string;
  }): string {
    return `
    <title>${data.title} | Anpip</title>
    <meta name="description" content="${data.description}" />
    <meta name="keywords" content="${data.title}, Anpip, Video" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${data.title}" />
    <meta property="og:description" content="${data.description}" />
    <meta property="og:image" content="${data.image || 'https://anpip.com/og-image.jpg'}" />
    <meta property="og:url" content="${data.url}" />
    <meta property="og:type" content="${data.type || 'website'}" />
    <meta property="og:site_name" content="Anpip" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${data.title}" />
    <meta name="twitter:description" content="${data.description}" />
    <meta name="twitter:image" content="${data.image || 'https://anpip.com/og-image.jpg'}" />
    
    <!-- Language -->
    <meta http-equiv="content-language" content="${data.language || 'de'}" />
    <link rel="canonical" href="${data.url}" />
    `;
  }
  
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export const seoGeoService = new AdvancedSEOGeoService();
