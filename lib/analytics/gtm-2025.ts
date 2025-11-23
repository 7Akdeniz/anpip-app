/**
 * 🏷️ GOOGLE TAG MANAGER (GTM) 2025
 * 
 * GTM Setup für Anpip.com
 * - Container Management
 * - Tag Configuration
 * - Trigger Setup
 * - Variable Management
 * 
 * @module GTM2025
 */

export interface GTMConfig {
  containerId: string;
  dataLayerName?: string;
  preview?: string; // Preview mode ID
  auth?: string; // Auth parameter for environments
}

export interface GTMDataLayerEvent {
  event: string;
  [key: string]: any;
}

/**
 * GTM Manager
 */
export class GTMManager {
  private config: GTMConfig;

  constructor(config: GTMConfig) {
    this.config = config;
  }

  /**
   * 🚀 Initialize GTM
   */
  static init(config: GTMConfig) {
    if (typeof window === 'undefined') return;

    const dataLayerName = config.dataLayerName || 'dataLayer';

    // Create dataLayer
    // @ts-ignore
    window[dataLayerName] = window[dataLayerName] || [];

    // GTM Script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl${
        config.preview ? `+'&gtm_preview=${config.preview}&gtm_auth=${config.auth}'` : ''
      };f.parentNode.insertBefore(j,f);
      })(window,document,'script','${dataLayerName}','${config.containerId}');
    `;
    document.head.insertBefore(script, document.head.firstChild);

    // GTM NoScript (for <body>)
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${config.containerId}${
      config.preview ? `&gtm_preview=${config.preview}&gtm_auth=${config.auth}` : ''
    }`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

    return new GTMManager(config);
  }

  /**
   * 📊 Push to Data Layer
   */
  push(data: GTMDataLayerEvent) {
    if (typeof window === 'undefined') return;

    const dataLayerName = this.config.dataLayerName || 'dataLayer';

    // @ts-ignore
    if (window[dataLayerName]) {
      // @ts-ignore
      window[dataLayerName].push(data);
    }
  }

  /**
   * 📄 Track Page View
   */
  trackPageView(path: string, title?: string) {
    this.push({
      event: 'page_view',
      page_path: path,
      page_title: title,
    });
  }

  /**
   * 🛍️ Track E-Commerce Event
   */
  trackEcommerce(event: string, ecommerce: any) {
    this.push({
      event,
      ecommerce,
    });
  }

  /**
   * 👤 Track User Data
   */
  setUserData(userId: string, properties?: Record<string, any>) {
    this.push({
      event: 'user_data_set',
      user_id: userId,
      user_properties: properties,
    });
  }

  /**
   * 🎯 Track Custom Event
   */
  trackEvent(eventName: string, params?: Record<string, any>) {
    this.push({
      event: eventName,
      ...params,
    });
  }
}

/**
 * 🏷️ GTM Tag Configuration
 */
export const GTM_TAGS = {
  // Analytics Tags
  GA4: {
    type: 'Google Analytics: GA4 Configuration',
    measurementId: '{{GA4 Measurement ID}}',
    triggers: ['All Pages'],
  },

  // Conversion Tags
  GOOGLE_ADS_CONVERSION: {
    type: 'Google Ads Conversion Tracking',
    conversionId: '{{Google Ads Conversion ID}}',
    conversionLabel: '{{Google Ads Conversion Label}}',
    triggers: ['Conversion - Signup', 'Conversion - Purchase'],
  },

  META_PIXEL: {
    type: 'Facebook Pixel',
    pixelId: '{{Meta Pixel ID}}',
    triggers: ['All Pages', 'Conversion Events'],
  },

  // Custom HTML Tags
  STRUCTURED_DATA: {
    type: 'Custom HTML',
    html: '{{Structured Data Script}}',
    triggers: ['All Pages'],
  },
};

/**
 * 🎯 GTM Triggers
 */
export const GTM_TRIGGERS = {
  // Page Views
  ALL_PAGES: {
    name: 'All Pages',
    type: 'Page View',
    filter: 'Page URL matches RegEx .*',
  },

  HOME_PAGE: {
    name: 'Homepage',
    type: 'Page View',
    filter: 'Page Path equals /',
  },

  VIDEO_PAGE: {
    name: 'Video Page',
    type: 'Page View',
    filter: 'Page Path matches RegEx /video/.*',
  },

  MARKET_PAGE: {
    name: 'Marketplace Page',
    type: 'Page View',
    filter: 'Page Path starts with /market',
  },

  // Events
  SIGNUP: {
    name: 'Conversion - Signup',
    type: 'Custom Event',
    eventName: 'sign_up',
  },

  PURCHASE: {
    name: 'Conversion - Purchase',
    type: 'Custom Event',
    eventName: 'purchase',
  },

  VIDEO_UPLOAD: {
    name: 'Video Upload',
    type: 'Custom Event',
    eventName: 'video_upload',
  },

  // Clicks
  CTA_CLICK: {
    name: 'CTA Button Click',
    type: 'Click',
    filter: 'Click Classes contains btn-cta',
  },

  EXTERNAL_LINK: {
    name: 'External Link Click',
    type: 'Click',
    filter: 'Click URL does not contain anpip.com',
  },

  // Scrolling
  SCROLL_DEPTH: {
    name: 'Scroll Depth',
    type: 'Scroll Depth',
    verticalThresholds: '25,50,75,90,100',
  },

  // Form
  FORM_SUBMIT: {
    name: 'Form Submission',
    type: 'Form Submission',
    filter: 'Form ID equals signup-form',
  },
};

/**
 * 🔧 GTM Variables
 */
export const GTM_VARIABLES = {
  // Built-in Variables
  PAGE_URL: {
    name: 'Page URL',
    type: 'URL',
  },

  PAGE_PATH: {
    name: 'Page Path',
    type: 'URL',
    component: 'path',
  },

  PAGE_TITLE: {
    name: 'Page Title',
    type: 'JavaScript Variable',
    variable: 'document.title',
  },

  // Data Layer Variables
  USER_ID: {
    name: 'User ID',
    type: 'Data Layer Variable',
    dataLayerVariable: 'user_id',
  },

  EVENT_VALUE: {
    name: 'Event Value',
    type: 'Data Layer Variable',
    dataLayerVariable: 'value',
  },

  // Custom JavaScript Variables
  SESSION_ID: {
    name: 'Session ID',
    type: 'Custom JavaScript',
    code: `
      function() {
        return sessionStorage.getItem('session_id') || 'unknown';
      }
    `,
  },

  USER_TYPE: {
    name: 'User Type',
    type: 'Custom JavaScript',
    code: `
      function() {
        return localStorage.getItem('user_type') || 'visitor';
      }
    `,
  },

  // Lookup Table Variables
  GA4_MEASUREMENT_ID: {
    name: 'GA4 Measurement ID',
    type: 'Constant',
    value: 'G-XXXXXXXXXX',
  },

  GOOGLE_ADS_CONVERSION_ID: {
    name: 'Google Ads Conversion ID',
    type: 'Constant',
    value: 'AW-XXXXXXXXXX',
  },

  META_PIXEL_ID: {
    name: 'Meta Pixel ID',
    type: 'Constant',
    value: 'XXXXXXXXXXXXXXX',
  },
};

/**
 * 🎨 GTM Data Layer Events für Anpip
 */
export const ANPIP_GTM_EVENTS = {
  // User Events
  signUp: (method: string) => ({
    event: 'sign_up',
    method,
  }),

  login: (method: string) => ({
    event: 'login',
    method,
  }),

  // Video Events
  videoView: (videoId: string, category: string) => ({
    event: 'video_view',
    video_id: videoId,
    video_category: category,
  }),

  videoUpload: (videoId: string, category: string) => ({
    event: 'video_upload',
    video_id: videoId,
    video_category: category,
  }),

  // E-Commerce Events
  viewItem: (item: any) => ({
    event: 'view_item',
    ecommerce: {
      items: [item],
    },
  }),

  addToCart: (item: any) => ({
    event: 'add_to_cart',
    ecommerce: {
      items: [item],
    },
  }),

  purchase: (transactionId: string, value: number, items: any[]) => ({
    event: 'purchase',
    ecommerce: {
      transaction_id: transactionId,
      value,
      currency: 'EUR',
      items,
    },
  }),

  // Social Events
  share: (contentType: string, contentId: string) => ({
    event: 'share',
    content_type: contentType,
    content_id: contentId,
  }),

  follow: (userId: string) => ({
    event: 'follow',
    user_id: userId,
  }),
};

/**
 * 🚀 Helper: Initialize GTM for Anpip
 */
export function initAnpipGTM(containerId: string) {
  return GTMManager.init({
    containerId,
    dataLayerName: 'dataLayer',
  });
}

export default GTMManager;
