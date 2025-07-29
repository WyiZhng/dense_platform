/**
 * Bundle Analysis Utilities
 * 
 * Provides utilities for analyzing bundle size and performance in development
 */

interface BundleInfo {
  name: string
  size: number
  gzipSize?: number
  modules: string[]
}

interface PerformanceMetrics {
  bundleSize: number
  loadTime: number
  parseTime: number
  executeTime: number
}

class BundleAnalyzer {
  private chunks: Map<string, BundleInfo> = new Map()
  private metrics: PerformanceMetrics[] = []

  recordChunk(name: string, size: number, modules: string[] = []) {
    this.chunks.set(name, {
      name,
      size,
      modules
    })
  }

  recordMetrics(metrics: PerformanceMetrics) {
    this.metrics.push(metrics)
  }

  getChunkInfo(name: string): BundleInfo | undefined {
    return this.chunks.get(name)
  }

  getAllChunks(): BundleInfo[] {
    return Array.from(this.chunks.values())
  }

  getTotalBundleSize(): number {
    return Array.from(this.chunks.values()).reduce((total, chunk) => total + chunk.size, 0)
  }

  getLargestChunks(limit = 5): BundleInfo[] {
    return Array.from(this.chunks.values())
      .sort((a, b) => b.size - a.size)
      .slice(0, limit)
  }

  getPerformanceReport() {
    const totalSize = this.getTotalBundleSize()
    const largestChunks = this.getLargestChunks()
    const avgMetrics = this.calculateAverageMetrics()

    return {
      totalBundleSize: totalSize,
      totalBundleSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      chunkCount: this.chunks.size,
      largestChunks,
      averageMetrics: avgMetrics,
      recommendations: this.generateRecommendations(totalSize, largestChunks)
    }
  }

  private calculateAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {}

    const totals = this.metrics.reduce(
      (acc, metric) => ({
        bundleSize: acc.bundleSize + metric.bundleSize,
        loadTime: acc.loadTime + metric.loadTime,
        parseTime: acc.parseTime + metric.parseTime,
        executeTime: acc.executeTime + metric.executeTime
      }),
      { bundleSize: 0, loadTime: 0, parseTime: 0, executeTime: 0 }
    )

    const count = this.metrics.length
    return {
      bundleSize: totals.bundleSize / count,
      loadTime: totals.loadTime / count,
      parseTime: totals.parseTime / count,
      executeTime: totals.executeTime / count
    }
  }

  private generateRecommendations(totalSize: number, largestChunks: BundleInfo[]): string[] {
    const recommendations: string[] = []

    // Bundle size recommendations
    if (totalSize > 1024 * 1024) { // > 1MB
      recommendations.push('Bundle size is large (>1MB). Consider code splitting and lazy loading.')
    }

    if (totalSize > 2 * 1024 * 1024) { // > 2MB
      recommendations.push('Bundle size is very large (>2MB). Urgent optimization needed.')
    }

    // Chunk size recommendations
    largestChunks.forEach(chunk => {
      if (chunk.size > 500 * 1024) { // > 500KB
        recommendations.push(`Chunk "${chunk.name}" is large (${(chunk.size / 1024).toFixed(0)}KB). Consider splitting.`)
      }
    })

    // Vendor chunk recommendations
    const vendorChunk = largestChunks.find(chunk => chunk.name.includes('vendor'))
    if (vendorChunk && vendorChunk.size > 300 * 1024) { // > 300KB
      recommendations.push('Vendor chunk is large. Consider splitting vendor dependencies.')
    }

    return recommendations
  }

  clear() {
    this.chunks.clear()
    this.metrics.clear()
  }
}

// Global analyzer instance
const globalAnalyzer = new BundleAnalyzer()

/**
 * Development-only bundle analysis
 */
export function analyzeBundleInDev() {
  if (import.meta.env.DEV) {
    // Analyze dynamic imports
    const originalImport = window.__vitePreload || (() => {})
    
    window.__vitePreload = function(baseModule, deps) {
      const startTime = performance.now()
      
      return originalImport.call(this, baseModule, deps).then((result: any) => {
        const loadTime = performance.now() - startTime
        
        // Record metrics
        globalAnalyzer.recordMetrics({
          bundleSize: 0, // Would need to be calculated from network
          loadTime,
          parseTime: 0, // Would need performance API
          executeTime: 0 // Would need performance API
        })
        
        return result
      })
    }
  }
}

/**
 * Get bundle analysis report
 */
export function getBundleReport() {
  return globalAnalyzer.getPerformanceReport()
}

/**
 * Log bundle analysis to console (development only)
 */
export function logBundleAnalysis() {
  if (import.meta.env.DEV) {
    const report = getBundleReport()
    
    console.group('📦 Bundle Analysis Report')
    console.log(`Total Bundle Size: ${report.totalBundleSizeMB}MB`)
    console.log(`Number of Chunks: ${report.chunkCount}`)
    
    if (report.largestChunks.length > 0) {
      console.group('🔍 Largest Chunks:')
      report.largestChunks.forEach(chunk => {
        console.log(`${chunk.name}: ${(chunk.size / 1024).toFixed(0)}KB`)
      })
      console.groupEnd()
    }
    
    if (report.recommendations.length > 0) {
      console.group('💡 Recommendations:')
      report.recommendations.forEach(rec => console.warn(rec))
      console.groupEnd()
    }
    
    console.groupEnd()
  }
}

/**
 * Monitor chunk loading performance
 */
export function monitorChunkLoading() {
  if (import.meta.env.DEV && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          const size = (entry as any).transferSize || 0
          const name = entry.name.split('/').pop() || 'unknown'
          
          globalAnalyzer.recordChunk(name, size)
        }
      }
    })
    
    observer.observe({ entryTypes: ['resource'] })
    
    // Log analysis after initial load
    setTimeout(() => {
      logBundleAnalysis()
    }, 2000)
  }
}

/**
 * Preload critical chunks
 */
export function preloadCriticalChunks(chunkNames: string[]) {
  chunkNames.forEach(chunkName => {
    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.href = chunkName
    document.head.appendChild(link)
  })
}

/**
 * Lazy load non-critical chunks
 */
export function lazyLoadChunk(chunkName: string): Promise<any> {
  return import(/* @vite-ignore */ chunkName)
}

/**
 * Check if chunk is already loaded
 */
export function isChunkLoaded(chunkName: string): boolean {
  return globalAnalyzer.getChunkInfo(chunkName) !== undefined
}

// Initialize monitoring in development
if (import.meta.env.DEV) {
  analyzeBundleInDev()
  monitorChunkLoading()
}