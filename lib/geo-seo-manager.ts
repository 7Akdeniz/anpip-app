/**
 * GEO-SEO MANAGER für weltweite Sichtbarkeit
 * Multi-Region, Hreflang, lokale Sitemaps
 */

export interface GeoRegion {
  code: string;        // z.B. "de", "us", "es"
  name: string;        // z.B. "Deutschland", "United States"
  language: string;    // z.B. "de-DE", "en-US"
  currency: string;    // z.B. "EUR", "USD"
  timezone: string;    // z.B. "Europe/Berlin"
  hreflang: string;    // z.B. "de-DE", "en-US"
}

export const GEO_REGIONS: GeoRegion[] = [
  { code: 'de', name: 'Deutschland', language: 'de-DE', currency: 'EUR', timezone: 'Europe/Berlin', hreflang: 'de-DE' },
  { code: 'at', name: 'Österreich', language: 'de-AT', currency: 'EUR', timezone: 'Europe/Vienna', hreflang: 'de-AT' },
  { code: 'ch', name: 'Schweiz', language: 'de-CH', currency: 'CHF', timezone: 'Europe/Zurich', hreflang: 'de-CH' },
  { code: 'us', name: 'United States', language: 'en-US', currency: 'USD', timezone: 'America/New_York', hreflang: 'en-US' },
  { code: 'gb', name: 'United Kingdom', language: 'en-GB', currency: 'GBP', timezone: 'Europe/London', hreflang: 'en-GB' },
  { code: 'ca', name: 'Canada', language: 'en-CA', currency: 'CAD', timezone: 'America/Toronto', hreflang: 'en-CA' },
  { code: 'au', name: 'Australia', language: 'en-AU', currency: 'AUD', timezone: 'Australia/Sydney', hreflang: 'en-AU' },
  { code: 'es', name: 'España', language: 'es-ES', currency: 'EUR', timezone: 'Europe/Madrid', hreflang: 'es-ES' },
  { code: 'mx', name: 'México', language: 'es-MX', currency: 'MXN', timezone: 'America/Mexico_City', hreflang: 'es-MX' },
  { code: 'ar', name: 'Argentina', language: 'es-AR', currency: 'ARS', timezone: 'America/Argentina/Buenos_Aires', hreflang: 'es-AR' },
  { code: 'fr', name: 'France', language: 'fr-FR', currency: 'EUR', timezone: 'Europe/Paris', hreflang: 'fr-FR' },
  { code: 'it', name: 'Italia', language: 'it-IT', currency: 'EUR', timezone: 'Europe/Rome', hreflang: 'it-IT' },
  { code: 'nl', name: 'Nederland', language: 'nl-NL', currency: 'EUR', timezone: 'Europe/Amsterdam', hreflang: 'nl-NL' },
  { code: 'pl', name: 'Polska', language: 'pl-PL', currency: 'PLN', timezone: 'Europe/Warsaw', hreflang: 'pl-PL' },
  { code: 'tr', name: 'Türkiye', language: 'tr-TR', currency: 'TRY', timezone: 'Europe/Istanbul', hreflang: 'tr-TR' },
  { code: 'ru', name: 'Россия', language: 'ru-RU', currency: 'RUB', timezone: 'Europe/Moscow', hreflang: 'ru-RU' },
  { code: 'cn', name: '中国', language: 'zh-CN', currency: 'CNY', timezone: 'Asia/Shanghai', hreflang: 'zh-CN' },
  { code: 'jp', name: '日本', language: 'ja-JP', currency: 'JPY', timezone: 'Asia/Tokyo', hreflang: 'ja-JP' },
  { code: 'kr', name: '대한민국', language: 'ko-KR', currency: 'KRW', timezone: 'Asia/Seoul', hreflang: 'ko-KR' },
  { code: 'in', name: 'India', language: 'hi-IN', currency: 'INR', timezone: 'Asia/Kolkata', hreflang: 'hi-IN' },
  { code: 'br', name: 'Brasil', language: 'pt-BR', currency: 'BRL', timezone: 'America/Sao_Paulo', hreflang: 'pt-BR' },
  { code: 'pt', name: 'Portugal', language: 'pt-PT', currency: 'EUR', timezone: 'Europe/Lisbon', hreflang: 'pt-PT' },
  { code: 'se', name: 'Sverige', language: 'sv-SE', currency: 'SEK', timezone: 'Europe/Stockholm', hreflang: 'sv-SE' },
  { code: 'no', name: 'Norge', language: 'no-NO', currency: 'NOK', timezone: 'Europe/Oslo', hreflang: 'no-NO' },
  { code: 'dk', name: 'Danmark', language: 'da-DK', currency: 'DKK', timezone: 'Europe/Copenhagen', hreflang: 'da-DK' },
  { code: 'fi', name: 'Suomi', language: 'fi-FI', currency: 'EUR', timezone: 'Europe/Helsinki', hreflang: 'fi-FI' },
];

/**
 * Generiert Hreflang-Tags für alle Regionen
 */
export function generateHreflangTags(currentPath: string, baseUrl: string = 'https://anpip.com'): string[] {
  const tags: string[] = [];
  
  // Default (x-default)
  tags.push(`<link rel="alternate" hreflang="x-default" href="${baseUrl}${currentPath}" />`);
  
  // Alle Regionen
  GEO_REGIONS.forEach(region => {
    const url = `${baseUrl}${currentPath}?region=${region.code}`;
    tags.push(`<link rel="alternate" hreflang="${region.hreflang}" href="${url}" />`);
  });
  
  return tags;
}

/**
 * Generiert Geo-Meta-Tags für eine Region
 */
export function generateGeoMetaTags(region: GeoRegion, location?: { lat: number; lng: number; placename?: string }) {
  const tags: Record<string, string> = {
    'geo.region': region.code.toUpperCase(),
    'geo.country': region.code.toUpperCase(),
    'content-language': region.language,
  };
  
  if (location) {
    tags['geo.position'] = `${location.lat};${location.lng}`;
    tags['ICBM'] = `${location.lat}, ${location.lng}`;
    if (location.placename) {
      tags['geo.placename'] = location.placename;
    }
  }
  
  return tags;
}

/**
 * Lokalisierte Titel für verschiedene Sprachen
 */
export const LOCALIZED_TITLES = {
  'de-DE': 'Anpip - Die #1 Plattform für vertikale Videos',
  'de-AT': 'Anpip - Die #1 Plattform für vertikale Videos',
  'de-CH': 'Anpip - Die #1 Plattform für vertikale Videos',
  'en-US': 'Anpip - The #1 Platform for Vertical Videos',
  'en-GB': 'Anpip - The #1 Platform for Vertical Videos',
  'en-CA': 'Anpip - The #1 Platform for Vertical Videos',
  'en-AU': 'Anpip - The #1 Platform for Vertical Videos',
  'es-ES': 'Anpip - La plataforma #1 para videos verticales',
  'es-MX': 'Anpip - La plataforma #1 para videos verticales',
  'es-AR': 'Anpip - La plataforma #1 para videos verticales',
  'fr-FR': 'Anpip - La plateforme #1 pour les vidéos verticales',
  'it-IT': 'Anpip - La piattaforma #1 per video verticali',
  'nl-NL': 'Anpip - Het #1 platform voor verticale video\'s',
  'pl-PL': 'Anpip - Platforma #1 dla pionowych filmów',
  'tr-TR': 'Anpip - Dikey videolar için #1 platform',
  'ru-RU': 'Anpip - Платформа #1 для вертикальных видео',
  'zh-CN': 'Anpip - 垂直视频第一平台',
  'ja-JP': 'Anpip - 縦型動画のナンバーワンプラットフォーム',
  'ko-KR': 'Anpip - 세로 동영상 1위 플랫폼',
  'hi-IN': 'Anpip - वर्टिकल वीडियो के लिए #1 प्लेटफॉर्म',
  'pt-BR': 'Anpip - A plataforma #1 para vídeos verticais',
  'pt-PT': 'Anpip - A plataforma #1 para vídeos verticais',
  'sv-SE': 'Anpip - Den #1 plattformen för vertikala videor',
  'no-NO': 'Anpip - Den #1 plattformen for vertikale videoer',
  'da-DK': 'Anpip - Den #1 platform til lodrette videoer',
  'fi-FI': 'Anpip - #1 alusta pystyvideoille',
};

/**
 * Lokalisierte Beschreibungen
 */
export const LOCALIZED_DESCRIPTIONS = {
  'de-DE': 'Entdecke vertikale Videos aus der ganzen Welt. Erstelle, teile und erlebe 9:16 Content auf Anpip.',
  'en-US': 'Discover vertical videos from around the world. Create, share and experience 9:16 content on Anpip.',
  'es-ES': 'Descubre videos verticales de todo el mundo. Crea, comparte y experimenta contenido 9:16 en Anpip.',
  'fr-FR': 'Découvrez des vidéos verticales du monde entier. Créez, partagez et vivez du contenu 9:16 sur Anpip.',
  'it-IT': 'Scopri video verticali da tutto il mondo. Crea, condividi e vivi contenuti 9:16 su Anpip.',
  'nl-NL': 'Ontdek verticale video\'s van over de hele wereld. Creëer, deel en beleef 9:16 content op Anpip.',
  'pl-PL': 'Odkryj pionowe filmy z całego świata. Twórz, udostępniaj i doświadczaj treści 9:16 na Anpip.',
  'tr-TR': 'Dünyanın her yerinden dikey videolar keşfedin. Anpip\'te 9:16 içerik oluşturun, paylaşın ve deneyimleyin.',
  'ru-RU': 'Откройте для себя вертикальные видео со всего мира. Создавайте, делитесь и наслаждайтесь контентом 9:16 на Anpip.',
  'zh-CN': '发现来自世界各地的垂直视频。在Anpip上创建、分享和体验9:16内容。',
  'ja-JP': '世界中の縦型動画を発見。Anpipで9:16コンテンツを作成、共有、体験。',
  'ko-KR': '전 세계의 세로 동영상을 발견하세요. Anpip에서 9:16 콘텐츠를 만들고 공유하고 경험하세요.',
  'hi-IN': 'दुनिया भर के वर्टिकल वीडियो खोजें। Anpip पर 9:16 सामग्री बनाएं, साझा करें और अनुभव करें।',
  'pt-BR': 'Descubra vídeos verticais de todo o mundo. Crie, compartilhe e experimente conteúdo 9:16 no Anpip.',
  'sv-SE': 'Upptäck vertikala videor från hela världen. Skapa, dela och upplev 9:16-innehåll på Anpip.',
  'no-NO': 'Oppdag vertikale videoer fra hele verden. Opprett, del og opplev 9:16-innhold på Anpip.',
  'da-DK': 'Oplev lodrette videoer fra hele verden. Opret, del og oplev 9:16-indhold på Anpip.',
  'fi-FI': 'Löydä pystyvideoita ympäri maailmaa. Luo, jaa ja koe 9:16-sisältöä Anpipissä.',
};

/**
 * Region von User-IP oder Browser-Sprache erkennen
 */
export function detectUserRegion(
  browserLanguage?: string,
  ipCountry?: string
): GeoRegion {
  // Zuerst IP-basierte Region prüfen
  if (ipCountry) {
    const region = GEO_REGIONS.find(r => r.code.toUpperCase() === ipCountry.toUpperCase());
    if (region) return region;
  }
  
  // Dann Browser-Sprache
  if (browserLanguage) {
    const lang = browserLanguage.toLowerCase();
    const region = GEO_REGIONS.find(r => 
      r.language.toLowerCase() === lang || 
      r.language.toLowerCase().startsWith(lang)
    );
    if (region) return region;
  }
  
  // Default: Deutschland
  return GEO_REGIONS[0];
}

/**
 * Generiert lokalisierte Video-URL
 */
export function getLocalizedVideoUrl(
  videoId: string,
  region: GeoRegion,
  baseUrl: string = 'https://anpip.com'
): string {
  return `${baseUrl}/${region.code}/video/${videoId}`;
}

/**
 * Generiert lokalisierte Sitemap-URL
 */
export function getLocalizedSitemapUrl(
  region: GeoRegion,
  baseUrl: string = 'https://anpip.com'
): string {
  return `${baseUrl}/sitemap-${region.code}.xml`;
}

export default {
  GEO_REGIONS,
  generateHreflangTags,
  generateGeoMetaTags,
  LOCALIZED_TITLES,
  LOCALIZED_DESCRIPTIONS,
  detectUserRegion,
  getLocalizedVideoUrl,
  getLocalizedSitemapUrl,
};
