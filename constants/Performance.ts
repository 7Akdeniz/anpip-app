/**
 * ANPIP.COM - PERFORMANCE OPTIMIERUNG
 * 60 FPS, Lazy Loading, Code-Splitting
 * 
 * Best Practices für 2025
 */

import { Platform, InteractionManager } from 'react-native';

// ============================
// 1. LAZY LOADING HELPER
// ============================

/**
 * Verzögert Ausführung bis Interaktionen abgeschlossen sind
 * Verhindert Ruckeln bei Navigation/Animationen
 */
export function runAfterInteractions<T>(callback: () => T): Promise<T> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      resolve(callback());
    });
  });
}

/**
 * Debounce für häufige Events (Scroll, Input)
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
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle für kontinuierliche Events (Scroll Position)
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

// ============================
// 2. IMAGE OPTIMIZATION
// ============================

export const ImageOptimization = {
  /**
   * Optimale Bildgröße basierend auf Gerät
   */
  getOptimalImageSize(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number
  ): { width: number; height: number } {
    const screenWidth = maxWidth || require('react-native').Dimensions.get('window').width;
    const pixelRatio = require('react-native').PixelRatio.get();
    
    // Maximale Breite basierend auf Screen + Pixel Ratio
    const targetWidth = Math.min(originalWidth, screenWidth * pixelRatio);
    const aspectRatio = originalHeight / originalWidth;
    const targetHeight = targetWidth * aspectRatio;
    
    return {
      width: Math.round(targetWidth),
      height: Math.round(targetHeight),
    };
  },
  
  /**
   * Optimale Bild-Qualität basierend auf Netzwerk
   */
  getOptimalQuality(networkType?: string): number {
    // In React Native würdest du @react-native-community/netinfo verwenden
    switch (networkType) {
      case 'wifi':
        return 0.9;
      case '4g':
        return 0.8;
      case '3g':
        return 0.6;
      case '2g':
        return 0.4;
      default:
        return 0.8;
    }
  },
  
  /**
   * Generiert srcset für responsive Images (Web)
   */
  generateSrcSet(baseUrl: string, widths: number[]): string {
    return widths
      .map((width) => `${baseUrl}?w=${width} ${width}w`)
      .join(', ');
  },
  
  /**
   * WebP/AVIF Support Detection
   */
  supportsModernFormats(): boolean {
    if (Platform.OS === 'web') {
      // Browser Support für WebP/AVIF
      return true; // Moderne Browser unterstützen beide
    }
    // React Native unterstützt WebP nativ
    return true;
  },
};

// ============================
// 3. VIDEO OPTIMIZATION
// ============================

export const VideoOptimization = {
  /**
   * Optimale Video-Qualität basierend auf Gerät
   */
  getOptimalVideoQuality(
    deviceType: string,
    networkType?: string
  ): {
    resolution: string;
    bitrate: number;
    fps: number;
  } {
    const isWifi = networkType === 'wifi';
    
    switch (deviceType) {
      case 'phone':
        return {
          resolution: isWifi ? '1080p' : '720p',
          bitrate: isWifi ? 2500 : 1500,
          fps: 30,
        };
      case 'tablet':
        return {
          resolution: isWifi ? '1080p' : '720p',
          bitrate: isWifi ? 3000 : 2000,
          fps: 30,
        };
      case 'desktop':
        return {
          resolution: isWifi ? '4k' : '1080p',
          bitrate: isWifi ? 8000 : 3000,
          fps: 60,
        };
      default:
        return {
          resolution: '720p',
          bitrate: 1500,
          fps: 30,
        };
    }
  },
  
  /**
   * Preload-Strategie für Videos
   */
  getPreloadStrategy(isVisible: boolean, isNearby: boolean): 'auto' | 'metadata' | 'none' {
    if (isVisible) return 'auto';
    if (isNearby) return 'metadata';
    return 'none';
  },
  
  /**
   * Adaptive Bitrate Streaming URLs
   */
  getAdaptiveStreamUrl(baseUrl: string, quality: 'auto' | 'high' | 'medium' | 'low'): string {
    const qualityMap = {
      auto: '',
      high: '?quality=1080p',
      medium: '?quality=720p',
      low: '?quality=480p',
    };
    
    return `${baseUrl}${qualityMap[quality]}`;
  },
};

// ============================
// 4. ANIMATION OPTIMIZATION
// ============================

export const AnimationOptimization = {
  /**
   * 60 FPS Animation Config
   */
  smoothAnimation: {
    duration: 300,
    useNativeDriver: true, // Wichtig für 60 FPS!
    isInteraction: false,
  },
  
  /**
   * Schnelle Animationen (UI Feedback)
   */
  fastAnimation: {
    duration: 150,
    useNativeDriver: true,
    isInteraction: false,
  },
  
  /**
   * Langsame Animationen (Page Transitions)
   */
  slowAnimation: {
    duration: 500,
    useNativeDriver: true,
    isInteraction: true,
  },
  
  /**
   * Spring Animation (natürlich)
   */
  springAnimation: {
    tension: 50,
    friction: 7,
    useNativeDriver: true,
  },
  
  /**
   * Layout Animation Config (für Größenänderungen)
   */
  layoutAnimation: {
    duration: 300,
    create: {
      type: 'easeInEaseOut' as const,
      property: 'opacity' as const,
    },
    update: {
      type: 'easeInEaseOut' as const,
    },
    delete: {
      type: 'easeInEaseOut' as const,
      property: 'opacity' as const,
    },
  },
};

// ============================
// 5. LISTE OPTIMIZATION (FlatList)
// ============================

export const ListOptimization = {
  /**
   * Optimale FlatList Props für Performance
   */
  getOptimalFlatListProps(itemCount: number) {
    return {
      // Rendering Optimization
      removeClippedSubviews: Platform.OS === 'android', // Android Performance
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      initialNumToRender: 5,
      windowSize: 10,
      
      // Memory Optimization
      getItemLayout: itemCount < 1000 ? undefined : (data: any, index: number) => ({
        length: 400, // Durchschnittliche Item-Höhe
        offset: 400 * index,
        index,
      }),
    };
  },
  
  /**
   * Key Extractor (wichtig für Performance)
   */
  keyExtractor: (item: any, index: number) => 
    item.id?.toString() || `item-${index}`,
};

// ============================
// 6. MEMORY MANAGEMENT
// ============================

export const MemoryOptimization = {
  /**
   * Cleanup für Komponenten
   */
  cleanup: {
    /**
     * Interval Cleanup
     */
    clearIntervals: (intervals: NodeJS.Timeout[]) => {
      intervals.forEach(clearInterval);
    },
    
    /**
     * Timeout Cleanup
     */
    clearTimeouts: (timeouts: NodeJS.Timeout[]) => {
      timeouts.forEach(clearTimeout);
    },
    
    /**
     * Event Listener Cleanup
     */
    removeListeners: (listeners: Array<{ remove: () => void }>) => {
      listeners.forEach(listener => listener.remove());
    },
  },
  
  /**
   * Image Cache Limits
   */
  imageCacheSize: {
    maxMemoryCacheSize: 50 * 1024 * 1024, // 50 MB
    maxDiskCacheSize: 200 * 1024 * 1024,  // 200 MB
  },
};

// ============================
// 7. BUNDLE SIZE OPTIMIZATION
// ============================

export const BundleOptimization = {
  /**
   * Dynamic Imports (Code Splitting)
   * 
   * Beispiel:
   * const VideoPlayer = React.lazy(() => import('./VideoPlayer'));
   */
  shouldSplit: (componentSize: number) => {
    // Splitte Komponenten > 50KB
    return componentSize > 50 * 1024;
  },
  
  /**
   * Tree Shaking Hints
   */
  treeShakable: {
    // Import nur was du brauchst
    // ❌ import * as Utils from './utils';
    // ✅ import { debounce, throttle } from './utils';
  },
};

// ============================
// 8. NETWORK OPTIMIZATION
// ============================

export const NetworkOptimization = {
  /**
   * Request Batching
   */
  batchRequests: <T>(
    requests: Array<() => Promise<T>>,
    batchSize: number = 5
  ): Promise<T[]> => {
    const batches: Array<Array<() => Promise<T>>> = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }
    
    return batches.reduce(
      async (promise, batch) => {
        const results = await promise;
        const batchResults = await Promise.all(batch.map(req => req()));
        return [...results, ...batchResults];
      },
      Promise.resolve([]) as Promise<T[]>
    );
  },
  
  /**
   * Request Timeout
   */
  withTimeout: <T>(
    promise: Promise<T>,
    timeoutMs: number = 10000
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      ),
    ]);
  },
  
  /**
   * Retry Logic
   */
  retry: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
    throw new Error('Max retries exceeded');
  },
};

// ============================
// 9. FONT LOADING OPTIMIZATION
// ============================

export const FontOptimization = {
  /**
   * Preload wichtige Fonts
   */
  preloadFonts: [
    'System', // System Font ist immer verfügbar
  ],
  
  /**
   * Font Display Strategy
   */
  fontDisplay: 'swap' as const, // Zeigt Fallback bis Font geladen
  
  /**
   * Subset Strategy (nur benötigte Zeichen laden)
   */
  subset: 'latin-extended',
};

// ============================
// 10. PERFORMANCE MONITORING
// ============================

export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  
  /**
   * Startet Performance Messung
   */
  start(label: string): void {
    this.marks.set(label, Date.now());
  }
  
  /**
   * Beendet Messung und gibt Dauer zurück
   */
  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`Performance mark "${label}" not found`);
      return 0;
    }
    
    const duration = Date.now() - startTime;
    this.marks.delete(label);
    
    if (__DEV__) {
      console.log(`⚡ ${label}: ${duration}ms`);
    }
    
    return duration;
  }
  
  /**
   * Misst Funktion Performance
   */
  async measure<T>(
    label: string,
    fn: () => T | Promise<T>
  ): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ============================
// EXPORT
// ============================

export default {
  runAfterInteractions,
  debounce,
  throttle,
  ImageOptimization,
  VideoOptimization,
  AnimationOptimization,
  ListOptimization,
  MemoryOptimization,
  BundleOptimization,
  NetworkOptimization,
  FontOptimization,
  performanceMonitor,
};
