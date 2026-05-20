/**
 * Memoization cache for storing cache check results
 * Key: JSON stringified array of sorted URLs
 * Value: { timestamp, result }
 */
const memoCache = new Map<string, { timestamp: number; result: Map<string, boolean> }>();
const MEMO_TTL_MS = 2000; // Memoization valid for 2 seconds

/**
 * Clear memoization cache (useful for testing or forcing fresh checks)
 */
export const clearMemoCache = () => {
  memoCache.clear();
};

/**
 * Check image cache status for an array of URLs
 * Returns a Map with per-URL cache status and a boolean indicating if any are still pending
 *
 * @param data Array of image URLs to check
 * @param useMemo Whether to use memoization (default: true)
 * @returns { stillPending: boolean, cached: Map<url, isCached> }
 */
export const checkImageOnCache = async (
  data: Array<string>,
  useMemo: boolean = true,
): Promise<{ stillPending: boolean; cached: Map<string, boolean> }> => {
  if (data.length < 1) {
    return { stillPending: false, cached: new Map() };
  }

  const urlsToCache = data.filter((i) => i.endsWith('.jpg') || i.endsWith('.png') || i.endsWith('.jpeg'));

  if (urlsToCache.length === 0) {
    return { stillPending: false, cached: new Map() };
  }

  // Check memoization cache
  if (useMemo) {
    const sortedUrls = urlsToCache.slice().sort();
    const memoKey = JSON.stringify(sortedUrls);
    const memoEntry = memoCache.get(memoKey);

    if (memoEntry && Date.now() - memoEntry.timestamp < MEMO_TTL_MS) {
      return {
        stillPending: Array.from(memoEntry.result.values()).some((cached) => !cached),
        cached: memoEntry.result,
      };
    }
  }

  const CACHE_NAME = `diamond-clinic-cache-v2 - ${self.location.origin}`;
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedRequests = await cache.keys();
    const cachedUrls = cachedRequests.map((request) => request.url);

    // Build per-URL cache status
    const urlStatusMap = new Map<string, boolean>();
    let anyPending = false;

    urlsToCache.forEach((url) => {
      const isCached = cachedUrls.some((cachedUrl) => cachedUrl.includes(url));
      urlStatusMap.set(url, isCached);
      if (!isCached) {
        anyPending = true;
      }
    });

    // Store in memoization cache
    if (useMemo) {
      const sortedUrls = urlsToCache.slice().sort();
      const memoKey = JSON.stringify(sortedUrls);
      memoCache.set(memoKey, {
        timestamp: Date.now(),
        result: urlStatusMap,
      });
    }

    return {
      stillPending: anyPending,
      cached: urlStatusMap,
    };
  } catch (error) {
    console.error('Error checking cache:', error);
    return {
      stillPending: true,
      cached: new Map(),
    };
  }
};

/**
 * Legacy function for backward compatibility - returns boolean instead of detailed status
 * @deprecated Use checkImageOnCache() which returns detailed per-URL status
 */
export const checkImageOnCacheLegacy = async (data: Array<string>): Promise<boolean> => {
  const result = await checkImageOnCache(data);
  return result.stillPending;
};
