/**
 * ANPIP SERVICE WORKER
 * Enables offline functionality and performance caching
 */

const CACHE_NAME = 'anpip-cache-v1.0.2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
];

console.log('[Service Worker] Initialisiert mit Cache:', CACHE_NAME);

// Install Event - Cache wichtige Assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 📦 Installation gestartet...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 💾 Caching Assets:', PRECACHE_ASSETS);
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] ✅ Installation erfolgreich');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[Service Worker] ❌ Installation fehlgeschlagen:', err);
      })
  );
});

// Activate Event - Alte Caches löschen
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 🔄 Aktivierung gestartet...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      const oldCaches = cacheNames.filter(name => name !== CACHE_NAME);
      console.log('[Service Worker] 🗑️  Lösche alte Caches:', oldCaches);
      return Promise.all(
        oldCaches.map(name => {
          console.log('[Service Worker] Lösche Cache:', name);
          return caches.delete(name);
        })
      );
    }).then(() => {
      console.log('[Service Worker] ✅ Aktivierung erfolgreich, übernehme Kontrolle');
      return self.clients.claim();
    })
  );
});

// Fetch Event - Network-first mit Cache-Fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome extensions and other protocols
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              console.log('[SW] Serving from cache:', event.request.url);
              return cachedResponse;
            }
            // Return offline page or generic error
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background Sync (optional - for future features)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-uploads') {
    event.waitUntil(syncUploads());
  }
});

async function syncUploads() {
  // Future: Sync pending uploads when online
  console.log('[SW] Syncing uploads...');
}

// Push Notifications (optional - for future features)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New notification',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Anpip', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
