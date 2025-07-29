<template>
  <div class="error-boundary">
    <slot v-if="!hasError"></slot>
    
    <!-- Error fallback UI -->
    <div v-else class="error-fallback">
      <div class="max-w-2xl mx-auto p-6">
        <ErrorDisplay
          type="card"
          severity="error"
          title="应用程序错误"
          :message="errorMessage"
          :details="errorDetails"
          :show-details="showDetails"
          :closable="false"
          size="large"
        >
          <template #actions>
            <div class="flex space-x-3">
              <el-button @click="handleRetry" type="primary">
                重试
              </el-button>
              <el-button @click="handleReload" type="default">
                刷新页面
              </el-button>
              <el-button @click="toggleDetails" type="text">
                {{ showDetails ? '隐藏' : '显示' }}详情
              </el-button>
            </div>
          </template>
        </ErrorDisplay>
        
        <!-- Additional help information -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-900 mb-2">遇到问题？</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• 尝试刷新页面</li>
            <li>• 检查网络连接</li>
            <li>• 清除浏览器缓存</li>
            <li>• 如果问题持续存在，请联系技术支持</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, nextTick, readonly } from 'vue'
import ErrorDisplay from './ErrorDisplay.vue'
import { useErrorHandler } from '@/composables/useErrorHandler'

interface Props {
  fallbackComponent?: any
  onError?: (error: Error, instance: any, info: string) => void
  resetOnPropsChange?: boolean
  resetKeys?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  resetOnPropsChange: true,
  resetKeys: () => []
})

const emit = defineEmits<{
  error: [error: Error, instance: any, info: string]
  reset: []
}>()

const { handleError } = useErrorHandler()

// Error state
const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref<any>(null)
const showDetails = ref(false)
const errorInfo = ref('')

// Error capture
onErrorCaptured((error: Error, instance: any, info: string) => {
  console.error('ErrorBoundary caught error:', error, info)
  
  // Set error state
  hasError.value = true
  errorMessage.value = error.message || '发生未知错误'
  errorDetails.value = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    componentInfo: info,
    timestamp: new Date().toISOString()
  }
  errorInfo.value = info
  
  // Handle error through global error handler
  handleError(error, `Component Error: ${info}`)
  
  // Call custom error handler if provided
  props.onError?.(error, instance, info)
  
  // Emit error event
  emit('error', error, instance, info)
  
  // Prevent error from propagating
  return false
})

// Methods
const handleRetry = async () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = null
  showDetails.value = false
  errorInfo.value = ''
  
  emit('reset')
  
  // Force re-render
  await nextTick()
}

const handleReload = () => {
  window.location.reload()
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

// Reset error state when props change (if enabled)
if (props.resetOnPropsChange) {
  // Watch for prop changes and reset error state
  // This would need to be implemented based on specific reset keys
}

// Expose methods for parent components
defineExpose({
  hasError: readonly(hasError),
  reset: handleRetry,
  getErrorDetails: () => errorDetails.value
})
</script>

<style scoped>
.error-boundary {
  @apply w-full h-full;
}

.error-fallback {
  @apply min-h-screen flex items-center justify-center bg-gray-50 p-4;
}

/* Animation for error display */
.error-fallback {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .error-fallback {
    @apply p-2;
  }
  
  .error-fallback .max-w-2xl {
    @apply max-w-full;
  }
}
</style>