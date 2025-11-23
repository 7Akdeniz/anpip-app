/**
 * PERFORMANCE OPTIMIZATION
 * Core Web Vitals, Video Streaming, Preload/Prefetch
 * Optimiert für 9:16 Videos und schnelles Feed-Scrolling
 */

/**
 * Preload-Strategien für Videos
 */
export const videoPreloadStrategies = {
  // Aggressive: Lädt nächste 3 Videos vor
  aggressive: {
    preloadCount: 3,
    preloadDistance: 1, // Screens entfernt
    preloadMetadata: true,
    preloadThumbnails: 5
  },
  
  // Balanced: Standard für Mobile
  balanced: {
    preloadCount: 2,
    preloadDistance: 0.5,
    preloadMetadata: true,
    preloadThumbnails: 3
  },
  
  // Conservative: Spart Daten
  conservative: {
    preloadCount: 1,
    preloadDistance: 0.3,
    preloadMetadata: true,
    preloadThumbnails: 2
  }
};

/**
 * Adaptive Streaming Configuration für Cloudflare Stream
 */
export interface StreamingConfig {
  quality: 'auto' | '1080p' | '720p' | '480p' | '360p';
  adaptiveBitrate: boolean;
  preloadNextVideo: boolean;
  bufferAhead: number; // Sekunden
}

export function getStreamingConfig(networkSpeed: 'fast' | 'medium' | 'slow'): StreamingConfig {
  switch (networkSpeed) {
    case 'fast':
      return {
        quality: '1080p',
        adaptiveBitrate: true,
        preloadNextVideo: true,
        bufferAhead: 10
      };
    case 'medium':
      return {
        quality: '720p',
        adaptiveBitrate: true,
        preloadNextVideo: true,
        bufferAhead: 5
      };
    case 'slow':
      return {
        quality: '480p',
        adaptiveBitrate: true,
        preloadNextVideo: false,
        bufferAhead: 3
      };
  }
}

/**
 * Erkennt Netzwerk-Geschwindigkeit
 */
export async function detectNetworkSpeed(): Promise<'fast' | 'medium' | 'slow'> {
  // @ts-ignore - Navigator.connection ist experimental
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return 'medium';
  }

  const effectiveType = connection.effectiveType;
  
  switch (effectiveType) {
    case '4g':
      return 'fast';
    case '3g':
      return 'medium';
    case '2g':
    case 'slow-2g':
      return 'slow';
    default:
      return 'medium';
  }
}

/**
 * Preload nächstes Video im Feed
 */
export function preloadNextVideo(videoUrl: string, thumbnailUrl?: string) {
  // Preload Video
  const videoLink = document.createElement('link');
  videoLink.rel = 'preload';
  videoLink.as = 'video';
  videoLink.href = videoUrl;
  document.head.appendChild(videoLink);

  // Preload Thumbnail
  if (thumbnailUrl) {
    const imgLink = document.createElement('link');
    imgLink.rel = 'preload';
    imgLink.as = 'image';
    imgLink.href = thumbnailUrl;
    document.head.appendChild(imgLink);
  }
}

/**
 * Prefetch nächste Seite/Route
 */
export function prefetchRoute(route: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
}

/**
 * Lazy Load Images mit Intersection Observer
 */
export function lazyLoadImage(img: HTMLImageElement, src: string, threshold = 0.5) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.disconnect();
        }
      });
    },
    { threshold }
  );
  
  observer.observe(img);
}

/**
 * Video Buffering Strategie
 */
export class VideoBufferManager {
  private bufferCache = new Map<string, ArrayBuffer>();
  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private currentCacheSize = 0;

  async preloadVideo(url: string): Promise<void> {
    if (this.bufferCache.has(url)) {
      return;
    }

    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      
      // Cache-Größe prüfen
      if (this.currentCacheSize + buffer.byteLength > this.maxCacheSize) {
        this.clearOldestCache();
      }

      this.bufferCache.set(url, buffer);
      this.currentCacheSize += buffer.byteLength;
    } catch (error) {
      console.error('Video preload failed:', error);
    }
  }

  getVideo(url: string): ArrayBuffer | null {
    return this.bufferCache.get(url) || null;
  }

  private clearOldestCache() {
    const firstKey = this.bufferCache.keys().next().value;
    if (firstKey) {
      const buffer = this.bufferCache.get(firstKey);
      if (buffer) {
        this.currentCacheSize -= buffer.byteLength;
      }
      this.bufferCache.delete(firstKey);
    }
  }

  clearAll() {
    this.bufferCache.clear();
    this.currentCacheSize = 0;
  }
}

/**
 * Core Web Vitals Monitoring
 */
export interface WebVitals {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
}

export function measureWebVitals(): Promise<Partial<WebVitals>> {
  return new Promise((resolve) => {
    const vitals: Partial<WebVitals> = {};

    // LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number };
      vitals.LCP = lastEntry.renderTime || lastEntry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // FID
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstEntry = entries[0] as PerformanceEventTiming;
      vitals.FID = firstEntry.processingStart - firstEntry.startTime;
    }).observe({ type: 'first-input', buffered: true });

    // CLS
    let cls = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as LayoutShift[]) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      }
      vitals.CLS = cls;
    }).observe({ type: 'layout-shift', buffered: true });

    // FCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstEntry = entries[0];
      vitals.FCP = firstEntry.startTime;
    }).observe({ type: 'paint', buffered: true });

    // TTFB
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navTiming) {
      vitals.TTFB = navTiming.responseStart - navTiming.requestStart;
    }

    setTimeout(() => resolve(vitals), 3000);
  });
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

/**
 * Optimiert Bilder für verschiedene Geräte
 */
export function generateResponsiveImageSrcSet(baseUrl: string): string {
  return `
    ${baseUrl}?w=320 320w,
    ${baseUrl}?w=640 640w,
    ${baseUrl}?w=960 960w,
    ${baseUrl}?w=1280 1280w,
    ${baseUrl}?w=1920 1920w
  `.trim();
}

/**
 * CDN URL Generator (Cloudflare Images)
 */
export function getCdnUrl(
  imageUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  } = {}
): string {
  const {
    width,
    height,
    quality = 85,
    format = 'auto',
    fit = 'cover'
  } = options;

  const params = new URLSearchParams();
  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());
  params.set('format', format);
  params.set('fit', fit);

  return `${imageUrl}?${params.toString()}`;
}

/**
 * Service Worker Cache-Strategie
 */
export const cacheStrategies = {
  // Videos: Network-First (immer frisch)
  videos: 'networkFirst',
  
  // Thumbnails: Cache-First (schnell laden)
  thumbnails: 'cacheFirst',
  
  // API: Network-First mit Fallback
  api: 'networkFirst',
  
  // Static Assets: Cache-First
  static: 'cacheFirst'
};

/**
 * Generiert Cache-Control Headers
 */
export function getCacheHeaders(type: 'video' | 'thumbnail' | 'api' | 'static'): string {
  switch (type) {
    case 'video':
      return 'public, max-age=3600, s-maxage=86400'; // 1h client, 24h CDN
    case 'thumbnail':
      return 'public, max-age=604800, s-maxage=2592000'; // 7d client, 30d CDN
    case 'api':
      return 'public, max-age=60, s-maxage=300'; // 1m client, 5m CDN
    case 'static':
      return 'public, max-age=31536000, immutable'; // 1 Jahr
  }
}
