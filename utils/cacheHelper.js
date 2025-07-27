export const cacheName = "diamond-clinic-cache-v2";

// Fungsi untuk mendapatkan data dari cache
export async function getCachedData(key) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(key);

    if (cachedResponse) {
      const contentType = cachedResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        // Jika data adalah JSON, parse sebagai JSON
        return await cachedResponse.json();
      } else if (contentType && contentType.includes("image")) {
        // Jika data adalah gambar, kembalikan URL cache
        return URL.createObjectURL(await cachedResponse.blob());
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
      // Jika `data` adalah URL gambar
      const response = await fetch(data, { mode: "no-cors" }); // Mendapatkan gambar dari URL
      await cache.put(key, response.clone());
    } else {
      // Jika `data` adalah objek JSON
      const response = new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
      await cache.put(key, response);
    }
  } catch (error) {
    console.error("Error saving to cache:", error);
  }
}
