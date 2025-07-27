export const checkImageOnCache = async (data: Array<string>) => {
  if (data.length < 1) {
    return false;
  }

  const urlsToCache = data.filter((i) => i.endsWith('.jpg') || i.endsWith('.png') || i.endsWith('.jpeg'));

  const CACHE_NAME = `diamond-clinic-cache-v2 - ${self.location.origin}`;
  try {
    const cache = await caches.open(CACHE_NAME);

    const cachedRequests = await cache.keys();

    const cachedUrls = cachedRequests.map((request) => request.url);
    const isCompletelyCached = urlsToCache.every((url) => cachedUrls.some((cachedUrl) => cachedUrl.includes(url)));

    return !isCompletelyCached;
  } catch (error) {
    console.error('Error checking cache:', error);
    return false;
  }
};
