<template>
  <div v-if="visible" :class="containerClass">
    <!-- Inline Error Display -->
    <div v-if="type === 'inline'" class="inline-error">
      <el-alert
        :title="title"
        :description="message"
        :type="severity"
        :closable="closable"
        :show-icon="showIcon"
        @close="handleClose"
      >
        <template v-if="$slots.actions" #default>
          <div class="mt-2">
            <slot name="actions"></slot>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- Card Error Display -->
    <div v-else-if="type === 'card'" class="card-error">
      <el-card :class="cardClass">
        <div class="flex items-start space-x-3">
          <el-icon v-if="showIcon" :size="iconSize" :class="iconClass">
            <component :is="getIcon(severity)" />
          </el-icon>
          <div class="flex-1">
            <h4 v-if="title" :class="titleClass">{{ title }}</h4>
            <p :class="messageClass">{{ message }}</p>
            <div v-if="details && showDetails" class="mt-2">
              <el-collapse>
                <el-collapse-item title="错误详情" name="details">
                  <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{ formatDetails(details) }}</pre>
                </el-collapse-item>
              </el-collapse>
            </div>
            <div v-if="$slots.actions" class="mt-3">
              <slot name="actions"></slot>
            </div>
          </div>
          <el-button
            v-if="closable"
            type="text"
            :icon="Close"
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600"
          />
        </div>
      </el-card>
    </div>

    <!-- Banner Error Display -->
    <div v-else-if="type === 'banner'" class="banner-error">
      <div :class="bannerClass">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <el-icon v-if="showIcon" :size="20" :class="iconClass">
              <component :is="getIcon(severity)" />
            </el-icon>
            <div>
              <span v-if="title" class="font-medium">{{ title }}</span>
              <span v-if="title && message" class="mx-2">-</span>
              <span>{{ message }}</span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <slot name="actions"></slot>
            <el-button
              v-if="closable"
              type="text"
              :icon="Close"
              @click="handleClose"
              class="text-current opacity-70 hover:opacity-100"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- List Error Display -->
    <div v-else-if="type === 'list'" class="list-error">
      <div :class="listClass">
        <div class="flex items-start space-x-3">
          <el-icon v-if="showIcon" :size="16" :class="iconClass">
            <component :is="getIcon(severity)" />
          </el-icon>
          <div class="flex-1">
            <div v-if="Array.isArray(errors)" class="space-y-1">
              <div v-for="(error, index) in errors" :key="index" class="text-sm">
                {{ typeof error === 'string' ? error : error.message }}
              </div>
            </div>
            <div v-else class="text-sm">
              {{ message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Close,
  CircleClose,
  WarningFilled,
  InfoFilled,
  CircleCheck
} from '@element-plus/icons-vue'

interface Props {
  visible?: boolean
  type?: 'inline' | 'card' | 'banner' | 'list'
  severity?: 'error' | 'warning' | 'info' | 'success'
  title?: string
  message?: string
  errors?: string[] | Array<{ message: string; field?: string }>
  details?: any
  showDetails?: boolean
  closable?: boolean
  showIcon?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  type: 'inline',
  severity: 'error',
  message: '',
  closable: true,
  showIcon: true,
  showDetails: false,
  size: 'medium'
})

const emit = defineEmits<{
  close: []
}>()

// Icon mapping
const getIcon = (severity: string) => {
  const icons = {
    error: CircleClose,
    warning: WarningFilled,
    info: InfoFilled,
    success: CircleCheck
  }
  return icons[severity as keyof typeof icons] || CircleClose
}

// Computed classes
const containerClass = computed(() => [
  'error-display',
  `error-display--${props.type}`,
  `error-display--${props.severity}`,
  `error-display--${props.size}`
])

const cardClass = computed(() => [
  'border-l-4',
  {
    'border-l-red-500 bg-red-50': props.severity === 'error',
    'border-l-yellow-500 bg-yellow-50': props.severity === 'warning',
    'border-l-blue-500 bg-blue-50': props.severity === 'info',
    'border-l-green-500 bg-green-50': props.severity === 'success'
  }
])

const bannerClass = computed(() => [
  'px-4 py-3 rounded-lg',
  {
    'bg-red-100 text-red-800 border border-red-200': props.severity === 'error',
    'bg-yellow-100 text-yellow-800 border border-yellow-200': props.severity === 'warning',
    'bg-blue-100 text-blue-800 border border-blue-200': props.severity === 'info',
    'bg-green-100 text-green-800 border border-green-200': props.severity === 'success'
  }
])

const listClass = computed(() => [
  'px-3 py-2 rounded border-l-4',
  {
    'border-l-red-500 bg-red-50': props.severity === 'error',
    'border-l-yellow-500 bg-yellow-50': props.severity === 'warning',
    'border-l-blue-500 bg-blue-50': props.severity === 'info',
    'border-l-green-500 bg-green-50': props.severity === 'success'
  }
])

const iconClass = computed(() => [
  {
    'text-red-500': props.severity === 'error',
    'text-yellow-500': props.severity === 'warning',
    'text-blue-500': props.severity === 'info',
    'text-green-500': props.severity === 'success'
  }
])

const titleClass = computed(() => [
  'font-medium',
  {
    'text-red-800': props.severity === 'error',
    'text-yellow-800': props.severity === 'warning',
    'text-blue-800': props.severity === 'info',
    'text-green-800': props.severity === 'success'
  },
  {
    'text-sm': props.size === 'small',
    'text-base': props.size === 'medium',
    'text-lg': props.size === 'large'
  }
])

const messageClass = computed(() => [
  {
    'text-red-700': props.severity === 'error',
    'text-yellow-700': props.severity === 'warning',
    'text-blue-700': props.severity === 'info',
    'text-green-700': props.severity === 'success'
  },
  {
    'text-xs': props.size === 'small',
    'text-sm': props.size === 'medium',
    'text-base': props.size === 'large'
  }
])

const iconSize = computed(() => {
  switch (props.size) {
    case 'small': return 16
    case 'large': return 24
    default: return 20
  }
})

// Methods
const handleClose = () => {
  emit('close')
}

const formatDetails = (details: any): string => {
  if (typeof details === 'string') {
    return details
  }
  
  if (typeof details === 'object') {
    try {
      return JSON.stringify(details, null, 2)
    } catch {
      return String(details)
    }
  }
  
  return String(details)
}
</script>

<style scoped>
.error-display {
  @apply w-full;
}

.error-display--small {
  @apply text-sm;
}

.error-display--large {
  @apply text-lg;
}

/* Animation for error display */
.error-display {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .banner-error .flex {
    @apply flex-col items-start space-x-0 space-y-2;
  }
  
  .card-error .flex {
    @apply flex-col space-x-0 space-y-2;
  }
}
</style>