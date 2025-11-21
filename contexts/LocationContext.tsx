/**
 * Location Context
 * 
 * Globales Standort-Management für die gesamte App
 * Verwaltet den aktuellen Standort des Nutzers
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  detectUserLocation,
  getStoredLocation,
  clearStoredLocation,
  UserLocation,
  userLocationToLocation,
} from '@/lib/locationService';
import { Location } from '@/components/LocationAutocomplete';

interface LocationContextType {
  userLocation: UserLocation | null;
  isDetecting: boolean;
  error: string | null;
  detectLocation: () => Promise<void>;
  setManualLocation: (location: Location) => void;
  clearLocation: () => void;
  hasLocation: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Beim App-Start: Lade gespeicherten Standort
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      console.log('📍 Gespeicherter Standort geladen:', stored);
      setUserLocation(stored);
    }
  }, []);

  /**
   * Erkenne Standort (GPS oder IP)
   */
  const detectLocation = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      const location = await detectUserLocation();
      
      if (location) {
        setUserLocation(location);
        console.log('✅ Standort erkannt:', location);
      } else {
        setError('Standort konnte nicht erkannt werden');
        console.log('⚠️ Standort-Erkennung fehlgeschlagen');
      }
    } catch (err: any) {
      setError(err.message || 'Fehler bei Standort-Erkennung');
      console.error('❌ Standort-Erkennung Fehler:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  /**
   * Setze manuell gewählten Standort
   */
  const setManualLocation = (location: Location) => {
    const manualLocation: UserLocation = {
      lat: location.lat,
      lon: location.lon,
      city: location.city,
      country: location.country,
      displayName: location.displayName,
      source: 'manual',
      timestamp: Date.now(),
    };

    setUserLocation(manualLocation);
    
    // Speichere auch im localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userLocation', JSON.stringify(manualLocation));
    }
    
    console.log('📍 Manueller Standort gesetzt:', manualLocation);
  };

  /**
   * Lösche aktuellen Standort
   */
  const clearLocation = () => {
    setUserLocation(null);
    clearStoredLocation();
    console.log('🗑️ Standort gelöscht');
  };

  const value: LocationContextType = {
    userLocation,
    isDetecting,
    error,
    detectLocation,
    setManualLocation,
    clearLocation,
    hasLocation: userLocation !== null,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Hook zum Zugriff auf Location-Context
 */
export function useLocation() {
  const context = useContext(LocationContext);
  
  if (context === undefined) {
    throw new Error('useLocation muss innerhalb von LocationProvider verwendet werden');
  }
  
  return context;
}

/**
 * Hook für Location im Format der LocationAutocomplete-Komponente
 */
export function useLocationAsAutocomplete(): Location | null {
  const { userLocation } = useLocation();
  
  if (!userLocation) {
    return null;
  }
  
  return userLocationToLocation(userLocation);
}
