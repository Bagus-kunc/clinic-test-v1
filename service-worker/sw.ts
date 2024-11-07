/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'

// Declare self for TypeScript
declare let self: ServiceWorkerGlobalScope

// Define custom cache name and assets
const CACHE_NAME = 'diamond-clinic-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/dataClinic.json'
];

// Precache assets defined in __WB_MANIFEST
precacheAndRoute(self.__WB_MANIFEST);

// Cache additional static assets during installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching additional assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((error) => console.error('Caching failed', error))
  );
});

cleanupOutdatedCaches();

// Custom cache clearing for old versions of the manual cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Serve cached assets for fetch events if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Navigation fallback route for SPA
let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [/^\/$/];

registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL('/'),
    { allowlist }
  )
);

self.skipWaiting();
clientsClaim();
