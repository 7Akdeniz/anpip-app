/**
 * 📊 CONVERSION TRACKING 2025
 * 
 * Zentrales Conversion Tracking für alle Plattformen
 * - Google Ads
 * - Meta (Facebook/Instagram)
 * - Google Analytics 4
 * - Custom Events
 * 
 * @module ConversionTracking2025
 */

export interface ConversionEvent {
  name: string;
  value?: number;
  currency?: string;
  orderId?: string;
  itemId?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface TrackingConfig {
  googleAds?: {
    conversionId: string;
    conversionLabel: string;
  };
  metaPixel?: {
    pixelId: string;
  };
  ga4?: {
    measurementId: string;
  };
  customEvents?: {
    endpoint: string;
    apiKey: string;
  };
}

/**
 * Conversion Tracker
 */
export class ConversionTracker {
  private config: TrackingConfig;

  constructor(config: TrackingConfig) {
    this.config = config;
  }

  /**
   * 🎯 Track Universal Conversion
   */
  async track(event: ConversionEvent): Promise<void> {
    const promises: Promise<any>[] = [];

    // Google Ads
    if (this.config.googleAds) {
      promises.push(this.trackGoogleAds(event));
    }

    // Meta Pixel
    if (this.config.metaPixel) {
      promises.push(this.trackMetaPixel(event));
    }

    // Google Analytics 4
    if (this.config.ga4) {
      promises.push(this.trackGA4(event));
    }

    // Custom Events
    if (this.config.customEvents) {
      promises.push(this.trackCustom(event));
    }

    await Promise.allSettled(promises);
  }

  /**
   * 🟢 Google Ads Conversion
   */
  private async trackGoogleAds(event: ConversionEvent): Promise<void> {
    if (typeof window === 'undefined') return;

    const { conversionId, conversionLabel } = this.config.googleAds!;

    // @ts-ignore
    if (window.gtag) {
      // @ts-ignore
      window.gtag('event', 'conversion', {
        send_to: `${conversionId}/${conversionLabel}`,
        value: event.value || 0,
        currency: event.currency || 'EUR',
        transaction_id: event.orderId,
      });
    }
  }

  /**
   * 🔵 Meta Pixel Conversion
   */
  private async trackMetaPixel(event: ConversionEvent): Promise<void> {
    if (typeof window === 'undefined') return;

    const eventName = this.mapToMetaEvent(event.name);

    // @ts-ignore
    if (window.fbq) {
      // @ts-ignore
      window.fbq('track', eventName, {
        value: event.value,
        currency: event.currency || 'EUR',
        content_ids: event.itemId ? [event.itemId] : undefined,
        content_category: event.category,
      });
    }
  }

  /**
   * 📊 Google Analytics 4 Conversion
   */
  private async trackGA4(event: ConversionEvent): Promise<void> {
    if (typeof window === 'undefined') return;

    // @ts-ignore
    if (window.gtag) {
      // @ts-ignore
      window.gtag('event', event.name, {
        value: event.value,
        currency: event.currency || 'EUR',
        transaction_id: event.orderId,
        items: event.itemId
          ? [
              {
                item_id: event.itemId,
                item_category: event.category,
              },
            ]
          : undefined,
        ...event.metadata,
      });
    }
  }

  /**
   * 🔧 Custom Event Tracking
   */
  private async trackCustom(event: ConversionEvent): Promise<void> {
    const { endpoint, apiKey } = this.config.customEvents!;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          event: event.name,
          value: event.value,
          currency: event.currency,
          order_id: event.orderId,
          item_id: event.itemId,
          category: event.category,
          metadata: event.metadata,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Custom tracking error:', error);
    }
  }

  /**
   * 🗺️ Map Event Names to Meta Events
   */
  private mapToMetaEvent(eventName: string): string {
    const mapping: Record<string, string> = {
      signup: 'CompleteRegistration',
      login: 'Lead',
      purchase: 'Purchase',
      add_to_cart: 'AddToCart',
      begin_checkout: 'InitiateCheckout',
      search: 'Search',
      view_item: 'ViewContent',
      video_upload: 'SubmitApplication',
    };

    return mapping[eventName] || eventName;
  }
}

/**
 * 🎯 Conversion Events für Anpip
 */
export const ANPIP_CONVERSIONS = {
  // Registrierung
  SIGNUP: {
    name: 'signup',
    value: 5.0,
    category: 'user_acquisition',
  },

  // Video Upload
  VIDEO_UPLOAD: {
    name: 'video_upload',
    value: 2.0,
    category: 'content_creation',
  },

  // Marketplace Purchase
  MARKETPLACE_PURCHASE: {
    name: 'purchase',
    category: 'marketplace',
  },

  // Subscription
  SUBSCRIPTION: {
    name: 'subscribe',
    value: 10.0,
    category: 'subscription',
  },

  // Video View (100%)
  VIDEO_VIEW_COMPLETE: {
    name: 'video_view_complete',
    value: 0.1,
    category: 'engagement',
  },

  // Live Stream Start
  LIVE_STREAM_START: {
    name: 'live_stream_start',
    value: 3.0,
    category: 'content_creation',
  },

  // Profile Complete
  PROFILE_COMPLETE: {
    name: 'profile_complete',
    value: 1.0,
    category: 'user_activation',
  },

  // First Follow
  FIRST_FOLLOW: {
    name: 'first_follow',
    value: 0.5,
    category: 'social_engagement',
  },

  // Marketplace Listing Created
  MARKETPLACE_LISTING: {
    name: 'marketplace_listing',
    value: 1.5,
    category: 'marketplace',
  },

  // Share Video
  SHARE_VIDEO: {
    name: 'share',
    value: 0.3,
    category: 'social_sharing',
  },
} as const;

/**
 * 📈 Initialize Conversion Tracking
 */
export function initConversionTracking(config: TrackingConfig) {
  const tracker = new ConversionTracker(config);

  // Make tracker globally available
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.anpipTracker = tracker;
  }

  return tracker;
}

/**
 * 🎯 Quick Track Functions
 */
export function trackSignup(userId?: string) {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  const tracker = window.anpipTracker as ConversionTracker | undefined;
  
  if (tracker) {
    tracker.track({
      ...ANPIP_CONVERSIONS.SIGNUP,
      metadata: { user_id: userId },
    });
  }
}

export function trackVideoUpload(videoId: string, category?: string) {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  const tracker = window.anpipTracker as ConversionTracker | undefined;
  
  if (tracker) {
    tracker.track({
      ...ANPIP_CONVERSIONS.VIDEO_UPLOAD,
      itemId: videoId,
      category: category || 'general',
    });
  }
}

export function trackPurchase(orderId: string, value: number, currency: string = 'EUR') {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  const tracker = window.anpipTracker as ConversionTracker | undefined;
  
  if (tracker) {
    tracker.track({
      ...ANPIP_CONVERSIONS.MARKETPLACE_PURCHASE,
      value,
      currency,
      orderId,
    });
  }
}

export function trackSubscription(plan: string, value: number) {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  const tracker = window.anpipTracker as ConversionTracker | undefined;
  
  if (tracker) {
    tracker.track({
      ...ANPIP_CONVERSIONS.SUBSCRIPTION,
      value,
      metadata: { plan },
    });
  }
}

/**
 * 📊 UTM Parameter Helper
 */
export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    term: params.get('utm_term') || undefined,
    content: params.get('utm_content') || undefined,
  };
}

export function saveUTMParams() {
  if (typeof window === 'undefined') return;

  const utmParams = getUTMParams();

  if (Object.keys(utmParams).length > 0) {
    localStorage.setItem('anpip_utm', JSON.stringify(utmParams));
  }
}

export function getSavedUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};

  const saved = localStorage.getItem('anpip_utm');
  return saved ? JSON.parse(saved) : {};
}

export default ConversionTracker;
