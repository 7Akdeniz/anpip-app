/**
 * ROBOTS.TXT API
 * Optimierte robots.txt für SEO
 */

import { generateRobotsTxt } from '@/lib/robots-2025';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const robotsTxt = generateRobotsTxt(baseUrl, {
    disallowPatterns: [
      '/messages',
      '/notifications',
      '/settings',
      '/auth/',
      '/*?*sort=', // Query-Parameter
      '/*?*filter=',
    ],
    allowPatterns: [
      '/api/sitemap*',
    ],
  });

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // 24h
    },
  });
}
