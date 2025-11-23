/**
 * GEO-SEO ENGINE
 * Standorterkennung, lokale Inhaltsanpassung, Geo-Tags
 * Optimiert für Market-Kategorien und lokale Video-Feeds
 */

export interface GeoLocation {
  city?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  currency?: string;
  language?: string;
}

export interface GeoMetaTags {
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
  icbm?: string;
}

/**
 * Erkennt Standort aus IP (clientseitig über API)
 */
export async function detectLocationFromIP(): Promise<GeoLocation | null> {
  try {
    // Option 1: ipapi.co (kostenlos, 1000 requests/day)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      city: data.city,
      country: data.country_name,
      countryCode: data.country_code,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      currency: data.currency,
      language: data.languages?.split(',')[0]
    };
  } catch (error) {
    console.error('Geo-Detection failed:', error);
    return null;
  }
}

/**
 * Erkennt Standort via Browser Geolocation API
 */
export async function detectLocationFromBrowser(): Promise<GeoLocation | null> {
  if (!navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse Geocoding via OpenStreetMap Nominatim
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          resolve({
            city: data.address?.city || data.address?.town,
            country: data.address?.country,
            countryCode: data.address?.country_code?.toUpperCase(),
            region: data.address?.state,
            latitude,
            longitude
          });
        } catch {
          resolve({
            latitude,
            longitude
          });
        }
      },
      () => resolve(null)
    );
  });
}

/**
 * Generiert Geo Meta Tags für SEO
 */
export function generateGeoMetaTags(location: GeoLocation): GeoMetaTags {
  const tags: GeoMetaTags = {};

  if (location.countryCode && location.region) {
    tags.geoRegion = `${location.countryCode}-${location.region}`;
  }

  if (location.city && location.country) {
    tags.geoPlacename = `${location.city}, ${location.country}`;
  }

  if (location.latitude && location.longitude) {
    tags.geoPosition = `${location.latitude};${location.longitude}`;
    tags.icbm = `${location.latitude}, ${location.longitude}`;
  }

  return tags;
}

/**
 * Generiert LocalBusiness Schema für Market
 */
export function generateLocalBusinessSchema(
  business: {
    name: string;
    description: string;
    category: string;
    video_id: string;
    price?: number;
    currency?: string;
  },
  location: GeoLocation
) {
  const baseUrl = 'https://anpip.com';

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": business.description,
    "url": `${baseUrl}/video/${business.video_id}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location.city,
      "addressRegion": location.region,
      "addressCountry": location.country
    },
    "geo": location.latitude && location.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": location.latitude,
      "longitude": location.longitude
    } : undefined,
    "priceRange": business.price ? `€${business.price}` : undefined,
    "offers": business.price ? {
      "@type": "Offer",
      "price": business.price,
      "priceCurrency": business.currency || location.currency || "EUR"
    } : undefined
  };
}

/**
 * Generiert Place Schema für Geo-Videos
 */
export function generatePlaceSchema(location: GeoLocation, video_id: string) {
  const baseUrl = 'https://anpip.com';

  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": location.city || location.country,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location.city,
      "addressRegion": location.region,
      "addressCountry": location.country
    },
    "geo": location.latitude && location.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": location.latitude,
      "longitude": location.longitude
    } : undefined,
    "url": `${baseUrl}/location/${location.city?.toLowerCase().replace(/\s/g, '-')}`
  };
}

/**
 * Filtert Videos nach Standort (Radius in km)
 */
export function filterVideosByLocation(
  videos: any[],
  userLocation: GeoLocation,
  radiusKm: number = 50
): any[] {
  if (!userLocation.latitude || !userLocation.longitude) {
    return videos;
  }

  return videos.filter(video => {
    if (!video.location?.latitude || !video.location?.longitude) {
      return false;
    }

    const distance = calculateDistance(
      userLocation.latitude!,
      userLocation.longitude!,
      video.location.latitude,
      video.location.longitude
    );

    return distance <= radiusKm;
  });
}

/**
 * Berechnet Distanz zwischen zwei GPS-Koordinaten (Haversine-Formel)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Erdradius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Generiert lokalisierte URL-Slugs
 */
export function generateLocalizedSlug(
  category: string,
  location?: GeoLocation
): string {
  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
  
  if (location?.city) {
    const citySlug = location.city.toLowerCase().replace(/\s+/g, '-');
    return `${categorySlug}-${citySlug}`;
  }
  
  return categorySlug;
}

/**
 * Generiert hreflang Tags für Geo-Varianten
 */
export function generateGeoHreflangTags(
  path: string,
  locations: GeoLocation[]
): string[] {
  const baseUrl = 'https://anpip.com';
  
  return locations.map(location => {
    const citySlug = location.city?.toLowerCase().replace(/\s+/g, '-');
    return `<link rel="alternate" hreflang="${location.language || 'de'}" href="${baseUrl}${path}?location=${citySlug}" />`;
  });
}

/**
 * Priorisiert Videos basierend auf Geo-Relevanz
 */
export function prioritizeByGeoRelevance(
  videos: any[],
  userLocation: GeoLocation
): any[] {
  if (!userLocation.latitude || !userLocation.longitude) {
    return videos;
  }

  return videos.sort((a, b) => {
    const distanceA = a.location?.latitude && a.location?.longitude
      ? calculateDistance(
          userLocation.latitude!,
          userLocation.longitude!,
          a.location.latitude,
          a.location.longitude
        )
      : Infinity;

    const distanceB = b.location?.latitude && b.location?.longitude
      ? calculateDistance(
          userLocation.latitude!,
          userLocation.longitude!,
          b.location.latitude,
          b.location.longitude
        )
      : Infinity;

    return distanceA - distanceB;
  });
}

/**
 * Generiert Geo-optimierte Sitemap
 */
export function generateGeoSitemap(
  videos: any[],
  locations: GeoLocation[]
): string {
  const baseUrl = 'https://anpip.com';
  
  const urls = locations.flatMap(location => {
    const citySlug = location.city?.toLowerCase().replace(/\s+/g, '-');
    
    return [
      {
        loc: `${baseUrl}/location/${citySlug}`,
        priority: 0.8,
        changefreq: 'daily'
      },
      {
        loc: `${baseUrl}/market?location=${citySlug}`,
        priority: 0.7,
        changefreq: 'daily'
      }
    ];
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}
