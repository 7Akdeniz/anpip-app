/**
 * MARKET SEO ENGINE
 * Category-SEO, SEO-Pfade, strukturierte Daten für Market-Kategorien
 * Optimiert für lokale Video-Angebote und Geo-Targeting
 */

export interface MarketCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  video_count?: number;
  subcategories?: string[];
  seo_keywords?: string[];
}

export interface MarketVideo {
  id: string;
  title: string;
  description: string;
  price?: number;
  currency?: string;
  category: string;
  location?: {
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  seller: {
    user_id: string;
    username: string;
    rating?: number;
  };
  created_at: string;
}

/**
 * Generiert SEO-optimierte URL-Slugs für Market Kategorien
 */
export function generateMarketCategorySlug(
  category: string,
  city?: string,
  subcategory?: string
): string {
  const parts: string[] = [];
  
  // Hauptkategorie
  parts.push(category.toLowerCase().replace(/\s+/g, '-'));
  
  // Unterkategorie
  if (subcategory) {
    parts.push(subcategory.toLowerCase().replace(/\s+/g, '-'));
  }
  
  // Stadt für Geo-SEO
  if (city) {
    parts.push(city.toLowerCase().replace(/\s+/g, '-'));
  }
  
  return parts.join('/');
}

/**
 * Generiert Breadcrumb Schema für Market
 */
export function generateMarketBreadcrumbs(
  category: MarketCategory,
  subcategory?: string,
  city?: string
): any {
  const baseUrl = 'https://anpip.com';
  
  const items = [
    { name: 'Home', url: baseUrl },
    { name: 'Market', url: `${baseUrl}/market` },
    { name: category.name, url: `${baseUrl}/market/${category.id}` }
  ];
  
  if (subcategory) {
    items.push({
      name: subcategory,
      url: `${baseUrl}/market/${category.id}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`
    });
  }
  
  if (city) {
    items.push({
      name: city,
      url: `${baseUrl}/market/${category.id}?city=${city.toLowerCase()}`
    });
  }
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Generiert Product Schema für Market-Videos
 */
export function generateMarketProductSchema(video: MarketVideo): any {
  const baseUrl = 'https://anpip.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": video.title,
    "description": video.description,
    "image": `${baseUrl}/api/thumbnail/${video.id}`,
    "url": `${baseUrl}/video/${video.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Anpip Market"
    },
    "offers": {
      "@type": "Offer",
      "price": video.price || 0,
      "priceCurrency": video.currency || "EUR",
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/video/${video.id}`,
      "seller": {
        "@type": "Person",
        "name": video.seller.username,
        "url": `${baseUrl}/profile/${video.seller.user_id}`
      },
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    "aggregateRating": video.seller.rating ? {
      "@type": "AggregateRating",
      "ratingValue": video.seller.rating,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "category": video.category,
    "video": {
      "@type": "VideoObject",
      "name": video.title,
      "description": video.description,
      "thumbnailUrl": `${baseUrl}/api/thumbnail/${video.id}`,
      "contentUrl": `${baseUrl}/api/video/${video.id}`,
      "uploadDate": video.created_at
    },
    "location": video.location ? {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": video.location.city,
        "addressCountry": video.location.country
      }
    } : undefined
  };
}

/**
 * Generiert ItemList Schema für Market Kategorien
 */
export function generateMarketCategoryListSchema(
  category: MarketCategory,
  videos: MarketVideo[]
): any {
  const baseUrl = 'https://anpip.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${category.name} - Anpip Market`,
    "description": category.description,
    "url": `${baseUrl}/market/${category.id}`,
    "numberOfItems": videos.length,
    "itemListElement": videos.map((video, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": video.title,
        "url": `${baseUrl}/video/${video.id}`,
        "image": `${baseUrl}/api/thumbnail/${video.id}`,
        "offers": {
          "@type": "Offer",
          "price": video.price || 0,
          "priceCurrency": video.currency || "EUR"
        }
      }
    }))
  };
}

/**
 * Generiert Meta Tags für Market Kategorien
 */
export function generateMarketCategoryMetaTags(
  category: MarketCategory,
  location?: { city: string; country: string }
): Record<string, string> {
  const locationSuffix = location ? ` in ${location.city}, ${location.country}` : '';
  const title = `${category.name}${locationSuffix} - ${category.video_count || 0} Angebote | Anpip Market`;
  const description = `${category.description} Entdecke Video-Angebote zu ${category.name}${locationSuffix}. Lokale Deals, Produkte & Services.`;
  
  const keywords = [
    category.name,
    'anpip market',
    'video marketplace',
    'local deals',
    ...(category.seo_keywords || []),
    ...(location ? [location.city, location.country] : [])
  ].join(', ');

  return {
    'title': title,
    'description': description,
    'keywords': keywords,
    'og:title': `${category.name} - Anpip Market`,
    'og:description': description,
    'og:type': 'website',
    'twitter:card': 'summary_large_image',
    'twitter:title': `${category.name} - Anpip Market`,
    'twitter:description': description
  };
}

/**
 * Generiert FAQ Schema für Market Kategorien
 */
export function generateMarketFAQSchema(category: MarketCategory): any {
  const faqs = [
    {
      question: `Was ist ${category.name} auf Anpip Market?`,
      answer: `${category.description} Auf Anpip Market kannst du lokale Video-Angebote zu ${category.name} entdecken und deine eigenen Produkte als Video präsentieren.`
    },
    {
      question: `Wie funktioniert der Verkauf auf Anpip Market?`,
      answer: `Erstelle ein kurzes 9:16 Video deines Produkts, füge Preis und Standort hinzu, und teile es mit der Community. Interessenten können dich direkt kontaktieren.`
    },
    {
      question: `Sind die Angebote in ${category.name} kostenlos?`,
      answer: `Das Einstellen von Angeboten ist kostenlos. Die Preise der Produkte werden von den Verkäufern selbst festgelegt.`
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generiert Market Sitemap
 */
export function generateMarketSitemap(categories: MarketCategory[]): string {
  const baseUrl = 'https://anpip.com';
  
  const urls = [
    {
      loc: `${baseUrl}/market`,
      priority: 0.9,
      changefreq: 'daily'
    },
    ...categories.flatMap(category => [
      {
        loc: `${baseUrl}/market/${category.id}`,
        priority: 0.8,
        changefreq: 'daily'
      },
      ...(category.subcategories || []).map(sub => ({
        loc: `${baseUrl}/market/${category.id}/${sub.toLowerCase().replace(/\s+/g, '-')}`,
        priority: 0.7,
        changefreq: 'daily'
      }))
    ])
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

/**
 * Market Kategorien mit SEO-Optimierung
 */
export const MARKET_CATEGORIES: MarketCategory[] = [
  {
    id: 'electronics',
    name: 'Elektronik',
    description: 'Smartphones, Laptops, Tablets, Kameras und mehr',
    icon: 'laptop',
    seo_keywords: ['elektronik', 'smartphone', 'laptop', 'technik', 'gebraucht'],
    subcategories: ['Smartphones', 'Laptops', 'Tablets', 'Kameras', 'Audio']
  },
  {
    id: 'fashion',
    name: 'Mode & Kleidung',
    description: 'Kleidung, Schuhe, Accessoires für Damen, Herren & Kinder',
    icon: 'shirt',
    seo_keywords: ['mode', 'kleidung', 'schuhe', 'fashion', 'secondhand'],
    subcategories: ['Damen', 'Herren', 'Kinder', 'Schuhe', 'Accessoires']
  },
  {
    id: 'home',
    name: 'Haus & Garten',
    description: 'Möbel, Deko, Garten, Haushaltsgeräte',
    icon: 'home',
    seo_keywords: ['möbel', 'haus', 'garten', 'deko', 'haushalt'],
    subcategories: ['Möbel', 'Deko', 'Garten', 'Küche', 'Bad']
  },
  {
    id: 'auto',
    name: 'Auto & Motorrad',
    description: 'Fahrzeuge, Teile, Zubehör',
    icon: 'car',
    seo_keywords: ['auto', 'motorrad', 'fahrzeug', 'gebrauchtwagen', 'kfz'],
    subcategories: ['Autos', 'Motorräder', 'Teile', 'Zubehör', 'Reifen']
  },
  {
    id: 'services',
    name: 'Dienstleistungen',
    description: 'Handwerk, Reparatur, Nachhilfe, Beratung',
    icon: 'construct',
    seo_keywords: ['dienstleistung', 'handwerk', 'reparatur', 'service', 'hilfe'],
    subcategories: ['Handwerk', 'Reparatur', 'Nachhilfe', 'Beratung', 'Transport']
  },
  {
    id: 'food',
    name: 'Essen & Trinken',
    description: 'Lokale Restaurants, Cafés, Food Trucks',
    icon: 'pizza',
    seo_keywords: ['essen', 'restaurant', 'café', 'food', 'lieferung'],
    subcategories: ['Restaurants', 'Cafés', 'Bars', 'Food Trucks', 'Catering']
  },
  {
    id: 'real-estate',
    name: 'Immobilien',
    description: 'Wohnungen, Häuser, WG-Zimmer',
    icon: 'business',
    seo_keywords: ['immobilien', 'wohnung', 'haus', 'mieten', 'kaufen'],
    subcategories: ['Mieten', 'Kaufen', 'WG-Zimmer', 'Gewerbe', 'Grundstücke']
  },
  {
    id: 'jobs',
    name: 'Jobs & Karriere',
    description: 'Stellenangebote, Praktika, Freelance',
    icon: 'briefcase',
    seo_keywords: ['jobs', 'stellenangebote', 'karriere', 'arbeit', 'praktikum'],
    subcategories: ['Vollzeit', 'Teilzeit', 'Minijob', 'Praktikum', 'Freelance']
  }
];

/**
 * Generiert alle Market SEO Schemas
 */
export function generateAllMarketSchemas(
  category: MarketCategory,
  videos: MarketVideo[],
  location?: { city: string; country: string }
): any[] {
  return [
    generateMarketBreadcrumbs(category, undefined, location?.city),
    generateMarketCategoryListSchema(category, videos),
    generateMarketFAQSchema(category),
    ...videos.slice(0, 5).map(video => generateMarketProductSchema(video))
  ];
}
