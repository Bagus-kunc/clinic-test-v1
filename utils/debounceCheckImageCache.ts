/**
 * Debounced wrapper for checkImageOnCache to prevent redundant cache checks
 * within a short timeframe, reducing CPU overhead especially during rapid
 * user interactions like clicking menu items.
 */

let lastCheckTime = 0;
const DEBOUNCE_DELAY_MS = 500;

/**
 * Debounced cache check function
 * Only executes if at least DEBOUNCE_DELAY_MS has passed since last call
 */
export const debounceCheckImageCache = async (
  urls: string[],
  checkFn: (urls: string[]) => Promise<boolean>,
): Promise<boolean> => {
  const now = Date.now();

  // If within debounce window, skip the check
  if (now - lastCheckTime < DEBOUNCE_DELAY_MS) {
    return false; // Skipped
  }

  lastCheckTime = now;
  return await checkFn(urls);
};

/**
 * Create a debounced version of checkImageOnCache for a specific use case
 * This allows debouncing to be shared across multiple calls within same "session"
 */
export function createDebouncedCacheChecker(delayMs: number = DEBOUNCE_DELAY_MS) {
  let lastCheck = 0;

  return async (urls: string[], checkFn: (urls: string[]) => Promise<boolean>): Promise<boolean> => {
    const now = Date.now();

    if (now - lastCheck < delayMs) {
      return false; // Skipped
    }

    lastCheck = now;
    return await checkFn(urls);
  };
}

/**
 * Reset debounce timer (useful for testing or forcing an immediate check)
 */
export const resetDebounce = () => {
  lastCheckTime = 0;
};
