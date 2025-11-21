/**
 * Market Items Sitemap API
 * GET /api/sitemap-market+api.ts
 */

import { supabase } from '@/lib/supabase';
import { generateSitemap, formatSitemapDate, type SitemapURL } from '@/lib/sitemap';

export async function GET(request: Request) {
  try {
    const urls: SitemapURL[] = [];
    const baseUrl = 'https://anpip.com';

    // Alle Market Items laden
    const { data: marketItems, error } = await supabase
      .from('videos')
      .select('*')
      .eq('visibility', 'public')
      .eq('is_market_item', true)
      .order('created_at', { ascending: false })
      .limit(5000);

    if (!error && marketItems) {
      marketItems.forEach(item => {
        const geoLocation = item.location_city && item.location_country
          ? `${item.location_city}, ${item.location_country}`
          : undefined;

        urls.push({
          loc: `${baseUrl}/market/${item.id}`,
          changefreq: 'daily',
          priority: 0.9,
          lastmod: formatSitemapDate(new Date(item.updated_at || item.created_at)),
          images: item.thumbnail_url ? [{
            loc: item.thumbnail_url,
            title: item.description || 'Market Item',
            caption: item.description || undefined,
            geoLocation,
          }] : undefined,
          videos: [{
            thumbnail_loc: item.thumbnail_url || `${baseUrl}/assets/icons/icon-512x512.png`,
            title: item.description || 'Market Item auf Anpip',
            description: `${item.market_category || 'Artikel'} in ${item.location_city || 'deiner Nähe'}`,
            content_loc: item.video_url,
            publication_date: formatSitemapDate(new Date(item.created_at)),
            view_count: item.views_count || 0,
            family_friendly: true,
            requires_subscription: false,
          }],
          alternates: [
            { hreflang: 'de', href: `${baseUrl}/market/${item.id}?lang=de` },
            { hreflang: 'en', href: `${baseUrl}/market/${item.id}?lang=en` },
          ],
        });
      });

      // Stadt-spezifische Market-Seiten
      const cities = [...new Set(marketItems.map(item => item.location_city).filter(Boolean))];
      cities.forEach(city => {
        urls.push({
          loc: `${baseUrl}/market/location/${encodeURIComponent(city as string)}`,
          changefreq: 'hourly',
          priority: 0.85,
          lastmod: formatSitemapDate(new Date()),
          alternates: [
            { hreflang: 'de', href: `${baseUrl}/market/location/${encodeURIComponent(city as string)}?lang=de` },
            { hreflang: 'en', href: `${baseUrl}/market/location/${encodeURIComponent(city as string)}?lang=en` },
          ],
        });
      });

      // Kategorien
      const categories = [...new Set(marketItems.map(item => item.market_category).filter(Boolean))];
      categories.forEach(category => {
        urls.push({
          loc: `${baseUrl}/market/category/${encodeURIComponent(category as string)}`,
          changefreq: 'daily',
          priority: 0.8,
          lastmod: formatSitemapDate(new Date()),
        });
      });
    }

    const xml = generateSitemap(urls);

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Market sitemap generation error:', error);
    return new Response('Error generating market sitemap', { status: 500 });
  }
}
