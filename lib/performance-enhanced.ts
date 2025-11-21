/**
 * PERFORMANCE OPTIMIZATION LIBRARY
 * 
 * Ziel: LCP < 1.5s, TBT < 100ms, CLS = 0
 * 
 * Features:
 * - Code Splitting & Lazy Loading
 * - Image Optimization
 * - Prefetching & Preloading
 * - Service Worker & Caching
 * - Resource Hints
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Lazy Load Component
 * Lädt Komponente nur wenn sichtbar
 */
export function useLazyLoad<T>(
  importFn: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = {}
): { Component: T | null; ref: React.RefObject<HTMLDivElement> } {
  const [Component, setComponent] = useState<T | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !Component) {
          importFn().then((module) => {
            setComponent(module.default);
          });
        }
      },
      { threshold: 0.01, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [Component]);

  return { Component, ref };
}

/**
 * Intersection Observer Hook
 * Erkennt, wann Element sichtbar wird
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.01, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Prefetch Link on Hover/Touch
 */
export function usePrefetchOnHover(url: string): {
  onMouseEnter: () => void;
  onTouchStart: () => void;
} {
  const prefetched = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetched.current) return;
    prefetched.current = true;

    // Prefetch HTML
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);

    // Prefetch in Next.js Router (wenn verwendet)
    if (typeof window !== 'undefined' && (window as any).next?.router) {
      (window as any).next.router.prefetch(url);
    }
  }, [url]);

  return {
    onMouseEnter: prefetch,
    onTouchStart: prefetch,
  };
}

/**
 * Preload Next Video
 * Lädt nächstes Video vor während aktuelles läuft
 */
export function preloadNextVideo(videoUrl: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'video';
  link.href = videoUrl;
  document.head.appendChild(link);
}

/**
 * Optimized Image Component Props
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  lazy?: boolean;
  quality?: number;
  formats?: ('webp' | 'avif' | 'jpg')[];
}

/**
 * Generate Srcset for Responsive Images
 */
export function generateSrcset(
  baseUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string {
  return widths.map((w) => `${baseUrl}?w=${w} ${w}w`).join(', ');
}

/**
 * Critical CSS Inline
 * Extrahiert kritisches CSS für Above-the-Fold
 */
export function injectCriticalCSS(css: string): void {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.setAttribute('data-critical', 'true');
  style.textContent = css;
  document.head.insertBefore(style, document.head.firstChild);
}

/**
 * Resource Hints Helper
 */
export function addResourceHints(hints: {
  preconnect?: string[];
  dnsPrefetch?: string[];
  prefetch?: string[];
  preload?: Array<{ href: string; as: string; type?: string }>;
}): void {
  if (typeof document === 'undefined') return;

  // DNS Prefetch
  hints.dnsPrefetch?.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  });

  // Preconnect
  hints.preconnect?.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Prefetch
  hints.prefetch?.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });

  // Preload
  hints.preload?.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  });
}

/**
 * Web Vitals Tracking
 */
export function trackWebVitals(callback: (metric: any) => void): void {
  if (typeof window === 'undefined') return;

  // LCP - Largest Contentful Paint
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    callback({
      name: 'LCP',
      value: lastEntry.renderTime || lastEntry.loadTime,
      rating: lastEntry.renderTime < 2500 ? 'good' : 'needs-improvement',
    });
  });
  observer.observe({ entryTypes: ['largest-contentful-paint'] });

  // FID - First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      callback({
        name: 'FID',
        value: entry.processingStart - entry.startTime,
        rating: entry.processingStart - entry.startTime < 100 ? 'good' : 'needs-improvement',
      });
    });
  });
  fidObserver.observe({ entryTypes: ['first-input'] });

  // CLS - Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    callback({
      name: 'CLS',
      value: clsValue,
      rating: clsValue < 0.1 ? 'good' : 'needs-improvement',
    });
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });
}

/**
 * Debounce Helper
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle Helper
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request Idle Callback Polyfill
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && window.requestIdleCallback
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(cb, 1);

/**
 * Bundle Size Analyzer
 */
export function logBundleSize(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const resources = performance.getEntriesByType('resource');
    const scripts = resources.filter((r: any) => r.initiatorType === 'script');
    const totalSize = scripts.reduce((acc: number, r: any) => acc + r.transferSize, 0);

    console.log('📦 Bundle Size Analysis:');
    console.log(`Total JS: ${(totalSize / 1024).toFixed(2)} KB`);
    console.table(
      scripts.map((r: any) => ({
        name: r.name.split('/').pop(),
        size: `${(r.transferSize / 1024).toFixed(2)} KB`,
        duration: `${r.duration.toFixed(2)} ms`,
      }))
    );
  });
}

/**
 * Service Worker Registration
 */
export function registerServiceWorker(swPath: string = '/service-worker.js'): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(swPath)
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

/**
 * Network Information API
 * Optimiert für langsame Verbindungen
 */
export function getNetworkInfo(): {
  effectiveType: string;
  downlink: number;
  saveData: boolean;
} | null {
  if (typeof navigator === 'undefined' || !(navigator as any).connection) {
    return null;
  }

  const conn = (navigator as any).connection;
  return {
    effectiveType: conn.effectiveType, // '4g', '3g', '2g', 'slow-2g'
    downlink: conn.downlink, // Mbps
    saveData: conn.saveData, // Data Saver aktiviert
  };
}

/**
 * Adaptive Loading basierend auf Netzwerk
 */
export function shouldLoadHighQuality(): boolean {
  const networkInfo = getNetworkInfo();

  if (!networkInfo) return true; // Default: High Quality

  // Bei schlechter Verbindung oder Data Saver: Low Quality
  if (networkInfo.saveData) return false;
  if (networkInfo.effectiveType === '2g' || networkInfo.effectiveType === 'slow-2g')
    return false;
  if (networkInfo.downlink < 1) return false;

  return true;
}
