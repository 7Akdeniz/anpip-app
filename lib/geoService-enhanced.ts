/**
 * GEO-SERVICE - Erweitert
 * 
 * Features:
 * - Auto-Location-Detection
 * - Nächste Stadt finden
 * - GEO-basierter Video-Feed
 * - Lokale Kategorien
 * - Stadt-Landingpages
 */

import { supabase } from './supabase';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface City {
  id: string;
  name: string;
  nameAscii: string;
  slug: string;
  countryId: string;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
  population: number;
  isFeatured: boolean;
  distance?: number; // in km
}

export interface LocalCategory {
  id: string;
  cityId: string;
  cityName: string;
  citySlug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  videosCount: number;
}

/**
 * Auto-Location-Detection (Browser Geolocation API)
 */
export async function detectUserLocation(): Promise<GeoLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 3600000, // 1 Stunde Cache
      }
    );
  });
}

/**
 * Finde nächste Stadt zu Koordinaten
 */
export async function findNearestCity(location: GeoLocation): Promise<City | null> {
  const { data, error } = await supabase.rpc('find_nearest_city', {
    lat: location.latitude,
    lng: location.longitude,
  });

  if (error || !data || data.length === 0) {
    console.error('Find nearest city error:', error);
    return null;
  }

  return {
    id: data[0].id,
    name: data[0].name,
    nameAscii: data[0].name_ascii,
    slug: data[0].slug,
    countryId: data[0].country_id,
    countryCode: data[0].country_code,
    countryName: data[0].country_name,
    latitude: data[0].latitude,
    longitude: data[0].longitude,
    population: data[0].population,
    isFeatured: data[0].is_featured,
    distance: data[0].distance,
  };
}

/**
 * Hole Stadt nach Slug
 */
export async function getCityBySlug(slug: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('cities')
    .select(`
      *,
      countries (
        code,
        name
      )
    `)
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    nameAscii: data.name_ascii,
    slug: data.slug,
    countryId: data.country_id,
    countryCode: data.countries.code,
    countryName: data.countries.name,
    latitude: data.latitude,
    longitude: data.longitude,
    population: data.population,
    isFeatured: data.is_featured,
  };
}

/**
 * Hole alle Featured Cities
 */
export async function getFeaturedCities(): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select(`
      *,
      countries (
        code,
        name
      )
    `)
    .eq('is_featured', true)
    .order('population', { ascending: false });

  if (error || !data) return [];

  return data.map((city) => ({
    id: city.id,
    name: city.name,
    nameAscii: city.name_ascii,
    slug: city.slug,
    countryId: city.country_id,
    countryCode: city.countries.code,
    countryName: city.countries.name,
    latitude: city.latitude,
    longitude: city.longitude,
    population: city.population,
    isFeatured: city.is_featured,
  }));
}

/**
 * Hole lokale Kategorien für eine Stadt
 */
export async function getLocalCategories(cityId: string): Promise<LocalCategory[]> {
  const { data, error } = await supabase
    .from('local_categories')
    .select(`
      *,
      cities (
        name,
        slug
      ),
      categories (
        name,
        slug
      )
    `)
    .eq('city_id', cityId)
    .gt('videos_count', 0)
    .order('videos_count', { ascending: false });

  if (error || !data) return [];

  return data.map((lc) => ({
    id: lc.id,
    cityId: lc.city_id,
    cityName: lc.cities.name,
    citySlug: lc.cities.slug,
    categoryId: lc.category_id,
    categoryName: lc.categories.name,
    categorySlug: lc.categories.slug,
    videosCount: lc.videos_count,
  }));
}

/**
 * GEO-basierter Video-Feed
 * Zeigt Videos aus der Nähe des Users
 */
export async function getGeoVideoFeed(
  location: GeoLocation,
  radius: number = 50, // km
  limit: number = 20
) {
  const { data, error } = await supabase.rpc('get_geo_video_feed', {
    user_lat: location.latitude,
    user_lng: location.longitude,
    radius_km: radius,
    result_limit: limit,
  });

  if (error) {
    console.error('Geo video feed error:', error);
    return [];
  }

  return data || [];
}

/**
 * Generiere SEO-Landing-Page-Daten
 */
export async function getSEOLandingPage(urlPath: string) {
  const { data, error } = await supabase
    .from('seo_landing_pages')
    .select('*')
    .eq('url_path', urlPath)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Auto-generiere SEO-Text für Stadt/Kategorie
 */
export function generateLocalSEOText(
  cityName: string,
  categoryName?: string,
  videosCount: number = 0
): string {
  if (categoryName) {
    return `
Entdecke ${videosCount > 0 ? videosCount : ''} ${categoryName} Videos aus ${cityName}. 
Lokale Inhalte von echten Menschen aus deiner Region. 
Finde die besten ${categoryName} Videos in ${cityName} und Umgebung. 
Teile deine eigenen Momente und werde Teil der ${cityName} Community.
    `.trim();
  }

  return `
Willkommen in ${cityName}! Entdecke lokale Videos und Momente aus ${cityName}. 
${videosCount > 0 ? `Aktuell ${videosCount} Videos` : 'Sei der Erste'} aus deiner Stadt. 
Teile deine Erlebnisse und verbinde dich mit Menschen aus ${cityName}.
  `.trim();
}

/**
 * Reverse Geocoding (Koordinaten -> Adresse)
 * Nutzt Browser Geocoding API oder externe Services
 */
export async function reverseGeocode(
  location: GeoLocation
): Promise<{ city?: string; country?: string; address?: string } | null> {
  // In Production: Google Maps API, Mapbox, oder OpenStreetMap Nominatim
  // Hier: Simplified mit Nominatim
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      city: data.address.city || data.address.town || data.address.village,
      country: data.address.country,
      address: data.display_name,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
