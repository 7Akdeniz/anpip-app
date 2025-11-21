/**
 * i18n CONTEXT - Sprach-Management mit Auto-Erkennung
 * 
 * Verwaltet die aktuelle Sprache der App
 * - Automatische Erkennung via GEO/Browser
 * - Persistierung in AsyncStorage
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { de } from './translations/de';
import { en } from './translations/en';
import { DEFAULT_LANGUAGE } from './languages';
import { languageDetector } from './language-detection';

type TranslationType = typeof de;

const translations: Record<string, TranslationType> = {
  de,
  en,
  // Andere Sprachen nutzen erstmal Englisch als Fallback
  // TODO: Weitere Übersetzungen hinzufügen
};

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: TranslationType;
  isAutoDetected: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = '@anpip:language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(DEFAULT_LANGUAGE);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Automatische Sprach-Erkennung beim Start
  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      // 1. Prüfe ob User bereits manuell eine Sprache gewählt hat
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (savedLanguage) {
        setLocaleState(savedLanguage);
        setIsAutoDetected(false);
      } else {
        // 2. Automatische Erkennung
        const detected = await languageDetector.detectLanguage();
        setLocaleState(detected.code);
        setIsAutoDetected(true);
        
        console.log(`🌍 Auto-detected language: ${detected.code} (${detected.source}, ${detected.confidence})`);
      }
    } catch (error) {
      console.error('Language initialization failed:', error);
      setLocaleState(DEFAULT_LANGUAGE);
    } finally {
      setIsInitialized(true);
    }
  };

  const setLocale = async (newLocale: string) => {
    try {
      setLocaleState(newLocale);
      setIsAutoDetected(false);
      
      // Persistiere manuelle Auswahl
      await AsyncStorage.setItem(STORAGE_KEY, newLocale);
      
      console.log(`🌍 Language changed to: ${newLocale}`);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const t = translations[locale] || translations['en'];

  // Warte bis Sprache initialisiert ist
  if (!isInitialized) {
    return null; // oder Loading-Screen
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isAutoDetected }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
