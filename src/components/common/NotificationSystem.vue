<template>
  <teleport to="body">
    <div class="notification-container">
      <transition-group
        name="notification"
        tag="div"
        class="fixed top-4 right-4 z-[9999] space-y-2"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'notification-item',
            `notification-${notification.type}`,
            'max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4',
            'transform transition-all duration-300 ease-in-out'
          ]"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <el-icon :size="20" :class="iconClass(notification.type)">
                <component :is="getIcon(notification.type)" />
              </el-icon>
            </div>
            <div class="ml-3 flex-1">
              <h4 v-if="notification.title" class="text-sm font-medium text-gray-900">
                {{ notification.title }}
              </h4>
              <p class="text-sm text-gray-600 mt-1">
                {{ notification.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0">
              <button
                @click="removeNotification(notification.id)"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <el-icon :size="16">
                  <Close />
                </el-icon>
              </button>
            </div>
          </div>
          
          <!-- Progress bar for auto-dismiss -->
          <div
            v-if="notification.duration && notification.duration > 0"
            class="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden"
          >
            <div
              class="h-full bg-current opacity-30 transition-all ease-linear"
              :style="{
                width: `${notification.progress}%`,
                transitionDuration: `${notification.duration}ms`
              }"
            />
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  CircleCheck, 
  CircleClose, 
  WarningFilled, 
  InfoFilled,
  Close 
} from '@element-plus/icons-vue'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  progress?: number
}

const notifications = ref<Notification[]>([])
const timers = new Map<string, number>()

const getIcon = (type: string) => {
  const icons = {
    success: CircleCheck,
    error: CircleClose,
    warning: WarningFilled,
    info: InfoFilled
  }
  return icons[type as keyof typeof icons]
}

const iconClass = (type: string) => {
  const classes = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }
  return classes[type as keyof typeof classes]
}

const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString()
  const newNotification: Notification = {
    ...notification,
    id,
    progress: 0
  }
  
  notifications.value.push(newNotification)
  
  if (notification.duration && notification.duration > 0) {
    // Start progress animation
    setTimeout(() => {
      const notif = notifications.value.find(n => n.id === id)
      if (notif) {
        notif.progress = 100
      }
    }, 100)
    
    // Auto remove after duration
    const timer = setTimeout(() => {
      removeNotification(id)
    }, notification.duration)
    
    timers.set(id, timer)
  }
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
  
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

const clearAll = () => {
  notifications.value = []
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
}

// Global notification methods
const showSuccess = (message: string, title?: string, duration = 4000) => {
  addNotification({ type: 'success', message, title, duration })
}

const showError = (message: string, title?: string, duration = 6000) => {
  addNotification({ type: 'error', message, title, duration })
}

const showWarning = (message: string, title?: string, duration = 5000) => {
  addNotification({ type: 'warning', message, title, duration })
}

const showInfo = (message: string, title?: string, duration = 4000) => {
  addNotification({ type: 'info', message, title, duration })
}

// Cleanup on unmount
onUnmounted(() => {
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
})

// Expose methods
defineExpose({
  showSuccess,
  showError,
  showWarning,
  showInfo,
  clearAll
})
</script>

<style scoped>
.notification-success {
  @apply border-l-green-500;
}

.notification-error {
  @apply border-l-red-500;
}

.notification-warning {
  @apply border-l-yellow-500;
}

.notification-info {
  @apply border-l-blue-500;
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .notification-container :deep(.fixed) {
    @apply left-4 right-4 top-4;
  }
  
  .notification-item {
    @apply max-w-none;
  }
}
</style>