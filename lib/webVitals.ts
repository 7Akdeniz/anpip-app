/**
 * Web Vitals & Performance Monitoring
 * Core Web Vitals für 2025: LCP, FID, CLS, INP, TTFB, FCP
 */

import { Platform } from 'react-native';

export interface WebVitalsMetrics {
  // Core Web Vitals
  lcp?: number;  // Largest Contentful Paint
  fid?: number;  // First Input Delay (deprecated in 2024)
  cls?: number;  // Cumulative Layout Shift
  inp?: number;  // Interaction to Next Paint (new in 2024)
  
  // Additional Metrics
  ttfb?: number; // Time to First Byte
  fcp?: number;  // First Contentful Paint
  
  // Custom Metrics
  videoLoadTime?: number;
  apiResponseTime?: number;
  timestamp: number;
  url: string;
}

export type WebVitalsCallback = (metrics: WebVitalsMetrics) => void;

let metricsCallback: WebVitalsCallback | null = null;
const metrics: WebVitalsMetrics = {
  timestamp: Date.now(),
  url: typeof window !== 'undefined' ? window.location.href : '',
};

/**
 * Initialize Web Vitals Monitoring
 */
export function initWebVitals(callback: WebVitalsCallback) {
  if (Platform.OS !== 'web') return;

  metricsCallback = callback;

  // Use native Web Vitals library if available
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    measureLCP();
    measureFID();
    measureCLS();
    measureINP();
    measureFCP();
    measureTTFB();
  }
}

/**
 * Largest Contentful Paint (LCP)
 * Good: < 2.5s, Needs Improvement: 2.5s - 4s, Poor: > 4s
 */
function measureLCP() {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      const value = lastEntry.renderTime || lastEntry.loadTime;
      metrics.lcp = value;
      
      reportMetric('LCP', value);
    });
    
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP measurement not supported');
  }
}

/**
 * First Input Delay (FID)
 * Good: < 100ms, Needs Improvement: 100ms - 300ms, Poor: > 300ms
 * Note: Deprecated, replaced by INP in 2024
 */
function measureFID() {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        const value = entry.processingStart - entry.startTime;
        metrics.fid = value;
        
        reportMetric('FID', value);
      });
    });
    
    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('FID measurement not supported');
  }
}

/**
 * Cumulative Layout Shift (CLS)
 * Good: < 0.1, Needs Improvement: 0.1 - 0.25, Poor: > 0.25
 */
function measureCLS() {
  try {
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: any[] = [];
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        // Ignore entries with recent user input
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
          
          // Start new session if gap > 1s or > 5s since first entry
          if (
            sessionValue &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000
          ) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }
          
          // Update CLS if new session value is larger
          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            metrics.cls = clsValue;
            
            reportMetric('CLS', clsValue);
          }
        }
      }
    });
    
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('CLS measurement not supported');
  }
}

/**
 * Interaction to Next Paint (INP)
 * Good: < 200ms, Needs Improvement: 200ms - 500ms, Poor: > 500ms
 * Replaces FID as Core Web Vital in 2024
 */
function measureINP() {
  try {
    let longestInteraction = 0;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        const duration = entry.processingEnd - entry.processingStart;
        
        if (duration > longestInteraction) {
          longestInteraction = duration;
          metrics.inp = duration;
          
          reportMetric('INP', duration);
        }
      }
    });
    
    observer.observe({ type: 'event', buffered: true } as any);
  } catch (e) {
    console.warn('INP measurement not supported');
  }
}

/**
 * First Contentful Paint (FCP)
 * Good: < 1.8s, Needs Improvement: 1.8s - 3s, Poor: > 3s
 */
function measureFCP() {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
          
          reportMetric('FCP', entry.startTime);
        }
      });
    });
    
    observer.observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.warn('FCP measurement not supported');
  }
}

/**
 * Time to First Byte (TTFB)
 * Good: < 800ms, Needs Improvement: 800ms - 1800ms, Poor: > 1800ms
 */
function measureTTFB() {
  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
    
    if (navigationEntry) {
      const value = navigationEntry.responseStart - navigationEntry.requestStart;
      metrics.ttfb = value;
      
      reportMetric('TTFB', value);
    }
  } catch (e) {
    console.warn('TTFB measurement not supported');
  }
}

/**
 * Report Metric
 */
function reportMetric(name: string, value: number) {
  console.log(`[Web Vitals] ${name}:`, `${Math.round(value)}ms`);
  
  if (metricsCallback) {
    metricsCallback({ ...metrics });
  }
  
  // Send to Analytics
  sendToAnalytics(name, value);
}

/**
 * Send Metrics to Analytics
 */
function sendToAnalytics(name: string, value: number) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', name, {
      value: Math.round(value),
      metric_id: name.toLowerCase(),
      metric_value: value,
      metric_delta: value,
    });
  }
  
  // Custom Analytics Endpoint
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const data = JSON.stringify({
      metric: name,
      value: Math.round(value),
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    });
    
    navigator.sendBeacon('/api/analytics/vitals', data);
  }
}

/**
 * Measure Custom Metric
 */
export function measureCustomMetric(name: string, startTime: number) {
  const duration = performance.now() - startTime;
  
  console.log(`[Custom Metric] ${name}:`, `${Math.round(duration)}ms`);
  
  if (name === 'videoLoad') {
    metrics.videoLoadTime = duration;
  } else if (name === 'apiResponse') {
    metrics.apiResponseTime = duration;
  }
  
  sendToAnalytics(name, duration);
  
  return duration;
}

/**
 * Mark Performance Point
 */
export function markPerformance(name: string) {
  if (Platform.OS !== 'web') return;
  
  if ('performance' in window && 'mark' in performance) {
    performance.mark(name);
  }
}

/**
 * Measure Performance between two marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (Platform.OS !== 'web') return;
  
  if ('performance' in window && 'measure' in performance) {
    try {
      performance.measure(name, startMark, endMark);
      
      const measure = performance.getEntriesByName(name)[0];
      if (measure) {
        console.log(`[Performance] ${name}:`, `${Math.round(measure.duration)}ms`);
        sendToAnalytics(name, measure.duration);
      }
    } catch (e) {
      console.warn(`Could not measure ${name}`);
    }
  }
}

/**
 * Get All Metrics
 */
export function getWebVitalsMetrics(): WebVitalsMetrics {
  return { ...metrics };
}

/**
 * Get Performance Rating
 */
export function getPerformanceRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    INP: { good: 200, poor: 500 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };
  
  const threshold = thresholds[metric];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Monitor Resource Timing
 */
export function monitorResourceTiming() {
  if (Platform.OS !== 'web') return;
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming;
      
      // Log slow resources (> 1s)
      if (resource.duration > 1000) {
        console.warn(`[Slow Resource] ${resource.name}:`, `${Math.round(resource.duration)}ms`);
      }
    }
  });
  
  observer.observe({ type: 'resource', buffered: true });
}

/**
 * Get Page Load Performance Summary
 */
export function getPageLoadSummary() {
  if (Platform.OS !== 'web') return null;
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;
  
  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domProcessing: navigation.domComplete - navigation.domInteractive,
    total: navigation.loadEventEnd - navigation.fetchStart,
  };
}
