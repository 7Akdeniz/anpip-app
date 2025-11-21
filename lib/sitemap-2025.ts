/**
 * MULTI-SITEMAP SYSTEM 2025
 * 7 verschiedene Sitemaps für maximale SEO-Performance
 * - sitemap-index.xml (Haupt-Index)
 * - sitemap-pages.xml (Statische Seiten)
 * - sitemap-categories.xml (Alle Kategorien)
 * - sitemap-locations.xml (Länder & Städte)
 * - sitemap-videos.xml (Video-Content)
 * - sitemap-users.xml (Öffentliche Profile)
 * - sitemap-geo.xml (Lokale SEO Kombinationen)
 */

import { SitemapURL } from './sitemap';

export interface SitemapIndexEntry {
  loc: string;
  lastmod: string;
}

// ==================== SITEMAP INDEX ====================

/**
 * Haupt-Sitemap-Index
 */
export function generateSitemapIndex(baseUrl: string): string {
  const now = new Date().toISOString();
  
  const sitemaps: SitemapIndexEntry[] = [
    { loc: `${baseUrl}/sitemap-pages.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-categories.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-locations.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-videos.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-users.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-geo.xml`, lastmod: now },
  ];

  const xml = ['<?xml version="1.0" encoding="UTF-8"?>'];
  xml.push('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  
  sitemaps.forEach(sitemap => {
    xml.push('  <sitemap>');
    xml.push(`    <loc>${escapeXml(sitemap.loc)}</loc>`);
    xml.push(`    <lastmod>${sitemap.lastmod}</lastmod>`);
    xml.push('  </sitemap>');
  });
  
  xml.push('</sitemapindex>');
  
  return xml.join('\n');
}

// ==================== PAGES SITEMAP ====================

/**
 * Statische Seiten & wichtige Landing Pages
 */
export function generatePagesSitemap(baseUrl: string): SitemapURL[] {
  const now = new Date().toISOString();
  
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' as const },
    { path: '/explore', priority: 0.9, changefreq: 'hourly' as const },
    { path: '/feed', priority: 0.9, changefreq: 'hourly' as const },
    { path: '/upload', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/profile', priority: 0.7, changefreq: 'weekly' as const },
    { path: '/messages', priority: 0.6, changefreq: 'daily' as const },
    { path: '/notifications', priority: 0.6, changefreq: 'daily' as const },
    
    // Legal & Info Pages
    { path: '/impressum', priority: 0.3, changefreq: 'monthly' as const },
    { path: '/datenschutz', priority: 0.3, changefreq: 'monthly' as const },
    { path: '/agb', priority: 0.3, changefreq: 'monthly' as const },
    { path: '/kontakt', priority: 0.5, changefreq: 'monthly' as const },
    { path: '/hilfe', priority: 0.6, changefreq: 'weekly' as const },
    { path: '/faq', priority: 0.7, changefreq: 'weekly' as const },
  ];

  return staticPages.map(page => ({
    loc: `${baseUrl}${page.path}`,
    lastmod: now,
    changefreq: page.changefreq,
    priority: page.priority,
    alternates: generateHreflangAlternates(baseUrl, page.path),
  }));
}

// ==================== CATEGORIES SITEMAP ====================

/**
 * Alle Kategorien & Unterkategorien
 */
export interface Category {
  id: string;
  slug: string;
  name: string;
  parent?: string;
  subcategories?: Category[];
}

export function generateCategoriesSitemap(
  baseUrl: string,
  categories: Category[]
): SitemapURL[] {
  const urls: SitemapURL[] = [];
  const now = new Date().toISOString();

  function processCategory(category: Category, parentPath = '') {
    const path = `${parentPath}/kategorie/${category.slug}`;
    
    urls.push({
      loc: `${baseUrl}${path}`,
      lastmod: now,
      changefreq: 'daily',
      priority: parentPath ? 0.7 : 0.8, // Hauptkategorien höher
      alternates: generateHreflangAlternates(baseUrl, path),
    });

    // Unterkategorien rekursiv
    if (category.subcategories) {
      category.subcategories.forEach(sub => processCategory(sub, path));
    }
  }

  categories.forEach(cat => processCategory(cat));
  return urls;
}

// ==================== LOCATIONS SITEMAP ====================

/**
 * Länder & Städte für GEO-SEO
 */
export interface Location {
  country: string;
  countryCode: string;
  cities: Array<{
    name: string;
    slug: string;
    lat: number;
    lng: number;
    population?: number;
  }>;
}

export function generateLocationsSitemap(
  baseUrl: string,
  locations: Location[]
): SitemapURL[] {
  const urls: SitemapURL[] = [];
  const now = new Date().toISOString();

  locations.forEach(location => {
    // Länder-Seite
    urls.push({
      loc: `${baseUrl}/${location.countryCode.toLowerCase()}`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.9,
      alternates: generateHreflangAlternates(baseUrl, `/${location.countryCode.toLowerCase()}`),
    });

    // Stadt-Seiten
    location.cities.forEach(city => {
      const cityPath = `/${location.countryCode.toLowerCase()}/${city.slug}`;
      
      urls.push({
        loc: `${baseUrl}${cityPath}`,
        lastmod: now,
        changefreq: 'hourly',
        priority: city.population && city.population > 500000 ? 0.9 : 0.8,
        alternates: generateHreflangAlternates(baseUrl, cityPath),
      });
    });
  });

  return urls;
}

// ==================== VIDEOS SITEMAP ====================

/**
 * Video-Content mit erweiterten Video-Meta-Daten
 */
export interface VideoEntry {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  uploadDate: string;
  duration?: number;
  viewCount?: number;
  category?: string;
  location?: {
    country: string;
    city: string;
  };
  tags?: string[];
}

export function generateVideosSitemap(
  baseUrl: string,
  videos: VideoEntry[],
  page = 1,
  pageSize = 1000 // Max 50,000 URLs pro Sitemap
): SitemapURL[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageVideos = videos.slice(start, end);

  return pageVideos.map(video => {
    // URL-Struktur: /land/stadt/kategorie/video-titel-id
    const locationPath = video.location 
      ? `/${video.location.country.toLowerCase()}/${video.location.city.toLowerCase()}`
      : '';
    const categoryPath = video.category ? `/kategorie/${video.category}` : '';
    const videoSlug = slugify(video.title);
    const videoPath = `${locationPath}${categoryPath}/v/${videoSlug}-${video.id}`;

    return {
      loc: `${baseUrl}${videoPath}`,
      lastmod: video.uploadDate,
      changefreq: 'weekly',
      priority: video.viewCount && video.viewCount > 1000 ? 0.9 : 0.7,
      videos: [{
        thumbnail_loc: video.thumbnailUrl,
        title: video.title,
        description: video.description,
        content_loc: video.contentUrl,
        duration: video.duration,
        publication_date: video.uploadDate,
        view_count: video.viewCount,
        family_friendly: true,
        requires_subscription: false,
      }],
      alternates: generateHreflangAlternates(baseUrl, videoPath),
    };
  });
}

// ==================== USERS SITEMAP ====================

/**
 * Öffentliche User-Profile
 */
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  videoCount: number;
  followerCount: number;
  updatedAt: string;
}

export function generateUsersSitemap(
  baseUrl: string,
  users: UserProfile[]
): SitemapURL[] {
  return users.map(user => ({
    loc: `${baseUrl}/u/${user.username}`,
    lastmod: user.updatedAt,
    changefreq: 'weekly',
    priority: user.followerCount > 1000 ? 0.8 : 0.6,
    images: user.avatarUrl ? [{
      loc: user.avatarUrl,
      title: user.displayName,
      caption: user.bio || user.displayName,
    }] : undefined,
  }));
}

// ==================== GEO-SEO SITEMAP ====================

/**
 * Lokale SEO: Kombinationen aus Stadt + Kategorie
 * Beispiel: "/de/berlin/fahrzeuge/auto"
 */
export function generateGeoSitemap(
  baseUrl: string,
  locations: Location[],
  categories: Category[]
): SitemapURL[] {
  const urls: SitemapURL[] = [];
  const now = new Date().toISOString();

  locations.forEach(location => {
    // Top-Städte (z.B. > 100k Einwohner)
    const topCities = location.cities
      .filter(city => !city.population || city.population > 100000)
      .slice(0, 50); // Max 50 Städte pro Land

    topCities.forEach(city => {
      // Haupt-Kategorien für jede Stadt
      categories.forEach(category => {
        const path = `/${location.countryCode.toLowerCase()}/${city.slug}/kategorie/${category.slug}`;
        
        urls.push({
          loc: `${baseUrl}${path}`,
          lastmod: now,
          changefreq: 'daily',
          priority: 0.7,
          alternates: generateHreflangAlternates(baseUrl, path),
        });

        // Unterkategorien (nur für große Städte)
        if (city.population && city.population > 500000 && category.subcategories) {
          category.subcategories.forEach(subcat => {
            const subPath = `${path}/${subcat.slug}`;
            
            urls.push({
              loc: `${baseUrl}${subPath}`,
              lastmod: now,
              changefreq: 'daily',
              priority: 0.6,
              alternates: generateHreflangAlternates(baseUrl, subPath),
            });
          });
        }
      });
    });
  });

  return urls;
}

// ==================== HREFLANG SUPPORT ====================

/**
 * Hreflang Alternates für Multi-Language Support
 */
function generateHreflangAlternates(baseUrl: string, path: string) {
  const supportedLocales = ['de', 'en', 'tr', 'fr', 'es'];
  
  return supportedLocales.map(locale => ({
    hreflang: locale,
    href: `${baseUrl}/${locale}${path}`,
  }));
}

// ==================== HELPER FUNCTIONS ====================

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Diakritische Zeichen entfernen
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ==================== SITEMAP GENERATOR ====================

/**
 * Generiert XML aus SitemapURL[]
 */
export function generateXMLFromURLs(urls: SitemapURL[]): string {
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

    // Hreflang Alternates
    if (url.alternates) {
      url.alternates.forEach(alt => {
        xml.push(`    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}" />`);
      });
    }

    // Images
    if (url.images) {
      url.images.forEach(img => {
        xml.push('    <image:image>');
        xml.push(`      <image:loc>${escapeXml(img.loc)}</image:loc>`);
        if (img.title) xml.push(`      <image:title>${escapeXml(img.title)}</image:title>`);
        if (img.caption) xml.push(`      <image:caption>${escapeXml(img.caption)}</image:caption>`);
        xml.push('    </image:image>');
      });
    }

    // Videos
    if (url.videos) {
      url.videos.forEach(vid => {
        xml.push('    <video:video>');
        xml.push(`      <video:thumbnail_loc>${escapeXml(vid.thumbnail_loc)}</video:thumbnail_loc>`);
        xml.push(`      <video:title>${escapeXml(vid.title)}</video:title>`);
        xml.push(`      <video:description>${escapeXml(vid.description)}</video:description>`);
        xml.push(`      <video:content_loc>${escapeXml(vid.content_loc)}</video:content_loc>`);
        if (vid.duration) xml.push(`      <video:duration>${vid.duration}</video:duration>`);
        if (vid.publication_date) xml.push(`      <video:publication_date>${vid.publication_date}</video:publication_date>`);
        if (vid.view_count) xml.push(`      <video:view_count>${vid.view_count}</video:view_count>`);
        xml.push(`      <video:family_friendly>${vid.family_friendly ? 'yes' : 'no'}</video:family_friendly>`);
        xml.push('    </video:video>');
      });
    }

    xml.push('  </url>');
  });

  xml.push('</urlset>');
  return xml.join('\n');
}

// ==================== EXPORT ====================

export default {
  generateSitemapIndex,
  generatePagesSitemap,
  generateCategoriesSitemap,
  generateLocationsSitemap,
  generateVideosSitemap,
  generateUsersSitemap,
  generateGeoSitemap,
  generateXMLFromURLs,
};
