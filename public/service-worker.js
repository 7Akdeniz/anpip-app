/**
 * ANPIP SERVICE WORKER - 2025 OPTIMIZED
 * Features: Offline-First, Smart Caching, Background Sync, Push Notifications
 * Optimized for: Core Web Vitals, Performance, SEO
 */

const VERSION = '3.0.0';
const CACHE_PREFIX = 'anpip';
const STATIC_CACHE = `${CACHE_PREFIX}-static-v${VERSION}`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-v${VERSION}`;
const VIDEO_CACHE = `${CACHE_PREFIX}-videos-v${VERSION}`;
const API_CACHE = `${CACHE_PREFIX}-api-v${VERSION}`;
const DYNAMIC_CACHE = `${CACHE_PREFIX}-dynamic-v${VERSION}`;

const NETWORK_TIMEOUT = 3000;

const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
];

console.log(`[SW v${VERSION}] Initializing...`);

self.addEventListener('install', (event) => {
  console.log(`[SW v${VERSION}] Installing...`);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log(`[SW v${VERSION}] Activating...`);
  
  const validCaches = [STATIC_CACHE, IMAGE_CACHE, VIDEO_CACHE, API_CACHE, DYNAMIC_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(CACHE_PREFIX) && !validCaches.includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImage(url)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
  } else if (isVideo(url)) {
    event.respondWith(cacheFirst(request, VIDEO_CACHE));
  } else if (isApiCall(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (request.destination === 'document') {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), NETWORK_TIMEOUT))
    ]);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      caches.open(cacheName).then(cache => cache.put(request, response.clone()));
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|woff2?|ttf|eot|svg|ico)$/);
}

function isImage(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|webp|avif|gif)$/);
}

function isVideo(url) {
  return url.pathname.match(/\.(mp4|webm|ogg|mov)$/);
}

function isApiCall(url) {
  return url.pathname.startsWith('/api/');
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-uploads') {
    event.waitUntil(syncUploads());
  }
});

async function syncUploads() {
  console.log('[SW] Syncing uploads...');
}

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Neue Benachrichtigung',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: data,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Anpip', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

console.log(`[SW v${VERSION}] Ready`);
