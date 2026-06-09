// Service Worker voor offline caching en performance optimalisatie
const CACHE_NAME = 'zn-sleepwear-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/shop.html',
  '/product.html',
  '/about.html',
  '/contact.html',
  '/css/style.css',
  '/js/app.js'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE).catch(err => {
        console.log('Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Cache with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and non-GET requests
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // Images: cache first, network fallback
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(response => {
          // Clone the response
          let responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        }).catch(() => {
          // Return a placeholder image or empty response
          return new Response('Image not available', { status: 404 });
        });
      })
    );
    return;
  }

  // HTML, CSS, JS: network first, cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        // Clone the response
        let responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
