/**
 * PAGES SITEMAP API
 * Alle statischen Seiten
 */

import { generatePagesSitemap, generateXMLFromURLs } from '@/lib/sitemap-2025';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const urls = generatePagesSitemap(baseUrl);
  const xml = generateXMLFromURLs(urls);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200',
    },
  });
}
