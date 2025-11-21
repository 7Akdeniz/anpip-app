/**
 * AI & STRUCTURED DATA OPTIMIZATION 2025
 * Optimiert für Google SGE, ChatGPT, Perplexity, Claude, Gemini
 * JSON-LD Schema für alle Content-Typen
 */

// ==================== JSON-LD SCHEMAS ====================

export interface Organization {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[]; // Social Media Profiles
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    contactType: string;
    email?: string;
    areaServed?: string;
    availableLanguage?: string[];
  }[];
}

export interface WebSite {
  url: string;
  name: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface WebPage {
  url: string;
  name: string;
  description?: string;
  inLanguage?: string;
  isPartOf?: string;
  breadcrumb?: string;
}

export interface VideoObject {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl: string;
  embedUrl?: string;
  duration?: string; // ISO 8601 format: PT1M30S
  interactionStatistic?: {
    '@type': 'InteractionCounter';
    interactionType: string;
    userInteractionCount: number;
  }[];
  contentLocation?: {
    '@type': 'Place';
    name: string;
    geo?: {
      '@type': 'GeoCoordinates';
      latitude: number;
      longitude: number;
    };
  };
}

export interface Product {
  name: string;
  description: string;
  image?: string[];
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
    seller?: {
      '@type': 'Organization' | 'Person';
      name: string;
    };
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  category?: string;
}

export interface BreadcrumbList {
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface LocalBusiness {
  '@type': 'LocalBusiness';
  name: string;
  description?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  url?: string;
  telephone?: string;
  priceRange?: string;
  openingHoursSpecification?: Array<{
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
}

export interface FAQPage {
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

// ==================== SCHEMA GENERATORS ====================

/**
 * Organization Schema (Haupt-Website)
 */
export function generateOrganizationSchema(org: Organization): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    sameAs: org.sameAs || [],
    contactPoint: org.contactPoint || [],
  };

  return JSON.stringify(schema);
}

/**
 * WebSite Schema mit Search Action
 */
export function generateWebSiteSchema(site: WebSite): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: site.url,
    name: site.name,
    description: site.description,
    potentialAction: site.potentialAction || {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${site.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return JSON.stringify(schema);
}

/**
 * WebPage Schema
 */
export function generateWebPageSchema(page: WebPage): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: page.url,
    name: page.name,
    description: page.description,
    inLanguage: page.inLanguage || 'de',
    isPartOf: page.isPartOf ? {
      '@type': 'WebSite',
      '@id': page.isPartOf,
    } : undefined,
    breadcrumb: page.breadcrumb ? {
      '@type': 'BreadcrumbList',
      '@id': page.breadcrumb,
    } : undefined,
  };

  return JSON.stringify(schema);
}

/**
 * VideoObject Schema für Video-SEO
 */
export function generateVideoSchema(video: VideoObject): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl,
    duration: video.duration,
    interactionStatistic: video.interactionStatistic || [],
    contentLocation: video.contentLocation,
  };

  return JSON.stringify(schema);
}

/**
 * Product Schema für Marktplatz-Items
 */
export function generateProductSchema(product: Product): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image || [],
    offers: product.offers,
    aggregateRating: product.aggregateRating,
    brand: product.brand,
    category: product.category,
  };

  return JSON.stringify(schema);
}

/**
 * BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(breadcrumb: BreadcrumbList): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.itemListElement,
  };

  return JSON.stringify(schema);
}

/**
 * LocalBusiness Schema für GEO-SEO
 */
export function generateLocalBusinessSchema(business: LocalBusiness): string {
  const schema = {
    '@context': 'https://schema.org',
    ...business,
  };

  return JSON.stringify(schema);
}

/**
 * FAQPage Schema
 */
export function generateFAQSchema(faq: FAQPage): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.mainEntity,
  };

  return JSON.stringify(schema);
}

// ==================== SEMANTIC HTML HELPERS ====================

/**
 * Generiert semantisches HTML für bessere KI-Lesbarkeit
 */
export interface SemanticContent {
  h1: string;
  h2?: string[];
  mainContent: string;
  sidebarContent?: string;
  facts?: Array<{ label: string; value: string }>;
  faq?: Array<{ question: string; answer: string }>;
}

export function generateSemanticHTML(content: SemanticContent): string {
  const html: string[] = [];

  // Main Content with semantic structure
  html.push('<main role="main">');
  html.push('  <article>');
  
  // H1 - Nur EINE pro Seite!
  html.push(`    <h1>${escapeHTML(content.h1)}</h1>`);

  // H2 Sections
  if (content.h2 && content.h2.length > 0) {
    content.h2.forEach(heading => {
      html.push(`    <section>`);
      html.push(`      <h2>${escapeHTML(heading)}</h2>`);
      html.push(`    </section>`);
    });
  }

  // Main Content
  html.push(`    <div class="content">`);
  html.push(`      ${content.mainContent}`);
  html.push(`    </div>`);

  // Facts (für Entity-Based SEO)
  if (content.facts && content.facts.length > 0) {
    html.push(`    <section aria-labelledby="facts-heading">`);
    html.push(`      <h2 id="facts-heading">Wichtige Fakten</h2>`);
    html.push(`      <dl class="fact-list">`);
    content.facts.forEach(fact => {
      html.push(`        <dt>${escapeHTML(fact.label)}</dt>`);
      html.push(`        <dd>${escapeHTML(fact.value)}</dd>`);
    });
    html.push(`      </dl>`);
    html.push(`    </section>`);
  }

  // FAQ Section
  if (content.faq && content.faq.length > 0) {
    html.push(`    <section aria-labelledby="faq-heading">`);
    html.push(`      <h2 id="faq-heading">Häufig gestellte Fragen</h2>`);
    content.faq.forEach((item, index) => {
      html.push(`      <details>`);
      html.push(`        <summary>${escapeHTML(item.question)}</summary>`);
      html.push(`        <p>${escapeHTML(item.answer)}</p>`);
      html.push(`      </details>`);
    });
    html.push(`    </section>`);
  }

  html.push('  </article>');

  // Sidebar
  if (content.sidebarContent) {
    html.push('  <aside role="complementary">');
    html.push(`    ${content.sidebarContent}`);
    html.push('  </aside>');
  }

  html.push('</main>');

  return html.join('\n');
}

// ==================== META TAGS GENERATOR ====================

export interface MetaTags {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string[];
  ogType?: 'website' | 'video.other' | 'article' | 'product';
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogVideo?: string;
  ogLocale?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  geoPosition?: { lat: number; lng: number };
  geoPlacename?: string;
  geoRegion?: string;
}

/**
 * Generiert alle Meta-Tags für optimale SEO & Social Sharing
 */
export function generateMetaTags(tags: MetaTags): string {
  const meta: string[] = [];

  // Basic Meta
  meta.push(`<title>${escapeHTML(tags.title)}</title>`);
  meta.push(`<meta name="description" content="${escapeHTML(tags.description)}" />`);
  
  if (tags.keywords && tags.keywords.length > 0) {
    meta.push(`<meta name="keywords" content="${tags.keywords.join(', ')}" />`);
  }

  if (tags.canonical) {
    meta.push(`<link rel="canonical" href="${tags.canonical}" />`);
  }

  // Open Graph
  meta.push(`<meta property="og:type" content="${tags.ogType || 'website'}" />`);
  meta.push(`<meta property="og:title" content="${escapeHTML(tags.ogTitle || tags.title)}" />`);
  meta.push(`<meta property="og:description" content="${escapeHTML(tags.ogDescription || tags.description)}" />`);
  
  if (tags.ogImage) {
    meta.push(`<meta property="og:image" content="${tags.ogImage}" />`);
    meta.push(`<meta property="og:image:width" content="1200" />`);
    meta.push(`<meta property="og:image:height" content="630" />`);
  }

  if (tags.ogVideo) {
    meta.push(`<meta property="og:video" content="${tags.ogVideo}" />`);
  }

  meta.push(`<meta property="og:locale" content="${tags.ogLocale || 'de_DE'}" />`);

  // Twitter Card
  meta.push(`<meta name="twitter:card" content="${tags.twitterCard || 'summary_large_image'}" />`);
  meta.push(`<meta name="twitter:title" content="${escapeHTML(tags.twitterTitle || tags.title)}" />`);
  meta.push(`<meta name="twitter:description" content="${escapeHTML(tags.twitterDescription || tags.description)}" />`);
  
  if (tags.twitterImage || tags.ogImage) {
    meta.push(`<meta name="twitter:image" content="${tags.twitterImage || tags.ogImage}" />`);
  }

  // GEO Meta Tags
  if (tags.geoPosition) {
    meta.push(`<meta name="geo.position" content="${tags.geoPosition.lat};${tags.geoPosition.lng}" />`);
    meta.push(`<meta name="ICBM" content="${tags.geoPosition.lat}, ${tags.geoPosition.lng}" />`);
  }

  if (tags.geoPlacename) {
    meta.push(`<meta name="geo.placename" content="${escapeHTML(tags.geoPlacename)}" />`);
  }

  if (tags.geoRegion) {
    meta.push(`<meta name="geo.region" content="${tags.geoRegion}" />`);
  }

  return meta.join('\n');
}

// ==================== ENTITY EXTRACTION ====================

/**
 * Extrahiert Entities für NLP & AI-Optimierung
 */
export interface Entity {
  type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'PRODUCT' | 'EVENT' | 'DATE' | 'PRICE';
  value: string;
  confidence?: number;
}

export function extractEntities(text: string): Entity[] {
  const entities: Entity[] = [];

  // Preis-Erkennung
  const priceRegex = /(\d+(?:[.,]\d{2})?)\s*(?:€|EUR|USD|\$)/gi;
  let match;
  while ((match = priceRegex.exec(text)) !== null) {
    entities.push({ type: 'PRICE', value: match[0], confidence: 0.9 });
  }

  // Datums-Erkennung (einfach)
  const dateRegex = /\b(\d{1,2}\.\d{1,2}\.\d{4})\b/g;
  while ((match = dateRegex.exec(text)) !== null) {
    entities.push({ type: 'DATE', value: match[1], confidence: 0.8 });
  }

  // Weitere Entities können mit NLP-Bibliotheken extrahiert werden

  return entities;
}

// ==================== HELPER FUNCTIONS ====================

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * ISO 8601 Duration für Video-Länge
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0 || duration === 'PT') duration += `${secs}S`;

  return duration;
}

// ==================== EXPORT ====================

export default {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateWebPageSchema,
  generateVideoSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  generateFAQSchema,
  generateSemanticHTML,
  generateMetaTags,
  extractEntities,
  formatDuration,
};
