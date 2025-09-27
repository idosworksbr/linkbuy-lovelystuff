import { useState, useEffect, useCallback } from 'react';

interface CacheData {
  data: any;
  timestamp: number;
  expiresIn: number;
}

interface PreloaderOptions {
  cacheKey: string;
  cacheDuration?: number; // in milliseconds, default 5 minutes
  preloadOnMount?: boolean;
}

export const usePreloader = <T,>(
  fetchFunction: () => Promise<T>,
  options: PreloaderOptions
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { cacheKey, cacheDuration = 5 * 60 * 1000, preloadOnMount = true } = options;

  // Check if data is in cache and not expired
  const getCachedData = useCallback((): T | null => {
    try {
      const cached = localStorage.getItem(`preloader_${cacheKey}`);
      if (!cached) return null;
      
      const parsedCache: CacheData = JSON.parse(cached);
      const now = Date.now();
      
      if (now > parsedCache.timestamp + parsedCache.expiresIn) {
        // Cache expired, remove it
        localStorage.removeItem(`preloader_${cacheKey}`);
        return null;
      }
      
      return parsedCache.data;
    } catch {
      return null;
    }
  }, [cacheKey]);

  // Cache data with expiration
  const setCachedData = useCallback((data: T) => {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        expiresIn: cacheDuration
      };
      localStorage.setItem(`preloader_${cacheKey}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, [cacheKey, cacheDuration]);

  // Fetch data with caching
  const fetchData = useCallback(async (useCache = true) => {
    // Check cache first if enabled
    if (useCache) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      setCachedData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, getCachedData, setCachedData]);

  // Refresh data (bypass cache)
  const refresh = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  // Clear cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(`preloader_${cacheKey}`);
    setData(null);
  }, [cacheKey]);

  // Preload on mount if enabled
  useEffect(() => {
    if (preloadOnMount) {
      fetchData();
    }
  }, [preloadOnMount, fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    refresh,
    clearCache,
    isStale: !getCachedData() && !!data // Data exists but not in cache (stale)
  };
};