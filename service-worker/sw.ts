/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

const FALLBACK_IMAGE = '/images/contents/not-found.jpg';
// Define custom cache name and assets
const CACHE_NAME = `diamond-clinic-cache-v2 - ${self.location.origin}`;
const ASSETS_TO_CACHE = [
  FALLBACK_IMAGE,
  'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap',
  'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap',
  `https://diamond.talenavi.com/api/json`,
];

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching additional assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((error) => console.error('Caching failed', error)),
  );
});

cleanupOutdatedCaches();

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'update-cache') {
    clearCacheAndDownloadMedia();
  }
});

const clearCacheAndDownloadMedia = async () => {
  try {
    await caches.delete(CACHE_NAME);
    console.log('Cache lama dihapus.');

    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching additional assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((error) => console.error('Caching failed', error));

    const clientsList = await self.clients.matchAll();
    clientsList.forEach((client) => client.postMessage({ type: 'CACHE_UPDATED' }));

    console.log('Cache diperbarui dan media diunduh ulang.');
  } catch (error) {
    console.error('Terjadi kesalahan saat menghapus cache atau mengunduh media:', error);
  }
};

self.addEventListener('fetch', (event) => {
  if (
    event.request.destination === 'image' ||
    event.request.url.endsWith('.jpg') ||
    event.request.url.endsWith('.jpeg') ||
    event.request.url.endsWith('.png')
  ) {
    event.respondWith(handleImageRequest(event));
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      }),
    );
  }
});

const handleImageRequest = async (event: FetchEvent) => {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(event.request.url);

  if (!response) {
    try {
      const fetchResponse = await fetch(event.request);
      cache.put(event.request, fetchResponse.clone());
      return fetchResponse;
    } catch (error) {
      console.error(`Fetch failed for ${event.request.url}. Using fallback image.`);
      const fallbackResponse = await cache.match(FALLBACK_IMAGE);

      if (!fallbackResponse) {
        return fallbackResponse || new Response('Fallback image not found', { status: 404 });
      }
      return fallbackResponse;
    }
  }

  return response;
};

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [/^\/$/];

registerRoute(new NavigationRoute(createHandlerBoundToURL('/'), { allowlist }));

self.skipWaiting();
clientsClaim();
