import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'

// Screen size breakpoints
const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useUI() {
  // Reactive screen size
  const screenWidth = ref(window.innerWidth)
  const screenHeight = ref(window.innerHeight)

  // Update screen size
  const updateScreenSize = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
  }

  // Screen size computed properties
  const isXs = computed(() => screenWidth.value < BREAKPOINTS.xs)
  const isSm = computed(() => screenWidth.value >= BREAKPOINTS.xs && screenWidth.value < BREAKPOINTS.sm)
  const isMd = computed(() => screenWidth.value >= BREAKPOINTS.sm && screenWidth.value < BREAKPOINTS.md)
  const isLg = computed(() => screenWidth.value >= BREAKPOINTS.md && screenWidth.value < BREAKPOINTS.lg)
  const isXl = computed(() => screenWidth.value >= BREAKPOINTS.lg && screenWidth.value < BREAKPOINTS.xl)
  const is2Xl = computed(() => screenWidth.value >= BREAKPOINTS.xl)

  // Mobile/Desktop detection
  const isMobile = computed(() => screenWidth.value < BREAKPOINTS.md)
  const isTablet = computed(() => screenWidth.value >= BREAKPOINTS.md && screenWidth.value < BREAKPOINTS.lg)
  const isDesktop = computed(() => screenWidth.value >= BREAKPOINTS.lg)

  // Responsive sizing helpers
  const getResponsiveSize = (sizes: { xs?: any, sm?: any, md?: any, lg?: any, xl?: any, '2xl'?: any }) => {
    if (is2Xl.value && sizes['2xl']) return sizes['2xl']
    if (isXl.value && sizes.xl) return sizes.xl
    if (isLg.value && sizes.lg) return sizes.lg
    if (isMd.value && sizes.md) return sizes.md
    if (isSm.value && sizes.sm) return sizes.sm
    if (isXs.value && sizes.xs) return sizes.xs
    return sizes.md || sizes.sm || sizes.xs
  }

  // Loading state management
  const loadingStates = ref<Record<string, boolean>>({})
  
  const setLoading = (key: string, loading: boolean) => {
    loadingStates.value[key] = loading
  }
  
  const isLoading = (key: string) => {
    return loadingStates.value[key] || false
  }

  // Notification helpers
  const showSuccess = (message: string, title?: string) => {
    if (isMobile.value) {
      ElMessage.success(message)
    } else {
      ElNotification.success({
        title: title || '成功',
        message,
        duration: 4000
      })
    }
  }

  const showError = (message: string, title?: string) => {
    if (isMobile.value) {
      ElMessage.error(message)
    } else {
      ElNotification.error({
        title: title || '错误',
        message,
        duration: 6000
      })
    }
  }

  const showWarning = (message: string, title?: string) => {
    if (isMobile.value) {
      ElMessage.warning(message)
    } else {
      ElNotification.warning({
        title: title || '警告',
        message,
        duration: 5000
      })
    }
  }

  const showInfo = (message: string, title?: string) => {
    if (isMobile.value) {
      ElMessage.info(message)
    } else {
      ElNotification.info({
        title: title || '信息',
        message,
        duration: 4000
      })
    }
  }

  // Confirmation dialog
  const showConfirm = async (message: string, title = '确认', type: 'warning' | 'info' | 'success' | 'error' = 'warning') => {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type,
        center: isMobile.value
      })
      return true
    } catch {
      return false
    }
  }

  // Theme management
  const isDark = ref(false)
  const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  // Initialize theme
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // Debounce helper
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: number
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Throttle helper
  const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // Setup event listeners
  onMounted(() => {
    window.addEventListener('resize', debounce(updateScreenSize, 100))
    initTheme()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize)
  })

  return {
    // Screen size
    screenWidth,
    screenHeight,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isMobile,
    isTablet,
    isDesktop,
    getResponsiveSize,
    
    // Loading states
    setLoading,
    isLoading,
    
    // Notifications
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    
    // Theme
    isDark,
    toggleTheme,
    
    // Utilities
    debounce,
    throttle
  }
}

// Global UI state
export const useGlobalUI = () => {
  const globalLoading = ref(false)
  const sidebarCollapsed = ref(false)
  const fullscreen = ref(false)

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        fullscreen.value = true
      } else {
        await document.exitFullscreen()
        fullscreen.value = false
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  return {
    globalLoading,
    sidebarCollapsed,
    fullscreen,
    toggleSidebar,
    toggleFullscreen
  }
}