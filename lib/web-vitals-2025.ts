/**
 * PERFORMANCE & CORE WEB VITALS OPTIMIZATION 2025
 * Image/Video Optimization, Lazy Loading, Caching, Adaptive Loading
 */

import { Platform } from 'react-native';

// ==================== CORE WEB VITALS ====================

export interface WebVitalsMetrics {
  lcp?: number; // Largest Contentful Paint - sollte < 2.5s sein
  fid?: number; // First Input Delay - sollte < 100ms sein
  cls?: number; // Cumulative Layout Shift - sollte < 0.1 sein
  fcp?: number; // First Contentful Paint - sollte < 1.8s sein
  ttfb?: number; // Time to First Byte - sollte < 600ms sein
  tti?: number; // Time to Interactive - sollte < 3.8s sein
}

/**
 * Web Vitals Tracking (nur Web)
 */
export function initWebVitals(): void {
  if (Platform.OS !== 'web') return;
  
  try {
    // @ts-ignore - web-vitals ist nur im Web-Build verfügbar
    import('web-vitals').then(({ onCLS, onFID, onLCP, onFCP, onTTFB }: any) => {
      onCLS((metric: any) => reportWebVital('CLS', metric.value));
      onFID((metric: any) => reportWebVital('FID', metric.value));
      onLCP((metric: any) => reportWebVital('LCP', metric.value));
      onFCP((metric: any) => reportWebVital('FCP', metric.value));
      onTTFB((metric: any) => reportWebVital('TTFB', metric.value));
    });
  } catch (error) {
    console.warn('Web Vitals not available:', error);
  }
}

function reportWebVital(name: string, value: number): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_category: 'Web Vitals',
      event_label: name,
      non_interaction: true,
    });
  }
  console.log(`[Web Vitals] ${name}:`, value);
}

// ==================== IMAGE OPTIMIZATION ====================

export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  maxWidth?: number;
  maxHeight?: number;
  lazyLoad?: boolean;
}

export function optimizeImageURL(url: string, config: ImageOptimizationConfig = {}): string {
  if (Platform.OS !== 'web') return url;
  
  const { quality = 85, format = 'webp', maxWidth, maxHeight } = config;
  
  if (url.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    if (maxWidth) params.append('width', maxWidth.toString());
    if (maxHeight) params.append('height', maxHeight.toString());
    params.append('quality', quality.toString());
    params.append('format', format);
    return `${url}?${params.toString()}`;
  }
  
  if (url.includes('imagedelivery.net')) {
    return url.replace('/public', `/public,q=${quality},f=${format}`);
  }
  
  return url;
}

export function generateResponsiveSrcSet(baseUrl: string, widths: number[] = [320, 640, 768, 1024, 1280, 1920]): string {
  return widths.map((width) => {
    const url = optimizeImageURL(baseUrl, { maxWidth: width, format: 'webp' });
    return `${url} ${width}w`;
  }).join(', ');
}

// ==================== VIDEO OPTIMIZATION ====================

export interface VideoOptimizationConfig {
  quality?: 'auto' | 'low' | 'medium' | 'high' | '4k';
  preload?: 'none' | 'metadata' | 'auto';
  poster?: string;
  lazyLoad?: boolean;
}

export function optimizeVideoURL(url: string, config: VideoOptimizationConfig = {}): string {
  const { quality = 'auto' } = config;
  let targetQuality = quality;
  
  if (Platform.OS === 'web' && quality === 'auto') {
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '4g') targetQuality = 'high';
      else if (effectiveType === '3g') targetQuality = 'medium';
      else targetQuality = 'low';
      
      if (connection.saveData) targetQuality = 'low';
    }
  }
  
  if (url.includes('cloudflarestream.com')) {
    const params = new URLSearchParams();
    switch (targetQuality) {
      case '4k': params.append('quality', '2160p'); break;
      case 'high': params.append('quality', '1080p'); break;
      case 'medium': params.append('quality', '720p'); break;
      case 'low': params.append('quality', '480p'); break;
    }
    return `${url}?${params.toString()}`;
  }
  
  return url;
}

export function getVideoPreloadStrategy(): 'none' | 'metadata' | 'auto' {
  if (Platform.OS !== 'web') return 'metadata';
  
  const connection = (navigator as any).connection;
  if (connection) {
    if (connection.saveData) return 'none';
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') return 'none';
    if (connection.effectiveType === '3g') return 'metadata';
  }
  
  return 'metadata';
}

// ==================== RESOURCE PRELOADING ====================

export function preloadCriticalResources(resources: {
  images?: string[];
  fonts?: string[];
  scripts?: string[];
}): void {
  if (Platform.OS !== 'web') return;
  
  const { images = [], fonts = [], scripts = [] } = resources;
  
  images.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizeImageURL(src, { format: 'webp' });
    document.head.appendChild(link);
  });
  
  fonts.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = src;
    document.head.appendChild(link);
  });
  
  scripts.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  });
}

export function addDNSPrefetch(domains: string[]): void {
  if (Platform.OS !== 'web') return;
  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
}

export function addPreconnect(domains: string[]): void {
  if (Platform.OS !== 'web') return;
  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// ==================== CACHING ====================

export function setupCaching(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(
      (registration) => console.log('Service Worker registered:', registration),
      (error) => console.error('Service Worker registration failed:', error)
    );
  }
}

export async function cachedFetch(url: string, cacheName: string = 'anpip-cache'): Promise<Response> {
  if (Platform.OS !== 'web' || !('caches' in window)) {
    return fetch(url);
  }
  
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(url);
    
    if (cached) {
      fetch(url).then((response) => {
        if (response.ok) cache.put(url, response.clone());
      });
      return cached;
    }
    
    const response = await fetch(url);
    if (response.ok) cache.put(url, response.clone());
    return response;
  } catch (error) {
    console.error('Cached fetch failed:', error);
    return fetch(url);
  }
}

// ==================== ADAPTIVE LOADING ====================

export function getDevicePerformanceClass(): 'low' | 'medium' | 'high' {
  if (Platform.OS !== 'web') return 'medium';
  
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 4;
  
  if (cores >= 8 && memory >= 8) return 'high';
  else if (cores >= 4 && memory >= 4) return 'medium';
  else return 'low';
}

export function getAdaptiveConfig(): {
  imageQuality: number;
  videoQuality: VideoOptimizationConfig['quality'];
  enableAnimations: boolean;
  prefetchCount: number;
} {
  const performanceClass = getDevicePerformanceClass();
  
  switch (performanceClass) {
    case 'high':
      return { imageQuality: 90, videoQuality: 'high', enableAnimations: true, prefetchCount: 3 };
    case 'medium':
      return { imageQuality: 80, videoQuality: 'medium', enableAnimations: true, prefetchCount: 2 };
    case 'low':
      return { imageQuality: 70, videoQuality: 'low', enableAnimations: false, prefetchCount: 1 };
  }
}

export function getNetworkInfo(): { effectiveType: string; downlink: number; rtt: number; saveData: boolean } | null {
  if (Platform.OS !== 'web') return null;
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!connection) return null;
  
  return {
    effectiveType: connection.effectiveType || '4g',
    downlink: connection.downlink || 10,
    rtt: connection.rtt || 100,
    saveData: connection.saveData || false,
  };
}

export function shouldLoadHighQuality(): boolean {
  const network = getNetworkInfo();
  if (!network) return true;
  
  if (network.saveData) return false;
  if (network.effectiveType === 'slow-2g' || network.effectiveType === '2g') return false;
  if (network.effectiveType === '3g') return false;
  
  return true;
}

export default {
  initWebVitals,
  optimizeImageURL,
  generateResponsiveSrcSet,
  optimizeVideoURL,
  getVideoPreloadStrategy,
  preloadCriticalResources,
  addDNSPrefetch,
  addPreconnect,
  setupCaching,
  cachedFetch,
  getDevicePerformanceClass,
  getAdaptiveConfig,
  getNetworkInfo,
  shouldLoadHighQuality,
};
