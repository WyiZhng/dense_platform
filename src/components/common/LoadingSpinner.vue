<template>
  <div 
    :class="[
      'flex items-center justify-center',
      size === 'small' ? 'h-8' : size === 'large' ? 'h-32' : 'h-16'
    ]"
  >
    <el-icon 
      :size="iconSize" 
      class="animate-spin text-blue-500"
    >
      <Loading />
    </el-icon>
    <span 
      v-if="text" 
      :class="[
        'ml-2 text-gray-600',
        size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base'
      ]"
    >
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const iconSize = computed(() => {
  switch (props.size) {
    case 'small': return 16
    case 'large': return 32
    default: return 24
  }
})
</script>