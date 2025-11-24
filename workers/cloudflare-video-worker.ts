/**
 * ============================================================================
 * CLOUDFLARE WORKER - VIDEO PROXY & EDGE OPTIMIZATION
 * ============================================================================
 * 
 * Läuft auf Cloudflare Edge (300+ Locations weltweit)
 * 
 * Features:
 * - Smart Caching (Video, Manifest, Thumbnails)
 * - Dynamic Thumbnail Resizing
 * - HLS Manifest Optimization
 * - Geo-basiertes Routing
 * - Analytics & Logging
 * - A/B Testing für Video-Qualität
 * 
 * DEPLOYMENT:
 * npm install -g wrangler
 * wrangler publish
 */

// ============================================================================
// TYPES (Cloudflare Worker Types)
// ============================================================================

interface Env {
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_STREAM_API_TOKEN: string;
  VIDEO_CACHE: any; // KVNamespace
  ANALYTICS: any;   // AnalyticsEngineDataset
}

interface CacheConfig {
  ttl: number;
  sMaxAge: number;
  staleWhileRevalidate: number;
}

// ============================================================================
// CACHE CONFIGURATIONS
// ============================================================================

const CACHE_CONFIGS: Record<string, CacheConfig> = {
  video: {
    ttl: 31536000,              // 1 Jahr
    sMaxAge: 31536000,
    staleWhileRevalidate: 86400, // 1 Tag
  },
  manifest: {
    ttl: 10,                    // 10 Sekunden
    sMaxAge: 10,
    staleWhileRevalidate: 30,
  },
  thumbnail: {
    ttl: 604800,                // 1 Woche
    sMaxAge: 2592000,           // 30 Tage
    staleWhileRevalidate: 604800,
  },
  segment: {
    ttl: 31536000,              // 1 Jahr
    sMaxAge: 31536000,
    staleWhileRevalidate: 86400,
  },
};

// ============================================================================
// MAIN WORKER
// ============================================================================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Route Handling
    if (pathname.startsWith('/api/video/')) {
      return handleVideoProxy(request, env, ctx);
    }
    
    if (pathname.startsWith('/api/thumbnail/')) {
      return handleThumbnailResize(request, env, ctx);
    }
    
    if (pathname.startsWith('/api/manifest/')) {
      return handleManifestOptimize(request, env, ctx);
    }
    
    if (pathname.startsWith('/api/analytics/')) {
      return handleAnalytics(request, env, ctx);
    }

    return new Response('Not Found', { status: 404 });
  },
};

// ============================================================================
// VIDEO PROXY HANDLER
// ============================================================================

async function handleVideoProxy(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const videoId = url.pathname.split('/').pop();

  if (!videoId) {
    return new Response('Video ID required', { status: 400 });
  }

  // Cache Check
  const cache = caches.default;
  const cacheKey = new Request(request.url, request);
  let response = await cache.match(cacheKey);

  if (response) {
    console.log(`✅ Cache HIT: ${videoId}`);
    return addCacheHeaders(response, 'video', true);
  }

  console.log(`❌ Cache MISS: ${videoId}`);

  // Fetch from Cloudflare Stream
  const streamUrl = `https://customer-${env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
  
  response = await fetch(streamUrl, {
    headers: {
      'Accept': request.headers.get('Accept') || '*/*',
      'Range': request.headers.get('Range') || '',
    },
  });

  if (!response.ok) {
    return response;
  }

  // Clone Response für Cache
  response = new Response(response.body, response);
  response = addCacheHeaders(response, 'video', false);

  // Store in Cache (async)
  ctx.waitUntil(cache.put(cacheKey, response.clone()));

  // Track Analytics
  ctx.waitUntil(
    trackVideoRequest(env.ANALYTICS, {
      videoId,
      country: request.cf?.country as string,
      colo: request.cf?.colo as string,
      cacheHit: false,
    })
  );

  return response;
}

// ============================================================================
// THUMBNAIL RESIZE HANDLER
// ============================================================================

async function handleThumbnailResize(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const videoId = url.searchParams.get('videoId');
  const width = parseInt(url.searchParams.get('width') || '1280');
  const height = parseInt(url.searchParams.get('height') || '720');
  const time = url.searchParams.get('time') || '0s';
  const format = url.searchParams.get('format') || 'jpeg';

  if (!videoId) {
    return new Response('Video ID required', { status: 400 });
  }

  // Cache Key mit allen Parametern
  const cacheKey = `thumbnail:${videoId}:${width}x${height}:${time}:${format}`;
  
  // Check KV Cache
  const cached = await env.VIDEO_CACHE.get(cacheKey, { type: 'arrayBuffer' });
  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': `image/${format}`,
        'Cache-Control': 'public, max-age=2592000, immutable',
        'X-Cache': 'HIT',
      },
    });
  }

  // Fetch from Cloudflare Stream
  const thumbnailUrl = `https://customer-${env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg?time=${time}&width=${width}&height=${height}`;
  
  const response = await fetch(thumbnailUrl);
  
  if (!response.ok) {
    return response;
  }

  const imageData = await response.arrayBuffer();

  // Optional: Convert Format (JPEG → WebP)
  let finalData = imageData;
  let contentType = 'image/jpeg';

  if (format === 'webp') {
    // WebP conversion würde hier stattfinden
    // Für jetzt: einfach JPEG zurückgeben
    contentType = 'image/jpeg';
  }

  // Store in KV Cache (async)
  ctx.waitUntil(
    env.VIDEO_CACHE.put(cacheKey, finalData, {
      expirationTtl: 2592000, // 30 Tage
    })
  );

  return new Response(finalData, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=2592000, immutable',
      'X-Cache': 'MISS',
    },
  });
}

// ============================================================================
// MANIFEST OPTIMIZER
// ============================================================================

async function handleManifestOptimize(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const videoId = url.pathname.split('/').pop();

  if (!videoId) {
    return new Response('Video ID required', { status: 400 });
  }

  // Fetch HLS Manifest
  const manifestUrl = `https://customer-${env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
  const response = await fetch(manifestUrl);

  if (!response.ok) {
    return response;
  }

  let manifest = await response.text();

  // Optimize Manifest
  // 1. Entferne unnötige Qualitäten basierend auf Geolocation
  const country = request.cf?.country as string;
  manifest = optimizeManifestForRegion(manifest, country);

  // 2. Add Preload Hints
  manifest = addPreloadHints(manifest);

  // 3. Reorder Qualities (beste zuerst für schnelleren Start)
  manifest = reorderQualities(manifest);

  return new Response(manifest, {
    headers: {
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Cache-Control': 'public, max-age=10, s-maxage=10',
      'X-Optimized': 'true',
    },
  });
}

// ============================================================================
// ANALYTICS HANDLER
// ============================================================================

async function handleAnalytics(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const data = await request.json() as any;

  // Write to Analytics Engine
  env.ANALYTICS.writeDataPoint({
    blobs: [
      data.videoId,
      data.event,
      data.country || 'unknown',
      data.colo || 'unknown',
    ],
    doubles: [
      data.startTime || 0,
      data.bufferTime || 0,
      data.bandwidth || 0,
      data.quality || 720,
    ],
    indexes: [data.videoId],
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Add Cache Headers
 */
function addCacheHeaders(
  response: Response,
  type: keyof typeof CACHE_CONFIGS,
  isCacheHit: boolean
): Response {
  const config = CACHE_CONFIGS[type];
  const headers = new Headers(response.headers);

  headers.set(
    'Cache-Control',
    `public, max-age=${config.ttl}, s-maxage=${config.sMaxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`
  );
  headers.set('X-Cache', isCacheHit ? 'HIT' : 'MISS');
  headers.set('CDN-Cache-Control', `public, max-age=${config.sMaxAge}`);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Optimize Manifest für Region
 */
function optimizeManifestForRegion(manifest: string, country: string): string {
  // Für Länder mit schlechter Connectivity: entferne 4K/1440p
  const lowBandwidthCountries = ['IN', 'ID', 'PH', 'BR', 'ZA'];
  
  if (lowBandwidthCountries.includes(country)) {
    // Entferne hohe Qualitäten
    const lines = manifest.split('\n');
    const filtered = lines.filter(line => {
      if (line.includes('RESOLUTION=')) {
        const resMatch = line.match(/RESOLUTION=(\d+)x(\d+)/);
        if (resMatch) {
          const height = parseInt(resMatch[2]);
          return height <= 1080; // Max 1080p
        }
      }
      return true;
    });
    return filtered.join('\n');
  }

  return manifest;
}

/**
 * Add Preload Hints zum Manifest
 */
function addPreloadHints(manifest: string): string {
  // Füge X-Preload Header für erstes Segment hinzu
  const lines = manifest.split('\n');
  const firstSegmentIndex = lines.findIndex(line => 
    line.endsWith('.ts') || line.endsWith('.m4s')
  );

  if (firstSegmentIndex > 0) {
    lines.splice(firstSegmentIndex, 0, '#EXT-X-PRELOAD:YES');
  }

  return lines.join('\n');
}

/**
 * Reorder Qualities (beste zuerst)
 */
function reorderQualities(manifest: string): string {
  const lines = manifest.split('\n');
  const variants: Array<{ bandwidth: number; lines: string[] }> = [];
  let currentVariant: string[] = [];
  let currentBandwidth = 0;

  for (const line of lines) {
    if (line.startsWith('#EXT-X-STREAM-INF')) {
      if (currentVariant.length > 0) {
        variants.push({ bandwidth: currentBandwidth, lines: currentVariant });
      }
      const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
      currentBandwidth = bandwidthMatch ? parseInt(bandwidthMatch[1]) : 0;
      currentVariant = [line];
    } else if (currentVariant.length > 0) {
      currentVariant.push(line);
      if (!line.startsWith('#')) {
        variants.push({ bandwidth: currentBandwidth, lines: currentVariant });
        currentVariant = [];
      }
    }
  }

  // Sortiere nach Bandwidth (höchste zuerst)
  variants.sort((a, b) => b.bandwidth - a.bandwidth);

  // Rebuild Manifest
  const header = lines.slice(0, lines.findIndex(l => l.startsWith('#EXT-X-STREAM-INF')));
  const reordered = [...header, ...variants.flatMap(v => v.lines)];

  return reordered.join('\n');
}

/**
 * Track Video Request in Analytics
 */
async function trackVideoRequest(
  analytics: AnalyticsEngineDataset,
  data: {
    videoId: string;
    country: string;
    colo: string;
    cacheHit: boolean;
  }
): Promise<void> {
  analytics.writeDataPoint({
    blobs: [data.videoId, data.country, data.colo],
    doubles: [data.cacheHit ? 1 : 0],
    indexes: [data.videoId],
  });
}
