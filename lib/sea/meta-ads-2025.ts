/**
 * 📱 META ADS (FACEBOOK & INSTAGRAM) 2025
 * 
 * Vollständiges Meta Ads Setup für Anpip.com
 * - Facebook Pixel Integration
 * - Custom Audiences
 * - Lookalike Audiences
 * - Conversion API
 * - Dynamic Ads
 * - Campaign Structure
 * 
 * @module MetaAds2025
 */

export interface MetaAdsConfig {
  pixelId: string;
  accessToken: string;
  appId: string;
  testEventCode?: string; // Für Testing
}

export interface MetaCampaign {
  id: string;
  name: string;
  objective:
    | 'AWARENESS'
    | 'TRAFFIC'
    | 'ENGAGEMENT'
    | 'LEADS'
    | 'APP_PROMOTION'
    | 'SALES'
    | 'CONVERSIONS';
  budget: {
    daily?: number;
    lifetime?: number;
    currency: string;
  };
  schedule?: {
    startDate: string;
    endDate?: string;
  };
  adSets: MetaAdSet[];
}

export interface MetaAdSet {
  id: string;
  name: string;
  targeting: {
    locations: {
      countries?: string[];
      regions?: string[];
      cities?: string[];
    };
    age: {
      min: number;
      max: number;
    };
    genders?: ('male' | 'female' | 'all')[];
    interests?: string[];
    behaviors?: string[];
    customAudiences?: string[];
    lookalike?: {
      source: string;
      ratio: number;
    };
  };
  placements: MetaPlacement[];
  optimization: {
    goal: 'IMPRESSIONS' | 'REACH' | 'LINK_CLICKS' | 'CONVERSIONS' | 'APP_INSTALLS';
    bidStrategy: 'LOWEST_COST' | 'COST_CAP' | 'BID_CAP';
    bidAmount?: number;
  };
  ads: MetaAd[];
}

export interface MetaPlacement {
  platform: 'facebook' | 'instagram' | 'messenger' | 'audience_network';
  position: 'feed' | 'story' | 'reel' | 'search' | 'in_stream_video' | 'explore';
}

export interface MetaAd {
  id: string;
  name: string;
  format: 'SINGLE_IMAGE' | 'SINGLE_VIDEO' | 'CAROUSEL' | 'COLLECTION' | 'REELS';
  creative: {
    headline: string;
    description?: string;
    callToAction: 'LEARN_MORE' | 'SIGN_UP' | 'DOWNLOAD' | 'SHOP_NOW' | 'INSTALL_APP';
    link: string;
    image?: string;
    video?: string;
    carousel?: {
      cards: {
        image: string;
        headline: string;
        description: string;
        link: string;
      }[];
    };
  };
}

/**
 * Meta Ads Manager
 */
export class MetaAdsManager {
  private config: MetaAdsConfig;

  constructor(config: MetaAdsConfig) {
    this.config = config;
  }

  /**
   * 📱 Kampagnenstruktur für Anpip
   */
  static getAnpipCampaignStructure(): MetaCampaign[] {
    return [
      // 1. AWARENESS CAMPAIGN
      {
        id: 'meta-campaign-awareness',
        name: 'Anpip - Brand Awareness',
        objective: 'AWARENESS',
        budget: {
          daily: 100,
          currency: 'EUR',
        },
        adSets: [
          {
            id: 'adset-awareness-cold',
            name: 'Cold Audience - Gen Z',
            targeting: {
              locations: {
                countries: ['DE', 'AT', 'CH'],
              },
              age: {
                min: 18,
                max: 34,
              },
              genders: ['all'],
              interests: [
                'TikTok',
                'Instagram Reels',
                'Video Sharing',
                'Social Media',
                'Content Creation',
                'Photography',
                'Mobile Apps',
              ],
              behaviors: [
                'Mobile Device User',
                'Early Technology Adopters',
                'Engaged Shoppers',
              ],
            },
            placements: [
              { platform: 'instagram', position: 'feed' },
              { platform: 'instagram', position: 'story' },
              { platform: 'instagram', position: 'reel' },
              { platform: 'facebook', position: 'feed' },
              { platform: 'facebook', position: 'reel' },
            ],
            optimization: {
              goal: 'REACH',
              bidStrategy: 'LOWEST_COST',
            },
            ads: [
              {
                id: 'ad-awareness-video-1',
                name: 'Awareness - Reel Video',
                format: 'SINGLE_VIDEO',
                creative: {
                  headline: 'Die neue Social Video App 🎥',
                  description: 'Teile Momente & lokale Angebote. Jetzt kostenlos!',
                  callToAction: 'SIGN_UP',
                  link: 'https://anpip.com/?utm_source=meta&utm_medium=paid&utm_campaign=awareness',
                  video: 'https://anpip.com/assets/ads/reel-video-9-16.mp4',
                },
              },
            ],
          },
        ],
      },

      // 2. APP INSTALL CAMPAIGN
      {
        id: 'meta-campaign-app-install',
        name: 'Anpip - App Install',
        objective: 'APP_PROMOTION',
        budget: {
          daily: 150,
          currency: 'EUR',
        },
        adSets: [
          {
            id: 'adset-app-install-lookalike',
            name: 'Lookalike - App Users',
            targeting: {
              locations: {
                countries: ['DE', 'AT', 'CH'],
              },
              age: {
                min: 18,
                max: 44,
              },
              lookalike: {
                source: 'existing_app_users',
                ratio: 1, // 1% Lookalike
              },
            },
            placements: [
              { platform: 'instagram', position: 'feed' },
              { platform: 'instagram', position: 'story' },
              { platform: 'facebook', position: 'feed' },
            ],
            optimization: {
              goal: 'APP_INSTALLS',
              bidStrategy: 'LOWEST_COST',
            },
            ads: [
              {
                id: 'ad-app-install-1',
                name: 'App Install - Carousel',
                format: 'CAROUSEL',
                creative: {
                  headline: 'Entdecke Anpip 🚀',
                  callToAction: 'INSTALL_APP',
                  link: 'https://anpip.com/app',
                  carousel: {
                    cards: [
                      {
                        image: 'https://anpip.com/assets/ads/feature-1-videos.jpg',
                        headline: 'Teile Videos',
                        description: '9:16 Format, perfekt für Mobile',
                        link: 'https://anpip.com/app',
                      },
                      {
                        image: 'https://anpip.com/assets/ads/feature-2-live.jpg',
                        headline: 'Live-Streaming',
                        description: 'Streame live mit deiner Community',
                        link: 'https://anpip.com/app',
                      },
                      {
                        image: 'https://anpip.com/assets/ads/feature-3-marketplace.jpg',
                        headline: 'Marketplace',
                        description: 'Kaufe & verkaufe lokale Angebote',
                        link: 'https://anpip.com/app',
                      },
                    ],
                  },
                },
              },
            ],
          },
        ],
      },

      // 3. CONVERSIONS CAMPAIGN (Registrierung)
      {
        id: 'meta-campaign-conversions',
        name: 'Anpip - Sign Up',
        objective: 'CONVERSIONS',
        budget: {
          daily: 120,
          currency: 'EUR',
        },
        adSets: [
          {
            id: 'adset-signup-retargeting',
            name: 'Retargeting - Website Visitors',
            targeting: {
              locations: {
                countries: ['DE', 'AT', 'CH'],
              },
              age: {
                min: 18,
                max: 65,
              },
              customAudiences: ['website_visitors_30d', 'video_viewers_30d'],
            },
            placements: [
              { platform: 'instagram', position: 'feed' },
              { platform: 'instagram', position: 'story' },
              { platform: 'facebook', position: 'feed' },
            ],
            optimization: {
              goal: 'CONVERSIONS',
              bidStrategy: 'COST_CAP',
              bidAmount: 5.0,
            },
            ads: [
              {
                id: 'ad-signup-retargeting-1',
                name: 'Retargeting - Sign Up',
                format: 'SINGLE_IMAGE',
                creative: {
                  headline: 'Noch nicht dabei? 🎯',
                  description: 'Jetzt kostenlos registrieren und Teil der Community werden!',
                  callToAction: 'SIGN_UP',
                  link: 'https://anpip.com/auth/signup?utm_source=meta&utm_medium=retargeting&utm_campaign=signup',
                  image: 'https://anpip.com/assets/ads/signup-cta.jpg',
                },
              },
            ],
          },
        ],
      },

      // 4. TRAFFIC CAMPAIGN (Blog/Content)
      {
        id: 'meta-campaign-traffic',
        name: 'Anpip - Content Traffic',
        objective: 'TRAFFIC',
        budget: {
          daily: 50,
          currency: 'EUR',
        },
        adSets: [
          {
            id: 'adset-content-interests',
            name: 'Content - Interests',
            targeting: {
              locations: {
                countries: ['DE', 'AT', 'CH'],
              },
              age: {
                min: 18,
                max: 54,
              },
              interests: [
                'Video Marketing',
                'Social Media Marketing',
                'Content Creator',
                'Influencer Marketing',
                'Digital Marketing',
              ],
            },
            placements: [
              { platform: 'facebook', position: 'feed' },
              { platform: 'instagram', position: 'feed' },
            ],
            optimization: {
              goal: 'LINK_CLICKS',
              bidStrategy: 'LOWEST_COST',
            },
            ads: [
              {
                id: 'ad-content-blog-1',
                name: 'Blog - How to go viral',
                format: 'SINGLE_IMAGE',
                creative: {
                  headline: 'So wirst du viral 🚀',
                  description: 'Tipps & Tricks für Content Creator. Jetzt lesen!',
                  callToAction: 'LEARN_MORE',
                  link: 'https://anpip.com/blog/how-to-go-viral?utm_source=meta&utm_medium=traffic&utm_campaign=blog',
                  image: 'https://anpip.com/assets/blog/viral-tips.jpg',
                },
              },
            ],
          },
        ],
      },

      // 5. LOCAL AWARENESS (Geo-Targeting)
      {
        id: 'meta-campaign-local',
        name: 'Anpip - Local Berlin',
        objective: 'AWARENESS',
        budget: {
          daily: 40,
          currency: 'EUR',
        },
        adSets: [
          {
            id: 'adset-local-berlin',
            name: 'Local - Berlin',
            targeting: {
              locations: {
                cities: ['Berlin, Germany'],
              },
              age: {
                min: 18,
                max: 44,
              },
            },
            placements: [
              { platform: 'instagram', position: 'story' },
              { platform: 'facebook', position: 'story' },
            ],
            optimization: {
              goal: 'REACH',
              bidStrategy: 'LOWEST_COST',
            },
            ads: [
              {
                id: 'ad-local-berlin-1',
                name: 'Local - Berlin Story',
                format: 'SINGLE_VIDEO',
                creative: {
                  headline: 'Berlin entdecken 📍',
                  description: 'Lokale Videos, Events & Angebote aus Berlin',
                  callToAction: 'LEARN_MORE',
                  link: 'https://anpip.com/videos/berlin?utm_source=meta&utm_medium=local&utm_campaign=berlin',
                  video: 'https://anpip.com/assets/ads/berlin-local.mp4',
                },
              },
            ],
          },
        ],
      },
    ];
  }

  /**
   * 🎯 Facebook Pixel Events
   */
  static getPixelEvents() {
    return {
      pageView: 'PageView',
      viewContent: 'ViewContent',
      search: 'Search',
      addToCart: 'AddToCart',
      initiateCheckout: 'InitiateCheckout',
      purchase: 'Purchase',
      lead: 'Lead',
      completeRegistration: 'CompleteRegistration',
      custom: {
        videoUpload: 'VideoUpload',
        profileView: 'ProfileView',
        videoPlay: 'VideoPlay',
        liveStream: 'LiveStream',
        marketplaceListing: 'MarketplaceListing',
      },
    };
  }

  /**
   * 📊 Track Event (Browser)
   */
  trackEvent(eventName: string, params?: any) {
    if (typeof window === 'undefined') return;

    // @ts-ignore
    if (window.fbq) {
      // @ts-ignore
      window.fbq('track', eventName, params);
    }
  }

  /**
   * 🔄 Track Event (Server - Conversion API)
   */
  async trackEventServer(eventName: string, userData: any, customData?: any) {
    const eventData = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: userData.email ? await this.hashSHA256(userData.email) : undefined,
        ph: userData.phone ? await this.hashSHA256(userData.phone) : undefined,
        fn: userData.firstName ? await this.hashSHA256(userData.firstName) : undefined,
        ln: userData.lastName ? await this.hashSHA256(userData.lastName) : undefined,
        ct: userData.city ? await this.hashSHA256(userData.city) : undefined,
        country: userData.country ? await this.hashSHA256(userData.country) : undefined,
        client_ip_address: userData.ip,
        client_user_agent: userData.userAgent,
        fbc: userData.fbc, // Facebook Click ID
        fbp: userData.fbp, // Facebook Browser ID
      },
      custom_data: customData,
      action_source: 'website',
    };

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.config.pixelId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [eventData],
          access_token: this.config.accessToken,
          test_event_code: this.config.testEventCode,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Meta Conversion API Error:', error);
      return null;
    }
  }

  /**
   * 🔐 SHA-256 Hash für User Data
   */
  private async hashSHA256(value: string): Promise<string> {
    const normalized = value.toLowerCase().trim();
    const msgUint8 = new TextEncoder().encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 👥 Custom Audiences
   */
  static getCustomAudiences() {
    return [
      {
        name: 'Website Visitors - 30 Days',
        rule: {
          url: { contains: 'anpip.com' },
          retention_days: 30,
        },
      },
      {
        name: 'Video Viewers - 30 Days',
        rule: {
          event: 'ViewContent',
          url: { contains: '/video/' },
          retention_days: 30,
        },
      },
      {
        name: 'Add to Cart - No Purchase',
        rule: {
          events: ['AddToCart'],
          exclude: ['Purchase'],
          retention_days: 14,
        },
      },
      {
        name: 'Registered Users',
        rule: {
          event: 'CompleteRegistration',
          retention_days: 180,
        },
      },
      {
        name: 'High-Value Customers',
        rule: {
          event: 'Purchase',
          value: { greater_than: 50 },
          retention_days: 90,
        },
      },
    ];
  }

  /**
   * 🎨 Dynamic Product Ads Setup
   */
  static getDynamicAdsSetup() {
    return {
      catalog: {
        name: 'Anpip Marketplace',
        vertical: 'commerce',
      },
      productSet: {
        name: 'All Products',
        filter: {
          availability: 'in stock',
        },
      },
      template: {
        headline: '{{product.name}}',
        description: '{{product.description}}',
        image: '{{product.image.url}}',
        price: '{{product.price}} {{product.currency}}',
        link: 'https://anpip.com/market/{{product.id}}',
      },
    };
  }

  /**
   * 📐 Ad Creative Specifications
   */
  static getCreativeSpecs() {
    return {
      image: {
        feed: {
          ratio: '1:1',
          size: '1080x1080',
          formats: ['jpg', 'png'],
          maxSize: '30MB',
        },
        story: {
          ratio: '9:16',
          size: '1080x1920',
          formats: ['jpg', 'png'],
          maxSize: '30MB',
        },
      },
      video: {
        feed: {
          ratio: '1:1 oder 4:5',
          resolution: '1080x1080 oder 1080x1350',
          duration: '1-240 Sekunden',
          formats: ['mp4', 'mov'],
          maxSize: '4GB',
        },
        reel: {
          ratio: '9:16',
          resolution: '1080x1920',
          duration: '3-90 Sekunden',
          formats: ['mp4', 'mov'],
          maxSize: '4GB',
        },
        story: {
          ratio: '9:16',
          resolution: '1080x1920',
          duration: '1-120 Sekunden',
          formats: ['mp4', 'mov'],
          maxSize: '4GB',
        },
      },
      text: {
        headline: {
          maxLength: 40,
          recommended: 25,
        },
        description: {
          maxLength: 125,
          recommended: 90,
        },
      },
    };
  }
}

/**
 * 📱 Facebook Pixel Initialization
 */
export function initMetaPixel(pixelId: string, testEventCode?: string) {
  if (typeof window === 'undefined') return;

  // @ts-ignore - Facebook Pixel Standard Code
  !(function (f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  // @ts-ignore
  window.fbq('init', pixelId, {}, { agent: 'plAnpip', testEventCode });
  // @ts-ignore
  window.fbq('track', 'PageView');
}

/**
 * 🎯 Helper: Track Purchase
 */
export function trackMetaPurchase(value: number, currency: string, orderId: string) {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  if (window.fbq) {
    // @ts-ignore
    window.fbq('track', 'Purchase', {
      value,
      currency,
      content_type: 'product',
      content_ids: [orderId],
    });
  }
}

export default MetaAdsManager;
