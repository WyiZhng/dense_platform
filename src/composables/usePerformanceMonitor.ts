/**
 * Performance Monitoring Composable
 * 
 * Provides performance monitoring capabilities for the frontend application
 * including page load times, API response times, and user interaction metrics.
 */

import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'navigation' | 'api' | 'interaction' | 'custom'
  metadata?: Record<string, any>
}

interface NavigationTiming {
  domContentLoaded: number
  loadComplete: number
  firstPaint: number
  firstContentfulPaint: number
  largestContentfulPaint?: number
  firstInputDelay?: number
  cumulativeLayoutShift?: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []
  private maxMetrics = 1000

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        // Navigation timing observer
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.recordNavigationMetrics(entry as PerformanceNavigationTiming)
            }
          }
        })
        navObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navObserver)

        // Paint timing observer
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.addMetric({
              name: entry.name,
              value: entry.startTime,
              timestamp: Date.now(),
              type: 'navigation'
            })
          }
        })
        paintObserver.observe({ entryTypes: ['paint'] })
        this.observers.push(paintObserver)

        // Largest Contentful Paint observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.addMetric({
            name: 'largest-contentful-paint',
            value: lastEntry.startTime,
            timestamp: Date.now(),
            type: 'navigation'
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)

        // First Input Delay observer
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.addMetric({
              name: 'first-input-delay',
              value: (entry as any).processingStart - entry.startTime,
              timestamp: Date.now(),
              type: 'interaction'
            })
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)

        // Cumulative Layout Shift observer
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.addMetric({
            name: 'cumulative-layout-shift',
            value: clsValue,
            timestamp: Date.now(),
            type: 'navigation'
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)

      } catch (error) {
        console.warn('Performance observer initialization failed:', error)
      }
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = [
      {
        name: 'dom-content-loaded',
        value: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
        timestamp: Date.now(),
        type: 'navigation' as const
      },
      {
        name: 'load-complete',
        value: entry.loadEventEnd - entry.loadEventStart,
        timestamp: Date.now(),
        type: 'navigation' as const
      },
      {
        name: 'dns-lookup',
        value: entry.domainLookupEnd - entry.domainLookupStart,
        timestamp: Date.now(),
        type: 'navigation' as const
      },
      {
        name: 'tcp-connection',
        value: entry.connectEnd - entry.connectStart,
        timestamp: Date.now(),
        type: 'navigation' as const
      },
      {
        name: 'request-response',
        value: entry.responseEnd - entry.requestStart,
        timestamp: Date.now(),
        type: 'navigation' as const
      }
    ]

    metrics.forEach(metric => this.addMetric(metric))
  }

  addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  getMetrics(type?: string): PerformanceMetric[] {
    if (type) {
      return this.metrics.filter(m => m.type === type)
    }
    return [...this.metrics]
  }

  getNavigationTiming(): NavigationTiming | null {
    if (!('performance' in window) || !performance.getEntriesByType) {
      return null
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')

    if (!navigation) return null

    const firstPaint = paint.find(p => p.name === 'first-paint')
    const firstContentfulPaint = paint.find(p => p.name === 'first-contentful-paint')

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: firstPaint?.startTime || 0,
      firstContentfulPaint: firstContentfulPaint?.startTime || 0,
      largestContentfulPaint: this.getMetricValue('largest-contentful-paint'),
      firstInputDelay: this.getMetricValue('first-input-delay'),
      cumulativeLayoutShift: this.getMetricValue('cumulative-layout-shift')
    }
  }

  private getMetricValue(name: string): number | undefined {
    const metric = this.metrics.find(m => m.name === name)
    return metric?.value
  }

  measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now()
    
    return apiCall()
      .then(result => {
        const endTime = performance.now()
        this.addMetric({
          name: `api-${name}`,
          value: endTime - startTime,
          timestamp: Date.now(),
          type: 'api',
          metadata: { ...metadata, success: true }
        })
        return result
      })
      .catch(error => {
        const endTime = performance.now()
        this.addMetric({
          name: `api-${name}`,
          value: endTime - startTime,
          timestamp: Date.now(),
          type: 'api',
          metadata: { ...metadata, success: false, error: error.message }
        })
        throw error
      })
  }

  measureInteraction(name: string, callback: () => void | Promise<void>) {
    const startTime = performance.now()
    
    const result = callback()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const endTime = performance.now()
        this.addMetric({
          name: `interaction-${name}`,
          value: endTime - startTime,
          timestamp: Date.now(),
          type: 'interaction'
        })
      })
    } else {
      const endTime = performance.now()
      this.addMetric({
        name: `interaction-${name}`,
        value: endTime - startTime,
        timestamp: Date.now(),
        type: 'interaction'
      })
    }
  }

  getPerformanceReport() {
    const navigationTiming = this.getNavigationTiming()
    const apiMetrics = this.getMetrics('api')
    const interactionMetrics = this.getMetrics('interaction')

    return {
      navigation: navigationTiming,
      api: {
        totalCalls: apiMetrics.length,
        averageResponseTime: apiMetrics.length > 0 
          ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
          : 0,
        slowestCall: apiMetrics.reduce((max, m) => m.value > max.value ? m : max, { value: 0 }),
        fastestCall: apiMetrics.reduce((min, m) => m.value < min.value ? m : min, { value: Infinity })
      },
      interactions: {
        totalInteractions: interactionMetrics.length,
        averageTime: interactionMetrics.length > 0
          ? interactionMetrics.reduce((sum, m) => sum + m.value, 0) / interactionMetrics.length
          : 0
      },
      timestamp: Date.now()
    }
  }

  clearMetrics() {
    this.metrics = []
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.clearMetrics()
  }
}

// Global performance monitor instance
const globalMonitor = new PerformanceMonitor()

export function usePerformanceMonitor() {
  const isSupported = ref(typeof window !== 'undefined' && 'performance' in window)
  const metrics: Ref<PerformanceMetric[]> = ref([])

  const addMetric = (metric: PerformanceMetric) => {
    globalMonitor.addMetric(metric)
    metrics.value = globalMonitor.getMetrics()
  }

  const measureApiCall = <T>(
    name: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    return globalMonitor.measureApiCall(name, apiCall, metadata)
  }

  const measureInteraction = (name: string, callback: () => void | Promise<void>) => {
    return globalMonitor.measureInteraction(name, callback)
  }

  const getNavigationTiming = () => {
    return globalMonitor.getNavigationTiming()
  }

  const getPerformanceReport = () => {
    return globalMonitor.getPerformanceReport()
  }

  const clearMetrics = () => {
    globalMonitor.clearMetrics()
    metrics.value = []
  }

  // Update metrics periodically
  const updateMetrics = () => {
    metrics.value = globalMonitor.getMetrics()
  }

  onMounted(() => {
    updateMetrics()
    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000)
    
    onUnmounted(() => {
      clearInterval(interval)
    })
  })

  return {
    isSupported,
    metrics,
    addMetric,
    measureApiCall,
    measureInteraction,
    getNavigationTiming,
    getPerformanceReport,
    clearMetrics
  }
}

/**
 * Composable for measuring component render performance
 */
export function useComponentPerformance(componentName: string) {
  const { measureInteraction } = usePerformanceMonitor()
  let mountStartTime: number

  onMounted(() => {
    mountStartTime = performance.now()
    
    // Measure mount time on next tick
    setTimeout(() => {
      const mountTime = performance.now() - mountStartTime
      measureInteraction(`component-mount-${componentName}`, () => {
        // Component mount completed
      })
    }, 0)
  })

  const measureRender = (renderName: string, renderFn: () => void | Promise<void>) => {
    return measureInteraction(`component-render-${componentName}-${renderName}`, renderFn)
  }

  return {
    measureRender
  }
}

/**
 * Performance monitoring directive for Vue components
 */
export const vPerformance = {
  mounted(el: HTMLElement, binding: any) {
    const name = binding.value || 'unknown'
    const startTime = performance.now()
    
    // Measure when element is fully rendered
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime
      globalMonitor.addMetric({
        name: `directive-render-${name}`,
        value: renderTime,
        timestamp: Date.now(),
        type: 'custom'
      })
    })
  }
}