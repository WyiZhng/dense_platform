import { ref, reactive, readonly } from 'vue'
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
import { useUI } from './useUI'

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  context?: string
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export interface FormErrors {
  [key: string]: string[]
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

export function useErrorHandler() {
  const { isMobile, showError, showWarning, showInfo } = useUI()
  
  // Error state management
  const errors = ref<AppError[]>([])
  const formErrors = reactive<FormErrors>({})
  const isHandlingError = ref(false)

  // Error message mappings
  const errorMessages = {
    // Network errors
    'NETWORK_ERROR': '网络连接失败，请检查网络设置',
    'TIMEOUT_ERROR': '请求超时，请稍后重试',
    'CONNECTION_REFUSED': '无法连接到服务器',
    
    // Authentication errors
    'INVALID_TOKEN': '登录已过期，请重新登录',
    'UNAUTHORIZED': '您没有权限执行此操作',
    'LOGIN_FAILED': '用户名或密码错误',
    'TOKEN_EXPIRED': '登录已过期，请重新登录',
    
    // Validation errors
    'VALIDATION_ERROR': '输入信息有误，请检查后重试',
    'REQUIRED_FIELD': '此字段为必填项',
    'INVALID_FORMAT': '格式不正确',
    'PASSWORD_TOO_WEAK': '密码强度不够',
    
    // Server errors
    'SERVER_ERROR': '服务器内部错误，请稍后重试',
    'SERVICE_UNAVAILABLE': '服务暂时不可用',
    'DATABASE_ERROR': '数据库操作失败',
    
    // Generic errors
    'UNKNOWN_ERROR': '发生未知错误，请联系技术支持',
    'OPERATION_FAILED': '操作失败，请重试'
  }

  // Get user-friendly error message
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
      return errorMessages[error as keyof typeof errorMessages] || error
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message
    }
    
    if (error?.message) {
      return error.message
    }
    
    if (error?.code) {
      return errorMessages[error.code as keyof typeof errorMessages] || error.code
    }
    
    return errorMessages.UNKNOWN_ERROR
  }

  // Categorize error
  const categorizeError = (error: any): ErrorCategory => {
    if (error?.response) {
      const status = error.response.status
      if (status === 401) return ErrorCategory.AUTHENTICATION
      if (status === 403) return ErrorCategory.AUTHORIZATION
      if (status >= 400 && status < 500) return ErrorCategory.CLIENT
      if (status >= 500) return ErrorCategory.SERVER
    }
    
    if (error?.code === 'NETWORK_ERROR' || error?.code === 'ECONNREFUSED') {
      return ErrorCategory.NETWORK
    }
    
    if (error?.name === 'ValidationError') {
      return ErrorCategory.VALIDATION
    }
    
    return ErrorCategory.UNKNOWN
  }

  // Get error severity
  const getErrorSeverity = (category: ErrorCategory): ErrorSeverity => {
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return ErrorSeverity.HIGH
      case ErrorCategory.SERVER:
        return ErrorSeverity.CRITICAL
      case ErrorCategory.NETWORK:
        return ErrorSeverity.MEDIUM
      case ErrorCategory.VALIDATION:
        return ErrorSeverity.LOW
      default:
        return ErrorSeverity.MEDIUM
    }
  }

  // Handle different types of errors
  const handleError = (error: any, context?: string) => {
    if (isHandlingError.value) return
    isHandlingError.value = true

    try {
      const category = categorizeError(error)
      const severity = getErrorSeverity(category)
      const message = getErrorMessage(error)
      
      const appError: AppError = {
        code: error?.code || error?.response?.status?.toString() || 'UNKNOWN',
        message,
        details: error,
        timestamp: new Date(),
        context
      }
      
      // Add to error history
      errors.value.unshift(appError)
      if (errors.value.length > 50) {
        errors.value = errors.value.slice(0, 50)
      }
      
      // Show appropriate notification based on severity and category
      showErrorNotification(appError, severity, category)
      
      // Handle specific error types
      handleSpecificErrors(category, error, context)
      
    } finally {
      setTimeout(() => {
        isHandlingError.value = false
      }, 100)
    }
  }

  // Show error notification
  const showErrorNotification = (error: AppError, severity: ErrorSeverity, category: ErrorCategory) => {
    const duration = severity === ErrorSeverity.CRITICAL ? 0 : 
                    severity === ErrorSeverity.HIGH ? 8000 : 
                    severity === ErrorSeverity.MEDIUM ? 6000 : 4000

    if (isMobile.value) {
      ElMessage({
        type: severity === ErrorSeverity.LOW ? 'warning' : 'error',
        message: error.message,
        duration,
        showClose: true
      })
    } else {
      ElNotification({
        type: severity === ErrorSeverity.LOW ? 'warning' : 'error',
        title: getErrorTitle(category),
        message: error.message,
        duration,
        showClose: true,
        position: 'top-right'
      })
    }
  }

  // Get error title based on category
  const getErrorTitle = (category: ErrorCategory): string => {
    const titles = {
      [ErrorCategory.NETWORK]: '网络错误',
      [ErrorCategory.VALIDATION]: '输入错误',
      [ErrorCategory.AUTHENTICATION]: '认证错误',
      [ErrorCategory.AUTHORIZATION]: '权限错误',
      [ErrorCategory.SERVER]: '服务器错误',
      [ErrorCategory.CLIENT]: '请求错误',
      [ErrorCategory.UNKNOWN]: '系统错误'
    }
    return titles[category]
  }

  // Handle specific error types
  const handleSpecificErrors = (category: ErrorCategory, error: any, context?: string) => {
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        // Clear token and redirect to login
        if (error?.response?.status === 401) {
          setTimeout(() => {
            // Clear authentication data
            localStorage.removeItem('token')
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
            
            // Redirect to login
            window.location.href = '/login'
          }, 2000)
        }
        break
        
      case ErrorCategory.NETWORK:
        // Show retry option for network errors
        if (!isMobile.value) {
          ElMessageBox.confirm(
            '网络连接失败，是否重试？',
            '网络错误',
            {
              confirmButtonText: '重试',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            // Emit retry event if context is provided
            if (context) {
              window.dispatchEvent(new CustomEvent('error-retry', { detail: { context, error } }))
            }
          }).catch(() => {
            // User cancelled
          })
        }
        break
    }
  }

  // Handle validation errors
  const handleValidationErrors = (errors: ValidationError[] | Record<string, string[]>) => {
    // Clear previous form errors
    Object.keys(formErrors).forEach(key => {
      delete formErrors[key]
    })
    
    if (Array.isArray(errors)) {
      // Handle array format
      errors.forEach(error => {
        if (!formErrors[error.field]) {
          formErrors[error.field] = []
        }
        formErrors[error.field].push(error.message)
      })
    } else {
      // Handle object format
      Object.assign(formErrors, errors)
    }
    
    // Show summary notification
    const errorCount = Object.keys(formErrors).length
    showWarning(`表单中有 ${errorCount} 个字段需要修正`, '表单验证失败')
  }

  // Clear form errors
  const clearFormErrors = (field?: string) => {
    if (field) {
      delete formErrors[field]
    } else {
      Object.keys(formErrors).forEach(key => {
        delete formErrors[key]
      })
    }
  }

  // Get form field error
  const getFieldError = (field: string): string[] => {
    return formErrors[field] || []
  }

  // Check if field has error
  const hasFieldError = (field: string): boolean => {
    return !!(formErrors[field] && formErrors[field].length > 0)
  }

  // Show success message
  const showSuccess = (message: string, title?: string) => {
    if (isMobile.value) {
      ElMessage.success(message)
    } else {
      ElNotification.success({
        title: title || '操作成功',
        message,
        duration: 4000
      })
    }
  }

  // Show confirmation dialog
  const showConfirm = async (
    message: string, 
    title = '确认操作', 
    options: {
      type?: 'warning' | 'info' | 'success' | 'error'
      confirmText?: string
      cancelText?: string
    } = {}
  ): Promise<boolean> => {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: options.confirmText || '确定',
        cancelButtonText: options.cancelText || '取消',
        type: options.type || 'warning',
        center: isMobile.value
      })
      return true
    } catch {
      return false
    }
  }

  // Clear all errors
  const clearErrors = () => {
    errors.value = []
    clearFormErrors()
  }

  // Get recent errors
  const getRecentErrors = (limit = 10) => {
    return errors.value.slice(0, limit)
  }

  return {
    // State
    errors: readonly(errors),
    formErrors: readonly(formErrors),
    isHandlingError: readonly(isHandlingError),
    
    // Methods
    handleError,
    handleValidationErrors,
    clearFormErrors,
    clearErrors,
    getFieldError,
    hasFieldError,
    showSuccess,
    showConfirm,
    getRecentErrors,
    
    // Utilities
    getErrorMessage,
    categorizeError,
    getErrorSeverity
  }
}

// Global error handler instance
let globalErrorHandler: ReturnType<typeof useErrorHandler> | null = null

export const useGlobalErrorHandler = () => {
  if (!globalErrorHandler) {
    globalErrorHandler = useErrorHandler()
  }
  return globalErrorHandler
}