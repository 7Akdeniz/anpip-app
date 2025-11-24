/**
 * PERFORMANCE OPTIMIZER
 * Core Web Vitals, CDN, Caching, Image/Video Optimization
 */

// ==================== CORE WEB VITALS TARGETS ====================
export const PERFORMANCE_TARGETS = {
  // Largest Contentful Paint
  LCP: {
    good: 2500, // ms
    needsImprovement: 4000,
    poor: 4000,
  },
  // First Input Delay
  FID: {
    good: 100, // ms
    needsImprovement: 300,
    poor: 300,
  },
  // Cumulative Layout Shift
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
    poor: 0.25,
  },
  // First Contentful Paint
  FCP: {
    good: 1800, // ms
    needsImprovement: 3000,
    poor: 3000,
  },
  // Time to Interactive
  TTI: {
    good: 3800, // ms
    needsImprovement: 7300,
    poor: 7300,
  },
  // Total Blocking Time
  TBT: {
    good: 200, // ms
    needsImprovement: 600,
    poor: 600,
  },
};

// ==================== IMAGE OPTIMIZATION ====================
export interface ImageOptimizationConfig {
  quality: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill';
}

export const IMAGE_SIZES = {
  thumbnail: { width: 360, height: 640 }, // 9:16 thumbnail
  small: { width: 540, height: 960 },
  medium: { width: 720, height: 1280 },
  large: { width: 1080, height: 1920 },
  xlarge: { width: 1440, height: 2560 },
};

export function generateImageSrcSet(
  imageUrl: string,
  sizes: typeof IMAGE_SIZES = IMAGE_SIZES
): string {
  return Object.entries(sizes)
    .map(([name, { width }]) => `${imageUrl}?w=${width} ${width}w`)
    .join(', ');
}

export function generateImageSizes(): string {
  return [
    '(max-width: 360px) 360px',
    '(max-width: 540px) 540px',
    '(max-width: 720px) 720px',
    '(max-width: 1080px) 1080px',
    '1440px',
  ].join(', ');
}

// ==================== VIDEO OPTIMIZATION ====================
export interface VideoOptimizationConfig {
  quality: 'low' | 'medium' | 'high' | 'source';
  codec: 'h264' | 'h265' | 'vp9' | 'av1';
  bitrate?: number;
  framerate?: number;
}

export const VIDEO_QUALITIES = {
  low: {
    width: 540,
    height: 960,
    bitrate: '500k',
    codec: 'h264',
  },
  medium: {
    width: 720,
    height: 1280,
    bitrate: '1500k',
    codec: 'h264',
  },
  high: {
    width: 1080,
    height: 1920,
    bitrate: '3000k',
    codec: 'h265',
  },
  source: {
    width: 1080,
    height: 1920,
    bitrate: '5000k',
    codec: 'h265',
  },
};

export function getAdaptiveVideoUrl(
  videoId: string,
  quality: keyof typeof VIDEO_QUALITIES = 'medium'
): string {
  const config = VIDEO_QUALITIES[quality];
  return `https://cdn.anpip.com/videos/${videoId}/${quality}.mp4`;
}

// ==================== CDN CONFIGURATION ====================
export const CDN_CONFIG = {
  images: 'https://images.anpip.com',
  videos: 'https://videos.anpip.com',
  static: 'https://static.anpip.com',
  thumbnails: 'https://thumbnails.anpip.com',
};

export function getCDNUrl(
  path: string,
  type: keyof typeof CDN_CONFIG = 'static'
): string {
  return `${CDN_CONFIG[type]}${path}`;
}

// ==================== CACHING STRATEGY ====================
export const CACHE_HEADERS = {
  // Static Assets (1 Jahr)
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
  // Images (1 Monat)
  images: {
    'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400',
  },
  // Videos (1 Woche)
  videos: {
    'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
  },
  // API Responses (5 Minuten)
  api: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
  },
  // HTML (1 Stunde)
  html: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300',
  },
  // No Cache
  noCache: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
};

// ==================== LAZY LOADING ====================
export function generateLazyLoadConfig() {
  return {
    rootMargin: '50px 0px', // Start loading 50px before entering viewport
    threshold: 0.01,
    loading: 'lazy' as const,
  };
}

// ==================== PRELOAD/PREFETCH HINTS ====================
export function generatePreloadHints(videoIds: string[]): string[] {
  return videoIds.slice(0, 3).map(id => 
    `<link rel="prefetch" href="${getCDNUrl(`/videos/${id}/medium.mp4`, 'videos')}" as="video" type="video/mp4">`
  );
}

export function generateDNSPrefetch(): string[] {
  return [
    '<link rel="dns-prefetch" href="https://anpip.com">',
    '<link rel="dns-prefetch" href="https://cdn.anpip.com">',
    '<link rel="dns-prefetch" href="https://images.anpip.com">',
    '<link rel="dns-prefetch" href="https://videos.anpip.com">',
    '<link rel="preconnect" href="https://anpip.com">',
    '<link rel="preconnect" href="https://cdn.anpip.com">',
  ];
}

// ==================== COMPRESSION ====================
export const COMPRESSION_CONFIG = {
  brotli: {
    enabled: true,
    quality: 11, // 0-11, higher = better compression
  },
  gzip: {
    enabled: true,
    level: 9, // 1-9
  },
};

// ==================== SERVICE WORKER CACHE STRATEGY ====================
export const SW_CACHE_STRATEGY = {
  // Cache First (für statische Assets)
  static: 'CacheFirst',
  // Network First (für API-Calls)
  api: 'NetworkFirst',
  // Stale While Revalidate (für Images)
  images: 'StaleWhileRevalidate',
  // Network Only (für Auth)
  auth: 'NetworkOnly',
};

// ==================== BUNDLE SIZE OPTIMIZATION ====================
export const BUNDLE_CONFIG = {
  maxChunkSize: 244 * 1024, // 244KB
  maxInitialSize: 512 * 1024, // 512KB
  dynamicImports: true,
  treeShaking: true,
  minify: true,
  compression: 'brotli',
};

// ==================== MONITORING ====================
export function reportWebVitals(metric: any) {
  // Send to Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
  
  // Log to console in development
  if (__DEV__) {
    console.log('Web Vital:', metric);
  }
}

// ==================== VIDEO PRELOADING STRATEGY ====================
export function getVideoPreloadStrategy(
  position: number,
  totalVideos: number
): 'none' | 'metadata' | 'auto' {
  // Current video: auto (load fully)
  if (position === 0) return 'auto';
  
  // Next video: metadata (preload metadata only)
  if (position === 1) return 'metadata';
  
  // Others: none
  return 'none';
}

// ==================== ADAPTIVE BITRATE STREAMING ====================
export function selectVideoQuality(
  connectionSpeed: string,
  devicePixelRatio: number = 1
): keyof typeof VIDEO_QUALITIES {
  const dpr = Math.min(devicePixelRatio, 2);
  
  switch (connectionSpeed) {
    case 'slow-2g':
    case '2g':
      return 'low';
    case '3g':
      return dpr > 1 ? 'medium' : 'low';
    case '4g':
      return dpr > 1 ? 'high' : 'medium';
    case '5g':
    default:
      return 'high';
  }
}

// ==================== RESOURCE HINTS ====================
export function generateResourceHints() {
  return {
    dns: generateDNSPrefetch(),
    preconnect: [
      '<link rel="preconnect" href="https://cdn.anpip.com" crossorigin>',
      '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>',
    ],
    prefetch: [
      '<link rel="prefetch" href="/api/videos/trending" as="fetch" crossorigin>',
    ],
  };
}

export default {
  PERFORMANCE_TARGETS,
  IMAGE_SIZES,
  VIDEO_QUALITIES,
  CDN_CONFIG,
  CACHE_HEADERS,
  generateImageSrcSet,
  generateImageSizes,
  getAdaptiveVideoUrl,
  getCDNUrl,
  generateLazyLoadConfig,
  generatePreloadHints,
  generateDNSPrefetch,
  reportWebVitals,
  getVideoPreloadStrategy,
  selectVideoQuality,
  generateResourceHints,
};
