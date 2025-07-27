const CACHE_NAME = "my-cache-v1";
const URLS_TO_CACHE = [
  "/",
  "/dataClinic.json", // Menambahkan dataClinic.json untuk di-cache
  // Tambahkan file lain yang ingin dicache
];

// Event install untuk meng-cache sumber daya yang penting
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching essential resources");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Event fetch untuk meng-handle permintaan saat offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Periksa apakah file yang diminta adalah dataClinic.json
      if (event.request.url.includes("dataClinic.json")) {
        return (
          cachedResponse || // Jika sudah ada di cache, kembalikan cache
          fetch(event.request).then((networkResponse) => {
            // Setelah mendapat response dari jaringan, cache-kan untuk akses berikutnya
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      }

      // Untuk permintaan lain, langsung kembalikan response dari cache atau jaringan
      return cachedResponse || fetch(event.request);
    })
  );
});

// Event activate untuk membersihkan cache yang tidak lagi digunakan
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            // Hapus cache yang tidak ada di whitelist
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
