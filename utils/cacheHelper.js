// cacheHelper.js
export const cacheName = "diamond-clinic-cache-v2";

// Fungsi untuk mendapatkan data dari cache
export async function getCachedData(key) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(key);
    if (cachedResponse) {
      const contentType = cachedResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await cachedResponse.json();
      } else if (contentType && contentType.includes("image")) {
        return cachedResponse.url;
      }
    }
    return null; // Data tidak ada di cache
  } catch (error) {
    console.error("Error accessing cache:", error);
    return null;
  }
}

// Fungsi untuk menyimpan data ke cache
export async function setCachedData(key, data, isImage = false) {
  try {
    const cache = await caches.open(cacheName);
    if (isImage) {
      const response = await fetch(data); // `data` adalah URL gambar
      await cache.put(key, response.clone());
    } else {
      const response = new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
      await cache.put(key, response);
    }
  } catch (error) {
    console.error("Error saving to cache:", error);
  }
}
