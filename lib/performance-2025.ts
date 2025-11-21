/**
 * PERFORMANCE OPTIMIZATION 2025
 * Ziel: LCP < 1.5s, INP < 100ms, CLS = 0.0
 * Techniken: Edge Caching, Smart Prefetching, Adaptive Loading
 */

import { Platform } from 'react-native';

// ==================== CORE WEB VITALS ====================

export interface WebVitalsMetrics {
  lcp?: number;      // Largest Contentful Paint
  fid?: number;      // First Input Delay
  cls?: number;      // Cumulative Layout Shift
  inp?: number;      // Interaction to Next Paint
  ttfb?: number;     // Time to First Byte
  fcp?: number;      // First Contentful Paint
}

/**
 * Advanced Web Vitals Monitoring mit Real User Monitoring (RUM)
 */
export function initAdvancedWebVitals(callback: (metrics: WebVitalsMetrics) => void) {
  if (Platform.OS !== 'web') return;

  const metrics: WebVitalsMetrics = {};
  
  // Performance Observer für moderne Metriken
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        metrics.lcp = entry.startTime;
      } else if (entry.entryType === 'first-input') {
        metrics.fid = (entry as any).processingStart - entry.startTime;
      } else if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
        metrics.cls = (metrics.cls || 0) + (entry as any).value;
      }
    }
    callback({ ...metrics });
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  } catch (e) {
    console.warn('Performance Observer not supported', e);
  }

  // Navigation Timing für TTFB & FCP
  if ('performance' in window && 'getEntriesByType' in performance) {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      const nav = navEntries[0];
      metrics.ttfb = nav.responseStart - nav.requestStart;
    }

    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
    }
  }

  // INP Tracking (Interaction to Next Paint)
  let lastInteractionTime = 0;
  const interactionHandler = () => {
    const now = performance.now();
    if (lastInteractionTime > 0) {
      const inp = now - lastInteractionTime;
      metrics.inp = Math.max(metrics.inp || 0, inp);
      callback({ ...metrics });
    }
    lastInteractionTime = now;
  };

  ['click', 'keydown', 'touchstart'].forEach(eventType => {
    document.addEventListener(eventType, interactionHandler, { passive: true });
  });
}

// ==================== ADAPTIVE LOADING ====================

/**
 * Erkennt Netzwerk-Geschwindigkeit und Device-Kapazität
 */
export function getAdaptiveLoadingStrategy() {
  if (Platform.OS !== 'web') {
    return { quality: 'high' as const, prefetch: true, lazyLoad: false, maxConcurrentLoads: 3 };
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  const strategy = {
    quality: 'high' as 'low' | 'medium' | 'high',
    prefetch: true,
    lazyLoad: false,
    maxConcurrentLoads: 3,
  };

  // Slow Connection Detection
  if (connection) {
    const effectiveType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
    const saveData = connection.saveData;

    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      strategy.quality = 'low';
      strategy.prefetch = false;
      strategy.lazyLoad = true;
      strategy.maxConcurrentLoads = 1;
    } else if (effectiveType === '3g') {
      strategy.quality = 'medium';
      strategy.prefetch = false;
      strategy.maxConcurrentLoads = 2;
    }
  }

  // Device Memory Detection
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory < 4) {
    strategy.quality = 'medium';
    strategy.maxConcurrentLoads = 2;
  }

  return strategy;
}

// ==================== SMART PREFETCHING ====================

const prefetchedURLs = new Set<string>();
const prefetchQueue: string[] = [];
let isPrefetching = false;

/**
 * Intelligentes Prefetching basierend auf User-Verhalten
 */
export function smartPrefetch(url: string, priority: 'high' | 'low' = 'low') {
  if (Platform.OS !== 'web' || prefetchedURLs.has(url)) return;

  const strategy = getAdaptiveLoadingStrategy();
  if (!strategy.prefetch) return;

  prefetchQueue.push(url);
  prefetchedURLs.add(url);

  if (!isPrefetching) {
    processPrefetchQueue();
  }
}

async function processPrefetchQueue() {
  isPrefetching = true;
  const strategy = getAdaptiveLoadingStrategy();

  while (prefetchQueue.length > 0) {
    const batch = prefetchQueue.splice(0, strategy.maxConcurrentLoads);
    
    await Promise.all(batch.map(async (url) => {
      try {
        // Use link rel="prefetch" for better browser optimization
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = url.includes('/api/') ? 'fetch' : 'document';
        document.head.appendChild(link);
        
        // Also do actual fetch for API endpoints
        if (url.includes('/api/')) {
          await fetch(url, { method: 'GET', credentials: 'include' });
        }
      } catch (error) {
        console.warn('Prefetch failed for', url, error);
      }
    }));

    // Pause zwischen Batches für bessere Performance
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  isPrefetching = false;
}

/**
 * Hover/Touch Prefetching für Links
 */
export function setupHoverPrefetch() {
  if (Platform.OS !== 'web') return;

  let hoverTimer: ReturnType<typeof setTimeout> | null = null;

  const handleHover = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href]') as HTMLAnchorElement;
    
    if (!link || !link.href) return;

    // Prefetch nach 100ms Hover
    hoverTimer = setTimeout(() => {
      smartPrefetch(link.href, 'high');
    }, 100);
  };

  const handleLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
  };

  document.addEventListener('mouseover', handleHover, { passive: true });
  document.addEventListener('mouseout', handleLeave, { passive: true });
  
  // Touch Prefetch
  document.addEventListener('touchstart', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href]') as HTMLAnchorElement;
    if (link?.href) {
      smartPrefetch(link.href, 'high');
    }
  }, { passive: true });
}

// ==================== IMAGE OPTIMIZATION ====================

/**
 * Generiert optimierte Image URLs mit WebP/AVIF Support
 */
export function getOptimizedImageURL(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}
): string {
  if (!url || Platform.OS !== 'web') return url;

  const { width, height, quality = 85, format = 'auto' } = options;
  const strategy = getAdaptiveLoadingStrategy();

  // Automatische Format-Erkennung
  let selectedFormat: string = format;
  if (format === 'auto') {
    const supportsAvif = 'image/avif' in (new Image() as any);
    const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    selectedFormat = supportsAvif ? 'avif' : supportsWebP ? 'webp' : 'jpeg';
  }

  // Qualitäts-Anpassung basierend auf Connection
  let adjustedQuality = quality;
  if (strategy.quality === 'low') adjustedQuality = Math.min(quality, 60);
  else if (strategy.quality === 'medium') adjustedQuality = Math.min(quality, 75);

  // Supabase Storage Transformation
  if (url.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('quality', adjustedQuality.toString());
    params.set('format', selectedFormat as string);
    
    return `${url}?${params.toString()}`;
  }

  return url;
}

// ==================== VIDEO OPTIMIZATION ====================

/**
 * Adaptive Video Quality Selection
 */
export function getOptimalVideoQuality(): '360p' | '480p' | '720p' | '1080p' {
  const strategy = getAdaptiveLoadingStrategy();
  
  if (strategy.quality === 'low') return '360p';
  if (strategy.quality === 'medium') return '480p';
  
  // High-Quality: Check screen size
  const width = window.innerWidth;
  if (width >= 1920) return '1080p';
  if (width >= 1280) return '720p';
  return '480p';
}

/**
 * Video Preloading Strategy
 */
export function getVideoPreloadStrategy(): 'none' | 'metadata' | 'auto' {
  const strategy = getAdaptiveLoadingStrategy();
  
  if (strategy.quality === 'low') return 'none';
  if (strategy.quality === 'medium') return 'metadata';
  return 'metadata'; // Nicht 'auto' wegen Datenverbrauch
}

// ==================== CODE SPLITTING ====================

/**
 * Dynamic Import mit Error Handling & Retry
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Dynamic import failed after retries');
}

// ==================== CACHE OPTIMIZATION ====================

/**
 * Service Worker Cache Strategy
 */
export function setupAdvancedCaching() {
  if (Platform.OS !== 'web' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('✅ Service Worker registered:', registration.scope);
      
      // Update auf neuen Versionen
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Neue Version verfügbar
              console.log('🔄 New version available');
              if (confirm('Neue Version verfügbar! Jetzt aktualisieren?')) {
                window.location.reload();
              }
            }
          });
        }
      });
    })
    .catch(error => {
      console.warn('Service Worker registration failed:', error);
    });
}

// ==================== RESOURCE HINTS ====================

/**
 * DNS Prefetch, Preconnect, Preload für kritische Ressourcen
 */
export function addAdvancedResourceHints() {
  if (Platform.OS !== 'web') return;

  const hints = [
    // DNS Prefetch
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
    
    // Preconnect für kritische Origins
    { rel: 'preconnect', href: 'https://fkmhucsjybyhjrgodwcx.supabase.co', crossOrigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossOrigin: 'anonymous' },
    
    // Preload für kritische Fonts (wenn bekannt)
    // { rel: 'preload', href: '/fonts/main.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin;
    if ((hint as any).as) link.as = (hint as any).as;
    if ((hint as any).type) link.type = (hint as any).type;
    document.head.appendChild(link);
  });
}

// ==================== CRITICAL CSS ====================

/**
 * Inline Critical CSS in <head>
 */
export function injectCriticalCSS(css: string) {
  if (Platform.OS !== 'web') return;

  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.insertBefore(style, document.head.firstChild);
}

// ==================== LAZY HYDRATION ====================

/**
 * Progressive Hydration für bessere INP
 */
export function setupProgressiveHydration() {
  if (Platform.OS !== 'web') return;

  // Hydrate above-the-fold content first
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const componentName = element.dataset.component;
        
        if (componentName) {
          // Trigger hydration
          element.dispatchEvent(new CustomEvent('hydrate'));
          observer.unobserve(element);
        }
      }
    });
  }, { rootMargin: '50px' });

  // Observe all lazy-hydrate elements
  document.querySelectorAll('[data-lazy-hydrate]').forEach(el => {
    observer.observe(el);
  });
}

// ==================== PERFORMANCE BUDGET ====================

/**
 * Performance Budget Monitoring
 */
export interface PerformanceBudget {
  maxLCP: number;
  maxINP: number;
  maxCLS: number;
  maxTTFB: number;
  maxBundleSize: number;
}

const DEFAULT_BUDGET: PerformanceBudget = {
  maxLCP: 1500,      // 1.5s
  maxINP: 100,       // 100ms
  maxCLS: 0.05,      // 0.05
  maxTTFB: 500,      // 500ms
  maxBundleSize: 300 * 1024, // 300KB
};

export function checkPerformanceBudget(
  metrics: WebVitalsMetrics,
  budget: PerformanceBudget = DEFAULT_BUDGET
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  if (metrics.lcp && metrics.lcp > budget.maxLCP) {
    violations.push(`LCP: ${Math.round(metrics.lcp)}ms > ${budget.maxLCP}ms`);
  }
  if (metrics.inp && metrics.inp > budget.maxINP) {
    violations.push(`INP: ${Math.round(metrics.inp)}ms > ${budget.maxINP}ms`);
  }
  if (metrics.cls && metrics.cls > budget.maxCLS) {
    violations.push(`CLS: ${metrics.cls.toFixed(3)} > ${budget.maxCLS}`);
  }
  if (metrics.ttfb && metrics.ttfb > budget.maxTTFB) {
    violations.push(`TTFB: ${Math.round(metrics.ttfb)}ms > ${budget.maxTTFB}ms`);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

// ==================== EXPORT ALL ====================

export default {
  initAdvancedWebVitals,
  getAdaptiveLoadingStrategy,
  smartPrefetch,
  setupHoverPrefetch,
  getOptimizedImageURL,
  getOptimalVideoQuality,
  getVideoPreloadStrategy,
  dynamicImport,
  setupAdvancedCaching,
  addAdvancedResourceHints,
  injectCriticalCSS,
  setupProgressiveHydration,
  checkPerformanceBudget,
};
