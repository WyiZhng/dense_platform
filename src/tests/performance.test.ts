/**
 * Frontend Performance Tests
 * 
 * Tests for frontend performance optimizations including lazy loading,
 * caching, bundle optimization, and image loading.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useApiCache, cacheKeys, cacheOptions } from '@/composables/useApiCache'
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor'
import { useImageOptimization } from '@/composables/useImageOptimization'
import { getBundleReport, logBundleAnalysis } from '@/utils/bundleAnalyzer'

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
  mark: vi.fn(),
  measure: vi.fn()
}

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.prototype.observe = vi.fn()
mockIntersectionObserver.prototype.unobserve = vi.fn()
mockIntersectionObserver.prototype.disconnect = vi.fn()

// Setup global mocks
beforeEach(() => {
  global.performance = mockPerformance as any
  global.IntersectionObserver = mockIntersectionObserver as any
  global.PerformanceObserver = vi.fn() as any
})

describe('API Caching', () => {
  const { cachedCall, invalidate, clearCache, getCacheStats } = useApiCache()

  beforeEach(() => {
    clearCache()
  })

  it('should cache API responses', async () => {
    const mockApiCall = vi.fn().mockResolvedValue({ data: 'test' })
    const cacheKey = 'test-key'

    // First call should execute API
    const result1 = await cachedCall(cacheKey, mockApiCall)
    expect(mockApiCall).toHaveBeenCalledTimes(1)
    expect(result1).toEqual({ data: 'test' })

    // Second call should use cache
    const result2 = await cachedCall(cacheKey, mockApiCall)
    expect(mockApiCall).toHaveBeenCalledTimes(1) // Still only called once
    expect(result2).toEqual({ data: 'test' })
  })

  it('should respect cache TTL', async () => {
    const mockApiCall = vi.fn()
      .mockResolvedValueOnce({ data: 'first' })
      .mockResolvedValueOnce({ data: 'second' })

    const cacheKey = 'ttl-test'
    const shortTTL = { ttl: 100 } // 100ms

    // First call
    const result1 = await cachedCall(cacheKey, mockApiCall, shortTTL)
    expect(result1).toEqual({ data: 'first' })

    // Wait for cache to expire
    await new Promise(resolve => setTimeout(resolve, 150))

    // Second call should make new API call
    const result2 = await cachedCall(cacheKey, mockApiCall, shortTTL)
    expect(mockApiCall).toHaveBeenCalledTimes(2)
    expect(result2).toEqual({ data: 'second' })
  })

  it('should invalidate cache entries', async () => {
    const mockApiCall = vi.fn()
      .mockResolvedValueOnce({ data: 'first' })
      .mockResolvedValueOnce({ data: 'second' })

    const cacheKey = 'invalidate-test'

    // First call
    await cachedCall(cacheKey, mockApiCall)
    expect(mockApiCall).toHaveBeenCalledTimes(1)

    // Invalidate cache
    invalidate(cacheKey)

    // Second call should make new API call
    await cachedCall(cacheKey, mockApiCall)
    expect(mockApiCall).toHaveBeenCalledTimes(2)
  })

  it('should provide cache statistics', async () => {
    const mockApiCall = vi.fn().mockResolvedValue({ data: 'test' })
    
    await cachedCall('key1', mockApiCall)
    await cachedCall('key2', mockApiCall)

    const stats = getCacheStats()
    expect(stats.size).toBe(2)
    expect(stats.entries).toHaveLength(2)
  })
})

describe('Performance Monitoring', () => {
  const { measureApiCall, measureInteraction, getPerformanceReport } = usePerformanceMonitor()

  it('should measure API call performance', async () => {
    const mockApiCall = vi.fn().mockResolvedValue({ data: 'test' })
    
    const result = await measureApiCall('test-api', mockApiCall)
    
    expect(result).toEqual({ data: 'test' })
    expect(mockApiCall).toHaveBeenCalledTimes(1)

    const report = getPerformanceReport()
    expect(report.api.totalCalls).toBe(1)
  })

  it('should measure interaction performance', () => {
    const mockCallback = vi.fn()
    
    measureInteraction('test-interaction', mockCallback)
    
    expect(mockCallback).toHaveBeenCalledTimes(1)

    const report = getPerformanceReport()
    expect(report.interactions.totalInteractions).toBe(1)
  })

  it('should handle async interactions', async () => {
    const mockAsyncCallback = vi.fn().mockResolvedValue('done')
    
    await measureInteraction('async-interaction', mockAsyncCallback)
    
    expect(mockAsyncCallback).toHaveBeenCalledTimes(1)
  })

  it('should generate performance report', () => {
    const report = getPerformanceReport()
    
    expect(report).toHaveProperty('navigation')
    expect(report).toHaveProperty('api')
    expect(report).toHaveProperty('interactions')
    expect(report).toHaveProperty('timestamp')
  })
})

describe('Image Optimization', () => {
  it('should initialize with correct default state', () => {
    const { state, isLoading, isLoaded, hasError } = useImageOptimization('test.jpg')
    
    expect(state.value.loading).toBe(false)
    expect(state.value.loaded).toBe(false)
    expect(state.value.error).toBe(false)
    expect(isLoading.value).toBe(false)
    expect(isLoaded.value).toBe(false)
    expect(hasError.value).toBe(false)
  })

  it('should handle lazy loading configuration', () => {
    const { state } = useImageOptimization('test.jpg', { lazy: true })
    
    expect(state.value.placeholder).toBeTruthy()
  })

  it('should handle progressive loading', () => {
    const { state } = useImageOptimization('test.jpg', { 
      progressive: true,
      placeholder: 'placeholder.jpg'
    })
    
    expect(state.value.placeholder).toBe('placeholder.jpg')
  })

  it('should preload images', () => {
    const { preloadImage } = useImageOptimization('test.jpg')
    
    // Mock document.head.appendChild
    const mockAppendChild = vi.fn()
    const mockCreateElement = vi.fn().mockReturnValue({
      rel: '',
      as: '',
      href: ''
    })
    
    global.document = {
      createElement: mockCreateElement,
      head: { appendChild: mockAppendChild }
    } as any

    preloadImage('preload.jpg')
    
    expect(mockCreateElement).toHaveBeenCalledWith('link')
    expect(mockAppendChild).toHaveBeenCalled()
  })
})

describe('Bundle Analysis', () => {
  it('should generate bundle report', () => {
    const report = getBundleReport()
    
    expect(report).toHaveProperty('totalBundleSize')
    expect(report).toHaveProperty('totalBundleSizeMB')
    expect(report).toHaveProperty('chunkCount')
    expect(report).toHaveProperty('largestChunks')
    expect(report).toHaveProperty('recommendations')
  })

  it('should log bundle analysis in development', () => {
    const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    // Mock development environment
    vi.stubEnv('DEV', true)
    
    logBundleAnalysis()
    
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
    consoleLogSpy.mockRestore()
  })
})

describe('Cache Key Generation', () => {
  it('should generate correct cache keys', () => {
    expect(cacheKeys.userInfo('user123')).toBe('user:user123')
    expect(cacheKeys.userReports('user123')).toBe('user:user123:reports')
    expect(cacheKeys.userReports('user123', 2)).toBe('user:user123:reports:page:2')
    expect(cacheKeys.reportDetail('report456')).toBe('report:report456')
    expect(cacheKeys.reportComments('report456')).toBe('report:report456:comments')
  })
})

describe('Cache Options', () => {
  it('should provide predefined cache options', () => {
    expect(cacheOptions.realtime.ttl).toBe(60 * 1000) // 1 minute
    expect(cacheOptions.standard.ttl).toBe(5 * 60 * 1000) // 5 minutes
    expect(cacheOptions.longTerm.ttl).toBe(30 * 60 * 1000) // 30 minutes
    expect(cacheOptions.persistent.ttl).toBe(2 * 60 * 60 * 1000) // 2 hours
  })
})

describe('Performance Integration', () => {
  it('should integrate caching with performance monitoring', async () => {
    const { cachedCall } = useApiCache()
    const { measureApiCall } = usePerformanceMonitor()
    
    const mockApiCall = vi.fn().mockResolvedValue({ data: 'integrated' })
    
    // Measure cached API call
    const result = await measureApiCall(
      'integrated-test',
      () => cachedCall('integration-key', mockApiCall)
    )
    
    expect(result).toEqual({ data: 'integrated' })
    expect(mockApiCall).toHaveBeenCalledTimes(1)
  })
})

// Cleanup
afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})