/**
 * i18n CONTEXT - Sprach-Management
 * 
 * Verwaltet die aktuelle Sprache der App
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { de } from './translations/de';
import { en } from './translations/en';
import { DEFAULT_LANGUAGE } from './languages';

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
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState(DEFAULT_LANGUAGE);

  const t = translations[locale] || translations['en'];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
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
