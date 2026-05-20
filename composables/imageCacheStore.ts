import { defineStore } from 'pinia';

interface ImageCacheState {
  urlCacheStatus: Map<string, boolean>; // Map of URL -> isCached
  allImagesCached: boolean;
  isPolling: boolean;
  pollingInterval: NodeJS.Timer | null;
  pollingIntervalId: number | null;
  pausedCount: number; // Reference counter for pause/resume
}

export const useImageCacheStore = defineStore('imageCache', {
  state: (): ImageCacheState => ({
    urlCacheStatus: new Map(),
    allImagesCached: false,
    isPolling: false,
    pollingInterval: null,
    pollingIntervalId: null,
    pausedCount: 0,
  }),

  getters: {
    /**
     * Check if a specific URL is cached
     */
    isCached: (state) => (url: string) => {
      return state.urlCacheStatus.get(url) ?? false;
    },

    /**
     * Get pending (not cached) URLs
     */
    pendingUrls: (state) => {
      return Array.from(state.urlCacheStatus.entries())
        .filter(([_, cached]) => !cached)
        .map(([url, _]) => url);
    },

    /**
     * Get count of pending images
     */
    pendingCount: (state) => {
      return Array.from(state.urlCacheStatus.values()).filter((cached) => !cached).length;
    },
  },

  actions: {
    /**
     * Update cache status for a batch of URLs
     */
    updateCacheStatus(urlsToCacheStatus: Map<string, boolean>) {
      urlsToCacheStatus.forEach((isCached, url) => {
        this.urlCacheStatus.set(url, isCached);
      });

      // Update global flag: all cached if no pending URLs remain
      this.allImagesCached = this.pendingCount === 0;
    },

    /**
     * Start polling for image cache status
     */
    startPolling(urls: string[], pollIntervalMs: number = 1000) {
      if (this.isPolling) {
        return; // Already polling
      }

      // Initialize all URLs as not cached
      urls.forEach((url) => {
        if (!this.urlCacheStatus.has(url)) {
          this.urlCacheStatus.set(url, false);
        }
      });

      this.isPolling = true;
      this.pausedCount = 0;

      // Start polling interval
      this.pollingIntervalId = window.setInterval(async () => {
        // Skip polling if paused
        if (this.pausedCount > 0) {
          return;
        }

        // Skip if all images are cached
        if (this.allImagesCached) {
          this.stopPolling();
          return;
        }

        // Check only pending URLs
        const pendingUrls = this.pendingUrls;
        if (pendingUrls.length === 0) {
          this.allImagesCached = true;
          this.stopPolling();
          return;
        }

        // Perform cache check
        await this.checkCacheStatus(pendingUrls);
      }, pollIntervalMs);
    },

    /**
     * Stop polling completely
     */
    stopPolling() {
      if (this.pollingIntervalId !== null) {
        window.clearInterval(this.pollingIntervalId);
        this.pollingIntervalId = null;
      }
      this.isPolling = false;
      this.pausedCount = 0;
    },

    /**
     * Pause polling temporarily (used during user interactions)
     * Uses reference counting to support nested pause/resume calls
     */
    pausePolling() {
      this.pausedCount++;
    },

    /**
     * Resume polling after pause
     */
    resumePolling() {
      if (this.pausedCount > 0) {
        this.pausedCount--;
      }
    },

    /**
     * Check cache status for given URLs
     */
    async checkCacheStatus(urls: string[]) {
      try {
        if (urls.length === 0) {
          return;
        }

        const urlsToCache = urls.filter((i) => i.endsWith('.jpg') || i.endsWith('.png') || i.endsWith('.jpeg'));

        if (urlsToCache.length === 0) {
          return;
        }

        const CACHE_NAME = `diamond-clinic-cache-v2 - ${self.location.origin}`;
        const cache = await caches.open(CACHE_NAME);
        const cachedRequests = await cache.keys();
        const cachedUrls = cachedRequests.map((request) => request.url);

        // Update status for each URL
        const updatedStatus = new Map<string, boolean>();
        urlsToCache.forEach((url) => {
          const isCached = cachedUrls.some((cachedUrl) => cachedUrl.includes(url));
          updatedStatus.set(url, isCached);
        });

        this.updateCacheStatus(updatedStatus);
      } catch (error) {
        console.error('Error checking cache:', error);
      }
    },

    /**
     * Manually set cache status for specific URLs
     */
    setCacheStatus(url: string, isCached: boolean) {
      this.urlCacheStatus.set(url, isCached);
      this.allImagesCached = this.pendingCount === 0;
    },

    /**
     * Clear all cache status
     */
    clearCacheStatus() {
      this.urlCacheStatus.clear();
      this.allImagesCached = false;
    },

    /**
     * Reset store to initial state
     */
    reset() {
      this.stopPolling();
      this.clearCacheStatus();
      this.pausedCount = 0;
    },
  },
});
