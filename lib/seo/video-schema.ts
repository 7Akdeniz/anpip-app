/**
 * VIDEO SCHEMA MARKUP GENERATOR
 * Generiert VideoObject Schema.org Markup für SEO
 * Optimiert für Google, Bing, AI-Search (ChatGPT, Perplexity, Gemini)
 */

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  upload_date: string;
  duration?: number; // in Sekunden
  views_count?: number;
  likes_count?: number;
  username?: string;
  user_id?: string;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  category?: string;
  hashtags?: string[];
  is_market?: boolean;
  price?: number;
  currency?: string;
}

/**
 * Generiert VideoObject Schema für einzelnes Video
 */
export function generateVideoSchema(video: VideoMetadata) {
  const baseUrl = 'https://anpip.com';
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${baseUrl}/video/${video.id}`,
    "name": video.title,
    "description": video.description,
    "thumbnailUrl": [
      video.thumbnail_url,
      `${video.thumbnail_url}?w=1280`,
      `${video.thumbnail_url}?w=720`
    ],
    "uploadDate": video.upload_date,
    "contentUrl": video.video_url,
    "embedUrl": `${baseUrl}/embed/${video.id}`,
    "duration": video.duration ? `PT${video.duration}S` : undefined,
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/WatchAction",
        "userInteractionCount": video.views_count || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": video.likes_count || 0
      }
    ],
    "author": video.username ? {
      "@type": "Person",
      "name": video.username,
      "url": `${baseUrl}/profile/${video.user_id}`
    } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "Anpip",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/assets/icons/icon-512x512.png`,
        "width": 512,
        "height": 512
      }
    },
    "potentialAction": {
      "@type": "WatchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/video/${video.id}`,
        "inLanguage": "de-DE",
        "actionPlatform": [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
          "https://schema.org/IOSPlatform",
          "https://schema.org/AndroidPlatform"
        ]
      }
    },
    "genre": video.category || "Social Media",
    "keywords": video.hashtags?.join(', '),
    "contentLocation": video.location ? {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": video.location.city,
        "addressCountry": video.location.country
      },
      "geo": video.location.latitude && video.location.longitude ? {
        "@type": "GeoCoordinates",
        "latitude": video.location.latitude,
        "longitude": video.location.longitude
      } : undefined
    } : undefined,
    "offers": video.is_market && video.price ? {
      "@type": "Offer",
      "price": video.price,
      "priceCurrency": video.currency || "EUR",
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/video/${video.id}`
    } : undefined
  };

  // Entferne undefined Werte
  return JSON.parse(JSON.stringify(schema));
}

/**
 * Generiert VideoGallery Schema für Feed
 */
export function generateVideoGallerySchema(videos: VideoMetadata[]) {
  const baseUrl = 'https://anpip.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "VideoGallery",
    "name": "Anpip Video Feed - Entdecke die besten Videos",
    "description": "Entdecke virale Videos, lokale Angebote und Creator aus deiner Stadt. Die modernste 9:16 Video Plattform.",
    "url": `${baseUrl}/feed`,
    "video": videos.map(video => generateVideoSchema(video))
  };
}

/**
 * Generiert ProfilePage Schema für Creator
 */
export function generateCreatorProfileSchema(profile: {
  user_id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  followers_count?: number;
  videos_count?: number;
  verified?: boolean;
}) {
  const baseUrl = 'https://anpip.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": profile.username,
      "url": `${baseUrl}/profile/${profile.user_id}`,
      "image": profile.avatar_url,
      "description": profile.bio,
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/FollowAction",
        "userInteractionCount": profile.followers_count || 0
      },
      "numberOfItems": profile.videos_count || 0,
      "identifier": profile.verified ? {
        "@type": "PropertyValue",
        "propertyID": "verified",
        "value": "true"
      } : undefined
    }
  };
}

/**
 * Generiert CollectionPage Schema für Market Kategorien
 */
export function generateMarketCategorySchema(category: {
  id: string;
  name: string;
  description: string;
  video_count?: number;
  icon?: string;
}) {
  const baseUrl = 'https://anpip.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} - Anpip Market`,
    "description": category.description,
    "url": `${baseUrl}/market/${category.id}`,
    "numberOfItems": category.video_count || 0,
    "about": {
      "@type": "Thing",
      "name": category.name,
      "description": category.description
    }
  };
}

/**
 * Generiert BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
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
 * Generiert WebSite Schema mit Suchfunktion
 */
export function generateWebsiteSchema() {
  const baseUrl = 'https://anpip.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Anpip",
    "alternateName": "Anpip Social Video Platform",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Anpip",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/assets/icons/icon-512x512.png`
      }
    }
  };
}

/**
 * Generiert Organization Schema
 */
export function generateOrganizationSchema() {
  const baseUrl = 'https://anpip.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Anpip",
    "alternateName": "Anpip.com",
    "url": baseUrl,
    "logo": `${baseUrl}/assets/icons/icon-512x512.png`,
    "description": "Moderne Social Video Plattform für 9:16 Videos, lokale Angebote und Live-Streaming",
    "sameAs": [
      "https://twitter.com/anpip",
      "https://facebook.com/anpip",
      "https://instagram.com/anpip",
      "https://youtube.com/@anpip"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@anpip.com",
      "availableLanguage": ["de", "en", "es", "fr"]
    }
  };
}

/**
 * Hilfsfunktion: Schema in HTML einbetten
 */
export function embedSchema(schema: any): string {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generiert alle Schemas für eine Video-Seite
 */
export function generateAllVideoSchemas(video: VideoMetadata) {
  return [
    generateVideoSchema(video),
    generateWebsiteSchema(),
    generateOrganizationSchema(),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://anpip.com' },
      { name: 'Videos', url: 'https://anpip.com/feed' },
      { name: video.title, url: `https://anpip.com/video/${video.id}` }
    ])
  ];
}
