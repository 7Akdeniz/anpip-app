/**
 * SEO & Metadata Helper Functions
 * Optimiert für Google, Bing, AI-Search (ChatGPT, Perplexity, Claude)
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogType?: 'website' | 'video.other' | 'article' | 'product';
  ogImage?: string;
  ogVideo?: string;
  locale?: string;
  alternateLocales?: string[];
  geoPosition?: string;
  geoPlacename?: string;
  geoRegion?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface VideoSEO {
  title: string;
  description: string;
  uploadDate: string;
  thumbnailUrl: string;
  contentUrl: string;
  duration?: string;
  embedUrl?: string;
  interactionCount?: number;
  genre?: string;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

export interface MarketItemSEO {
  name: string;
  description: string;
  price?: string;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
  category?: string;
  brand?: string;
  image?: string;
  location?: {
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
}

/**
 * Generiert vollständige Meta-Tags für SEO
 */
export function generateMetaTags(metadata: SEOMetadata): string {
  const {
    title,
    description,
    keywords,
    canonical,
    ogType = 'website',
    ogImage,
    ogVideo,
    locale = 'de_DE',
    alternateLocales = ['en_US', 'de_DE'],
    geoPosition,
    geoPlacename,
    geoRegion,
    author,
    publishedTime,
    modifiedTime,
  } = metadata;

  const tags = [];

  // Basic Meta Tags
  tags.push(`<title>${escapeHtml(title)}</title>`);
  tags.push(`<meta name="description" content="${escapeHtml(description)}" />`);
  
  if (keywords && keywords.length > 0) {
    tags.push(`<meta name="keywords" content="${keywords.join(', ')}" />`);
  }

  // Canonical URL
  if (canonical) {
    tags.push(`<link rel="canonical" href="${canonical}" />`);
  }

  // Open Graph
  tags.push(`<meta property="og:type" content="${ogType}" />`);
  tags.push(`<meta property="og:title" content="${escapeHtml(title)}" />`);
  tags.push(`<meta property="og:description" content="${escapeHtml(description)}" />`);
  tags.push(`<meta property="og:locale" content="${locale}" />`);
  
  if (canonical) {
    tags.push(`<meta property="og:url" content="${canonical}" />`);
  }

  if (ogImage) {
    tags.push(`<meta property="og:image" content="${ogImage}" />`);
    tags.push(`<meta property="og:image:width" content="1200" />`);
    tags.push(`<meta property="og:image:height" content="630" />`);
  }

  if (ogVideo) {
    tags.push(`<meta property="og:video" content="${ogVideo}" />`);
    tags.push(`<meta property="og:video:type" content="video/mp4" />`);
    tags.push(`<meta property="og:video:width" content="720" />`);
    tags.push(`<meta property="og:video:height" content="1280" />`);
  }

  // Alternate Locales
  alternateLocales.forEach(altLocale => {
    if (altLocale !== locale) {
      tags.push(`<meta property="og:locale:alternate" content="${altLocale}" />`);
    }
  });

  // Twitter Card
  tags.push(`<meta name="twitter:card" content="${ogVideo ? 'player' : 'summary_large_image'}" />`);
  tags.push(`<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  
  if (ogImage) {
    tags.push(`<meta name="twitter:image" content="${ogImage}" />`);
  }

  if (ogVideo) {
    tags.push(`<meta name="twitter:player" content="${ogVideo}" />`);
    tags.push(`<meta name="twitter:player:width" content="720" />`);
    tags.push(`<meta name="twitter:player:height" content="1280" />`);
  }

  // GEO Tags
  if (geoPosition) {
    tags.push(`<meta name="geo.position" content="${geoPosition}" />`);
    tags.push(`<meta name="ICBM" content="${geoPosition}" />`);
  }

  if (geoPlacename) {
    tags.push(`<meta name="geo.placename" content="${escapeHtml(geoPlacename)}" />`);
  }

  if (geoRegion) {
    tags.push(`<meta name="geo.region" content="${geoRegion}" />`);
  }

  // Author & Time
  if (author) {
    tags.push(`<meta name="author" content="${escapeHtml(author)}" />`);
  }

  if (publishedTime) {
    tags.push(`<meta property="article:published_time" content="${publishedTime}" />`);
  }

  if (modifiedTime) {
    tags.push(`<meta property="article:modified_time" content="${modifiedTime}" />`);
  }

  // AI-Search Optimization
  tags.push(`<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`);
  tags.push(`<meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />`);
  tags.push(`<meta name="bingbot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />`);

  return tags.join('\n    ');
}

/**
 * Generiert VideoObject Schema.org JSON-LD
 */
export function generateVideoSchema(video: VideoSEO): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    contentUrl: video.contentUrl,
  };

  if (video.embedUrl) {
    schema.embedUrl = video.embedUrl;
  }

  if (video.duration) {
    schema.duration = video.duration; // ISO 8601 format: PT1M30S
  }

  if (video.interactionCount) {
    schema.interactionStatistic = {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: video.interactionCount,
    };
  }

  if (video.genre) {
    schema.genre = video.genre;
  }

  if (video.location) {
    schema.contentLocation = {
      '@type': 'Place',
      name: video.location.name,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: video.location.latitude,
        longitude: video.location.longitude,
      },
    };
  }

  return schema;
}

/**
 * Generiert Product Schema.org JSON-LD für Market Items
 */
export function generateProductSchema(item: MarketItemSEO): object {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description: item.description,
  };

  if (item.image) {
    schema.image = item.image;
  }

  if (item.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: item.brand,
    };
  }

  if (item.price) {
    schema.offers = {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: item.currency || 'EUR',
      availability: `https://schema.org/${item.availability || 'InStock'}`,
      itemCondition: `https://schema.org/${item.condition || 'NewCondition'}`,
    };
  }

  if (item.category) {
    schema.category = item.category;
  }

  if (item.location) {
    schema.areaServed = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: item.location.city,
        addressCountry: item.location.country,
      },
    };

    if (item.location.latitude && item.location.longitude) {
      schema.areaServed.geo = {
        '@type': 'GeoCoordinates',
        latitude: item.location.latitude,
        longitude: item.location.longitude,
      };
    }
  }

  return schema;
}

/**
 * Generiert LocalBusiness Schema.org JSON-LD
 */
export function generateLocalBusinessSchema(
  name: string,
  city: string,
  country: string,
  latitude: number,
  longitude: number
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${name} - ${city}`,
    description: `Lokaler ${name} Marketplace in ${city}, ${country}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressCountry: country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude,
      longitude,
    },
    url: `https://anpip.com/market/${city.toLowerCase()}`,
  };
}

/**
 * Generiert WebSite Schema.org JSON-LD mit SearchAction
 */
export function generateWebsiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Anpip',
    description: 'Social Video Platform - Teile Momente, Videos und lokale Angebote weltweit',
    url: 'https://anpip.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://anpip.com/explore?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['de', 'en'],
  };
}

/**
 * Generiert Organization Schema.org JSON-LD
 */
export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Anpip',
    description: 'Global Social Video Platform',
    url: 'https://anpip.com',
    logo: 'https://anpip.com/assets/icons/icon-512x512.png',
    sameAs: [
      // Social Media Links hier einfügen wenn vorhanden
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['German', 'English'],
    },
  };
}

/**
 * Generiert BreadcrumbList Schema.org JSON-LD
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Escape HTML für sichere Meta-Tag Ausgabe
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Generiert ISO 8601 Duration String für Videos
 */
export function generateDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0) duration += `${secs}S`;

  return duration;
}
