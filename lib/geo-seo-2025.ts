/**
 * GEO & LOCAL SEO OPTIMIZATION 2025
 * Auto-Location Detection, GEO Meta-Daten, Stadt-Landingpages
 */

import { Platform } from 'react-native';

// ==================== LOCATION DETECTION ====================

export interface LocationData {
  country: string;
  countryCode: string;
  city: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  currency?: string;
  language?: string;
}

/**
 * Auto-Location Detection via IP
 */
export async function detectUserLocation(): Promise<LocationData | null> {
  if (Platform.OS !== 'web') {
    return null; // Mobile apps sollten native Location API nutzen
  }

  try {
    // Eigene API verwenden (bereits vorhanden)
    const response = await fetch('/api/location/ip');
    if (!response.ok) throw new Error('Location API failed');
    
    const data = await response.json();
    
    return {
      country: data.country || 'Unknown',
      countryCode: data.country_code || 'XX',
      city: data.city || 'Unknown',
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      currency: data.currency,
      language: data.language || 'de',
    };
  } catch (error) {
    console.warn('Location detection failed:', error);
    
    // Fallback: Browser Language Detection
    const browserLang = navigator.language || 'de-DE';
    const countryCode = browserLang.split('-')[1] || 'DE';
    
    return {
      country: getCountryName(countryCode),
      countryCode,
      city: 'Unknown',
      language: browserLang.split('-')[0],
    };
  }
}

/**
 * HTML5 Geolocation API (präziser, aber benötigt User-Permission)
 */
export async function requestPreciseLocation(): Promise<{ latitude: number; longitude: number } | null> {
  if (Platform.OS !== 'web' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Geolocation permission denied:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // 5 Minuten Cache
      }
    );
  });
}

/**
 * Reverse Geocoding: Koordinaten → Stadt/Land
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationData | null> {
  try {
    const response = await fetch(`/api/location/reverse?lat=${lat}&lng=${lng}`);
    if (!response.ok) throw new Error('Reverse geocoding failed');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return null;
  }
}

// ==================== LOCATION-BASED ROUTING ====================

/**
 * Generiert SEO-optimierte Location-basierte URLs
 * Format: /land/stadt/kategorie/item
 */
export function generateLocationURL(params: {
  country?: string;
  city?: string;
  category?: string;
  subcategory?: string;
  itemId?: string;
  itemTitle?: string;
}): string {
  const segments: string[] = [];

  if (params.country) {
    segments.push(slugify(params.country).toLowerCase());
  }

  if (params.city) {
    segments.push(slugify(params.city));
  }

  if (params.category) {
    segments.push('kategorie', slugify(params.category));
  }

  if (params.subcategory) {
    segments.push(slugify(params.subcategory));
  }

  if (params.itemId) {
    const titleSlug = params.itemTitle ? slugify(params.itemTitle) : 'item';
    segments.push(`${titleSlug}-${params.itemId}`);
  }

  return '/' + segments.join('/');
}

/**
 * Parsed Location-URL zurück zu Parametern
 */
export function parseLocationURL(url: string): {
  country?: string;
  city?: string;
  category?: string;
  subcategory?: string;
  itemId?: string;
} {
  const segments = url.split('/').filter(Boolean);
  const result: any = {};

  // Erwartete Struktur: /land/stadt/kategorie/category-name/subcategory/item-id
  if (segments.length >= 1) result.country = segments[0];
  if (segments.length >= 2 && segments[1] !== 'kategorie') result.city = segments[1];
  
  const kategorieIndex = segments.indexOf('kategorie');
  if (kategorieIndex !== -1) {
    if (segments[kategorieIndex + 1]) result.category = segments[kategorieIndex + 1];
    if (segments[kategorieIndex + 2] && !segments[kategorieIndex + 2].includes('-')) {
      result.subcategory = segments[kategorieIndex + 2];
    }
  }

  // Item ID ist üblicherweise das letzte Segment mit "-" (slug-123)
  const lastSegment = segments[segments.length - 1];
  const match = lastSegment.match(/-([a-f0-9-]+)$/);
  if (match) result.itemId = match[1];

  return result;
}

// ==================== LOCATION-BASED CONTENT ====================

/**
 * Generiert lokalisierte Landing-Page Inhalte
 */
export interface LocalizedContent {
  h1: string;
  description: string;
  keywords: string[];
  faq: Array<{ question: string; answer: string }>;
}

export function generateLocalizedContent(params: {
  country: string;
  city?: string;
  category?: string;
  subcategory?: string;
}): LocalizedContent {
  const { country, city, category, subcategory } = params;

  // H1 Generierung
  let h1 = '';
  if (city && category && subcategory) {
    h1 = `${subcategory} in ${city} kaufen & verkaufen`;
  } else if (city && category) {
    h1 = `${category} in ${city} – lokale Angebote finden`;
  } else if (city) {
    h1 = `Lokale Angebote in ${city} entdecken`;
  } else {
    h1 = `Angebote in ${country} – Videos & Marktplatz`;
  }

  // Description
  let description = '';
  if (city && category) {
    description = `Entdecke ${category.toLowerCase()}-Angebote in ${city}, ${country}. Videos, Bewertungen und direkte Kontaktmöglichkeiten zu lokalen Anbietern.`;
  } else if (city) {
    description = `Finde lokale Angebote in ${city}, ${country}. Durchsuche Videos, Produkte und Dienstleistungen in deiner Nähe.`;
  } else {
    description = `Dein lokaler Marktplatz für ${country}. Videos, Angebote und Dienstleistungen in deiner Region.`;
  }

  // Keywords
  const keywords = [
    city || country,
    category || 'angebote',
    'lokal',
    'kaufen',
    'verkaufen',
    'videos',
    'marktplatz',
  ];

  // FAQ
  const faq = generateLocalFAQ(params);

  return { h1, description, keywords, faq };
}

/**
 * Generiert lokale FAQs
 */
function generateLocalFAQ(params: {
  country: string;
  city?: string;
  category?: string;
}): Array<{ question: string; answer: string }> {
  const { country, city, category } = params;
  const location = city || country;

  const faqs: Array<{ question: string; answer: string }> = [
    {
      question: `Wie finde ich ${category || 'Angebote'} in ${location}?`,
      answer: `Nutze unsere Suchfunktion oder filtere nach Standort "${location}". Alle Angebote sind mit Videos und detaillierten Beschreibungen versehen.`,
    },
    {
      question: `Sind alle Angebote in ${location} verfügbar?`,
      answer: `Ja, wir zeigen nur lokale Angebote von Anbietern in und um ${location}. Du kannst direkt Kontakt aufnehmen.`,
    },
    {
      question: `Kann ich selbst Angebote in ${location} einstellen?`,
      answer: `Absolut! Erstelle ein kostenloses Konto und teile deine Angebote mit Video-Upload für maximale Sichtbarkeit.`,
    },
  ];

  if (category) {
    faqs.push({
      question: `Was kostet ${category} in ${location}?`,
      answer: `Die Preise variieren je nach Anbieter und Zustand. Nutze die Filteroptionen, um Angebote nach Preis zu sortieren.`,
    });
  }

  return faqs;
}

// ==================== LOCATION-BASED SEARCH ====================

/**
 * Proximity Search: Finde Angebote in der Nähe
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Haversine-Formel
  const R = 6371; // Erdradius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filtert Items nach Distanz
 */
export function filterByProximity<T extends { latitude?: number; longitude?: number }>(
  items: T[],
  userLat: number,
  userLng: number,
  maxDistanceKm: number
): T[] {
  return items.filter(item => {
    if (!item.latitude || !item.longitude) return false;
    const distance = calculateDistance(userLat, userLng, item.latitude, item.longitude);
    return distance <= maxDistanceKm;
  });
}

// ==================== TOP LOCATIONS DATA ====================

export interface TopLocation {
  country: string;
  countryCode: string;
  cities: Array<{
    name: string;
    slug: string;
    population: number;
    latitude: number;
    longitude: number;
  }>;
}

/**
 * Top-Locations für Footer & SEO
 */
export const TOP_LOCATIONS: TopLocation[] = [
  {
    country: 'Deutschland',
    countryCode: 'DE',
    cities: [
      { name: 'Berlin', slug: 'berlin', population: 3645000, latitude: 52.5200, longitude: 13.4050 },
      { name: 'Hamburg', slug: 'hamburg', population: 1841000, latitude: 53.5511, longitude: 9.9937 },
      { name: 'München', slug: 'muenchen', population: 1472000, latitude: 48.1351, longitude: 11.5820 },
      { name: 'Köln', slug: 'koeln', population: 1086000, latitude: 50.9375, longitude: 6.9603 },
      { name: 'Frankfurt', slug: 'frankfurt', population: 753000, latitude: 50.1109, longitude: 8.6821 },
    ],
  },
  {
    country: 'Türkiye',
    countryCode: 'TR',
    cities: [
      { name: 'İstanbul', slug: 'istanbul', population: 15460000, latitude: 41.0082, longitude: 28.9784 },
      { name: 'Ankara', slug: 'ankara', population: 5663000, latitude: 39.9334, longitude: 32.8597 },
      { name: 'İzmir', slug: 'izmir', population: 4394000, latitude: 38.4237, longitude: 27.1428 },
    ],
  },
  {
    country: 'Austria',
    countryCode: 'AT',
    cities: [
      { name: 'Wien', slug: 'wien', population: 1911000, latitude: 48.2082, longitude: 16.3738 },
      { name: 'Graz', slug: 'graz', population: 291000, latitude: 47.0707, longitude: 15.4395 },
    ],
  },
  {
    country: 'Switzerland',
    countryCode: 'CH',
    cities: [
      { name: 'Zürich', slug: 'zuerich', population: 421000, latitude: 47.3769, longitude: 8.5417 },
      { name: 'Genf', slug: 'genf', population: 201000, latitude: 46.2044, longitude: 6.1432 },
    ],
  },
];

// ==================== HELPER FUNCTIONS ====================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    DE: 'Deutschland',
    AT: 'Österreich',
    CH: 'Schweiz',
    TR: 'Türkiye',
    US: 'USA',
    GB: 'United Kingdom',
    FR: 'France',
    ES: 'Spain',
    IT: 'Italy',
  };
  return countries[code] || code;
}

// ==================== EXPORT ====================

export default {
  detectUserLocation,
  requestPreciseLocation,
  reverseGeocode,
  generateLocationURL,
  parseLocationURL,
  generateLocalizedContent,
  calculateDistance,
  filterByProximity,
  TOP_LOCATIONS,
};
