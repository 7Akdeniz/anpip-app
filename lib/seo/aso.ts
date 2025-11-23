/**
 * APP STORE OPTIMIZATION (ASO)
 * Optimierung für iOS App Store & Google Play Store
 * App.json Metadata, Keywords, Screenshots, Ratings
 */

export interface AppStoreMetadata {
  name: string;
  subtitle?: string;
  description: string;
  keywords: string[];
  promotional_text?: string;
  whats_new?: string;
  support_url?: string;
  marketing_url?: string;
  privacy_url?: string;
  category: {
    primary: string;
    secondary?: string;
  };
}

/**
 * iOS App Store Metadata (Deutsch)
 */
export const APP_STORE_METADATA_DE: AppStoreMetadata = {
  name: 'Anpip - Video & Market',
  subtitle: 'Entdecke Videos & lokale Deals',
  description: `
Anpip ist DIE moderne Video-Plattform für 9:16 Videos, Live-Streaming und lokale Angebote.

🎥 VIDEO FEED
• Endlos-Feed mit viralen Videos
• 9:16 Format perfekt für Smartphone
• Like, Comment, Share, Duett
• Personalisierter "For You" Feed

🛍️ MARKET
• Lokale Angebote als Video
• Produkte in deiner Stadt
• Direkt chatten & kaufen
• Geo-optimierte Suche

✨ FEATURES
• Live-Streaming
• Duett-Videos erstellen
• Video-Upload in Sekunden
• AR-Filter & Effekte
• Hashtag & Category-Suche
• Multi-Language (DE, EN, TR, AR)

🌍 GLOBAL & LOKAL
• Weltweite Community
• Lokale Inhalte aus deiner Stadt
• Geo-Targeting
• Sprachen: Deutsch, English, Türkçe, العربية

📱 CREATOR TOOLS
• Video-Editor
• Analytics Dashboard
• Monetarisierung
• Verified Badge

Jetzt kostenlos downloaden und Teil der Anpip-Community werden!
  `.trim(),
  keywords: [
    'video',
    'social media',
    'tiktok',
    'short videos',
    'market',
    'marketplace',
    'local deals',
    'live streaming',
    'duet videos',
    '9:16',
    'viral',
    'trending',
    'creator',
    'feed',
    'social network',
    'community',
    'shopping',
    'local',
    'geo',
    'berlin',
    'deutschland',
    'instagram',
    'youtube',
    'snapchat',
    'reels'
  ],
  promotional_text: 'Entdecke virale Videos und lokale Deals in deiner Stadt! Die modernste Social Video Plattform 2025.',
  whats_new: `
🎉 Version 2.0 ist da!

✨ Neues Design - Noch schneller & schöner
🛍️ Market Modul - Lokale Angebote als Video
🌍 Geo-Targeting - Inhalte aus deiner Stadt
🎨 AR-Filter - Kreative Effekte
📊 Analytics - Für Creator
🔥 Performance - 2x schneller

Bug Fixes & Verbesserungen
  `.trim(),
  support_url: 'https://anpip.com/support',
  marketing_url: 'https://anpip.com',
  privacy_url: 'https://anpip.com/privacy',
  category: {
    primary: 'Social Networking',
    secondary: 'Photo & Video'
  }
};

/**
 * Google Play Store Metadata (Deutsch)
 */
export const PLAY_STORE_METADATA_DE = {
  ...APP_STORE_METADATA_DE,
  short_description: 'Anpip - Social Video Plattform für 9:16 Videos, Live-Streaming & lokale Angebote. Entdecke deine Stadt!',
  full_description: `
Anpip - Die modernste Social Video Plattform 2025

🎥 VIDEO FEED
Entdecke endlos virale Videos im "For You" Feed. 9:16 Format perfekt für dein Smartphone. Like, kommentiere, teile und erstelle Duett-Videos mit deinen Lieblings-Creators.

🛍️ ANPIP MARKET
Kaufe & verkaufe lokal! Präsentiere deine Produkte als kurzes Video. Finde Angebote in deiner Stadt. Von Elektronik über Mode bis Dienstleistungen - alles als Video.

✨ TOP FEATURES
• Endlos-Feed mit personalisierten Videos
• Live-Streaming direkt aus der App
• Duett-Videos erstellen
• Video-Upload in Sekunden
• AR-Filter & Effekte
• Hashtag-Suche
• Category-Browser
• Geo-optimierte Inhalte
• Multi-Language Support

🌍 GLOBAL & LOKAL
Weltweite Community, lokale Inhalte. Entdecke Videos aus deiner Stadt oder der ganzen Welt. Geo-Targeting zeigt dir relevante Inhalte aus deiner Umgebung.

📱 FÜR CREATOR
• Einfacher Video-Editor
• Analytics Dashboard
• Monetarisierung möglich
• Verified Badge
• Creator-Community

🎯 KATEGORIEN
• Trending
• Musik & Dance
• Comedy
• Food
• Fashion & Beauty
• Gaming
• Sports
• Travel
• Tech
• und viele mehr!

🌐 SPRACHEN
• Deutsch
• English
• Türkçe
• العربية (Arabisch)
• Español
• Français

💡 WARUM ANPIP?
• Schneller als andere Plattformen
• Fokus auf lokale Inhalte
• Market-Integration
• Privacy-First
• Made in Germany
• KI-optimiert
• Community-getrieben

📥 JETZT DOWNLOADEN
Werde Teil der Anpip-Community und entdecke eine neue Art von Social Media!

🔒 DATENSCHUTZ
Deine Daten gehören dir. Made in Germany, DSGVO-konform.

📞 SUPPORT
Fragen? support@anpip.com

🌟 BEWERTE UNS
Dein Feedback hilft uns besser zu werden!
  `.trim(),
  category: 'Social',
  content_rating: 'Everyone'
};

/**
 * Generiert optimierte App.json für Expo
 */
export function generateOptimizedAppJson() {
  return {
    "expo": {
      "name": "Anpip - Share Your Moments",
      "slug": "anpip",
      "description": "Social Video Platform für 9:16 Videos, Live-Streaming & lokale Angebote",
      "version": "2.0.0",
      "orientation": "portrait",
      "icon": "./assets/images/icon.png",
      "scheme": "anpip",
      "userInterfaceStyle": "automatic",
      "primaryColor": "#9C27B0",
      
      "ios": {
        "bundleIdentifier": "com.anpip.app",
        "buildNumber": "1",
        "supportsTablet": true,
        "associatedDomains": [
          "applinks:anpip.com",
          "applinks:www.anpip.com"
        ],
        "config": {
          "usesNonExemptEncryption": false
        },
        "infoPlist": {
          "NSCameraUsageDescription": "Anpip benötigt Zugriff auf deine Kamera, um Videos aufzunehmen und zu teilen.",
          "NSMicrophoneUsageDescription": "Anpip benötigt Zugriff auf dein Mikrofon für Videos und Live-Streaming.",
          "NSPhotoLibraryUsageDescription": "Anpip benötigt Zugriff auf deine Fotos, um Videos hochzuladen.",
          "NSLocationWhenInUseUsageDescription": "Anpip nutzt deinen Standort, um dir lokale Inhalte zu zeigen.",
          "UIBackgroundModes": ["audio", "fetch", "remote-notification"]
        }
      },
      
      "android": {
        "package": "com.anpip.app",
        "versionCode": 1,
        "adaptiveIcon": {
          "foregroundImage": "./assets/images/adaptive-icon.png",
          "backgroundColor": "#9C27B0"
        },
        "permissions": [
          "CAMERA",
          "RECORD_AUDIO",
          "READ_EXTERNAL_STORAGE",
          "WRITE_EXTERNAL_STORAGE",
          "ACCESS_FINE_LOCATION",
          "ACCESS_COARSE_LOCATION",
          "INTERNET",
          "ACCESS_NETWORK_STATE"
        ],
        "intentFilters": [
          {
            "action": "VIEW",
            "data": {
              "scheme": "https",
              "host": "anpip.com"
            },
            "category": ["BROWSABLE", "DEFAULT"]
          }
        ]
      },
      
      "web": {
        "bundler": "metro",
        "output": "static",
        "favicon": "./assets/images/favicon.png",
        "name": "Anpip - Social Video Platform",
        "shortName": "Anpip",
        "description": "Social Video Plattform für 9:16 Videos & lokale Angebote",
        "themeColor": "#9C27B0",
        "backgroundColor": "#000000",
        "lang": "de-DE",
        "scope": "/",
        "startUrl": "/?source=pwa",
        "display": "standalone"
      },
      
      "plugins": [
        "expo-router",
        "expo-audio",
        "expo-video",
        "expo-camera",
        "expo-location"
      ],
      
      "extra": {
        "eas": {
          "projectId": "your-project-id"
        }
      }
    }
  };
}

/**
 * App Store Keywords Strategy (100 Zeichen Limit iOS)
 */
export const APP_STORE_KEYWORDS_STRATEGY = {
  primary: [
    'video',
    'social',
    'tiktok',
    'market',
    'local',
    'live',
    'streaming',
    'duet'
  ],
  secondary: [
    'viral',
    'trending',
    'creator',
    'feed',
    'shopping',
    'deals',
    'community',
    'geo'
  ],
  // Kombiniere zu 100 Zeichen
  optimized: 'video,social,tiktok,market,local,live,streaming,duet,viral,trending,creator,feed,shopping,deals'
};

/**
 * Play Store Keywords Strategy (Unbegrenzt, aber relevant)
 */
export const PLAY_STORE_KEYWORDS = [
  // Primär
  'video app',
  'social media',
  'tiktok alternative',
  'short videos',
  'video feed',
  'social network',
  
  // Market
  'marketplace',
  'local deals',
  'buy sell',
  'local shopping',
  'video shopping',
  
  // Features
  'live streaming',
  'duet videos',
  'video editor',
  'ar filters',
  'video effects',
  
  // Geo
  'local videos',
  'city videos',
  'berlin videos',
  'deutschland',
  
  // Competitor
  'like tiktok',
  'like instagram',
  'like youtube shorts',
  'like snapchat',
  
  // Language
  'deutsch',
  'german',
  'turkish',
  'arabic'
];

/**
 * Screenshot-Strategien für ASO
 */
export const SCREENSHOT_STRATEGY = {
  ios: {
    count: 10, // Max 10
    sizes: {
      'iPhone 6.7"': '1290x2796',
      'iPhone 6.5"': '1284x2778',
      'iPad 12.9"': '2048x2732'
    },
    captions: [
      '📱 Entdecke virale Videos',
      '🛍️ Lokale Angebote als Video',
      '🎥 Live-Streaming',
      '✨ AR-Filter & Effekte',
      '📊 Creator Analytics',
      '🌍 Multi-Language',
      '💬 Chat & Community',
      '🎨 Video-Editor'
    ]
  },
  android: {
    count: 8, // Max 8
    sizes: {
      'Phone': '1080x1920',
      'Tablet 7"': '1200x1920',
      'Tablet 10"': '1536x2048'
    },
    captions: [
      '📱 9:16 Video Feed',
      '🛍️ Market - Kaufe lokal',
      '🎥 Live Streaming',
      '✨ Duett-Videos',
      '🌍 Geo-optimiert',
      '💬 Community',
      '📊 Analytics',
      '🎨 AR-Filter'
    ]
  }
};

/**
 * App Preview Video Script (15-30 Sekunden)
 */
export const APP_PREVIEW_SCRIPT = `
[0-3s] Logo-Animation + "Anpip - Share Your Moments"
[3-8s] Feed durchscrollen - virale Videos zeigen
[8-12s] Market-Feature - lokale Angebote
[12-16s] Live-Streaming Demo
[16-20s] Duett-Video erstellen
[20-25s] Community-Features (Like, Comment, Share)
[25-30s] CTA: "Jetzt kostenlos downloaden!"
`;

/**
 * ASO A/B Testing Varianten
 */
export const ASO_AB_TESTS = {
  title: [
    'Anpip - Video & Market',
    'Anpip: Social Video App',
    'Anpip - Videos & Deals'
  ],
  subtitle: [
    'Videos & lokale Angebote',
    'Social Video Plattform',
    'Entdecke deine Stadt'
  ],
  icon: [
    'purple-gradient',
    'solid-purple',
    'multi-color'
  ]
};
