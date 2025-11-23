/**
 * DYNAMIC SITEMAP GENERATOR
 * Generiert XML Sitemaps für Videos, Profile, Market, Kategorien
 * Optimiert für Google Video Search & AI-Crawlers
 */

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  video?: {
    thumbnail_loc: string;
    title: string;
    description: string;
    content_loc: string;
    player_loc?: string;
    duration?: number;
    view_count?: number;
    publication_date?: string;
    family_friendly?: 'yes' | 'no';
    uploader?: string;
    uploader_info?: string;
    category?: string;
    tag?: string[];
    requires_subscription?: 'yes' | 'no';
    live?: 'yes' | 'no';
  };
}

/**
 * Generiert Sitemap Index (verlinkt alle Sub-Sitemaps)
 */
export function generateSitemapIndex(): string {
  const baseUrl = 'https://anpip.com';
  const now = new Date().toISOString();

  const sitemaps = [
    { loc: `${baseUrl}/sitemap-main.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-videos.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-profiles.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-market.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-hashtags.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-categories.xml`, lastmod: now }
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return xml;
}

/**
 * Generiert Haupt-Sitemap (statische Seiten)
 */
export function generateMainSitemap(): string {
  const baseUrl = 'https://anpip.com';
  
  const urls: SitemapUrl[] = [
    {
      loc: baseUrl,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/feed`,
      changefreq: 'hourly',
      priority: 0.9
    },
    {
      loc: `${baseUrl}/explore`,
      changefreq: 'hourly',
      priority: 0.9
    },
    {
      loc: `${baseUrl}/market`,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/live`,
      changefreq: 'hourly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/upload`,
      changefreq: 'weekly',
      priority: 0.7
    }
  ];

  return generateSitemapXml(urls);
}

/**
 * Generiert Video-Sitemap mit Video-spezifischen Tags
 */
export async function generateVideoSitemap(videos: any[]): Promise<string> {
  const baseUrl = 'https://anpip.com';
  
  const urls: SitemapUrl[] = videos.map(video => ({
    loc: `${baseUrl}/video/${video.id}`,
    lastmod: video.updated_at || video.created_at,
    changefreq: 'weekly',
    priority: 0.7,
    video: {
      thumbnail_loc: video.thumbnail_url,
      title: video.title || video.description?.substring(0, 100) || 'Anpip Video',
      description: video.description || 'Video auf Anpip',
      content_loc: video.video_url,
      player_loc: `${baseUrl}/embed/${video.id}`,
      duration: video.duration,
      view_count: video.views_count || 0,
      publication_date: video.created_at,
      family_friendly: video.is_nsfw ? 'no' : 'yes',
      uploader: video.username || 'Anpip User',
      uploader_info: `${baseUrl}/profile/${video.user_id}`,
      category: video.category || 'Entertainment',
      tag: video.hashtags || [],
      requires_subscription: 'no',
      live: 'no'
    }
  }));

  return generateVideoSitemapXml(urls);
}

/**
 * Generiert Profile-Sitemap
 */
export async function generateProfileSitemap(profiles: any[]): Promise<string> {
  const baseUrl = 'https://anpip.com';
  
  const urls: SitemapUrl[] = profiles.map(profile => ({
    loc: `${baseUrl}/profile/${profile.user_id}`,
    lastmod: profile.updated_at,
    changefreq: 'weekly',
    priority: 0.6
  }));

  return generateSitemapXml(urls);
}

/**
 * Generiert Market-Sitemap
 */
export async function generateMarketSitemap(categories: any[]): Promise<string> {
  const baseUrl = 'https://anpip.com';
  
  const urls: SitemapUrl[] = [
    {
      loc: `${baseUrl}/market`,
      changefreq: 'daily',
      priority: 0.8
    },
    ...categories.map(category => ({
      loc: `${baseUrl}/market/${category.id}`,
      changefreq: 'daily' as const,
      priority: 0.7
    }))
  ];

  return generateSitemapXml(urls);
}

/**
 * Generiert Hashtag-Sitemap
 */
export async function generateHashtagSitemap(hashtags: string[]): Promise<string> {
  const baseUrl = 'https://anpip.com';
  
  const urls: SitemapUrl[] = hashtags.map(tag => ({
    loc: `${baseUrl}/hashtag/${encodeURIComponent(tag)}`,
    changefreq: 'daily',
    priority: 0.6
  }));

  return generateSitemapXml(urls);
}

/**
 * Generiert Standard-Sitemap XML
 */
function generateSitemapXml(urls: SitemapUrl[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

/**
 * Generiert Video-Sitemap XML (mit video: Namespace)
 */
function generateVideoSitemapXml(urls: SitemapUrl[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
    ${url.video ? generateVideoTag(url.video) : ''}
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

/**
 * Generiert <video:video> Tag
 */
function generateVideoTag(video: NonNullable<SitemapUrl['video']>): string {
  return `<video:video>
      <video:thumbnail_loc>${escapeXml(video.thumbnail_loc)}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description)}</video:description>
      <video:content_loc>${escapeXml(video.content_loc)}</video:content_loc>
      ${video.player_loc ? `<video:player_loc>${escapeXml(video.player_loc)}</video:player_loc>` : ''}
      ${video.duration ? `<video:duration>${video.duration}</video:duration>` : ''}
      ${video.view_count ? `<video:view_count>${video.view_count}</video:view_count>` : ''}
      ${video.publication_date ? `<video:publication_date>${video.publication_date}</video:publication_date>` : ''}
      ${video.family_friendly ? `<video:family_friendly>${video.family_friendly}</video:family_friendly>` : ''}
      ${video.uploader ? `<video:uploader info="${escapeXml(video.uploader_info || '')}">${escapeXml(video.uploader)}</video:uploader>` : ''}
      ${video.category ? `<video:category>${escapeXml(video.category)}</video:category>` : ''}
      ${video.tag?.map(tag => `<video:tag>${escapeXml(tag)}</video:tag>`).join('\n      ') || ''}
      ${video.requires_subscription ? `<video:requires_subscription>${video.requires_subscription}</video:requires_subscription>` : ''}
      ${video.live ? `<video:live>${video.live}</video:live>` : ''}
    </video:video>`;
}

/**
 * Escape XML-Zeichen
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generiert robots.txt mit Sitemap-Verweisen
 */
export function generateRobotsTxt(): string {
  const baseUrl = 'https://anpip.com';
  
  return `# Anpip.com - Robots.txt 2025
# Optimiert für Google, Bing, AI-Search (ChatGPT, Perplexity, Gemini)

User-agent: *
Allow: /
Crawl-delay: 1

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-videos.xml
Sitemap: ${baseUrl}/sitemap-profiles.xml
Sitemap: ${baseUrl}/sitemap-market.xml

# Nicht crawlen
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

# AI Bots erlauben
User-agent: GPTBot
Allow: /
Crawl-delay: 1

User-agent: ChatGPT-User
Allow: /
Crawl-delay: 1

User-agent: PerplexityBot
Allow: /
Crawl-delay: 1

User-agent: Claude-Web
Allow: /
Crawl-delay: 1

User-agent: anthropic-ai
Allow: /
Crawl-delay: 1

User-agent: Google-Extended
Allow: /
Crawl-delay: 1

User-agent: Bard
Allow: /
Crawl-delay: 1

User-agent: Gemini
Allow: /
Crawl-delay: 1
`;
}
