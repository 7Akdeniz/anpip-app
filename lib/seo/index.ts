/**
 * CENTRAL SEO ENGINE
 * Haupteinstiegspunkt für alle SEO-Funktionen
 * Vereint Video-Schema, Meta-Tags, Sitemap, Geo-SEO, Performance
 */

import {
  generateVideoSchema,
  generateVideoGallerySchema,
  generateCreatorProfileSchema,
  generateMarketCategorySchema,
  generateBreadcrumbSchema,
  generateWebsiteSchema,
  generateOrganizationSchema,
  type VideoMetadata
} from './video-schema';

import {
  generateVideoMetaTags,
  generateProfileMetaTags,
  generateFeedMetaTags,
  generateHashtagMetaTags,
  generateExploreMetaTags,
  metaTagsToHtml,
  type MetaTags
} from './meta-tags';

import {
  generateSitemapIndex,
  generateMainSitemap,
  generateVideoSitemap,
  generateProfileSitemap,
  generateMarketSitemap,
  generateHashtagSitemap,
  generateRobotsTxt
} from './sitemap-generator';

import {
  detectLocationFromIP,
  detectLocationFromBrowser,
  generateGeoMetaTags,
  generateLocalBusinessSchema,
  generatePlaceSchema,
  filterVideosByLocation,
  prioritizeByGeoRelevance,
  type GeoLocation
} from './geo-seo';

import {
  generateHreflangTags,
  generateLocalizedMetaTags,
  generateMultilingualSitemap,
  localizedKeywords,
  detectBrowserLanguage,
  type SupportedLanguage
} from './multilingual';

import {
  videoPreloadStrategies,
  detectNetworkSpeed,
  preloadNextVideo,
  prefetchRoute,
  measureWebVitals,
  getCdnUrl,
  type WebVitals
} from './performance';

import {
  MARKET_CATEGORIES,
  generateMarketCategorySlug,
  generateMarketBreadcrumbs,
  generateMarketProductSchema,
  generateMarketCategoryMetaTags,
  generateAllMarketSchemas,
  type MarketCategory,
  type MarketVideo
} from './market-seo';

/**
 * SEO Manager - Zentrale Klasse für alle SEO-Operationen
 */
export class SEOManager {
  private baseUrl = 'https://anpip.com';
  private defaultLanguage: SupportedLanguage = 'de';

  /**
   * Generiert vollständiges SEO-Paket für Video-Seite
   */
  async generateVideoPageSEO(video: VideoMetadata, lang: SupportedLanguage = 'de') {
    const metaTags = generateVideoMetaTags(video);
    const schemas = [
      generateVideoSchema(video),
      generateWebsiteSchema(),
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: this.baseUrl },
        { name: 'Videos', url: `${this.baseUrl}/feed` },
        { name: video.title, url: `${this.baseUrl}/video/${video.id}` }
      ])
    ];

    // Geo-Schema falls vorhanden
    if (video.location) {
      schemas.push(generatePlaceSchema(video.location, video.id));
    }

    // Market-Schema falls Market-Video
    if (video.is_market) {
      schemas.push(
        generateLocalBusinessSchema(
          {
            name: video.title,
            description: video.description,
            category: video.category || 'General',
            video_id: video.id,
            price: video.price,
            currency: video.currency
          },
          video.location || {}
        )
      );
    }

    // Hreflang Tags
    const hreflangTags = generateHreflangTags(`/video/${video.id}`);

    // Performance: Preload
    const preloadConfig = await this.getPreloadConfig();

    return {
      metaTags,
      schemas,
      hreflangTags,
      preloadConfig,
      html: this.generateHTML(metaTags, schemas, hreflangTags)
    };
  }

  /**
   * Generiert SEO für Feed-Seite
   */
  async generateFeedPageSEO(
    videos: VideoMetadata[],
    location?: GeoLocation,
    lang: SupportedLanguage = 'de'
  ) {
    const metaTags = generateFeedMetaTags(location);
    const schemas = [
      generateVideoGallerySchema(videos.slice(0, 10)),
      generateWebsiteSchema(),
      generateOrganizationSchema()
    ];

    // Geo-Meta-Tags
    const geoTags = location ? generateGeoMetaTags(location) : {};

    return {
      metaTags: { ...metaTags, ...geoTags },
      schemas,
      hreflangTags: generateHreflangTags('/feed'),
      html: this.generateHTML(metaTags, schemas)
    };
  }

  /**
   * Generiert SEO für Creator-Profile
   */
  generateProfilePageSEO(profile: any, lang: SupportedLanguage = 'de') {
    const metaTags = generateProfileMetaTags(profile);
    const schemas = [
      generateCreatorProfileSchema(profile),
      generateWebsiteSchema(),
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: this.baseUrl },
        { name: 'Creators', url: `${this.baseUrl}/creators` },
        { name: `@${profile.username}`, url: `${this.baseUrl}/profile/${profile.user_id}` }
      ])
    ];

    return {
      metaTags,
      schemas,
      hreflangTags: generateHreflangTags(`/profile/${profile.user_id}`),
      html: this.generateHTML(metaTags, schemas)
    };
  }

  /**
   * Generiert SEO für Market-Kategorien
   */
  generateMarketPageSEO(
    category: MarketCategory,
    videos: MarketVideo[],
    location?: GeoLocation,
    lang: SupportedLanguage = 'de'
  ) {
    const locationData = location && location.city && location.country 
      ? { city: location.city, country: location.country } 
      : undefined;

    const metaTags = generateMarketCategoryMetaTags(category, locationData);

    const schemas = generateAllMarketSchemas(category, videos, locationData);

    return {
      metaTags,
      schemas,
      hreflangTags: generateHreflangTags(`/market/${category.id}`),
      html: this.generateHTML(metaTags, schemas)
    };
  }

  /**
   * Generiert alle Sitemaps
   */
  async generateAllSitemaps(data: {
    videos: any[];
    profiles: any[];
    categories: MarketCategory[];
    hashtags: string[];
  }) {
    return {
      index: generateSitemapIndex(),
      main: generateMainSitemap(),
      videos: await generateVideoSitemap(data.videos),
      profiles: await generateProfileSitemap(data.profiles),
      market: await generateMarketSitemap(data.categories),
      hashtags: await generateHashtagSitemap(data.hashtags),
      robotsTxt: generateRobotsTxt()
    };
  }

  /**
   * Optimiert Videos für Performance
   */
  async optimizeVideoPerformance(videos: VideoMetadata[], userLocation?: GeoLocation) {
    // Geo-Priorisierung
    const prioritized = userLocation
      ? prioritizeByGeoRelevance(videos, userLocation)
      : videos;

    // Netzwerk-Geschwindigkeit erkennen
    const networkSpeed = await detectNetworkSpeed();

    // Preload-Strategie wählen
    const strategy =
      networkSpeed === 'fast'
        ? videoPreloadStrategies.aggressive
        : networkSpeed === 'medium'
        ? videoPreloadStrategies.balanced
        : videoPreloadStrategies.conservative;

    // Nächste Videos vorher laden
    const preloadCount = strategy.preloadCount;
    const videosToPreload = prioritized.slice(0, preloadCount);

    videosToPreload.forEach((video, index) => {
      if (index < preloadCount) {
        preloadNextVideo(video.video_url, video.thumbnail_url);
      }
    });

    return {
      prioritized,
      strategy,
      networkSpeed,
      preloadedCount: videosToPreload.length
    };
  }

  /**
   * Erkennt User-Standort für Geo-SEO
   */
  async detectUserLocation(): Promise<GeoLocation | null> {
    // Versuche Browser Geolocation
    const browserLocation = await detectLocationFromBrowser();
    if (browserLocation) return browserLocation;

    // Fallback: IP-basiert
    return await detectLocationFromIP();
  }

  /**
   * Misst Core Web Vitals
   */
  async measurePerformance(): Promise<Partial<WebVitals>> {
    return await measureWebVitals();
  }

  /**
   * Generiert optimierte CDN-URLs
   */
  generateCdnUrls(imageUrl: string) {
    return {
      thumbnail: getCdnUrl(imageUrl, { width: 480, height: 854, quality: 80 }),
      small: getCdnUrl(imageUrl, { width: 720, height: 1280, quality: 85 }),
      medium: getCdnUrl(imageUrl, { width: 1080, height: 1920, quality: 90 }),
      large: getCdnUrl(imageUrl, { width: 1440, height: 2560, quality: 95 })
    };
  }

  /**
   * Generiert HTML für Head-Section
   */
  private generateHTML(
    metaTags: MetaTags | Record<string, string>,
    schemas: any[],
    hreflangTags: string[] = []
  ): string {
    const metaHtml = 'title' in metaTags ? metaTagsToHtml(metaTags as MetaTags) : '';
    
    const schemaHtml = schemas
      .map(schema => `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`)
      .join('\n');

    const hreflangHtml = hreflangTags.join('\n');

    return `
${metaHtml}

<!-- Structured Data -->
${schemaHtml}

<!-- Hreflang -->
${hreflangHtml}
    `.trim();
  }

  /**
   * Preload Config basierend auf Netzwerk
   */
  private async getPreloadConfig() {
    const networkSpeed = await detectNetworkSpeed();
    return networkSpeed === 'fast'
      ? videoPreloadStrategies.aggressive
      : networkSpeed === 'medium'
      ? videoPreloadStrategies.balanced
      : videoPreloadStrategies.conservative;
  }
}

/**
 * Singleton-Instanz
 */
export const seoManager = new SEOManager();

/**
 * Quick-Access-Funktionen
 */
export {
  // Video Schema
  generateVideoSchema,
  generateVideoGallerySchema,
  generateCreatorProfileSchema,
  
  // Meta Tags
  generateVideoMetaTags,
  generateProfileMetaTags,
  generateFeedMetaTags,
  
  // Sitemap
  generateSitemapIndex,
  generateVideoSitemap,
  
  // Geo
  detectLocationFromIP,
  detectLocationFromBrowser,
  
  // Performance
  preloadNextVideo,
  measureWebVitals,
  
  // Market
  MARKET_CATEGORIES,
  generateMarketProductSchema,
  
  // Types
  type VideoMetadata,
  type MetaTags,
  type GeoLocation,
  type SupportedLanguage,
  type MarketCategory,
  type MarketVideo
};
