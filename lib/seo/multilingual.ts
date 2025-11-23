/**
 * MULTILINGUAL SEO ENGINE
 * i18n-Optimierung für DE, EN, TR, AR
 * Hreflang Tags, RTL-Support, lokalisierte URLs
 */

export type SupportedLanguage = 'de' | 'en' | 'tr' | 'ar' | 'es' | 'fr';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  locale: string;
  currency: string;
  dateFormat: string;
}

export const languages: Record<SupportedLanguage, LanguageConfig> = {
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    locale: 'de-DE',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    locale: 'en-US',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    direction: 'ltr',
    locale: 'tr-TR',
    currency: 'TRY',
    dateFormat: 'DD.MM.YYYY'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    locale: 'ar-SA',
    currency: 'SAR',
    dateFormat: 'DD/MM/YYYY'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    locale: 'es-ES',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    locale: 'fr-FR',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY'
  }
};

/**
 * Generiert hreflang Tags für alle Sprachen
 */
export function generateHreflangTags(path: string): string[] {
  const baseUrl = 'https://anpip.com';
  
  const tags = Object.values(languages).map(lang => {
    const url = lang.code === 'de' 
      ? `${baseUrl}${path}` 
      : `${baseUrl}/${lang.code}${path}`;
    
    return `<link rel="alternate" hreflang="${lang.code}" href="${url}" />`;
  });
  
  // x-default für Deutsch
  tags.push(`<link rel="alternate" hreflang="x-default" href="${baseUrl}${path}" />`);
  
  return tags;
}

/**
 * Generiert lokalisierte Meta Tags
 */
export function generateLocalizedMetaTags(
  lang: SupportedLanguage,
  title: string,
  description: string
): Record<string, string> {
  const config = languages[lang];
  
  return {
    'html:lang': config.code,
    'html:dir': config.direction,
    'og:locale': config.locale,
    'og:title': title,
    'og:description': description,
    'twitter:title': title,
    'twitter:description': description
  };
}

/**
 * Generiert lokalisierte Sitemap
 */
export function generateMultilingualSitemap(paths: string[]): string {
  const baseUrl = 'https://anpip.com';
  
  const urls = paths.flatMap(path => {
    // Haupt-URL (Deutsch)
    const mainUrl = {
      loc: `${baseUrl}${path}`,
      alternates: Object.values(languages).map(lang => ({
        hreflang: lang.code,
        href: lang.code === 'de' 
          ? `${baseUrl}${path}` 
          : `${baseUrl}/${lang.code}${path}`
      }))
    };
    
    return mainUrl;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
${url.alternates.map(alt => 
    `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`
  ).join('\n')}
  </url>`).join('\n')}
</urlset>`;
}

/**
 * Lokalisierte Keywords für SEO
 */
export const localizedKeywords: Record<SupportedLanguage, {
  videoFeed: string[];
  market: string[];
  explore: string[];
  upload: string[];
}> = {
  de: {
    videoFeed: ['video feed', 'kurze videos', 'social media', 'tiktok alternative', 'viral videos', '9:16 videos'],
    market: ['marketplace', 'lokale angebote', 'video markt', 'deals', 'schnäppchen', 'verkaufen'],
    explore: ['entdecken', 'trending', 'beliebt', 'hashtags', 'kategorien', 'creator'],
    upload: ['video hochladen', 'video erstellen', 'content creator', 'video teilen', 'upload']
  },
  en: {
    videoFeed: ['video feed', 'short videos', 'social media', 'tiktok alternative', 'viral videos', '9:16 videos'],
    market: ['marketplace', 'local deals', 'video market', 'offers', 'bargains', 'sell'],
    explore: ['explore', 'trending', 'popular', 'hashtags', 'categories', 'creators'],
    upload: ['upload video', 'create video', 'content creator', 'share video', 'upload']
  },
  tr: {
    videoFeed: ['video akışı', 'kısa videolar', 'sosyal medya', 'tiktok alternatifi', 'viral videolar', '9:16 video'],
    market: ['pazar yeri', 'yerel teklifler', 'video pazar', 'indirimler', 'fırsatlar', 'satış'],
    explore: ['keşfet', 'trend', 'popüler', 'etiketler', 'kategoriler', 'içerik üreticileri'],
    upload: ['video yükle', 'video oluştur', 'içerik üretici', 'video paylaş', 'yükle']
  },
  ar: {
    videoFeed: ['موجز فيديو', 'فيديوهات قصيرة', 'وسائل التواصل', 'بديل تيك توك', 'فيديوهات فيرال', 'فيديو 9:16'],
    market: ['سوق', 'عروض محلية', 'سوق الفيديو', 'عروض', 'صفقات', 'بيع'],
    explore: ['استكشف', 'رائج', 'شائع', 'هاشتاج', 'فئات', 'منشئو المحتوى'],
    upload: ['رفع فيديو', 'إنشاء فيديو', 'منشئ محتوى', 'مشاركة فيديو', 'رفع']
  },
  es: {
    videoFeed: ['feed de videos', 'videos cortos', 'redes sociales', 'alternativa tiktok', 'videos virales', 'videos 9:16'],
    market: ['mercado', 'ofertas locales', 'mercado de videos', 'ofertas', 'gangas', 'vender'],
    explore: ['explorar', 'tendencias', 'popular', 'hashtags', 'categorías', 'creadores'],
    upload: ['subir video', 'crear video', 'creador de contenido', 'compartir video', 'subir']
  },
  fr: {
    videoFeed: ['fil vidéo', 'vidéos courtes', 'réseaux sociaux', 'alternative tiktok', 'vidéos virales', 'vidéos 9:16'],
    market: ['marché', 'offres locales', 'marché vidéo', 'offres', 'bonnes affaires', 'vendre'],
    explore: ['explorer', 'tendances', 'populaire', 'hashtags', 'catégories', 'créateurs'],
    upload: ['télécharger vidéo', 'créer vidéo', 'créateur de contenu', 'partager vidéo', 'télécharger']
  }
};

/**
 * Übersetzt Video-Titel für SEO (automatisch)
 */
export function localizeVideoTitle(
  title: string,
  targetLang: SupportedLanguage,
  category?: string
): string {
  // Fügt Sprach-Suffix hinzu falls nötig
  const config = languages[targetLang];
  
  // Kategorie-Übersetzungen
  const categoryTranslations: Record<string, Record<SupportedLanguage, string>> = {
    'Food': { de: 'Essen', en: 'Food', tr: 'Yemek', ar: 'طعام', es: 'Comida', fr: 'Nourriture' },
    'Fashion': { de: 'Mode', en: 'Fashion', tr: 'Moda', ar: 'موضة', es: 'Moda', fr: 'Mode' },
    'Music': { de: 'Musik', en: 'Music', tr: 'Müzik', ar: 'موسيقى', es: 'Música', fr: 'Musique' },
    'Sports': { de: 'Sport', en: 'Sports', tr: 'Spor', ar: 'رياضة', es: 'Deportes', fr: 'Sports' },
    'Gaming': { de: 'Gaming', en: 'Gaming', tr: 'Oyun', ar: 'ألعاب', es: 'Juegos', fr: 'Jeux' },
    'Beauty': { de: 'Beauty', en: 'Beauty', tr: 'Güzellik', ar: 'جمال', es: 'Belleza', fr: 'Beauté' }
  };
  
  let localizedTitle = title;
  
  if (category && categoryTranslations[category]) {
    const translatedCategory = categoryTranslations[category][targetLang];
    localizedTitle = `${title} - ${translatedCategory}`;
  }
  
  return localizedTitle;
}

/**
 * Generiert Language Switcher HTML
 */
export function generateLanguageSwitcher(currentLang: SupportedLanguage, currentPath: string): string {
  const baseUrl = 'https://anpip.com';
  
  return `
<div class="language-switcher" dir="${languages[currentLang].direction}">
  ${Object.values(languages).map(lang => {
    const url = lang.code === 'de' 
      ? `${baseUrl}${currentPath}` 
      : `${baseUrl}/${lang.code}${currentPath}`;
    
    const isActive = lang.code === currentLang;
    
    return `<a 
      href="${url}" 
      class="lang-link ${isActive ? 'active' : ''}"
      hreflang="${lang.code}"
      lang="${lang.code}"
    >
      ${lang.nativeName}
    </a>`;
  }).join('\n  ')}
</div>
  `.trim();
}

/**
 * RTL-Support für Arabisch
 */
export function getRTLStyles(lang: SupportedLanguage): string {
  if (languages[lang].direction === 'rtl') {
    return `
      html[lang="${lang}"] {
        direction: rtl;
      }
      
      html[lang="${lang}"] .text-left {
        text-align: right;
      }
      
      html[lang="${lang}"] .text-right {
        text-align: left;
      }
      
      html[lang="${lang}"] .ml-auto {
        margin-right: auto;
        margin-left: 0;
      }
      
      html[lang="${lang}"] .mr-auto {
        margin-left: auto;
        margin-right: 0;
      }
    `;
  }
  
  return '';
}

/**
 * Generiert lokalisierte Open Graph Tags
 */
export function generateLocalizedOGTags(
  lang: SupportedLanguage,
  title: string,
  description: string,
  imageUrl: string,
  path: string
): Record<string, string> {
  const baseUrl = 'https://anpip.com';
  const config = languages[lang];
  const url = lang === 'de' ? `${baseUrl}${path}` : `${baseUrl}/${lang}${path}`;
  
  return {
    'og:locale': config.locale,
    'og:title': title,
    'og:description': description,
    'og:image': imageUrl,
    'og:url': url,
    'og:type': 'website',
    'og:site_name': 'Anpip',
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': imageUrl
  };
}

/**
 * Auto-Detect Browser Language
 */
export function detectBrowserLanguage(): SupportedLanguage {
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  
  if (Object.keys(languages).includes(browserLang)) {
    return browserLang;
  }
  
  return 'de'; // Default Deutsch
}

/**
 * Generiert SEO-freundliche URLs pro Sprache
 */
export function generateLocalizedUrl(
  path: string,
  lang: SupportedLanguage,
  params?: Record<string, string>
): string {
  const baseUrl = 'https://anpip.com';
  const prefix = lang === 'de' ? '' : `/${lang}`;
  
  let url = `${baseUrl}${prefix}${path}`;
  
  if (params) {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }
  
  return url;
}
