// Jovob Service Worker — App Shell caching + offline fallback

const CACHE_NAME = 'jovob-v1'
const APP_SHELL = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon.svg',
]

// Install — cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL)
    })
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch — strategy per request type
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip caching for API routes
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Stale-while-revalidate for navigation and assets
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          })
          .catch(() => {
            // Offline fallback for navigation requests
            if (request.mode === 'navigate') {
              return cache.match('/') || new Response(
                '<html><body><h1>Jovob</h1><p>Нет подключения к интернету</p></body></html>',
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
              )
            }
            return new Response('Offline', { status: 503 })
          })

        // Return cached response immediately, update in background
        return cachedResponse || fetchPromise
      })
    })
  )
})
