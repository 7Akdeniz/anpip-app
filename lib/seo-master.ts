/**
 * SEO OPTIMIZATION LIBRARY - MASTER
 * 
 * Features:
 * - Multi-Sitemap System
 * - JSON-LD Structured Data
 * - Meta Tags Generation
 * - Canonical URLs
 * - Hreflang Tags
 * - Open Graph & Twitter Cards
 * - Auto SEO Text Generation
 */

import { supabase } from './supabase';

export interface SEOMetaTags {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  hreflang?: Array<{ lang: string; url: string }>;
  jsonLd?: any[];
}

/**
 * Generiere Video JSON-LD
 */
export function generateVideoJSONLD(video: any): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl: video.thumbnail_url,
    uploadDate: video.created_at,
    duration: video.duration ? `PT${Math.floor(video.duration)}S` : undefined,
    contentUrl: video.file_path,
    embedUrl: `https://anpip.com/watch/${video.id}`,
    author: {
      '@type': 'Person',
      name: video.user?.username || 'Anonymous',
      url: `https://anpip.com/@${video.user?.username}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Anpip',
      logo: {
        '@type': 'ImageObject',
        url: 'https://anpip.com/logo.png',
      },
    },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: video.likes_count || 0,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: video.comments_count || 0,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/WatchAction',
        userInteractionCount: video.views_count || 0,
      },
    ],
  };
}

/**
 * Generiere LocalBusiness JSON-LD (für Stadt-Seiten)
 */
export function generateLocalBusinessJSONLD(city: any): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Anpip ${city.name}`,
    description: `Entdecke lokale Videos aus ${city.name}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressCountry: city.country_code,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city.latitude,
      longitude: city.longitude,
    },
    url: `https://anpip.com/${city.country_code.toLowerCase()}/${city.slug}`,
    image: `https://anpip.com/og/${city.slug}.jpg`,
  };
}

/**
 * Generiere BreadcrumbList JSON-LD
 */
export function generateBreadcrumbJSONLD(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generiere WebSite JSON-LD
 */
export function generateWebSiteJSONLD(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Anpip',
    url: 'https://anpip.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://anpip.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    sameAs: [
      'https://twitter.com/anpip',
      'https://facebook.com/anpip',
      'https://instagram.com/anpip',
    ],
  };
}

/**
 * Generiere FAQ JSON-LD
 */
export function generateFAQJSONLD(faqs: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Auto-generiere SEO-Titel
 */
export function generateSEOTitle(params: {
  type: 'video' | 'city' | 'category' | 'city_category' | 'home';
  videoTitle?: string;
  cityName?: string;
  categoryName?: string;
  countryName?: string;
}): string {
  const { type, videoTitle, cityName, categoryName, countryName } = params;

  switch (type) {
    case 'video':
      return `${videoTitle} | Anpip`;
    case 'city':
      return `${cityName} - Lokale Videos entdecken | Anpip`;
    case 'category':
      return `${categoryName} Videos | Anpip`;
    case 'city_category':
      return `${categoryName} in ${cityName} | Anpip`;
    case 'home':
      return 'Anpip - Teile deine Momente, entdecke lokale Videos';
    default:
      return 'Anpip';
  }
}

/**
 * Auto-generiere Meta-Description
 */
export function generateMetaDescription(params: {
  type: 'video' | 'city' | 'category' | 'city_category' | 'home';
  videoDescription?: string;
  cityName?: string;
  categoryName?: string;
  videosCount?: number;
}): string {
  const { type, videoDescription, cityName, categoryName, videosCount } = params;

  switch (type) {
    case 'video':
      return videoDescription || 'Schaue dieses Video auf Anpip';
    case 'city':
      return `Entdecke ${videosCount || ''} Videos aus ${cityName}. Lokale Momente, echte Menschen. Finde spannende Inhalte aus deiner Region.`;
    case 'category':
      return `Die besten ${categoryName} Videos auf Anpip. Entdecke, teile und erlebe spannende Momente.`;
    case 'city_category':
      return `${categoryName} Videos aus ${cityName}. ${videosCount || 'Viele'} lokale Videos entdecken und selbst teilen.`;
    case 'home':
      return 'Anpip ist die Plattform für lokale Videos. Teile deine Momente, entdecke spannende Inhalte aus deiner Region und verbinde dich mit Menschen in deiner Nähe.';
    default:
      return 'Anpip - Lokale Videos entdecken';
  }
}

/**
 * Generiere Canonical URL
 */
export function generateCanonicalURL(path: string): string {
  const baseURL = 'https://anpip.com';
  return `${baseURL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Generiere Hreflang Tags
 */
export function generateHreflangTags(
  path: string,
  languages: string[] = ['de', 'en', 'fr', 'es']
): Array<{ lang: string; url: string }> {
  return languages.map((lang) => ({
    lang,
    url: `https://anpip.com/${lang}${path}`,
  }));
}

/**
 * Generiere complete SEO Meta Tags
 */
export function generateCompleteMetaTags(params: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: string;
  keywords?: string[];
  jsonLd?: any[];
  noIndex?: boolean;
}): SEOMetaTags {
  const { title, description, path, image, type = 'website', keywords, jsonLd, noIndex } = params;

  const canonical = generateCanonicalURL(path);
  const ogImage = image || 'https://anpip.com/og-default.jpg';

  return {
    title,
    description,
    keywords,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogType: type,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    hreflang: generateHreflangTags(path),
    jsonLd,
  };
}

/**
 * Multi-Sitemap Generator
 */
export class SitemapGenerator {
  private baseURL = 'https://anpip.com';

  async generateSitemapIndex(): Promise<string> {
    const sitemaps = [
      'sitemap-pages.xml',
      'sitemap-videos.xml',
      'sitemap-users.xml',
      'sitemap-categories.xml',
      'sitemap-locations.xml',
      'sitemap-geo.xml',
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const sitemap of sitemaps) {
      xml += '  <sitemap>\n';
      xml += `    <loc>${this.baseURL}/${sitemap}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += '  </sitemap>\n';
    }

    xml += '</sitemapindex>';
    return xml;
  }

  async generateVideosSitemap(limit: number = 50000): Promise<string> {
    const { data: videos } = await supabase
      .from('videos')
      .select('id, title, thumbnail_url, created_at, updated_at, duration')
      .eq('status', 'ready')
      .order('created_at', { ascending: false })
      .limit(limit);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml +=
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';

    videos?.forEach((video) => {
      xml += '  <url>\n';
      xml += `    <loc>${this.baseURL}/watch/${video.id}</loc>\n`;
      xml += `    <lastmod>${video.updated_at || video.created_at}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '    <video:video>\n';
      xml += `      <video:title>${this.escapeXML(video.title)}</video:title>\n`;
      xml += `      <video:thumbnail_loc>${video.thumbnail_url}</video:thumbnail_loc>\n`;
      xml += `      <video:content_loc>${this.baseURL}/watch/${video.id}</video:content_loc>\n`;
      if (video.duration) {
        xml += `      <video:duration>${Math.floor(video.duration)}</video:duration>\n`;
      }
      xml += '    </video:video>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }

  async generateLocationsSitemap(): Promise<string> {
    const { data: cities } = await supabase.from('cities').select('slug, name, updated_at');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    cities?.forEach((city) => {
      xml += '  <url>\n';
      xml += `    <loc>${this.baseURL}/de/${city.slug}</loc>\n`;
      xml += `    <lastmod>${city.updated_at || new Date().toISOString()}</lastmod>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.9</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
