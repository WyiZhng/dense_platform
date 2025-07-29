<template>
  <div class="progress-container">
    <!-- Linear Progress -->
    <div v-if="type === 'linear'" class="linear-progress">
      <div class="progress-track">
        <div 
          class="progress-bar"
          :class="[
            `progress-${color}`,
            striped && 'progress-striped',
            animated && 'progress-animated'
          ]"
          :style="{ width: `${percentage}%` }"
        />
      </div>
      <div v-if="showText" class="progress-text">
        {{ percentage }}%
      </div>
    </div>

    <!-- Circular Progress -->
    <div v-else-if="type === 'circle'" class="circular-progress">
      <el-progress
        :type="type"
        :percentage="percentage"
        :color="progressColor"
        :width="width"
        :stroke-width="strokeWidth"
        :show-text="showText"
        :status="status"
      />
    </div>

    <!-- Step Progress -->
    <div v-else-if="type === 'steps'" class="step-progress">
      <el-steps
        :active="activeStep"
        :direction="direction"
        :align-center="alignCenter"
        :simple="simple"
        :finish-status="finishStatus"
        :process-status="processStatus"
      >
        <el-step
          v-for="(step, index) in steps"
          :key="index"
          :title="step.title"
          :description="step.description"
          :icon="step.icon"
          :status="step.status"
        />
      </el-steps>
    </div>

    <!-- Loading Dots -->
    <div v-else-if="type === 'dots'" class="dots-progress">
      <div class="flex items-center space-x-1">
        <div
          v-for="i in 3"
          :key="i"
          class="dot"
          :class="[
            `dot-${color}`,
            `dot-${size}`
          ]"
          :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
        />
      </div>
      <span v-if="showText" class="ml-3 text-sm text-gray-600">
        {{ text || '加载中...' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Step {
  title: string
  description?: string
  icon?: any
  status?: 'wait' | 'process' | 'finish' | 'error' | 'success'
}

interface Props {
  type?: 'linear' | 'circle' | 'steps' | 'dots'
  percentage?: number
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  showText?: boolean
  text?: string
  striped?: boolean
  animated?: boolean
  width?: number
  strokeWidth?: number
  status?: 'success' | 'exception' | 'warning'
  size?: 'small' | 'medium' | 'large'
  // Steps specific props
  steps?: Step[]
  activeStep?: number
  direction?: 'horizontal' | 'vertical'
  alignCenter?: boolean
  simple?: boolean
  finishStatus?: 'wait' | 'process' | 'finish' | 'error' | 'success'
  processStatus?: 'wait' | 'process' | 'finish' | 'error' | 'success'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'linear',
  percentage: 0,
  color: 'primary',
  showText: true,
  striped: false,
  animated: false,
  width: 126,
  strokeWidth: 6,
  size: 'medium',
  steps: () => [],
  activeStep: 0,
  direction: 'horizontal',
  alignCenter: false,
  simple: false,
  finishStatus: 'finish',
  processStatus: 'process'
})

const progressColor = computed(() => {
  const colors = {
    primary: '#409EFF',
    success: '#67C23A',
    warning: '#E6A23C',
    danger: '#F56C6C',
    info: '#909399'
  }
  return colors[props.color]
})
</script>

<style scoped>
.progress-container {
  @apply w-full;
}

/* Linear Progress */
.linear-progress {
  @apply flex items-center space-x-3;
}

.progress-track {
  @apply flex-1 bg-gray-200 rounded-full overflow-hidden;
  height: 8px;
}

.progress-bar {
  @apply h-full transition-all duration-300 ease-out;
}

.progress-primary {
  @apply bg-blue-500;
}

.progress-success {
  @apply bg-green-500;
}

.progress-warning {
  @apply bg-yellow-500;
}

.progress-danger {
  @apply bg-red-500;
}

.progress-info {
  @apply bg-gray-500;
}

.progress-striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.progress-animated {
  animation: progress-bar-stripes 1s linear infinite;
}

@keyframes progress-bar-stripes {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}

.progress-text {
  @apply text-sm font-medium text-gray-600 min-w-[3rem] text-right;
}

/* Circular Progress */
.circular-progress {
  @apply flex justify-center;
}

/* Step Progress */
.step-progress {
  @apply w-full;
}

/* Dots Progress */
.dots-progress {
  @apply flex items-center justify-center;
}

.dot {
  @apply rounded-full animate-pulse;
}

.dot-small {
  @apply w-2 h-2;
}

.dot-medium {
  @apply w-3 h-3;
}

.dot-large {
  @apply w-4 h-4;
}

.dot-primary {
  @apply bg-blue-500;
}

.dot-success {
  @apply bg-green-500;
}

.dot-warning {
  @apply bg-yellow-500;
}

.dot-danger {
  @apply bg-red-500;
}

.dot-info {
  @apply bg-gray-500;
}

@keyframes dot-pulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.dot {
  animation: dot-pulse 1.4s ease-in-out infinite both;
}
</style>