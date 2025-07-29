import { ref, reactive, readonly } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'

export interface ToastOptions {
  title?: string
  message: string
  type?: 'success' | 'warning' | 'info' | 'error'
  duration?: number
  showClose?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  offset?: number
  customClass?: string
  dangerouslyUseHTMLString?: boolean
  onClose?: () => void
  onClick?: () => void
}

export interface Toast {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title?: string
  message: string
  duration: number
  timestamp: Date
  visible: boolean
}

export function useToast() {
  const toasts = ref<Toast[]>([])
  const maxToasts = 5

  // Default options
  const defaultOptions: Partial<ToastOptions> = {
    duration: 4000,
    showClose: true,
    position: 'top-right',
    offset: 20
  }

  // Show toast notification
  const showToast = (options: ToastOptions) => {
    const finalOptions = { ...defaultOptions, ...options }
    
    // Create toast record
    const toast: Toast = {
      id: Date.now().toString(),
      type: finalOptions.type || 'info',
      title: finalOptions.title,
      message: finalOptions.message,
      duration: finalOptions.duration || 4000,
      timestamp: new Date(),
      visible: true
    }
    
    // Add to toast history
    toasts.value.unshift(toast)
    if (toasts.value.length > maxToasts) {
      toasts.value = toasts.value.slice(0, maxToasts)
    }
    
    // Show notification
    if (window.innerWidth < 768) {
      // Mobile: use ElMessage
      ElMessage({
        type: finalOptions.type || 'info',
        message: finalOptions.message,
        duration: finalOptions.duration,
        showClose: finalOptions.showClose,
        customClass: finalOptions.customClass,
        dangerouslyUseHTMLString: finalOptions.dangerouslyUseHTMLString,
        onClose: () => {
          toast.visible = false
          finalOptions.onClose?.()
        }
      })
    } else {
      // Desktop: use ElNotification
      ElNotification({
        type: finalOptions.type || 'info',
        title: finalOptions.title,
        message: finalOptions.message,
        duration: finalOptions.duration,
        showClose: finalOptions.showClose,
        position: finalOptions.position,
        offset: finalOptions.offset,
        customClass: finalOptions.customClass,
        dangerouslyUseHTMLString: finalOptions.dangerouslyUseHTMLString,
        onClose: () => {
          toast.visible = false
          finalOptions.onClose?.()
        },
        onClick: finalOptions.onClick
      })
    }
    
    return toast.id
  }

  // Convenience methods
  const success = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    return showToast({
      type: 'success',
      message,
      title: title || '成功',
      ...options
    })
  }

  const error = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    return showToast({
      type: 'error',
      message,
      title: title || '错误',
      duration: 6000, // Longer duration for errors
      ...options
    })
  }

  const warning = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    return showToast({
      type: 'warning',
      message,
      title: title || '警告',
      duration: 5000,
      ...options
    })
  }

  const info = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    return showToast({
      type: 'info',
      message,
      title: title || '信息',
      ...options
    })
  }

  // Loading toast with promise handling
  const loading = async <T>(
    promise: Promise<T>,
    messages: {
      loading?: string
      success?: string
      error?: string
    } = {}
  ): Promise<T> => {
    const loadingMessage = messages.loading || '处理中...'
    const successMessage = messages.success || '操作成功'
    const errorMessage = messages.error || '操作失败'
    
    // Show loading message
    const loadingToast = showToast({
      type: 'info',
      message: loadingMessage,
      duration: 0, // Don't auto-close
      showClose: false
    })
    
    try {
      const result = await promise
      
      // Close loading toast and show success
      ElNotification.closeAll()
      ElMessage.closeAll()
      
      success(successMessage)
      
      return result
    } catch (error) {
      // Close loading toast and show error
      ElNotification.closeAll()
      ElMessage.closeAll()
      
      const errorMsg = error instanceof Error ? error.message : errorMessage
      showToast({
        type: 'error',
        message: errorMsg,
        title: '错误',
        duration: 6000
      })
      
      throw error
    }
  }

  // Batch operations
  const showMultiple = (toastList: ToastOptions[]) => {
    const ids: string[] = []
    toastList.forEach((options, index) => {
      setTimeout(() => {
        const id = showToast(options)
        ids.push(id)
      }, index * 200) // Stagger the notifications
    })
    return ids
  }

  // Clear all toasts
  const clearAll = () => {
    ElNotification.closeAll()
    ElMessage.closeAll()
    toasts.value.forEach(toast => {
      toast.visible = false
    })
  }

  // Get toast history
  const getHistory = (limit?: number) => {
    const history = toasts.value.slice()
    return limit ? history.slice(0, limit) : history
  }

  // Get visible toasts
  const getVisible = () => {
    return toasts.value.filter(toast => toast.visible)
  }

  // Remove toast from history
  const removeFromHistory = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  // Clear history
  const clearHistory = () => {
    toasts.value = []
  }

  // Toast statistics
  const getStats = () => {
    const stats = {
      total: toasts.value.length,
      success: 0,
      error: 0,
      warning: 0,
      info: 0,
      visible: 0
    }
    
    toasts.value.forEach(toast => {
      stats[toast.type]++
      if (toast.visible) stats.visible++
    })
    
    return stats
  }

  return {
    // State
    toasts: readonly(toasts),
    
    // Core methods
    showToast,
    success,
    error,
    warning,
    info,
    loading,
    
    // Batch operations
    showMultiple,
    clearAll,
    
    // History management
    getHistory,
    getVisible,
    removeFromHistory,
    clearHistory,
    
    // Utilities
    getStats
  }
}

// Global toast instance
let globalToast: ReturnType<typeof useToast> | null = null

export const useGlobalToast = () => {
  if (!globalToast) {
    globalToast = useToast()
  }
  return globalToast
}