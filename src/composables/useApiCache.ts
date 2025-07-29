/**
 * API Response Caching Composable
 * 
 * Provides caching mechanisms for API responses to improve performance
 * and reduce unnecessary network requests.
 */

import { ref, computed } from 'vue'
import type { Ref } from 'vue'

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  staleWhileRevalidate?: boolean // Return stale data while fetching fresh data
}

class ApiCache {
  private cache = new Map<string, CacheEntry>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes
  private readonly maxSize = 100

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL
    const maxSize = options.maxSize || this.maxSize

    // Clean up expired entries
    this.cleanup()

    // Remove oldest entries if cache is full
    if (this.cache.size >= maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    }

    this.cache.set(key, entry)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry is expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    // Check if entry is expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        isExpired: Date.now() > entry.expiresAt
      }))
    }
  }
}

// Global cache instance
const globalCache = new ApiCache()

export function useApiCache() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Cached API call with automatic caching
   */
  async function cachedCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    loading.value = true
    error.value = null

    try {
      // Check cache first
      const cachedData = globalCache.get<T>(key)
      if (cachedData !== null) {
        loading.value = false
        return cachedData
      }

      // Make API call
      const data = await apiCall()
      
      // Cache the result
      globalCache.set(key, data, options)
      
      loading.value = false
      return data
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      loading.value = false
      throw err
    }
  }

  /**
   * Cached API call with stale-while-revalidate strategy
   */
  async function cachedCallSWR<T>(
    key: string,
    apiCall: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cachedData = globalCache.get<T>(key)
    
    // If we have cached data, return it immediately
    if (cachedData !== null) {
      // Revalidate in background
      apiCall()
        .then(freshData => {
          globalCache.set(key, freshData, options)
        })
        .catch(err => {
          console.warn('Background revalidation failed:', err)
        })
      
      return cachedData
    }

    // No cached data, make fresh call
    return cachedCall(key, apiCall, options)
  }

  /**
   * Invalidate cache entry
   */
  function invalidate(key: string): boolean {
    return globalCache.delete(key)
  }

  /**
   * Invalidate multiple cache entries by pattern
   */
  function invalidatePattern(pattern: string | RegExp): number {
    let count = 0
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    
    for (const key of globalCache['cache'].keys()) {
      if (regex.test(key)) {
        globalCache.delete(key)
        count++
      }
    }
    
    return count
  }

  /**
   * Clear all cache
   */
  function clearCache(): void {
    globalCache.clear()
  }

  /**
   * Get cache statistics
   */
  function getCacheStats() {
    return globalCache.getStats()
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    cachedCall,
    cachedCallSWR,
    invalidate,
    invalidatePattern,
    clearCache,
    getCacheStats
  }
}

/**
 * Composable for managing cached data with reactive state
 */
export function useCachedData<T>(
  key: string,
  apiCall: () => Promise<T>,
  options: CacheOptions = {}
) {
  const data: Ref<T | null> = ref(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const { cachedCall, invalidate } = useApiCache()

  const fetch = async (force = false) => {
    if (force) {
      invalidate(key)
    }

    try {
      loading.value = true
      error.value = null
      data.value = await cachedCall(key, apiCall, options)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
    } finally {
      loading.value = false
    }
  }

  const refresh = () => fetch(true)

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetch,
    refresh
  }
}

/**
 * Cache key generators for common patterns
 */
export const cacheKeys = {
  userInfo: (userId: string) => `user:${userId}`,
  userReports: (userId: string, page?: number) => 
    `user:${userId}:reports${page ? `:page:${page}` : ''}`,
  reportDetail: (reportId: string) => `report:${reportId}`,
  reportComments: (reportId: string) => `report:${reportId}:comments`,
  doctorInfo: (doctorId: string) => `doctor:${doctorId}`,
  systemConfig: () => 'system:config',
  userPermissions: (userId: string) => `user:${userId}:permissions`
}

/**
 * Pre-configured cache options for different data types
 */
export const cacheOptions = {
  // Short-lived data (1 minute)
  realtime: { ttl: 60 * 1000 },
  
  // Medium-lived data (5 minutes)
  standard: { ttl: 5 * 60 * 1000 },
  
  // Long-lived data (30 minutes)
  longTerm: { ttl: 30 * 60 * 1000 },
  
  // Very long-lived data (2 hours)
  persistent: { ttl: 2 * 60 * 60 * 1000 },
  
  // Stale-while-revalidate for frequently accessed data
  swr: { ttl: 5 * 60 * 1000, staleWhileRevalidate: true }
}