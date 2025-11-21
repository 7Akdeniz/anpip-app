/**
 * Enhanced GEO Service with Schema.org Integration
 * Optimiert für lokales SEO und AI-Crawling
 */

import { generateLocalBusinessSchema } from './seo';

export interface GeoLocation {
  lat: number;
  lon: number;
  city: string;
  country: string;
  countryCode: string;
  state?: string;
  displayName: string;
  postalCode?: string;
  street?: string;
  houseNumber?: string;
}

export interface GeoMetadata {
  position: string; // "lat,lon"
  placename: string;
  region: string; // ISO 3166-2 format (e.g., "DE-BE" for Berlin)
  schema: object; // LocalBusiness Schema
}

/**
 * Berechnet die Distanz zwischen zwei Koordinaten (Haversine-Formel)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Erdradius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Auf 1 Dezimalstelle runden
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Standort per Browser Geolocation API ermitteln
 */
export async function getBrowserLocation(): Promise<GeoLocation | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse Geocoding
          const location = await reverseGeocode(latitude, longitude);
          resolve(location);
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          resolve(null);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 Minuten Cache
      }
    );
  });
}

/**
 * Standort per IP-Adresse ermitteln (Fallback)
 */
export async function getIPLocation(): Promise<GeoLocation | null> {
  try {
    const response = await fetch('/api/location/ip');
    if (!response.ok) throw new Error('IP location failed');
    
    const data = await response.json();
    return {
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      country: data.country,
      countryCode: data.country_code,
      state: data.region,
      displayName: `${data.city}, ${data.country}`,
    };
  } catch (error) {
    console.error('IP location error:', error);
    return null;
  }
}

/**
 * Reverse Geocoding - Koordinaten zu Adresse
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation | null> {
  try {
    const response = await fetch(`/api/location/reverse?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Reverse geocoding failed');
    
    const data = await response.json();
    return {
      lat,
      lon,
      city: data.city,
      country: data.country,
      countryCode: data.country_code,
      state: data.state,
      displayName: data.display_name,
      postalCode: data.postcode,
      street: data.road,
      houseNumber: data.house_number,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Generiert GEO-Metadaten für SEO
 */
export function generateGeoMetadata(location: GeoLocation): GeoMetadata {
  const position = `${location.lat},${location.lon}`;
  const placename = `${location.city}, ${location.country}`;
  
  // ISO 3166-2 Region Code
  const region = `${location.countryCode}${location.state ? `-${location.state}` : ''}`;
  
  // LocalBusiness Schema für lokales SEO
  const schema = generateLocalBusinessSchema(
    'Anpip Market',
    location.city,
    location.country,
    location.lat,
    location.lon
  );

  return {
    position,
    placename,
    region,
    schema,
  };
}

/**
 * Formatiert Distanz für Anzeige
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  } else if (km < 10) {
    return `${km.toFixed(1)}km`;
  } else {
    return `${Math.round(km)}km`;
  }
}

/**
 * Prüft ob Standort in bestimmter Stadt/Land ist
 */
export function isInLocation(
  userLocation: GeoLocation,
  targetCity?: string,
  targetCountry?: string
): boolean {
  if (targetCountry && userLocation.countryCode !== targetCountry) {
    return false;
  }
  
  if (targetCity && userLocation.city.toLowerCase() !== targetCity.toLowerCase()) {
    return false;
  }
  
  return true;
}

/**
 * Sortiert Items nach Distanz zum Nutzer
 */
export function sortByDistance<T extends { location_lat?: number; location_lon?: number }>(
  items: T[],
  userLocation: GeoLocation
): T[] {
  return items
    .map(item => ({
      ...item,
      distance: item.location_lat && item.location_lon
        ? calculateDistance(userLocation.lat, userLocation.lon, item.location_lat, item.location_lon)
        : 99999,
    }))
    .sort((a, b) => (a.distance || 99999) - (b.distance || 99999));
}

/**
 * Filtert Items innerhalb eines Radius (in km)
 */
export function filterByRadius<T extends { location_lat?: number; location_lon?: number }>(
  items: T[],
  userLocation: GeoLocation,
  radiusKm: number
): T[] {
  return items.filter(item => {
    if (!item.location_lat || !item.location_lon) return false;
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lon,
      item.location_lat,
      item.location_lon
    );
    
    return distance <= radiusKm;
  });
}

/**
 * Generiert GEO-URL für Standort-spezifische Seiten
 */
export function generateGeoURL(city: string, country?: string): string {
  const citySlug = city.toLowerCase().replace(/\s+/g, '-');
  const countrySlug = country?.toLowerCase().replace(/\s+/g, '-');
  
  return `/market/${countrySlug ? `${countrySlug}/` : ''}${citySlug}`;
}

/**
 * Extrahiert Standort aus URL
 */
export function parseGeoURL(pathname: string): { city?: string; country?: string } | null {
  const match = pathname.match(/\/market\/(?:([^/]+)\/)?([^/]+)/);
  
  if (!match) return null;
  
  return {
    country: match[1]?.replace(/-/g, ' '),
    city: match[2]?.replace(/-/g, ' '),
  };
}
