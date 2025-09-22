/* PT Fuji Seat Indonesia - stockproduksi PWA Service Worker */
const CACHE_VERSION = 'v1';
const CACHE_NAME = `sp-${CACHE_VERSION}`;

// Use relative paths so this works on GitHub Pages or subpaths
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './icons/icon-16x16.png',
  './icons/icon-32x32.png',
  './icons/icon-180x180.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        // Add each asset individually; skip if missing (prevents install failure before PR #3 is merged)
        Promise.all(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch(() => Promise.resolve())
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith('sp-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // only handle GET

  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first with offline fallback to cached shell
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return resp;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Static assets: cache-first with background fill
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return resp;
        })
        .catch(() => cached);
    })
  );
});
