const CACHE_STATIC = 'mweb-static-v4';
const CACHE_DYNAMIC = 'mweb-dynamic-v4';
const CACHE_API = 'mweb-api-v4';

const STATIC_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/app-icon-192.png',
  '/app-icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(STATIC_SHELL).catch((err) => console.warn('PWA Precache partial fail', err));
    })
  );
  // Force active immediately without waiting for browser restart
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_STATIC && key !== CACHE_DYNAMIC && key !== CACHE_API)
          .map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Notify all open tabs/clients that an update was installed so they can auto-refresh
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED' });
        });
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // 1. Navigation requests (HTML page): Network First -> Fallback to Cache /
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_STATIC).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/').then((cached) => cached || caches.match('/index.html'));
        })
    );
    return;
  }

  // 2. Real-time endpoints and version check: Bypass Cache completely
  if (
    url.pathname === '/api/version' ||
    url.pathname === '/api/updates/stream' ||
    url.pathname.includes('/sse')
  ) {
    return; // Let browser make direct network call
  }

  // 3. API endpoints: Network First -> Cache Fallback
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_API).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 4. Static Assets, Images, Google Fonts: Stale-While-Revalidate
  if (
    url.origin === self.location.origin ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('images.unsplash.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const copy = networkResponse.clone();
              caches.open(CACHE_DYNAMIC).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default fallback
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});