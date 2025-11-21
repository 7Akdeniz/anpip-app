/**
 * ANPIP SERVICE WORKER - 2025 OPTIMIZED
 * Offline-First, Performance Caching, Smart Strategies
 * Browser: Chrome, Safari, Firefox, Edge
 */

const CACHE_NAME = 'anpip-v2.0.0';
const STATIC_CACHE = 'anpip-static-v2.0.0';
const IMAGE_CACHE = 'anpip-images-v2.0.0';
const VIDEO_CACHE = 'anpip-videos-v2.0.0';
const API_CACHE = 'anpip-api-v2.0.0';

// Cache Limits
const MAX_IMAGE_CACHE_SIZE = 50; // MB
const MAX_VIDEO_CACHE_SIZE = 100; // MB
const MAX_API_CACHE_AGE = 5 * 60 * 1000; // 5 Minuten

// Static Assets (sofort cachen)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
];

console.log('[Service Worker] 🚀 Anpip v2.0.0 initialisiert');

// ============================
// INSTALLATION
// ============================

self.addEventListener('install', (event) => {
  console.log('[SW] 📦 Installation gestartet...');
  
  event.waitUntil(
    Promise.all([
      // Static Assets cachen
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] 💾 Caching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      }),
      // Sofort aktivieren
      self.skipWaiting()
    ])
    .then(() => console.log('[SW] ✅ Installation erfolgreich'))
    .catch(err => console.error('[SW] ❌ Installation fehlgeschlagen:', err))
  );
});

// ============================
// AKTIVIERUNG
// ============================

self.addEventListener('activate', (event) => {
  console.log('[SW] 🔄 Aktivierung gestartet...');
  
  const validCaches = [STATIC_CACHE, IMAGE_CACHE, VIDEO_CACHE, API_CACHE];
  
  event.waitUntil(
    Promise.all([
      // Alte Caches löschen
      caches.keys().then(cacheNames => {
        const oldCaches = cacheNames.filter(name => !validCaches.includes(name));
        console.log('[SW] 🗑️  Lösche alte Caches:', oldCaches);
        return Promise.all(oldCaches.map(name => caches.delete(name)));
      }),
      // Übernehme Kontrolle
      self.clients.claim()
    ])
    .then(() => console.log('[SW] ✅ Aktivierung erfolgreich'))
  );
});

// ============================
// FETCH - SMART CACHING
// ============================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) return;
  
  // Skip Supabase Auth (immer live)
  if (url.hostname.includes('supabase') && url.pathname.includes('auth')) {
    return;
  }
  
  // ============================
  // ROUTING STRATEGY
  // ============================
  
  // 1. STATIC ASSETS - Cache First
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // 2. IMAGES - Cache First mit Stale-While-Revalidate
  if (isImage(url)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }
  
  // 3. VIDEOS - Cache First (große Dateien)
  if (isVideo(url)) {
    event.respondWith(cacheFirst(request, VIDEO_CACHE));
    return;
  }
  
  // 4. API CALLS - Network First mit Cache Fallback
  if (isApiCall(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
  
  // 5. HTML PAGES - Network First
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }
  
  // 6. DEFAULT - Network First
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// ============================
// CACHING STRATEGIES
// ============================

/**
 * Cache First - Schnellste Strategie
 * Gut für: Static Assets, Images
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    console.log('[SW] 📦 Cache hit:', request.url);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] ❌ Fetch failed:', error);
    return offlineResponse(request);
  }
}

/**
 * Network First - Immer aktuelle Daten
 * Gut für: API Calls, HTML
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] 🌐 Network failed, trying cache:', request.url);
    const cached = await caches.match(request);
    if (cached) return cached;
    return offlineResponse(request);
  }
}

/**
 * Stale While Revalidate - Best of Both
 * Gut für: Images, Fonts
 */
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  
  // Update im Hintergrund
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);
  
  // Gib sofort Cache zurück oder warte auf Fetch
  return cached || fetchPromise || offlineResponse(request);
}

// ============================
// HELPER FUNCTIONS
// ============================

function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/);
}

function isImage(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|webp|avif|svg|ico)$/);
}

function isVideo(url) {
  return url.pathname.match(/\.(mp4|webm|ogg)$/);
}

function isApiCall(url) {
  return url.pathname.includes('/api/') || 
         url.hostname.includes('supabase.co');
}

function offlineResponse(request) {
  const isImageRequest = request.destination === 'image';
  const isVideoRequest = request.destination === 'video';
  
  if (isImageRequest) {
    // Offline Image Placeholder
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" fill="#999">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' }}
    );
  }
  
  if (isVideoRequest) {
    return new Response('Video nicht verfügbar (Offline)', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
  
  return new Response('Offline - Keine Verbindung', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// ============================
// BACKGROUND SYNC
// ============================

self.addEventListener('sync', (event) => {
  console.log('[SW] 🔄 Background sync:', event.tag);
  
  if (event.tag === 'sync-videos') {
    event.waitUntil(syncVideos());
  }
});

async function syncVideos() {
  // TODO: Sync pending uploads
  console.log('[SW] Syncing videos...');
}

// ============================
// PUSH NOTIFICATIONS
// ============================

self.addEventListener('push', (event) => {
  console.log('[SW] 📬 Push notification received');
  
  const data = event.data?.json() || {};
  const title = data.title || 'Anpip';
  const options = {
    body: data.body || 'Neue Benachrichtigung',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data,
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
