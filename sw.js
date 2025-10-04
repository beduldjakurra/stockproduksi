// Service Worker (PWA) – network-first untuk HTML + cache aman untuk aset statis

const CACHE_STATIC = 'static-v3';
const CACHE_DYNAMIC = 'dynamic-v3';

// Gunakan scope SW sebagai base path (cocok untuk GitHub Pages project site)
const BASE = new URL(self.registration.scope).pathname.replace(/\/??$/, '/');

// Aset untuk precache, berbasis BASE
const PRECACHE_ASSETS = [
  BASE,                     // root app
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icons/icon-192x192.png',
  BASE + 'icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.map((k) =>
          (k !== CACHE_STATIC && k !== CACHE_DYNAMIC ? caches.delete(k) : undefined)
        ))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const accept = req.headers.get('accept') || '';
  const isHTML = accept.includes('text/html');

  // Network-first untuk dokumen HTML (halaman)
  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_STATIC).then((cache) => cache.put(BASE, resClone));
          return res;
        })
        .catch(() =>
          caches.match(req)
            .then((r) => r || caches.match(BASE + 'index.html') || caches.match(BASE))
        )
    );
    return;
  }

  // Stale-while-revalidate untuk aset statis same-origin (ikon, gambar, js, css)
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res.ok) {
              const cacheName =
                req.destination === 'image' || req.url.includes('/icons/')
                  ? CACHE_STATIC
                  : CACHE_DYNAMIC;
              caches.open(cacheName).then((cache) => cache.put(req, res.clone()));
            }
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Untuk resource cross-origin: langsung network, fallback ke cache jika ada
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});

// Opsional: dukung pesan untuk update cepat
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});