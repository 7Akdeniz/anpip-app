/**
 * COMPLETE SEO OPTIMIZATION 2025
 * Höchste Standards für Google, Bing, AI-Search (ChatGPT, Perplexity, Claude, Gemini)
 * Inkl. Core Web Vitals, Schema.org, Answer Engine Optimization (AEO)
 */

import { Platform } from 'react-native';

// ==================== INTERFACES ====================

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogImage?: string;
  ogVideo?: string;
  locale?: string;
  alternateLocales?: string[];
  
  // Geo-SEO
  geoPosition?: string;
  geoPlacename?: string;
  geoRegion?: string;
  geoCountry?: string;
  
  // Schema.org
  schema?: SchemaType[];
  
  // Answer Engine Optimization
  aeoContext?: string[];
  faq?: Array<{ question: string; answer: string }>;
  
  // Performance
  preloadImages?: string[];
  preconnectDomains?: string[];
}

export type SchemaType = 
  | OrganizationSchema 
  | WebSiteSchema 
  | VideoObjectSchema 
  | ProductSchema 
  | LocalBusinessSchema
  | FAQPageSchema
  | BreadcrumbSchema;

// ==================== SCHEMA DEFINITIONS ====================

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[]; // Social Media Links
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    contactType: string;
    email?: string;
    areaServed?: string | string[];
    availableLanguage?: string[];
  }[];
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  founder?: {
    '@type': 'Person';
    name: string;
  };
  foundingDate?: string;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  inLanguage?: string | string[];
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
}

export interface VideoObjectSchema {
  '@context': 'https://schema.org';
  '@type': 'VideoObject';
  name: string;
  description: string;
  thumbnailUrl: string | string[];
  uploadDate: string; // ISO 8601
  contentUrl: string;
  embedUrl?: string;
  duration?: string; // ISO 8601 (PT1M30S)
  width?: number;
  height?: number;
  
  // Engagement Metrics
  interactionStatistic?: Array<{
    '@type': 'InteractionCounter';
    interactionType: string; // http://schema.org/WatchAction, LikeAction, CommentAction
    userInteractionCount: number;
  }>;
  
  // Location
  contentLocation?: {
    '@type': 'Place';
    name: string;
    address?: {
      '@type': 'PostalAddress';
      addressLocality?: string;
      addressRegion?: string;
      addressCountry?: string;
    };
    geo?: {
      '@type': 'GeoCoordinates';
      latitude: number;
      longitude: number;
    };
  };
  
  // Creator
  creator?: {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  
  // Video Quality
  videoQuality?: 'HD' | 'SD' | '4K';
  encodingFormat?: string; // video/mp4
}

export interface ProductSchema {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image?: string | string[];
  sku?: string;
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  category?: string;
  
  // Pricing
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock' | 'https://schema.org/PreOrder';
    url: string;
    priceValidUntil?: string;
    seller?: {
      '@type': 'Organization' | 'Person';
      name: string;
    };
    shippingDetails?: {
      '@type': 'OfferShippingDetails';
      shippingRate?: {
        '@type': 'MonetaryAmount';
        value: string;
        currency: string;
      };
      deliveryTime?: {
        '@type': 'ShippingDeliveryTime';
        businessDays?: {
          '@type': 'OpeningHoursSpecification';
          dayOfWeek: string[];
        };
      };
    };
  };
  
  // Ratings
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  
  // Reviews
  review?: Array<{
    '@type': 'Review';
    author: {
      '@type': 'Person';
      name: string;
    };
    datePublished: string;
    reviewBody: string;
    reviewRating: {
      '@type': 'Rating';
      ratingValue: number;
    };
  }>;
}

export interface LocalBusinessSchema {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  image?: string | string[];
  '@id'?: string;
  url?: string;
  telephone?: string;
  priceRange?: string;
  
  address: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality: string; // Stadt
    addressRegion?: string; // Bundesland/Region
    postalCode?: string;
    addressCountry: string; // Land
  };
  
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  
  openingHoursSpecification?: Array<{
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string | string[];
    opens?: string; // HH:MM
    closes?: string; // HH:MM
  }>;
  
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
  
  servesCuisine?: string[];
  paymentAccepted?: string[];
  currenciesAccepted?: string[];
}

export interface FAQPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

// ==================== AEO (ANSWER ENGINE OPTIMIZATION) ====================

/**
 * Generiert strukturierte Daten für AI-Suchmaschinen
 * Optimiert für ChatGPT, Perplexity, Claude, Google Gemini
 */
export function generateAEOMarkup(config: {
  topic: string;
  context: string[];
  keyPoints: string[];
  faq?: Array<{ q: string; a: string }>;
}): string {
  const aeo = {
    // Hauptthema klar definieren
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: config.topic,
    
    // Strukturierte Informationen für AI
    abstract: config.context.join(' '),
    articleBody: config.keyPoints.join('\n\n'),
    
    // FAQ für direkte Antworten
    ...(config.faq && {
      mainEntity: config.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    }),
    
    // Timestamps für Aktualität
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };
  
  return JSON.stringify(aeo);
}

/**
 * Optimiert Text für Answer Engines
 */
export function optimizeForAEO(text: string): string {
  // Füge strukturierte Marker hinzu
  return text
    // Füge Definitions-Marker hinzu
    .replace(/^(.+?) is (.+)$/gm, '**Definition:** $1 is $2')
    // Füge Schritt-Marker hinzu
    .replace(/^Step (\d+):/gm, '**Step $1:**')
    // Füge Wichtigkeits-Marker hinzu
    .replace(/Important:/gi, '**Important:**');
}

// ==================== SEO META GENERATOR ====================

/**
 * Generiert vollständige SEO Meta-Tags für HTML <head>
 */
export function generateSEOMetaTags(config: SEOConfig): string {
  const tags: string[] = [];
  
  // Primary Meta Tags
  tags.push(`<title>${config.title}</title>`);
  tags.push(`<meta name="title" content="${config.title}" />`);
  tags.push(`<meta name="description" content="${config.description}" />`);
  
  if (config.keywords.length > 0) {
    tags.push(`<meta name="keywords" content="${config.keywords.join(', ')}" />`);
  }
  
  // Canonical
  if (config.canonical) {
    tags.push(`<link rel="canonical" href="${config.canonical}" />`);
  }
  
  // Robots - AI-Optimized
  tags.push(`<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`);
  tags.push(`<meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />`);
  tags.push(`<meta name="bingbot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />`);
  
  // OpenGraph
  tags.push(`<meta property="og:type" content="website" />`);
  tags.push(`<meta property="og:title" content="${config.title}" />`);
  tags.push(`<meta property="og:description" content="${config.description}" />`);
  
  if (config.canonical) {
    tags.push(`<meta property="og:url" content="${config.canonical}" />`);
  }
  
  if (config.ogImage) {
    tags.push(`<meta property="og:image" content="${config.ogImage}" />`);
    tags.push(`<meta property="og:image:width" content="1200" />`);
    tags.push(`<meta property="og:image:height" content="630" />`);
  }
  
  if (config.ogVideo) {
    tags.push(`<meta property="og:video" content="${config.ogVideo}" />`);
    tags.push(`<meta property="og:video:type" content="video/mp4" />`);
  }
  
  // Locale
  const locale = config.locale || 'de_DE';
  tags.push(`<meta property="og:locale" content="${locale}" />`);
  
  if (config.alternateLocales) {
    config.alternateLocales.forEach((altLocale) => {
      tags.push(`<meta property="og:locale:alternate" content="${altLocale}" />`);
    });
  }
  
  // Twitter Card
  tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
  tags.push(`<meta name="twitter:title" content="${config.title}" />`);
  tags.push(`<meta name="twitter:description" content="${config.description}" />`);
  
  if (config.ogImage) {
    tags.push(`<meta name="twitter:image" content="${config.ogImage}" />`);
  }
  
  // Geo-SEO
  if (config.geoPosition) {
    tags.push(`<meta name="geo.position" content="${config.geoPosition}" />`);
  }
  
  if (config.geoPlacename) {
    tags.push(`<meta name="geo.placename" content="${config.geoPlacename}" />`);
  }
  
  if (config.geoRegion) {
    tags.push(`<meta name="geo.region" content="${config.geoRegion}" />`);
  }
  
  return tags.join('\n');
}

// ==================== SCHEMA.ORG GENERATOR ====================

/**
 * Generiert JSON-LD Script Tags
 */
export function generateSchemaScripts(schemas: SchemaType[]): string {
  return schemas
    .map((schema) => {
      return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
    })
    .join('\n');
}

// ==================== PERFORMANCE OPTIMIZATION ====================

/**
 * Generiert Performance-optimierte Meta-Tags
 */
export function generatePerformanceTags(config: {
  preconnectDomains?: string[];
  dnsPrefetch?: string[];
  preloadImages?: string[];
  preloadFonts?: string[];
}): string {
  const tags: string[] = [];
  
  // DNS Prefetch
  config.dnsPrefetch?.forEach((domain) => {
    tags.push(`<link rel="dns-prefetch" href="${domain}" />`);
  });
  
  // Preconnect (wichtiger als DNS Prefetch)
  config.preconnectDomains?.forEach((domain) => {
    tags.push(`<link rel="preconnect" href="${domain}" crossorigin />`);
  });
  
  // Preload kritische Images
  config.preloadImages?.forEach((image) => {
    tags.push(`<link rel="preload" href="${image}" as="image" />`);
  });
  
  // Preload Fonts
  config.preloadFonts?.forEach((font) => {
    tags.push(`<link rel="preload" href="${font}" as="font" type="font/woff2" crossorigin />`);
  });
  
  return tags.join('\n');
}

// ==================== KEYWORD OPTIMIZATION ====================

/**
 * Keyword-Analyse und Optimierung
 */
export function analyzeKeywords(text: string): {
  keywords: string[];
  density: { [key: string]: number };
  suggestions: string[];
} {
  // Bereinige Text
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Wörter extrahieren
  const words = cleanText.split(' ').filter((w) => w.length > 3);
  
  // Häufigkeit zählen
  const frequency: { [key: string]: number } = {};
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Sortiere nach Häufigkeit
  const sorted = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);
  
  const keywords = sorted.map(([word]) => word);
  
  // Keyword Density berechnen
  const totalWords = words.length;
  const density: { [key: string]: number } = {};
  sorted.forEach(([word, count]) => {
    density[word] = (count / totalWords) * 100;
  });
  
  // Suggestions für fehlende Keywords
  const suggestions = [
    'video',
    'social media',
    'platform',
    'teilen',
    'lokal',
    'marketplace',
    'angebote',
  ].filter((s) => !keywords.includes(s.toLowerCase()));
  
  return { keywords, density, suggestions };
}

// ==================== STRUCTURED DATA HELPERS ====================

/**
 * Generiert Video Schema
 */
export function generateVideoSchema(video: {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  uploadDate: string;
  duration?: number; // in Sekunden
  views?: number;
  likes?: number;
  comments?: number;
  location?: {
    name: string;
    city?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  creator?: {
    name: string;
    url?: string;
  };
}): VideoObjectSchema {
  const schema: VideoObjectSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    contentUrl: video.videoUrl,
    embedUrl: `https://anpip.com/video/${video.id}`,
    width: 1080,
    height: 1920, // 9:16 format
    encodingFormat: 'video/mp4',
  };
  
  // Duration
  if (video.duration) {
    const minutes = Math.floor(video.duration / 60);
    const seconds = video.duration % 60;
    schema.duration = `PT${minutes}M${seconds}S`;
  }
  
  // Engagement
  if (video.views || video.likes || video.comments) {
    schema.interactionStatistic = [];
    
    if (video.views) {
      schema.interactionStatistic.push({
        '@type': 'InteractionCounter',
        interactionType: 'http://schema.org/WatchAction',
        userInteractionCount: video.views,
      });
    }
    
    if (video.likes) {
      schema.interactionStatistic.push({
        '@type': 'InteractionCounter',
        interactionType: 'http://schema.org/LikeAction',
        userInteractionCount: video.likes,
      });
    }
    
    if (video.comments) {
      schema.interactionStatistic.push({
        '@type': 'InteractionCounter',
        interactionType: 'http://schema.org/CommentAction',
        userInteractionCount: video.comments,
      });
    }
  }
  
  // Location
  if (video.location) {
    schema.contentLocation = {
      '@type': 'Place',
      name: video.location.name,
    };
    
    if (video.location.city || video.location.country) {
      schema.contentLocation.address = {
        '@type': 'PostalAddress',
        addressLocality: video.location.city,
        addressCountry: video.location.country,
      };
    }
    
    if (video.location.lat && video.location.lon) {
      schema.contentLocation.geo = {
        '@type': 'GeoCoordinates',
        latitude: video.location.lat,
        longitude: video.location.lon,
      };
    }
  }
  
  // Creator
  if (video.creator) {
    schema.creator = {
      '@type': 'Person',
      name: video.creator.name,
      url: video.creator.url,
    };
  }
  
  return schema;
}

/**
 * Generiert Product Schema für Marketplace Items
 */
export function generateProductSchema(product: {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  imageUrl?: string;
  category?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  seller?: {
    name: string;
  };
}): ProductSchema {
  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      url: `https://anpip.com/market/${product.id}`,
    },
  };
  
  if (product.imageUrl) {
    schema.image = product.imageUrl;
  }
  
  if (product.category) {
    schema.category = product.category;
  }
  
  if (product.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: product.brand,
    };
  }
  
  if (product.seller) {
    schema.offers!.seller = {
      '@type': 'Person',
      name: product.seller.name,
    };
  }
  
  if (product.rating && product.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }
  
  return schema;
}

/**
 * Generiert FAQ Schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): FAQPageSchema {
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
 * Generiert Breadcrumb Schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url?: string }>): BreadcrumbSchema {
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

// ==================== URL OPTIMIZATION ====================

/**
 * Erstellt SEO-freundliche URLs
 */
export function createSEOFriendlyURL(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

// ==================== EXPORT ====================

export default {
  generateSEOMetaTags,
  generateSchemaScripts,
  generatePerformanceTags,
  generateAEOMarkup,
  optimizeForAEO,
  analyzeKeywords,
  generateVideoSchema,
  generateProductSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  createSEOFriendlyURL,
};
