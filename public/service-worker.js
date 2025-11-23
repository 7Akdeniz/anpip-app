/**
 * ANPIP SERVICE WORKER - 2025 OPTIMIZED
 * Features: Offline-First, Smart Caching, Background Sync, Push Notifications
 * Optimized for: Core Web Vitals, Performance, SEO, Progressive Web App
 */

const VERSION = '4.0.1-2025';
const CACHE_PREFIX = 'anpip';
const STATIC_CACHE = `${CACHE_PREFIX}-static-v${VERSION}`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-v${VERSION}`;
const VIDEO_CACHE = `${CACHE_PREFIX}-videos-v${VERSION}`;
const API_CACHE = `${CACHE_PREFIX}-api-v${VERSION}`;
const DYNAMIC_CACHE = `${CACHE_PREFIX}-dynamic-v${VERSION}`;
const FONT_CACHE = `${CACHE_PREFIX}-fonts-v${VERSION}`;

const NETWORK_TIMEOUT = 5000; // 5 Sekunden
const MAX_IMAGE_CACHE_SIZE = 50; // Maximal 50 Bilder cachen
const MAX_VIDEO_CACHE_SIZE = 10; // Maximal 10 Videos cachen
const MAX_API_CACHE_AGE = 5 * 60 * 1000; // 5 Minuten

// Assets die beim Install vorgeladen werden
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html', // Offline-Fallback-Seite
];

console.log(`[SW v${VERSION}] Initializing...`);

// ==================== INSTALL EVENT ====================
self.addEventListener('install', (event) => {
  console.log(`[SW v${VERSION}] Installing...`);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Precaching static assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// ==================== ACTIVATE EVENT ====================
self.addEventListener('activate', (event) => {
  console.log(`[SW v${VERSION}] Activating...`);
  
  const validCaches = [
    STATIC_CACHE,
    IMAGE_CACHE,
    VIDEO_CACHE,
    API_CACHE,
    DYNAMIC_CACHE,
    FONT_CACHE
  ];
  
  event.waitUntil(
    caches.keys()
      .then(keys => {
        console.log('[SW] Cleaning old caches...');
        return Promise.all(
          keys
            .filter(key => key.startsWith(CACHE_PREFIX) && !validCaches.includes(key))
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
  );
});

// ==================== FETCH EVENT ====================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Nur GET-Requests cachen
  if (request.method !== 'GET') return;
  
  // Nur HTTP(S) Requests
  if (!url.protocol.startsWith('http')) return;
  
  // Chrome Extension Requests ignorieren
  if (url.protocol === 'chrome-extension:') return;
  
  // Strategy basierend auf Resource-Typ
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImage(url)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE));
  } else if (isVideo(url)) {
    event.respondWith(cacheFirst(request, VIDEO_CACHE, MAX_VIDEO_CACHE_SIZE));
  } else if (isFont(url)) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
  } else if (isApiCall(url)) {
    event.respondWith(networkFirst(request, API_CACHE, MAX_API_CACHE_AGE));
  } else if (request.destination === 'document') {
    event.respondWith(networkFirstWithOfflineFallback(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// ==================== CACHING STRATEGIES ====================

/**
 * Cache First - Für statische Assets
 * Versucht zuerst Cache, dann Network
 */
async function cacheFirst(request, cacheName, maxItems) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Cache hit:', request.url);
      return cached;
    }
    
    console.log('[SW] Cache miss, fetching:', request.url);
    const response = await fetch(request);
    
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      
      // Cache-Size-Limit prüfen
      if (maxItems) {
        await limitCacheSize(cacheName, maxItems);
      }
      
      // Klone Response für Cache (nur einmal!)
      const responseClone = response.clone();
      cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network First - Für dynamische Inhalte & API
 * Versucht zuerst Network, dann Cache
 */
async function networkFirst(request, cacheName, maxAge) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
      )
    ]);
    
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      
      // Timestamp hinzufügen für Age-Checking
      const responseBlob = await response.clone().blob();
      const headers = new Headers(response.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      
      const newResponse = new Response(responseBlob, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      });
      
      cache.put(request, newResponse);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cached = await caches.match(request);
    if (cached) {
      // Prüfe Cache-Alter
      if (maxAge) {
        const timestamp = cached.headers.get('sw-cache-timestamp');
        if (timestamp && Date.now() - parseInt(timestamp) > maxAge) {
          console.log('[SW] Cache too old, returning stale data');
        }
      }
      
      return cached;
    }
    
    return new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Network First with Offline Fallback - Für HTML-Seiten
 */
async function networkFirstWithOfflineFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      const responseClone = response.clone();
      cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache or offline page');
    
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // Offline-Fallback
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) return offlinePage;
    
    return new Response('Offline - Keine Internetverbindung', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

/**
 * Stale While Revalidate - Für Bilder
 * Gibt Cache zurück, aktualisiert im Hintergrund
 */
async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(cacheName).then(cache => {
          // Cache-Size-Limit prüfen
          if (maxItems) {
            limitCacheSize(cacheName, maxItems);
          }
          
          cache.put(request, response.clone());
        });
      }
      return response;
    })
    .catch(() => cached);
  
  return cached || fetchPromise;
}

// ==================== HELPER FUNCTIONS ====================

function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|json|webmanifest|svg)$/i) ||
         url.pathname.includes('/assets/') ||
         url.pathname === '/';
}

function isImage(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|webp|avif|ico)$/i);
}

function isVideo(url) {
  return url.pathname.match(/\.(mp4|webm|ogg|mov)$/i) ||
         url.hostname.includes('cloudflarestream.com') ||
         url.pathname.includes('/video/');
}

function isFont(url) {
  return url.pathname.match(/\.(woff|woff2|ttf|eot|otf)$/i) ||
         url.hostname.includes('fonts.gstatic.com');
}

function isApiCall(url) {
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('supabase.co');
}

/**
 * Limitiert Cache-Größe durch Löschen ältester Einträge
 */
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    console.log(`[SW] Cache ${cacheName} exceeds limit (${keys.length}/${maxItems}), cleaning...`);
    
    // Lösche älteste Einträge
    const itemsToDelete = keys.length - maxItems;
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// ==================== BACKGROUND SYNC ====================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-videos') {
    event.waitUntil(syncVideos());
  }
  
  if (event.tag === 'sync-likes') {
    event.waitUntil(syncLikes());
  }
});

async function syncVideos() {
  console.log('[SW] Syncing videos...');
  // Implementiere Video-Sync-Logik
}

async function syncLikes() {
  console.log('[SW] Syncing likes...');
  // Implementiere Like-Sync-Logik
}

// ==================== PUSH NOTIFICATIONS ====================

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Neue Benachrichtigung von Anpip',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      { action: 'open', title: 'Öffnen' },
      { action: 'close', title: 'Schließen' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Anpip', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// ==================== MESSAGE HANDLING ====================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(STATIC_CACHE).then(cache => cache.addAll(event.data.urls))
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(keys => 
        Promise.all(keys.map(key => caches.delete(key)))
      )
    );
  }
});

console.log(`[SW v${VERSION}] Ready!`);

async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cached = await caches.match(request);
  
  // Starte Netzwerk-Request im Hintergrund
  const fetchPromise = fetch(request).then(async response => {
    if (response && response.ok) {
      try {
        const cache = await caches.open(cacheName);
        
        // Cache-Size-Limit prüfen
        if (maxItems) {
          await limitCacheSize(cacheName, maxItems);
        }
        
        // Klone Response für Cache (nur einmal!)
        const responseClone = response.clone();
        cache.put(request, responseClone);
      } catch (error) {
        console.error('[SW] Cache update failed:', error);
      }
    }
    return response;
  }).catch(error => {
    console.error('[SW] Network failed:', error);
    return cached;
  });
  
  // Gebe gecachte Version sofort zurück, oder warte auf Netzwerk
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
