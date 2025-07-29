<template>
  <el-button
    :class="[
      'responsive-button',
      responsive && 'responsive-sizing',
      fullWidth && 'w-full'
    ]"
    :type="type"
    :size="computedSize"
    :loading="loading"
    :disabled="disabled"
    :icon="icon"
    :round="round"
    :circle="circle"
    :plain="plain"
    :text="text"
    :bg="bg"
    :link="link"
    @click="handleClick"
  >
    <slot></slot>
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'
  size?: 'large' | 'default' | 'small'
  loading?: boolean
  disabled?: boolean
  icon?: any
  round?: boolean
  circle?: boolean
  plain?: boolean
  text?: boolean
  bg?: boolean
  link?: boolean
  responsive?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'default',
  loading: false,
  disabled: false,
  round: false,
  circle: false,
  plain: false,
  text: false,
  bg: false,
  link: false,
  responsive: true,
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const computedSize = computed(() => {
  if (!props.responsive) return props.size
  
  // Responsive size based on screen width
  if (window.innerWidth < 480) {
    return props.size === 'large' ? 'default' : 'small'
  }
  return props.size
})

const handleClick = (event: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.responsive-button {
  @apply transition-all duration-200;
}

.responsive-sizing {
  @apply min-w-0;
}

@media (max-width: 768px) {
  .responsive-sizing {
    @apply text-sm px-3 py-2;
  }
}

@media (max-width: 480px) {
  .responsive-sizing {
    @apply text-xs px-2 py-1;
  }
  
  .responsive-sizing.w-full {
    @apply py-3;
  }
}
</style>