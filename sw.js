const CACHE = 'onebench-shell-v3'
const BASE_PATH = new URL('./', self.location.href).pathname
const APP_SHELL = [BASE_PATH, `${BASE_PATH}manifest.webmanifest`]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))))
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      caches.open(CACHE).then((cache) => cache.put(BASE_PATH, response.clone()))
      return response
    }).catch(() => caches.match(BASE_PATH)))
    return
  }
  if (new URL(event.request.url).pathname.startsWith(`${BASE_PATH}assets/`)) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()))
      return response
    })))
  }
})
