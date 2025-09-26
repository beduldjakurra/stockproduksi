/* PT Fuji Seat Indonesia - stockproduksi PWA Service Worker */
const CACHE_VERSION = 'v2'; // bump versi agar cache lama dibuang
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
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Lewatkan request CDN modul langsung ke network (jangan diintersep SW)
  if (url.hostname.includes('unpkg.com') || url.hostname.includes('cdn.jsdelivr.net')) {
    return; // tidak memanggil respondWith -> fetch default
  }

  // Untuk file modul P2P lokal, gunakan network-first agar selalu dapat versi terbaru
  if (url.origin === self.location.origin && url.pathname.endsWith('/auth-p2p-sync.js')) {
    event.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return resp;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Hanya handle same-origin requests lainnya
  if (url.origin !== self.location.origin) return;

  // Navigation requests: network-first dengan fallback ke shell
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

  // Static assets: cache-first
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
