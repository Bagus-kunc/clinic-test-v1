/**
 * Background image caching with concurrency limit and priority queue
 * Allows caching images without blocking UI
 */

import { fetchAndCacheImage } from './fetchAndCacheImage';

interface QueuedImage {
  url: string;
  priority: number; // Lower number = higher priority
}

class BackgroundImageCacher {
  private queue: QueuedImage[] = [];
  private isProcessing = false;
  private maxConcurrent = 3; // Limit concurrent requests
  private activeRequests = 0;
  private processedUrls = new Set<string>();

  /**
   * Add images to cache queue with priority
   * Priority: 0 = critical (load first), 1 = normal, 2 = low priority
   */
  addToQueue(urls: string[], priority: number = 1) {
    urls.forEach((url) => {
      if (!this.processedUrls.has(url)) {
        this.queue.push({ url, priority });
      }
    });

    // Sort by priority (ascending)
    this.queue.sort((a, b) => a.priority - b.priority);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.process();
    }
  }

  /**
   * Process queue with concurrency limit
   */
  private async process() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0 || this.activeRequests > 0) {
      // Fill up to maxConcurrent requests
      while (this.activeRequests < this.maxConcurrent && this.queue.length > 0) {
        const item = this.queue.shift();
        if (item) {
          this.activeRequests++;
          this.processedUrls.add(item.url);

          // Fire and forget - don't await
          fetchAndCacheImage(item.url)
            .catch((err) => console.error('Background cache error:', err))
            .finally(() => {
              this.activeRequests--;
            });
        }
      }

      // Wait a bit before checking again
      if (this.queue.length > 0 || this.activeRequests > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      processedUrls: this.processedUrls.size,
    };
  }

  /**
   * Clear queue (for testing)
   */
  clear() {
    this.queue = [];
    this.processedUrls.clear();
    this.isProcessing = false;
    this.activeRequests = 0;
  }
}

export const backgroundCacher = new BackgroundImageCacher();
