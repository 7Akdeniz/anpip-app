/**
 * ROBOTS.TXT GENERATOR 2025
 * Optimiert für Crawl-Budget & SEO
 */

export interface RobotsConfig {
  allowAll?: boolean;
  disallowPatterns?: string[];
  allowPatterns?: string[];
  crawlDelay?: number;
  sitemapURLs?: string[];
}

/**
 * Generiert optimierte robots.txt
 */
export function generateRobotsTxt(baseUrl: string, config: RobotsConfig = {}): string {
  const lines: string[] = [];

  // Google Bot
  lines.push('# Anpip.com Robots.txt');
  lines.push('# Optimiert für maximale Sichtbarkeit');
  lines.push('');
  lines.push('User-agent: Googlebot');
  lines.push('Allow: /');
  if (config.disallowPatterns) {
    config.disallowPatterns.forEach(pattern => {
      lines.push(`Disallow: ${pattern}`);
    });
  }
  lines.push('');

  // Google Image Bot
  lines.push('User-agent: Googlebot-Image');
  lines.push('Allow: /');
  lines.push('');

  // Google Video Bot
  lines.push('User-agent: Googlebot-Video');
  lines.push('Allow: /');
  lines.push('');

  // Bingbot
  lines.push('User-agent: Bingbot');
  lines.push('Allow: /');
  if (config.crawlDelay) {
    lines.push(`Crawl-delay: ${config.crawlDelay}`);
  }
  lines.push('');

  // AI Crawlers (ChatGPT, Claude, Perplexity, etc.)
  lines.push('# AI Search Engines');
  lines.push('User-agent: GPTBot');
  lines.push('Allow: /');
  lines.push('');

  lines.push('User-agent: ChatGPT-User');
  lines.push('Allow: /');
  lines.push('');

  lines.push('User-agent: CCBot');
  lines.push('Allow: /');
  lines.push('');

  lines.push('User-agent: PerplexityBot');
  lines.push('Allow: /');
  lines.push('');

  lines.push('User-agent: ClaudeBot');
  lines.push('Allow: /');
  lines.push('');

  // Social Media Crawlers
  lines.push('# Social Media Crawlers');
  lines.push('User-agent: facebookexternalhit');
  lines.push('Allow: /');
  lines.push('');

  lines.push('User-agent: Twitterbot');
  lines.push('Allow: /');
  lines.push('');

  // Alle anderen Bots
  lines.push('# Default for all other bots');
  lines.push('User-agent: *');
  
  if (config.allowAll) {
    lines.push('Allow: /');
  } else {
    // Standard Disallows
    lines.push('Disallow: /api/');
    lines.push('Disallow: /_next/');
    lines.push('Disallow: /admin/');
    lines.push('Disallow: /private/');
    lines.push('Disallow: /*.json$');
    lines.push('Allow: /api/sitemap*');
    
    // Zusätzliche Patterns
    if (config.disallowPatterns) {
      config.disallowPatterns.forEach(pattern => {
        lines.push(`Disallow: ${pattern}`);
      });
    }
  }

  if (config.allowPatterns) {
    config.allowPatterns.forEach(pattern => {
      lines.push(`Allow: ${pattern}`);
    });
  }

  lines.push('');

  // Sitemaps
  lines.push('# Sitemaps');
  const sitemaps = config.sitemapURLs || [
    `${baseUrl}/api/sitemap`,
    `${baseUrl}/api/sitemap-pages`,
    `${baseUrl}/api/sitemap-categories`,
    `${baseUrl}/api/sitemap-locations`,
    `${baseUrl}/api/sitemap-videos`,
    `${baseUrl}/api/sitemap-users`,
    `${baseUrl}/api/sitemap-geo`,
  ];

  sitemaps.forEach(sitemap => {
    lines.push(`Sitemap: ${sitemap}`);
  });

  return lines.join('\n');
}

/**
 * Robots.txt API Route
 */
export function createRobotsTxtHandler(baseUrl?: string) {
  return async (request: Request) => {
    const url = new URL(request.url);
    const base = baseUrl || `${url.protocol}//${url.host}`;
    
    const robotsTxt = generateRobotsTxt(base, {
      disallowPatterns: [
        '/messages/',
        '/notifications/',
        '/settings/',
        '/auth/',
      ],
    });

    return new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400', // 24h Cache
      },
    });
  };
}

export default {
  generateRobotsTxt,
  createRobotsTxtHandler,
};
