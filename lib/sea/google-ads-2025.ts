/**
 * 🎯 GOOGLE ADS OPTIMIZATION 2025
 * 
 * Vollständiges Google Ads Setup für Anpip.com
 * - Kampagnenstruktur
 * - Keyword-Management
 * - Anzeigengruppen
 * - Quality Score Optimization
 * - Conversion Tracking
 * - Landing Page Optimization
 * 
 * @module GoogleAds2025
 */

export interface GoogleAdsConfig {
  accountId: string;
  customerId: string;
  conversionId: string;
  conversionLabel: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  type: 'SEARCH' | 'DISPLAY' | 'VIDEO' | 'SHOPPING' | 'PERFORMANCE_MAX';
  budget: {
    daily: number;
    currency: string;
  };
  targeting: {
    locations: string[];
    languages: string[];
    devices: ('MOBILE' | 'DESKTOP' | 'TABLET')[];
    demographics?: {
      ageRanges?: string[];
      genders?: string[];
    };
  };
  bidding: {
    strategy: 'CPC' | 'CPM' | 'CPA' | 'ROAS' | 'MAXIMIZE_CONVERSIONS';
    amount?: number;
    targetCPA?: number;
    targetROAS?: number;
  };
  schedule?: {
    dayOfWeek: string;
    startHour: number;
    endHour: number;
  }[];
  adGroups: AdGroup[];
}

export interface AdGroup {
  id: string;
  name: string;
  keywords: Keyword[];
  ads: Ad[];
  bid: number;
}

export interface Keyword {
  text: string;
  matchType: 'EXACT' | 'PHRASE' | 'BROAD';
  bid?: number;
  negativeKeyword?: boolean;
  qualityScore?: number;
}

export interface Ad {
  id: string;
  type: 'RESPONSIVE_SEARCH' | 'EXPANDED_TEXT' | 'VIDEO' | 'DISPLAY';
  headlines: string[];
  descriptions: string[];
  finalUrl: string;
  displayUrl?: string;
  callToAction?: string;
  images?: string[];
  videos?: string[];
}

/**
 * Google Ads Manager
 */
export class GoogleAdsManager {
  private config: GoogleAdsConfig;

  constructor(config: GoogleAdsConfig) {
    this.config = config;
  }

  /**
   * 🏗️ Kampagnenstruktur für Anpip
   */
  static getAnpipCampaignStructure(): AdCampaign[] {
    return [
      // 1. BRAND CAMPAIGN
      {
        id: 'campaign-brand',
        name: 'Anpip - Brand',
        type: 'SEARCH',
        budget: {
          daily: 50,
          currency: 'EUR',
        },
        targeting: {
          locations: ['DE', 'AT', 'CH'],
          languages: ['de', 'en'],
          devices: ['MOBILE', 'DESKTOP', 'TABLET'],
        },
        bidding: {
          strategy: 'CPC',
          amount: 0.50,
        },
        adGroups: [
          {
            id: 'ag-brand-exact',
            name: 'Brand - Exact Match',
            bid: 0.50,
            keywords: [
              { text: 'anpip', matchType: 'EXACT' },
              { text: 'anpip app', matchType: 'EXACT' },
              { text: 'anpip.com', matchType: 'EXACT' },
            ],
            ads: [
              {
                id: 'ad-brand-1',
                type: 'RESPONSIVE_SEARCH',
                headlines: [
                  'Anpip - Offizielle Webseite',
                  'Social Video Platform 2025',
                  'Jetzt kostenlos starten',
                ],
                descriptions: [
                  'Teile Videos & lokale Angebote weltweit. Kostenlos registrieren!',
                  'Die moderne Alternative zu TikTok. Live-Streaming, Marketplace & mehr.',
                ],
                finalUrl: 'https://anpip.com/?utm_source=google&utm_medium=cpc&utm_campaign=brand',
                callToAction: 'Jetzt starten',
              },
            ],
          },
        ],
      },

      // 2. GENERIC CAMPAIGN - Social Video
      {
        id: 'campaign-generic-video',
        name: 'Anpip - Social Video',
        type: 'SEARCH',
        budget: {
          daily: 100,
          currency: 'EUR',
        },
        targeting: {
          locations: ['DE', 'AT', 'CH'],
          languages: ['de'],
          devices: ['MOBILE', 'DESKTOP'],
          demographics: {
            ageRanges: ['18-24', '25-34', '35-44'],
          },
        },
        bidding: {
          strategy: 'CPA',
          targetCPA: 5.00,
        },
        adGroups: [
          {
            id: 'ag-video-app',
            name: 'Video App',
            bid: 1.20,
            keywords: [
              { text: 'video app', matchType: 'PHRASE' },
              { text: 'social media app', matchType: 'PHRASE' },
              { text: 'video teilen app', matchType: 'PHRASE' },
              { text: 'kurze videos app', matchType: 'PHRASE' },
              { text: 'tiktok alternative', matchType: 'PHRASE' },
              { text: 'vertical video app', matchType: 'PHRASE' },
            ],
            ads: [
              {
                id: 'ad-video-1',
                type: 'RESPONSIVE_SEARCH',
                headlines: [
                  'Social Video App 2025',
                  'TikTok Alternative',
                  'Kostenlose Video Platform',
                  'Teile kurze Videos',
                  'Jetzt kostenlos testen',
                ],
                descriptions: [
                  'Teile Videos, Momente & lokale Angebote. Live-Streaming, Duett-Videos & mehr.',
                  'Die moderne Social Video Plattform. Kostenlos, ohne Werbung starten.',
                ],
                finalUrl: 'https://anpip.com/?utm_source=google&utm_medium=cpc&utm_campaign=generic-video',
                callToAction: 'Kostenlos starten',
              },
            ],
          },
        ],
      },

      // 3. LOCAL CAMPAIGN
      {
        id: 'campaign-local',
        name: 'Anpip - Local Services',
        type: 'SEARCH',
        budget: {
          daily: 75,
          currency: 'EUR',
        },
        targeting: {
          locations: ['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt'],
          languages: ['de'],
          devices: ['MOBILE'],
        },
        bidding: {
          strategy: 'CPC',
          amount: 0.80,
        },
        adGroups: [
          {
            id: 'ag-local-berlin',
            name: 'Berlin Local',
            bid: 0.80,
            keywords: [
              { text: 'videos berlin', matchType: 'PHRASE' },
              { text: 'lokale angebote berlin', matchType: 'PHRASE' },
              { text: 'marketplace berlin', matchType: 'PHRASE' },
              { text: 'berlin events', matchType: 'PHRASE' },
            ],
            ads: [
              {
                id: 'ad-local-berlin-1',
                type: 'RESPONSIVE_SEARCH',
                headlines: [
                  'Videos & Angebote Berlin',
                  'Lokale Community Berlin',
                  'Berlin entdecken',
                ],
                descriptions: [
                  'Entdecke Videos, Events & Angebote aus Berlin. Jetzt kostenlos!',
                  'Die lokale Social Plattform für Berlin. Community, Marketplace & mehr.',
                ],
                finalUrl: 'https://anpip.com/videos/berlin?utm_source=google&utm_medium=cpc&utm_campaign=local-berlin',
                callToAction: 'Berlin entdecken',
              },
            ],
          },
        ],
      },

      // 4. PERFORMANCE MAX CAMPAIGN
      {
        id: 'campaign-pmax',
        name: 'Anpip - Performance Max',
        type: 'PERFORMANCE_MAX',
        budget: {
          daily: 150,
          currency: 'EUR',
        },
        targeting: {
          locations: ['DE', 'AT', 'CH'],
          languages: ['de', 'en'],
          devices: ['MOBILE', 'DESKTOP', 'TABLET'],
        },
        bidding: {
          strategy: 'MAXIMIZE_CONVERSIONS',
          targetROAS: 3.0,
        },
        adGroups: [
          {
            id: 'ag-pmax-all',
            name: 'Performance Max - All',
            bid: 0,
            keywords: [],
            ads: [
              {
                id: 'ad-pmax-1',
                type: 'RESPONSIVE_SEARCH',
                headlines: [
                  'Anpip - Social Video Platform',
                  'Teile Momente weltweit',
                  'Kostenlos starten',
                  'Live-Streaming & Marketplace',
                  'Die moderne Video Community',
                ],
                descriptions: [
                  'Teile Videos, Momente & lokale Angebote. Live-Streaming, Duett-Videos, Marketplace. Jetzt kostenlos!',
                  'Die Social Video Plattform 2025. Entdecke Inhalte aus deiner Stadt und weltweit.',
                ],
                finalUrl: 'https://anpip.com/?utm_source=google&utm_medium=pmax&utm_campaign=performance-max',
                images: [
                  'https://anpip.com/assets/ads/ad-image-1200x628.jpg',
                  'https://anpip.com/assets/ads/ad-square-1080x1080.jpg',
                ],
                videos: [
                  'https://anpip.com/assets/ads/promo-video-30s.mp4',
                ],
              },
            ],
          },
        ],
      },

      // 5. VIDEO CAMPAIGN (YouTube)
      {
        id: 'campaign-video-youtube',
        name: 'Anpip - YouTube Ads',
        type: 'VIDEO',
        budget: {
          daily: 80,
          currency: 'EUR',
        },
        targeting: {
          locations: ['DE', 'AT', 'CH'],
          languages: ['de'],
          devices: ['MOBILE', 'DESKTOP'],
          demographics: {
            ageRanges: ['18-34'],
          },
        },
        bidding: {
          strategy: 'CPM',
          amount: 5.00,
        },
        adGroups: [
          {
            id: 'ag-youtube-skippable',
            name: 'YouTube - Skippable In-Stream',
            bid: 5.00,
            keywords: [
              { text: 'tiktok', matchType: 'BROAD' },
              { text: 'instagram reels', matchType: 'BROAD' },
              { text: 'video app', matchType: 'BROAD' },
            ],
            ads: [
              {
                id: 'ad-youtube-1',
                type: 'VIDEO',
                headlines: ['Anpip - Die neue Social Video App'],
                descriptions: ['Jetzt kostenlos starten!'],
                finalUrl: 'https://anpip.com/?utm_source=youtube&utm_medium=video&utm_campaign=awareness',
                videos: [
                  'https://youtube.com/watch?v=YOUR_VIDEO_ID',
                ],
              },
            ],
          },
        ],
      },
    ];
  }

  /**
   * 🎯 Negative Keywords (kampagnenübergreifend)
   */
  static getNegativeKeywords(): string[] {
    return [
      'kostenlos',
      'gratis download',
      'crack',
      'hack',
      'tutorial',
      'anleitung',
      'alternative zu anpip',
      'anpip kündigen',
      'anpip löschen',
      'anpip probleme',
      'anpip beschwerde',
      'xxx',
      'porn',
      'adult',
    ];
  }

  /**
   * 📊 Conversion Tracking Setup
   */
  static getConversionActions() {
    return [
      {
        name: 'Registrierung',
        id: 'AW-XXXXXX/xxxxx',
        value: 5.00,
        category: 'LEAD',
      },
      {
        name: 'Video Upload',
        id: 'AW-XXXXXX/xxxxx',
        value: 2.00,
        category: 'CUSTOM',
      },
      {
        name: 'Marketplace Purchase',
        id: 'AW-XXXXXX/xxxxx',
        value: 0, // Dynamic value
        category: 'PURCHASE',
      },
      {
        name: 'Subscription',
        id: 'AW-XXXXXX/xxxxx',
        value: 10.00,
        category: 'PURCHASE',
      },
    ];
  }

  /**
   * 🔄 Track Conversion
   */
  trackConversion(action: string, value?: number, orderId?: string) {
    if (typeof window === 'undefined') return;

    const conversionData: any = {
      send_to: this.config.conversionLabel,
      value: value || 0,
      currency: 'EUR',
    };

    if (orderId) {
      conversionData.transaction_id = orderId;
    }

    // @ts-ignore
    if (window.gtag) {
      // @ts-ignore
      window.gtag('event', 'conversion', conversionData);
    }
  }

  /**
   * 📈 Quality Score Optimization Tips
   */
  static getQualityScoreOptimizationTips(): string[] {
    return [
      '✅ Relevante Keywords in Anzeigentext',
      '✅ Landing Page URL mit Keyword',
      '✅ Hohe CTR durch starke CTAs',
      '✅ Mobile-optimierte Landing Pages',
      '✅ Schnelle Ladezeiten (< 2s)',
      '✅ Klare Ad-Relevanz zur Suchanfrage',
      '✅ Verwendung von Ad Extensions',
      '✅ Regelmäßige Anzeigentests (A/B)',
      '✅ Negative Keywords pflegen',
      '✅ Geo-Targeting optimieren',
    ];
  }

  /**
   * 🎨 Ad Extensions
   */
  static getAdExtensions() {
    return {
      sitelinks: [
        {
          text: 'Videos entdecken',
          url: 'https://anpip.com/videos',
          description: 'Entdecke spannende Videos aus aller Welt',
        },
        {
          text: 'Marketplace',
          url: 'https://anpip.com/market',
          description: 'Kaufe & verkaufe lokale Angebote',
        },
        {
          text: 'Live-Streams',
          url: 'https://anpip.com/live',
          description: 'Schaue Live-Streams deiner Lieblings-Creator',
        },
        {
          text: 'Jetzt registrieren',
          url: 'https://anpip.com/auth/signup',
          description: 'Kostenlos anmelden in 30 Sekunden',
        },
      ],
      callouts: [
        'Kostenlos',
        'Ohne Werbung',
        '10M+ Videos',
        'Live-Streaming',
        'Marketplace',
        'Duett-Videos',
        'KI-Features',
        'Global verfügbar',
      ],
      structuredSnippets: [
        {
          header: 'Features',
          values: ['Video Upload', 'Live-Streaming', 'Marketplace', 'Duett-Videos', 'KI-Effekte'],
        },
        {
          header: 'Kategorien',
          values: ['Food', 'Fitness', 'Musik', 'Reisen', 'Gaming', 'Bildung'],
        },
      ],
      callExtension: {
        phoneNumber: '+49 30 12345678',
        countryCode: 'DE',
      },
      locationExtension: {
        address: 'Anpip GmbH, Friedrichstraße 123, 10117 Berlin',
      },
      priceExtension: [
        {
          header: 'Kostenlos',
          description: 'Basis-Account',
          price: 0,
          unit: 'EUR',
          finalUrl: 'https://anpip.com/pricing',
        },
        {
          header: 'Creator Pro',
          description: 'Premium Features',
          price: 9.99,
          unit: 'EUR/Monat',
          finalUrl: 'https://anpip.com/pricing/pro',
        },
      ],
    };
  }

  /**
   * 📱 Mobile-optimierte Landing Page Struktur
   */
  static getMobileLandingPageStructure() {
    return {
      sections: [
        {
          type: 'hero',
          headline: 'Social Video Platform 2025',
          subheadline: 'Teile Momente & lokale Angebote weltweit',
          cta: 'Kostenlos starten',
          image: '/assets/hero-mobile.jpg',
        },
        {
          type: 'benefits',
          items: [
            { icon: '📹', title: 'Videos teilen', description: '9:16 Format, perfekt für Mobile' },
            { icon: '🌍', title: 'Lokal & Global', description: 'Entdecke Inhalte aus deiner Stadt' },
            { icon: '🛍️', title: 'Marketplace', description: 'Kaufe & verkaufe lokale Angebote' },
            { icon: '🎥', title: 'Live-Streaming', description: 'Streame live mit deiner Community' },
          ],
        },
        {
          type: 'social-proof',
          stats: [
            { value: '10M+', label: 'Videos' },
            { value: '500K+', label: 'Creator' },
            { value: '50+', label: 'Länder' },
          ],
        },
        {
          type: 'cta',
          headline: 'Jetzt kostenlos starten',
          button: 'Registrieren',
        },
      ],
    };
  }
}

/**
 * 🎯 Tracking Helper
 */
export function initGoogleAds(config: GoogleAdsConfig) {
  if (typeof window === 'undefined') return;

  // Google Ads Conversion Tracking Script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.conversionId}`;
  document.head.appendChild(script);

  // @ts-ignore
  window.dataLayer = window.dataLayer || [];
  // @ts-ignore
  function gtag(...args: any[]) {
    // @ts-ignore
    window.dataLayer.push(args);
  }
  // @ts-ignore
  window.gtag = gtag;

  // @ts-ignore
  gtag('js', new Date());
  // @ts-ignore
  gtag('config', config.conversionId);
}

export default GoogleAdsManager;
