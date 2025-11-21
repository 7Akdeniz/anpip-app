/**
 * Dynamic Sitemap Generator
 * Generiert XML-Sitemaps für besseres SEO-Ranking
 */

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{
    loc: string;
    title?: string;
    caption?: string;
    geoLocation?: string;
  }>;
  videos?: Array<{
    thumbnail_loc: string;
    title: string;
    description: string;
    content_loc: string;
    duration?: number;
    publication_date?: string;
    view_count?: number;
    family_friendly?: boolean;
    requires_subscription?: boolean;
  }>;
  alternates?: Array<{
    hreflang: string;
    href: string;
  }>;
}

/**
 * Generiert XML Sitemap
 */
export function generateSitemap(urls: SitemapURL[]): string {
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>'];
  xml.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  xml.push('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  xml.push('        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"');
  xml.push('        xmlns:xhtml="http://www.w3.org/1999/xhtml">');

  urls.forEach(url => {
    xml.push('  <url>');
    xml.push(`    <loc>${escapeXml(url.loc)}</loc>`);

    if (url.lastmod) {
      xml.push(`    <lastmod>${url.lastmod}</lastmod>`);
    }

    if (url.changefreq) {
      xml.push(`    <changefreq>${url.changefreq}</changefreq>`);
    }

    if (url.priority !== undefined) {
      xml.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
    }

    // Alternate Language Links
    if (url.alternates && url.alternates.length > 0) {
      url.alternates.forEach(alt => {
        xml.push(`    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}" />`);
      });
    }

    // Images
    if (url.images && url.images.length > 0) {
      url.images.forEach(img => {
        xml.push('    <image:image>');
        xml.push(`      <image:loc>${escapeXml(img.loc)}</image:loc>`);
        if (img.title) {
          xml.push(`      <image:title>${escapeXml(img.title)}</image:title>`);
        }
        if (img.caption) {
          xml.push(`      <image:caption>${escapeXml(img.caption)}</image:caption>`);
        }
        if (img.geoLocation) {
          xml.push(`      <image:geo_location>${escapeXml(img.geoLocation)}</image:geo_location>`);
        }
        xml.push('    </image:image>');
      });
    }

    // Videos
    if (url.videos && url.videos.length > 0) {
      url.videos.forEach(vid => {
        xml.push('    <video:video>');
        xml.push(`      <video:thumbnail_loc>${escapeXml(vid.thumbnail_loc)}</video:thumbnail_loc>`);
        xml.push(`      <video:title>${escapeXml(vid.title)}</video:title>`);
        xml.push(`      <video:description>${escapeXml(vid.description)}</video:description>`);
        xml.push(`      <video:content_loc>${escapeXml(vid.content_loc)}</video:content_loc>`);

        if (vid.duration) {
          xml.push(`      <video:duration>${vid.duration}</video:duration>`);
        }

        if (vid.publication_date) {
          xml.push(`      <video:publication_date>${vid.publication_date}</video:publication_date>`);
        }

        if (vid.view_count !== undefined) {
          xml.push(`      <video:view_count>${vid.view_count}</video:view_count>`);
        }

        xml.push(`      <video:family_friendly>${vid.family_friendly !== false ? 'yes' : 'no'}</video:family_friendly>`);
        xml.push(`      <video:requires_subscription>${vid.requires_subscription === true ? 'yes' : 'no'}</video:requires_subscription>`);
        xml.push('    </video:video>');
      });
    }

    xml.push('  </url>');
  });

  xml.push('</urlset>');
  return xml.join('\n');
}

/**
 * Generiert Sitemap Index
 */
export function generateSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>): string {
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>'];
  xml.push('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  sitemaps.forEach(sitemap => {
    xml.push('  <sitemap>');
    xml.push(`    <loc>${escapeXml(sitemap.loc)}</loc>`);
    if (sitemap.lastmod) {
      xml.push(`    <lastmod>${sitemap.lastmod}</lastmod>`);
    }
    xml.push('  </sitemap>');
  });

  xml.push('</sitemapindex>');
  return xml.join('\n');
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Formatiert Datum für Sitemap (ISO 8601)
 */
export function formatSitemapDate(date: Date): string {
  return date.toISOString();
}
