/**
 * 📊 GOOGLE ANALYTICS 4 (GA4) 2025
 * 
 * Vollständiges GA4-Setup für Anpip.com
 * - Event Tracking
 * - E-Commerce Tracking
 * - User Properties
 * - Custom Dimensions
 * - Conversion Tracking
 * 
 * @module GA4_2025
 */

export interface GA4Config {
  measurementId: string;
  appName?: string;
  debug?: boolean;
}

export interface GA4Event {
  name: string;
  params?: Record<string, any>;
}

export interface GA4EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_category2?: string;
  item_brand?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
  index?: number;
}

/**
 * GA4 Manager
 */
export class GA4Manager {
  private config: GA4Config;

  constructor(config: GA4Config) {
    this.config = config;
  }

  /**
   * 🚀 Initialize GA4
   */
  static init(config: GA4Config) {
    if (typeof window === 'undefined') return;

    // Load gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      // @ts-ignore
      window.dataLayer.push(args);
    }
    // @ts-ignore
    window.gtag = gtag;

    // @ts-ignore
    gtag('js', new Date());
    // @ts-ignore
    gtag('config', config.measurementId, {
      app_name: config.appName || 'Anpip',
      debug_mode: config.debug || false,
      send_page_view: true,
    });

    return new GA4Manager(config);
  }

  /**
   * 📊 Track Event
   */
  trackEvent(event: GA4Event) {
    if (typeof window === 'undefined') return;

    // @ts-ignore
    if (window.gtag) {
      // @ts-ignore
      window.gtag('event', event.name, event.params);
    }
  }

  /**
   * 📄 Track Page View
   */
  trackPageView(path: string, title?: string) {
    this.trackEvent({
      name: 'page_view',
      params: {
        page_path: path,
        page_title: title,
      },
    });
  }

  /**
   * 👤 Set User Properties
   */
  setUserProperties(properties: Record<string, any>) {
    if (typeof window === 'undefined') return;

    // @ts-ignore
    if (window.gtag) {
      // @ts-ignore
      window.gtag('set', 'user_properties', properties);
    }
  }

  /**
   * 🆔 Set User ID
   */
  setUserId(userId: string) {
    if (typeof window === 'undefined') return;

    // @ts-ignore
    if (window.gtag) {
      // @ts-ignore
      window.gtag('config', this.config.measurementId, {
        user_id: userId,
      });
    }
  }

  /**
   * 🛍️ E-Commerce: View Item
   */
  trackViewItem(item: GA4EcommerceItem, value?: number, currency: string = 'EUR') {
    this.trackEvent({
      name: 'view_item',
      params: {
        currency,
        value: value || item.price || 0,
        items: [item],
      },
    });
  }

  /**
   * 🛒 E-Commerce: Add to Cart
   */
  trackAddToCart(item: GA4EcommerceItem, value?: number, currency: string = 'EUR') {
    this.trackEvent({
      name: 'add_to_cart',
      params: {
        currency,
        value: value || item.price || 0,
        items: [item],
      },
    });
  }

  /**
   * 💳 E-Commerce: Begin Checkout
   */
  trackBeginCheckout(items: GA4EcommerceItem[], value: number, currency: string = 'EUR') {
    this.trackEvent({
      name: 'begin_checkout',
      params: {
        currency,
        value,
        items,
      },
    });
  }

  /**
   * ✅ E-Commerce: Purchase
   */
  trackPurchase(
    transactionId: string,
    items: GA4EcommerceItem[],
    value: number,
    currency: string = 'EUR',
    tax?: number,
    shipping?: number
  ) {
    this.trackEvent({
      name: 'purchase',
      params: {
        transaction_id: transactionId,
        currency,
        value,
        tax,
        shipping,
        items,
      },
    });
  }

  /**
   * 🔍 Track Search
   */
  trackSearch(searchTerm: string) {
    this.trackEvent({
      name: 'search',
      params: {
        search_term: searchTerm,
      },
    });
  }

  /**
   * 📹 Track Video Play
   */
  trackVideoPlay(videoId: string, videoTitle: string, category?: string) {
    this.trackEvent({
      name: 'video_start',
      params: {
        video_id: videoId,
        video_title: videoTitle,
        video_category: category,
      },
    });
  }

  /**
   * 📹 Track Video Complete
   */
  trackVideoComplete(videoId: string, videoTitle: string, duration: number) {
    this.trackEvent({
      name: 'video_complete',
      params: {
        video_id: videoId,
        video_title: videoTitle,
        video_duration: duration,
      },
    });
  }

  /**
   * 📤 Track Video Upload
   */
  trackVideoUpload(videoId: string, category?: string, duration?: number) {
    this.trackEvent({
      name: 'video_upload',
      params: {
        video_id: videoId,
        video_category: category,
        video_duration: duration,
      },
    });
  }

  /**
   * 🎥 Track Live Stream Start
   */
  trackLiveStreamStart(streamId: string, category?: string) {
    this.trackEvent({
      name: 'live_stream_start',
      params: {
        stream_id: streamId,
        stream_category: category,
      },
    });
  }

  /**
   * 👤 Track Signup
   */
  trackSignup(method: string = 'email') {
    this.trackEvent({
      name: 'sign_up',
      params: {
        method,
      },
    });
  }

  /**
   * 🔐 Track Login
   */
  trackLogin(method: string = 'email') {
    this.trackEvent({
      name: 'login',
      params: {
        method,
      },
    });
  }

  /**
   * 🤝 Track Social Share
   */
  trackShare(contentType: string, contentId: string, method?: string) {
    this.trackEvent({
      name: 'share',
      params: {
        content_type: contentType,
        content_id: contentId,
        method,
      },
    });
  }

  /**
   * ❤️ Track Like
   */
  trackLike(contentType: string, contentId: string) {
    this.trackEvent({
      name: 'like',
      params: {
        content_type: contentType,
        content_id: contentId,
      },
    });
  }

  /**
   * 💬 Track Comment
   */
  trackComment(contentType: string, contentId: string) {
    this.trackEvent({
      name: 'comment',
      params: {
        content_type: contentType,
        content_id: contentId,
      },
    });
  }

  /**
   * 👥 Track Follow
   */
  trackFollow(userId: string) {
    this.trackEvent({
      name: 'follow',
      params: {
        user_id: userId,
      },
    });
  }

  /**
   * 🎯 Track Custom Conversion
   */
  trackConversion(conversionName: string, value?: number, currency: string = 'EUR') {
    this.trackEvent({
      name: conversionName,
      params: {
        value,
        currency,
      },
    });
  }
}

/**
 * 🎯 Anpip-spezifische Events
 */
export const ANPIP_GA4_EVENTS = {
  // User Actions
  SIGNUP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PROFILE_COMPLETE: 'profile_complete',

  // Content
  VIDEO_VIEW: 'video_start',
  VIDEO_COMPLETE: 'video_complete',
  VIDEO_UPLOAD: 'video_upload',
  VIDEO_LIKE: 'video_like',
  VIDEO_COMMENT: 'video_comment',
  VIDEO_SHARE: 'video_share',

  // Social
  FOLLOW: 'follow',
  UNFOLLOW: 'unfollow',
  DUET_CREATE: 'duet_create',

  // Live Streaming
  LIVE_START: 'live_stream_start',
  LIVE_END: 'live_stream_end',
  LIVE_JOIN: 'live_stream_join',
  LIVE_GIFT: 'live_gift_send',

  // Marketplace
  PRODUCT_VIEW: 'view_item',
  PRODUCT_ADD_TO_CART: 'add_to_cart',
  PRODUCT_PURCHASE: 'purchase',
  PRODUCT_LIST: 'product_list_created',

  // Search
  SEARCH: 'search',
  SEARCH_RESULT_CLICK: 'search_result_click',

  // Engagement
  APP_OPEN: 'app_open',
  SESSION_START: 'session_start',
  FIRST_VISIT: 'first_visit',
} as const;

/**
 * 📊 Custom Dimensions
 */
export interface AnpipUserProperties {
  user_type?: 'creator' | 'viewer' | 'seller';
  subscription_tier?: 'free' | 'pro' | 'premium';
  content_category_preference?: string;
  location_city?: string;
  location_country?: string;
  follower_count_tier?: string; // '0-100', '100-1k', '1k-10k', '10k+'
  total_videos?: number;
  total_purchases?: number;
}

/**
 * 🚀 Helper: Initialize GA4 for Anpip
 */
export function initAnpipGA4(measurementId: string) {
  return GA4Manager.init({
    measurementId,
    appName: 'Anpip',
    debug: process.env.NODE_ENV === 'development',
  });
}

export default GA4Manager;
