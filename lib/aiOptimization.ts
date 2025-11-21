/**
 * AI-Optimized Content Structure
 * Optimiert für ChatGPT, Perplexity, Claude, Google SGE, Bing AI
 */

export interface AIContent {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  keywords: string[];
  mainEntity?: object;
  about?: object[];
  mentions?: object[];
}

/**
 * Generiert AI-freundliche JSON-LD Struktur für Videos
 */
export function generateAIVideoStructure(video: {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: number;
  category?: string;
  location?: {
    city: string;
    country: string;
    lat: number;
    lon: number;
  };
  tags?: string[];
}): object {
  const structure: any = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `https://anpip.com/video/${video.id}`,
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    contentUrl: video.url,
    uploadDate: video.uploadDate,
    embedUrl: `https://anpip.com/embed/${video.id}`,
    
    // AI-Crawling Hints
    discussionUrl: `https://anpip.com/video/${video.id}#comments`,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: 0,
    },
    
    // Content Metadata
    genre: video.category || 'Social Media',
    inLanguage: 'de',
    isFamilyFriendly: true,
    
    // Keywords für AI
    keywords: video.tags?.join(', ') || '',
  };

  // Duration
  if (video.duration) {
    structure.duration = `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`;
  }

  // Location
  if (video.location) {
    structure.contentLocation = {
      '@type': 'Place',
      name: `${video.location.city}, ${video.location.country}`,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: video.location.lat,
        longitude: video.location.lon,
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: video.location.city,
        addressCountry: video.location.country,
      },
    };
  }

  // Publisher Info für AI-Vertrauen
  structure.publisher = {
    '@type': 'Organization',
    name: 'Anpip',
    logo: {
      '@type': 'ImageObject',
      url: 'https://anpip.com/assets/icons/icon-512x512.png',
    },
  };

  return structure;
}

/**
 * Generiert AI-freundliche Produkt-Struktur für Market Items
 */
export function generateAIMarketItemStructure(item: {
  id: string;
  name: string;
  description: string;
  price?: number;
  currency?: string;
  imageUrl: string;
  category: string;
  condition?: 'new' | 'used' | 'refurbished';
  availability?: 'in_stock' | 'out_of_stock';
  location: {
    city: string;
    country: string;
    lat: number;
    lon: number;
  };
  seller?: string;
  datePosted: string;
}): object {
  const structure: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://anpip.com/market/${item.id}`,
    name: item.name,
    description: item.description,
    image: item.imageUrl,
    category: item.category,
    
    // AI-Hints
    brand: {
      '@type': 'Brand',
      name: item.seller || 'Private Seller',
    },
    
    // Availability
    offers: {
      '@type': 'Offer',
      url: `https://anpip.com/market/${item.id}`,
      priceCurrency: item.currency || 'EUR',
      price: item.price || 0,
      availability: item.availability === 'in_stock'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: item.condition === 'new'
        ? 'https://schema.org/NewCondition'
        : item.condition === 'refurbished'
        ? 'https://schema.org/RefurbishedCondition'
        : 'https://schema.org/UsedCondition',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      
      // Local Availability
      availableAtOrFrom: {
        '@type': 'Place',
        name: `${item.location.city}, ${item.location.country}`,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: item.location.lat,
          longitude: item.location.lon,
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: item.location.city,
          addressCountry: item.location.country,
        },
      },
    },
  };

  // Date Posted
  if (item.datePosted) {
    structure.datePublished = item.datePosted;
  }

  return structure;
}

/**
 * Generiert FAQ-Schema für AI-Antworten
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
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
 * Generiert How-To Schema für AI-Anweisungen
 */
export function generateHowToSchema(
  name: string,
  description: string,
  steps: Array<{ name: string; text: string; image?: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };
}

/**
 * Generiert Article-Schema für AI-Lesbarkeit
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  category?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.imageUrl,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author || 'Anpip User',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Anpip',
      logo: {
        '@type': 'ImageObject',
        url: 'https://anpip.com/assets/icons/icon-512x512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    articleSection: article.category,
  };
}

/**
 * Generiert Listing-Seite Schema für AI-Indexierung
 */
export function generateItemListSchema(
  name: string,
  description: string,
  items: Array<{ name: string; url: string; image?: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
      image: item.image,
    })),
  };
}

/**
 * Generiert Semantic Markup für AI-Verständnis
 */
export function generateSemanticMarkup(content: {
  topic: string;
  entities: string[];
  concepts: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    about: content.entities.map(entity => ({
      '@type': 'Thing',
      name: entity,
    })),
    keywords: [...content.entities, ...content.concepts].join(', '),
    inLanguage: 'de',
    abstract: content.topic,
  };
}

/**
 * Extrahiert Keywords aus Text für AI-Optimierung
 */
export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  // Entferne Stoppwörter und extrahiere relevante Keywords
  const stopWords = new Set([
    'der', 'die', 'das', 'und', 'oder', 'aber', 'in', 'von', 'zu', 'mit',
    'auf', 'für', 'ist', 'sind', 'war', 'waren', 'ein', 'eine', 'einer',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'is', 'are', 'was', 'were', 'of', 'with', 'as', 'by',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\säöüß]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Zähle Häufigkeit
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Sortiere nach Häufigkeit
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Generiert AI-optimierte Meta Description
 */
export function generateAIMetaDescription(
  title: string,
  content: string,
  location?: string,
  maxLength: number = 155
): string {
  // AI bevorzugt klare, informative Descriptions mit Kontext
  let description = content.substring(0, maxLength - 50);
  
  if (location) {
    description = `${description} | ${location}`;
  }
  
  description = `${description} | Anpip Social Video Platform`;
  
  return description.substring(0, maxLength);
}
