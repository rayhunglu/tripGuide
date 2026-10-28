// Minimal offline support: the app shell and bundled trip data work without a connection.
// Map tiles and road routes need the network and are intentionally not cached.
const CACHE = 'kansai-trip-v1'
const SHELL = ['/', '/favicon.svg', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return

  // Pages and API: network first, fall back to the cached copy (any route falls back to the SPA shell).
  if (req.mode === 'navigate' || url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req.mode === 'navigate' ? '/' : req, copy))
          return res
        })
        .catch(() => caches.match(req.mode === 'navigate' ? '/' : req)),
    )
    return
  }

  // Hashed build assets and icons: cache first.
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        }),
    ),
  )
})
