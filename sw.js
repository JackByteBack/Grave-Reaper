// Grave Reaper service worker — offline support for the installable app.
//
// Design goals:
//  • Website mode is unchanged for online players: navigations are network-first,
//    so a visitor with a connection always gets the latest index.html (matching
//    the page's existing no-cache intent). Offline, they fall back to the cache.
//  • Everything else (JS modules, sprites, backgrounds, BGM, icons) is cached
//    on first use (stale-while-revalidate), so after one play the whole game
//    works offline — which is what makes the installed app self-contained.
//  • All paths are relative to the SW scope, so it works the same whether the
//    site is served from a domain root or a GitHub Pages subpath (/shadow-vault/).

const VERSION = 'v23';
const CACHE = `grave-reaper-${VERSION}`;

// Minimal shell precached on install so the app boots offline immediately.
// (Heavy assets — sprites, backgrounds, BGM — are cached lazily on first use.)
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css?v=23',
  './src/main.js?v=23',
  './src/pwa.js?v=23',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // Tolerate individual misses (e.g. a query-string mismatch) so install
      // never fails wholesale — runtime caching backfills anything skipped.
      .then((cache) => Promise.allSettled(CORE.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('grave-reaper-') && k !== CACHE)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle our own origin; let cross-origin requests pass straight through.
  if (url.origin !== self.location.origin) return;

  // Navigations (the HTML document): network-first → keeps online players on the
  // freshest build; offline falls back to the cached shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Everything else: stale-while-revalidate. Serve cache instantly, refresh in
  // the background so the next load is up to date.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
