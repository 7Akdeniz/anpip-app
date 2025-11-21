/**
 * 🌍 AUTOMATIC LANGUAGE DETECTION
 * 
 * Erkennt automatisch die Sprache basierend auf:
 * 1. GEO-Standort
 * 2. Browser/System-Sprache
 * 3. IP-Adresse (Fallback)
 */

import { LANGUAGES } from './languages';

// Länder → Sprachen Mapping
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  // Europa
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  GB: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en',
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  IT: 'it', SM: 'it', VA: 'it',
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
  NL: 'nl', SR: 'nl',
  PL: 'pl',
  RU: 'ru', BY: 'ru', KZ: 'ru',
  UA: 'uk',
  CZ: 'cs', SK: 'cs',
  RO: 'ro', MD: 'ro',
  GR: 'el', CY: 'el',
  
  // Asien
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
  IN: 'hi', // Kann auch gu, kn, ml, mr, pa, ta, te sein
  JP: 'ja',
  KR: 'ko',
  VN: 'vi',
  TH: 'th',
  ID: 'id',
  MY: 'ms',
  PH: 'fil',
  MM: 'my',
  BD: 'bn',
  PK: 'ur',
  AF: 'fa',
  IR: 'fa',
  IQ: 'ar', SY: 'ar', JO: 'ar', LB: 'ar',
  SA: 'ar', AE: 'ar', KW: 'ar', QA: 'ar', BH: 'ar', OM: 'ar', YE: 'ar',
  EG: 'ar', LY: 'ar', TN: 'ar', DZ: 'ar', MA: 'ar',
  IL: 'he',
  TR: 'tr', AZ: 'az',
  
  // Afrika
  ET: 'am',
  SO: 'so',
  KE: 'sw', TZ: 'sw', UG: 'sw',
  ZA: 'zu',
  NG: 'ha', // Kann auch yo sein
  
  // Andere
  NP: 'ne',
  LK: 'si',
};

export interface DetectedLanguage {
  code: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'geo' | 'browser' | 'ip' | 'default';
}

export class LanguageDetectionService {
  
  /**
   * 🌍 Automatische Sprach-Erkennung
   */
  async detectLanguage(): Promise<DetectedLanguage> {
    // 1. Versuche GEO-Location
    const geoLanguage = await this.detectFromGeo();
    if (geoLanguage) return geoLanguage;
    
    // 2. Browser/System-Sprache
    const browserLanguage = this.detectFromBrowser();
    if (browserLanguage) return browserLanguage;
    
    // 3. Default: Deutsch
    return {
      code: 'de',
      confidence: 'low',
      source: 'default',
    };
  }
  
  /**
   * 📍 GEO-basierte Erkennung
   */
  private async detectFromGeo(): Promise<DetectedLanguage | null> {
    try {
      // IP-basierte GEO-Location (kostenlos via ipapi.co)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const countryCode = data.country_code;
      const languageCode = COUNTRY_LANGUAGE_MAP[countryCode];
      
      if (languageCode) {
        return {
          code: languageCode,
          confidence: 'high',
          source: 'geo',
        };
      }
      
      // Fallback: Browser-Sprache aus dem Land
      if (data.languages) {
        const firstLang = data.languages.split(',')[0].split('-')[0];
        const exists = LANGUAGES.find(l => l.code === firstLang);
        if (exists) {
          return {
            code: firstLang,
            confidence: 'medium',
            source: 'geo',
          };
        }
      }
    } catch (error) {
      console.warn('GEO detection failed:', error);
    }
    
    return null;
  }
  
  /**
   * 🌐 Browser-basierte Erkennung
   */
  private detectFromBrowser(): DetectedLanguage | null {
    try {
      // Browser-Sprache holen
      const browserLang = 
        navigator.language || 
        (navigator as any).userLanguage || 
        'de';
      
      // Extract language code (z.B. "de-DE" → "de")
      const langCode = browserLang.split('-')[0].toLowerCase();
      
      // Prüfe ob Sprache unterstützt wird
      const exists = LANGUAGES.find(l => l.code === langCode);
      
      if (exists) {
        return {
          code: langCode,
          confidence: 'medium',
          source: 'browser',
        };
      }
    } catch (error) {
      console.warn('Browser detection failed:', error);
    }
    
    return null;
  }
  
  /**
   * 🔍 Sprache für bestimmtes Land vorschlagen
   */
  suggestLanguageForCountry(countryCode: string): string {
    return COUNTRY_LANGUAGE_MAP[countryCode.toUpperCase()] || 'en';
  }
}

export const languageDetector = new LanguageDetectionService();
