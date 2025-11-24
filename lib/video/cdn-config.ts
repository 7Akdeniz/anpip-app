/**
 * ============================================================================
 * CDN & VIDEO SPEED CONFIGURATION
 * ============================================================================
 * 
 * Zentrale Konfiguration für maximale Video-Performance weltweit:
 * - Multi-CDN Routing (Cloudflare + Fallbacks)
 * - Edge Caching Strategien
 * - Adaptive Bitrate Thresholds
 * - Preload & Prefetch Logik
 * - Format-Prioritäten (AV1 > VP9 > H.265 > H.264)
 */

// ============================================================================
// CDN PROVIDERS
// ============================================================================

export const CDN_PROVIDERS = {
  PRIMARY: 'cloudflare',
  FALLBACKS: ['bunny', 'fastly'] as const,
} as const;

export const CDN_ENDPOINTS = {
  cloudflare: {
    video: (accountId: string, videoId: string) => 
      `https://customer-${accountId}.cloudflarestream.com/${videoId}`,
    thumbnail: (accountId: string, videoId: string, opts?: { time?: string; width?: number }) =>
      `https://customer-${accountId}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg${opts ? `?time=${opts.time || '0s'}&width=${opts.width || 1280}` : ''}`,
    hls: (accountId: string, videoId: string) =>
      `https://customer-${accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8`,
    dash: (accountId: string, videoId: string) =>
      `https://customer-${accountId}.cloudflarestream.com/${videoId}/manifest/video.mpd`,
  },
  bunny: {
    video: (libraryId: string, videoId: string) =>
      `https://video.bunnycdn.com/play/${libraryId}/${videoId}`,
    hls: (pullZone: string, videoId: string) =>
      `https://${pullZone}.b-cdn.net/${videoId}/playlist.m3u8`,
  },
  fastly: {
    video: (serviceId: string, videoId: string) =>
      `https://${serviceId}.global.ssl.fastly.net/videos/${videoId}`,
  },
};

// ============================================================================
// CACHE CONTROL HEADERS
// ============================================================================

export const CACHE_HEADERS = {
  // Videos (immutable nach Upload)
  VIDEO: {
    'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    'CDN-Cache-Control': 'public, max-age=31536000, stale-while-revalidate=86400',
    'Cloudflare-CDN-Cache-Control': 'public, max-age=31536000',
    'Vary': 'Accept-Encoding',
  },
  
  // HLS/DASH Manifests (kurz cachen, oft ändern)
  MANIFEST: {
    'Cache-Control': 'public, max-age=10, s-maxage=10, stale-while-revalidate=30',
    'CDN-Cache-Control': 'public, max-age=10',
  },
  
  // Thumbnails (lange cachen)
  THUMBNAIL: {
    'Cache-Control': 'public, max-age=604800, s-maxage=2592000, immutable',
    'CDN-Cache-Control': 'public, max-age=2592000',
  },
  
  // Segments (HLS/DASH Chunks)
  SEGMENT: {
    'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    'CDN-Cache-Control': 'public, max-age=31536000',
  },
};

// ============================================================================
// VIDEO FORMATS & CODECS
// ============================================================================

export const VIDEO_FORMATS = {
  // Format-Priorität (beste Kompression → Fallback)
  PRIORITY: ['av1', 'vp9', 'hevc', 'h264'] as const,
  
  // MIME Types
  MIME_TYPES: {
    av1: 'video/mp4; codecs="av01.0.05M.08"',
    vp9: 'video/webm; codecs="vp9"',
    hevc: 'video/mp4; codecs="hvc1.1.6.L93.B0"',
    h264: 'video/mp4; codecs="avc1.42E01E"',
  },
  
  // Browser Support Check
  isSupported: (format: string): boolean => {
    if (typeof window === 'undefined') return false;
    const video = document.createElement('video');
    return video.canPlayType(VIDEO_FORMATS.MIME_TYPES[format as keyof typeof VIDEO_FORMATS.MIME_TYPES]) !== '';
  },
};

// ============================================================================
// ADAPTIVE BITRATE (ABR) CONFIGURATION
// ============================================================================

export const ABR_CONFIG = {
  // Qualitätsstufen (Pixel-Höhe → Bitrate in kbps)
  QUALITIES: [
    { height: 2160, bitrate: 8000, name: '4K' },      // 4K UHD
    { height: 1440, bitrate: 5000, name: '1440p' },   // 2K QHD
    { height: 1080, bitrate: 3000, name: '1080p' },   // Full HD
    { height: 720, bitrate: 1500, name: '720p' },     // HD
    { height: 480, bitrate: 800, name: '480p' },      // SD
    { height: 360, bitrate: 500, name: '360p' },      // Low
    { height: 240, bitrate: 300, name: '240p' },      // Ultra Low
  ],
  
  // Netzwerk-Geschwindigkeit → Qualität Mapping (Mbps)
  NETWORK_THRESHOLDS: {
    excellent: 10,   // >= 10 Mbps → 1080p+
    good: 5,         // >= 5 Mbps → 720p
    fair: 2,         // >= 2 Mbps → 480p
    poor: 1,         // >= 1 Mbps → 360p
    bad: 0.5,        // >= 0.5 Mbps → 240p
  },
  
  // Buffer-Größen (Sekunden)
  BUFFER: {
    MIN: 2,          // Minimum buffer before playback
    TARGET: 10,      // Target buffer size
    MAX: 30,         // Maximum buffer size
  },
  
  // ABR-Algorithmus Gewichte
  WEIGHTS: {
    bandwidth: 0.6,  // 60% Gewichtung auf Bandbreite
    buffer: 0.25,    // 25% auf Buffer-Level
    latency: 0.15,   // 15% auf Latenz
  },
};

// ============================================================================
// PRELOAD & PREFETCH CONFIGURATION
// ============================================================================

export const PRELOAD_CONFIG = {
  // Wie viele Videos im Voraus laden
  LOOKAHEAD: 2,
  
  // Was wird preloaded
  PRELOAD_TYPES: {
    metadata: true,      // Video-Metadaten (Dauer, Größe, etc.)
    thumbnail: true,     // Erstes Frame/Thumbnail
    firstSegment: true,  // Erste 2-5 Sekunden HLS
    audio: false,        // Audio-Track (nur bei Bedarf)
  },
  
  // Timing
  TIMING: {
    thumbnailDelay: 0,        // Sofort
    metadataDelay: 100,       // 100ms
    firstSegmentDelay: 300,   // 300ms
  },
  
  // Netzwerk-basierte Anpassung
  NETWORK_ADAPTIVE: {
    '4g': { lookahead: 3, firstSegment: true },
    '3g': { lookahead: 2, firstSegment: true },
    '2g': { lookahead: 1, firstSegment: false },
    'slow-2g': { lookahead: 0, firstSegment: false },
  },
};

// ============================================================================
// INSTANT START OPTIMIZATION
// ============================================================================

export const INSTANT_START = {
  // First-Frame Optimierung
  FIRST_FRAME: {
    enabled: true,
    maxSize: 50 * 1024,      // 50KB max für First-Frame JPEG
    quality: 0.7,             // JPEG Quality
    format: 'image/jpeg',
  },
  
  // Video-Chunk für sofortigen Start
  QUICK_START_CHUNK: {
    duration: 2,              // Erste 2 Sekunden
    quality: 'auto',          // Automatische Qualität
    preload: true,
  },
  
  // Poster-Bild während Laden
  POSTER: {
    blurHash: true,           // BlurHash für smooth loading
    progressive: true,        // Progressive JPEG
    sizes: [320, 640, 1280],  // Responsive Sizes
  },
};

// ============================================================================
// COMPRESSION SETTINGS
// ============================================================================

export const COMPRESSION = {
  // Video Encoding Presets
  PRESETS: {
    av1: {
      codec: 'libaom-av1',
      crf: 30,                // Constant Rate Factor
      preset: 'medium',
      params: ['-cpu-used', '4', '-row-mt', '1'],
    },
    vp9: {
      codec: 'libvpx-vp9',
      crf: 31,
      preset: 'medium',
      params: ['-row-mt', '1', '-tile-columns', '2'],
    },
    hevc: {
      codec: 'libx265',
      crf: 28,
      preset: 'medium',
      params: ['-x265-params', 'log-level=error'],
    },
    h264: {
      codec: 'libx264',
      crf: 23,
      preset: 'medium',
      params: ['-movflags', '+faststart'],
    },
  },
  
  // Audio Settings
  AUDIO: {
    codec: 'aac',
    bitrate: 128,             // kbps
    sampleRate: 48000,
    channels: 2,
  },
  
  // Thumbnail Compression
  THUMBNAIL: {
    format: 'webp',           // WebP für beste Kompression
    quality: 80,
    fallback: 'jpeg',
  },
};

// ============================================================================
// EDGE FUNCTIONS & WORKERS
// ============================================================================

export const EDGE_CONFIG = {
  // Cloudflare Workers Endpoints
  WORKERS: {
    videoProxy: '/api/video-proxy',
    thumbnailResize: '/api/thumbnail-resize',
    manifestOptimizer: '/api/manifest-optimize',
    analyticsTracker: '/api/video-analytics',
  },
  
  // Edge Locations (Cloudflare hat 300+ POPs weltweit)
  REGIONS: [
    'NA',  // North America
    'EU',  // Europe
    'AS',  // Asia
    'OC',  // Oceania
    'SA',  // South America
    'AF',  // Africa
  ],
  
  // Smart Routing
  ROUTING: {
    method: 'latency',        // Route based on lowest latency
    fallbackMethod: 'random', // Fallback bei Ausfall
    healthCheck: true,        // Automatic health checks
  },
};

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export const MONITORING = {
  // Metrics to track
  METRICS: [
    'video_start_time',       // Time until first frame
    'buffering_events',       // How often buffering occurs
    'quality_changes',        // ABR quality switches
    'bandwidth_estimate',     // Estimated user bandwidth
    'cdn_latency',            // CDN response time
    'error_rate',             // Video load errors
  ],
  
  // Thresholds for alerts
  THRESHOLDS: {
    videoStartTime: 1000,     // 1 second max
    bufferingRate: 0.05,      // Max 5% buffering
    errorRate: 0.01,          // Max 1% errors
  },
  
  // Sampling Rate (%)
  SAMPLING_RATE: 0.1,         // Track 10% of all sessions
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get best video format for current browser
 */
export function getBestVideoFormat(): string {
  for (const format of VIDEO_FORMATS.PRIORITY) {
    if (VIDEO_FORMATS.isSupported(format)) {
      return format;
    }
  }
  return 'h264'; // Ultimate fallback
}

/**
 * Get optimal quality based on network speed
 */
export function getOptimalQuality(bandwidthMbps: number): number {
  const { NETWORK_THRESHOLDS } = ABR_CONFIG;
  
  if (bandwidthMbps >= NETWORK_THRESHOLDS.excellent) return 1080;
  if (bandwidthMbps >= NETWORK_THRESHOLDS.good) return 720;
  if (bandwidthMbps >= NETWORK_THRESHOLDS.fair) return 480;
  if (bandwidthMbps >= NETWORK_THRESHOLDS.poor) return 360;
  return 240;
}

/**
 * Get preload strategy based on connection type
 */
export function getPreloadStrategy(): typeof PRELOAD_CONFIG.NETWORK_ADAPTIVE['4g'] {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return PRELOAD_CONFIG.NETWORK_ADAPTIVE['4g']; // Default to best
  }
  
  const conn = (navigator as any).connection;
  const effectiveType = conn?.effectiveType || '4g';
  
  return PRELOAD_CONFIG.NETWORK_ADAPTIVE[effectiveType as keyof typeof PRELOAD_CONFIG.NETWORK_ADAPTIVE] 
    || PRELOAD_CONFIG.NETWORK_ADAPTIVE['4g'];
}

/**
 * Generate Cache-Control header based on resource type
 */
export function getCacheHeader(type: keyof typeof CACHE_HEADERS): Record<string, string> {
  return CACHE_HEADERS[type];
}

export default {
  CDN_PROVIDERS,
  CDN_ENDPOINTS,
  CACHE_HEADERS,
  VIDEO_FORMATS,
  ABR_CONFIG,
  PRELOAD_CONFIG,
  INSTANT_START,
  COMPRESSION,
  EDGE_CONFIG,
  MONITORING,
  getBestVideoFormat,
  getOptimalQuality,
  getPreloadStrategy,
  getCacheHeader,
};
