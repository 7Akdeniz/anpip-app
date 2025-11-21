/**
 * SITEMAP INDEX API
 * Haupt-Sitemap-Index mit allen Sub-Sitemaps
 */

import { generateSitemapIndex } from '@/lib/sitemap-2025';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const xml = generateSitemapIndex(baseUrl);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200', // 1h browser, 2h CDN
    },
  });
}
