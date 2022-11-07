import cacheManager from 'cache-manager';

export const cache = cacheManager.caching('memory', {max: 1000, ttl: 120 /*seconds*/ });
