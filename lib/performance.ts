/**
 * Performance Utilities
 * Core Web Vitals Optimization für 2025
 */

/**
 * Lazy Load Images with Intersection Observer
 */
export function setupLazyLoading() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }

          if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
          }

          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    }
  );

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Preload Critical Resources
 */
export function preloadCriticalResources(resources: Array<{
  href: string;
  as: 'image' | 'video' | 'script' | 'style' | 'font';
  type?: string;
  crossOrigin?: boolean;
}>) {
  if (typeof document === 'undefined') return;

  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;

    if (resource.type) {
      link.type = resource.type;
    }

    if (resource.crossOrigin) {
      link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);
  });
}

/**
 * Measure Core Web Vitals
 */
export interface WebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint (new in 2025)
}

export function measureWebVitals(callback: (metrics: WebVitals) => void) {
  if (typeof window === 'undefined') return;

  const vitals: WebVitals = {};

  // Use web-vitals library if available
  if ('web-vitals' in window) {
    return;
  }

  // Fallback: Performance Observer API
  if ('PerformanceObserver' in window) {
    // LCP
    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        callback(vitals);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('LCP measurement not supported');
    }

    // FID
    try {
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          vitals.fid = (entry as any).processingStart - entry.startTime;
          callback(vitals);
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('FID measurement not supported');
    }

    // CLS
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            vitals.cls = clsValue;
            callback(vitals);
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('CLS measurement not supported');
    }
  }

  // Navigation Timing
  if ('performance' in window && 'timing' in performance) {
    const timing = performance.timing;
    vitals.ttfb = timing.responseStart - timing.requestStart;
    vitals.fcp = timing.domContentLoadedEventEnd - timing.navigationStart;
    callback(vitals);
  }
}

/**
 * Debounce Function for Performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle Function for Performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Prefetch Links on Hover/Touch
 */
export function setupPrefetching() {
  if (typeof window === 'undefined') return;

  const prefetchLink = (url: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  };

  // Prefetch on hover (desktop)
  document.addEventListener(
    'mouseover',
    event => {
      const target = (event.target as HTMLElement).closest('a');
      if (target && target.href && !target.dataset.prefetched) {
        prefetchLink(target.href);
        target.dataset.prefetched = 'true';
      }
    },
    { passive: true }
  );

  // Prefetch on touch start (mobile)
  document.addEventListener(
    'touchstart',
    event => {
      const target = (event.target as HTMLElement).closest('a');
      if (target && target.href && !target.dataset.prefetched) {
        prefetchLink(target.href);
        target.dataset.prefetched = 'true';
      }
    },
    { passive: true }
  );
}

/**
 * Resource Hints
 */
export function addResourceHints(hints: Array<{
  rel: 'dns-prefetch' | 'preconnect' | 'prefetch' | 'prerender';
  href: string;
  crossOrigin?: boolean;
}>) {
  if (typeof document === 'undefined') return;

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;

    if (hint.crossOrigin) {
      link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);
  });
}

/**
 * Optimize Video Loading
 */
export function optimizeVideoLoading(videoElement: HTMLVideoElement) {
  // Preload metadata only
  videoElement.preload = 'metadata';

  // Use Intersection Observer for lazy loading
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          videoElement.preload = 'auto';
          observer.unobserve(videoElement);
        }
      });
    },
    { rootMargin: '200px' }
  );

  observer.observe(videoElement);
}

/**
 * Cache API Helper
 */
export async function cacheResource(cacheName: string, url: string, response: Response) {
  if ('caches' in window) {
    const cache = await caches.open(cacheName);
    await cache.put(url, response.clone());
  }
}

export async function getCachedResource(cacheName: string, url: string): Promise<Response | undefined> {
  if ('caches' in window) {
    const cache = await caches.open(cacheName);
    return await cache.match(url);
  }
  return undefined;
}

/**
 * Network Information API
 */
export function getConnectionQuality(): 'slow' | 'medium' | 'fast' {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'medium';
  }

  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType;

  if (effectiveType === '4g') return 'fast';
  if (effectiveType === '3g') return 'medium';
  return 'slow';
}

/**
 * Adaptive Loading based on Connection
 */
export function shouldLoadHighQuality(): boolean {
  const quality = getConnectionQuality();
  return quality === 'fast';
}

/**
 * Request Idle Callback Polyfill
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback
  return setTimeout(callback, 1);
}

/**
 * Cancel Idle Callback
 */
export function cancelIdleCallback(id: number) {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}
