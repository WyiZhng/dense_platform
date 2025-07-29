/**
 * Image Optimization Composable
 * 
 * Provides image loading optimization including lazy loading, progressive loading,
 * caching, and responsive image handling for better performance.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

interface ImageLoadOptions {
  lazy?: boolean
  progressive?: boolean
  placeholder?: string
  errorImage?: string
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'auto'
  sizes?: string[]
  rootMargin?: string
  threshold?: number
}

interface ImageState {
  loading: boolean
  loaded: boolean
  error: boolean
  src: string | null
  placeholder: string | null
}

class ImageCache {
  private cache = new Map<string, string>()
  private maxSize = 100

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  get(key: string): string | undefined {
    return this.cache.get(key)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

const imageCache = new ImageCache()

export function useImageOptimization(
  src: string | Ref<string>,
  options: ImageLoadOptions = {}
) {
  const {
    lazy = true,
    progressive = false,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
    errorImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZjJmMiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZjU2NTY1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RXJyb3I8L3RleHQ+PC9zdmc+',
    quality = 80,
    format = 'auto',
    rootMargin = '50px',
    threshold = 0.1
  } = options

  const state: Ref<ImageState> = ref({
    loading: false,
    loaded: false,
    error: false,
    src: null,
    placeholder: placeholder
  })

  const imageRef: Ref<HTMLImageElement | null> = ref(null)
  const observer: Ref<IntersectionObserver | null> = ref(null)

  const imageSrc = computed(() => {
    return typeof src === 'string' ? src : src.value
  })

  const currentSrc = computed(() => {
    if (state.value.error) return errorImage
    if (state.value.loaded) return state.value.src
    if (state.value.loading && progressive) return state.value.placeholder
    return state.value.placeholder
  })

  const optimizedSrc = computed(() => {
    const originalSrc = imageSrc.value
    if (!originalSrc) return null

    // Check cache first
    const cacheKey = `${originalSrc}-${quality}-${format}`
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!
    }

    // Generate optimized URL (this would typically be handled by a CDN or image service)
    let optimized = originalSrc

    // Add quality parameter if supported
    if (originalSrc.includes('?')) {
      optimized += `&quality=${quality}`
    } else {
      optimized += `?quality=${quality}`
    }

    // Add format parameter if supported and not auto
    if (format !== 'auto') {
      optimized += `&format=${format}`
    }

    imageCache.set(cacheKey, optimized)
    return optimized
  })

  const loadImage = async (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        state.value.src = src
        state.value.loaded = true
        state.value.loading = false
        state.value.error = false
        resolve()
      }

      img.onerror = () => {
        state.value.error = true
        state.value.loading = false
        reject(new Error(`Failed to load image: ${src}`))
      }

      img.src = src
    })
  }

  const startLoading = async () => {
    if (state.value.loading || state.value.loaded) return

    const srcToLoad = optimizedSrc.value
    if (!srcToLoad) return

    state.value.loading = true

    try {
      await loadImage(srcToLoad)
    } catch (error) {
      console.warn('Image loading failed:', error)
    }
  }

  const setupLazyLoading = () => {
    if (!lazy || !imageRef.value) return

    if ('IntersectionObserver' in window) {
      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startLoading()
              observer.value?.unobserve(entry.target)
            }
          })
        },
        {
          rootMargin,
          threshold
        }
      )

      observer.value.observe(imageRef.value)
    } else {
      // Fallback for browsers without IntersectionObserver
      startLoading()
    }
  }

  const preloadImage = (src: string) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  }

  onMounted(() => {
    if (lazy) {
      setupLazyLoading()
    } else {
      startLoading()
    }
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  return {
    imageRef,
    state: computed(() => state.value),
    currentSrc,
    isLoading: computed(() => state.value.loading),
    isLoaded: computed(() => state.value.loaded),
    hasError: computed(() => state.value.error),
    startLoading,
    preloadImage
  }
}

/**
 * Composable for responsive images with multiple sources
 */
export function useResponsiveImage(
  sources: { src: string; media?: string; sizes?: string }[],
  options: ImageLoadOptions = {}
) {
  const currentSource = ref(sources[0]?.src || '')
  const { state, currentSrc, imageRef, isLoading, isLoaded, hasError } = useImageOptimization(
    currentSource,
    options
  )

  const updateSource = () => {
    // Find the best matching source based on media queries
    for (const source of sources) {
      if (!source.media || window.matchMedia(source.media).matches) {
        currentSource.value = source.src
        break
      }
    }
  }

  onMounted(() => {
    updateSource()
    
    // Listen for viewport changes
    const mediaQueries = sources
      .filter(s => s.media)
      .map(s => window.matchMedia(s.media!))

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', updateSource)
    })

    onUnmounted(() => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updateSource)
      })
    })
  })

  return {
    imageRef,
    state,
    currentSrc,
    isLoading,
    isLoaded,
    hasError,
    updateSource
  }
}

/**
 * Composable for image gallery with preloading
 */
export function useImageGallery(images: string[], options: ImageLoadOptions = {}) {
  const currentIndex = ref(0)
  const preloadedImages = ref(new Set<string>())

  const currentImage = computed(() => images[currentIndex.value])
  const nextImage = computed(() => images[currentIndex.value + 1])
  const prevImage = computed(() => images[currentIndex.value - 1])

  const { state, currentSrc, imageRef, isLoading, isLoaded, hasError } = useImageOptimization(
    currentImage,
    options
  )

  const preloadNext = () => {
    if (nextImage.value && !preloadedImages.value.has(nextImage.value)) {
      const img = new Image()
      img.onload = () => {
        preloadedImages.value.add(nextImage.value)
      }
      img.src = nextImage.value
    }
  }

  const preloadPrev = () => {
    if (prevImage.value && !preloadedImages.value.has(prevImage.value)) {
      const img = new Image()
      img.onload = () => {
        preloadedImages.value.add(prevImage.value)
      }
      img.src = prevImage.value
    }
  }

  const goToNext = () => {
    if (currentIndex.value < images.length - 1) {
      currentIndex.value++
      preloadNext()
    }
  }

  const goToPrev = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      preloadPrev()
    }
  }

  const goToIndex = (index: number) => {
    if (index >= 0 && index < images.length) {
      currentIndex.value = index
      preloadNext()
      preloadPrev()
    }
  }

  // Preload adjacent images when current image loads
  onMounted(() => {
    preloadNext()
    preloadPrev()
  })

  return {
    imageRef,
    state,
    currentSrc,
    currentIndex: computed(() => currentIndex.value),
    currentImage,
    isLoading,
    isLoaded,
    hasError,
    canGoNext: computed(() => currentIndex.value < images.length - 1),
    canGoPrev: computed(() => currentIndex.value > 0),
    goToNext,
    goToPrev,
    goToIndex,
    totalImages: computed(() => images.length)
  }
}

/**
 * Vue directive for optimized image loading
 */
export const vOptimizedImage = {
  mounted(el: HTMLImageElement, binding: any) {
    const options = binding.value || {}
    const { startLoading } = useImageOptimization(el.src, options)
    
    if (!options.lazy) {
      startLoading()
    }
  }
}