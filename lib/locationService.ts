/**
 * Location Service
 * 
 * Zentrale Standort-Erkennung für Anpip.com
 * - HTML5 Geolocation API (Browser/App)
 * - Reverse Geocoding via Nominatim
 * - IP-basierter Fallback
 */

import { Location } from '@/components/LocationAutocomplete';

export interface UserLocation {
  lat: number;
  lon: number;
  city: string;
  country: string;
  displayName: string;
  source: 'gps' | 'ip' | 'manual';
  timestamp: number;
}

/**
 * Hauptfunktion: Erkenne Nutzer-Standort
 * 
 * Ablauf:
 * 1. Versuche GPS-basierte Standort-Erkennung
 * 2. Falls fehlgeschlagen → IP-basierter Fallback
 * 3. Speichere Ergebnis im lokalen Storage
 */
export async function detectUserLocation(): Promise<UserLocation | null> {
  try {
    // 1. Versuche GPS-Standort (benötigt User-Erlaubnis)
    const gpsLocation = await getGPSLocation();
    if (gpsLocation) {
      console.log('✅ Standort erkannt via GPS:', gpsLocation);
      saveLocationToStorage(gpsLocation);
      return gpsLocation;
    }
  } catch (error) {
    console.log('⚠️ GPS-Standort fehlgeschlagen:', error);
  }

  try {
    // 2. Fallback: IP-basierte Standort-Erkennung
    const ipLocation = await getIPBasedLocation();
    if (ipLocation) {
      console.log('✅ Standort erkannt via IP:', ipLocation);
      saveLocationToStorage(ipLocation);
      return ipLocation;
    }
  } catch (error) {
    console.error('❌ IP-basierter Standort fehlgeschlagen:', error);
  }

  return null;
}

/**
 * GPS-basierte Standort-Erkennung
 * Nutzt HTML5 Geolocation API
 */
async function getGPSLocation(): Promise<UserLocation | null> {
  // Prüfe ob Geolocation verfügbar ist
  if (!navigator.geolocation) {
    console.log('⚠️ Geolocation API nicht verfügbar');
    return null;
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse Geocoding: lat/lon → Stadt
          const cityInfo = await reverseGeocode(latitude, longitude);
          
          if (cityInfo) {
            resolve({
              lat: latitude,
              lon: longitude,
              city: cityInfo.city,
              country: cityInfo.country,
              displayName: cityInfo.displayName,
              source: 'gps',
              timestamp: Date.now(),
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Reverse Geocoding fehlgeschlagen:', error);
          reject(error);
        }
      },
      (error) => {
        console.log('Geolocation Fehler:', error.message);
        reject(error);
      },
      {
        enableHighAccuracy: false, // false = schneller, weniger genau
        timeout: 10000, // 10 Sekunden max
        maximumAge: 300000, // 5 Minuten Cache
      }
    );
  });
}

/**
 * Reverse Geocoding: Koordinaten → Stadt
 * Nutzt Nominatim API
 */
async function reverseGeocode(lat: number, lon: number): Promise<{
  city: string;
  country: string;
  displayName: string;
} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${lat}&` +
      `lon=${lon}&` +
      `format=json&` +
      `addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Anpip.com App',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Nominatim API Fehler');
    }

    const data = await response.json();
    
    const city = data.address?.city || 
                 data.address?.town || 
                 data.address?.village || 
                 data.address?.municipality || 
                 '';
    
    const country = data.address?.country || '';
    
    if (!city || !country) {
      return null;
    }

    return {
      city,
      country,
      displayName: data.display_name || `${city}, ${country}`,
    };
  } catch (error) {
    console.error('Reverse Geocoding Fehler:', error);
    return null;
  }
}

/**
 * IP-basierte Standort-Erkennung (Fallback)
 * Nutzt Server-API
 */
async function getIPBasedLocation(): Promise<UserLocation | null> {
  try {
    // Rufe unsere Backend-API auf (wird später implementiert)
    const response = await fetch('/api/location/ip');
    
    if (!response.ok) {
      throw new Error('IP-Location API Fehler');
    }

    const data = await response.json();
    
    if (data.city && data.country) {
      return {
        lat: data.lat || 0,
        lon: data.lon || 0,
        city: data.city,
        country: data.country,
        displayName: data.displayName || `${data.city}, ${data.country}`,
        source: 'ip',
        timestamp: Date.now(),
      };
    }

    return null;
  } catch (error) {
    console.error('IP-basierte Location Fehler:', error);
    return null;
  }
}

/**
 * Speichere Standort im lokalen Storage
 */
function saveLocationToStorage(location: UserLocation): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userLocation', JSON.stringify(location));
    }
  } catch (error) {
    console.error('Fehler beim Speichern des Standorts:', error);
  }
}

/**
 * Lade gespeicherten Standort aus Storage
 */
export function getStoredLocation(): UserLocation | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('userLocation');
      if (stored) {
        const location = JSON.parse(stored);
        
        // Prüfe ob Standort nicht zu alt ist (max 24 Stunden)
        const maxAge = 24 * 60 * 60 * 1000; // 24 Stunden
        if (Date.now() - location.timestamp < maxAge) {
          return location;
        } else {
          console.log('⏰ Gespeicherter Standort ist zu alt');
          localStorage.removeItem('userLocation');
        }
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden des Standorts:', error);
  }
  
  return null;
}

/**
 * Lösche gespeicherten Standort
 */
export function clearStoredLocation(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('userLocation');
    }
  } catch (error) {
    console.error('Fehler beim Löschen des Standorts:', error);
  }
}

/**
 * Konvertiere UserLocation zu Location-Format (für LocationAutocomplete)
 */
export function userLocationToLocation(userLocation: UserLocation): Location {
  return {
    id: 0,
    city: userLocation.city,
    country: userLocation.country,
    lat: userLocation.lat,
    lon: userLocation.lon,
    displayName: userLocation.displayName,
  };
}

/**
 * Berechne Distanz zwischen zwei Koordinaten in Kilometern
 * Nutzt Haversine-Formel
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
  
  return Math.round(distance * 10) / 10; // Runde auf 1 Nachkommastelle
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
