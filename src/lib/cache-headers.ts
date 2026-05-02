// Cache control utilities for API responses
export const CACHE_DURATION = {
  SHORT: 10,      // 10 seconds
  MEDIUM: 60,     // 1 minute
  LONG: 300,      // 5 minutes
};

export function getCacheHeaders(duration: number = CACHE_DURATION.MEDIUM) {
  return {
    'Cache-Control': `public, max-age=${duration}, s-maxage=${duration}`,
  };
}
