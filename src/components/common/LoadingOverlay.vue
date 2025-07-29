<template>
  <div 
    v-if="visible" 
    class="loading-overlay"
    :class="[
      'absolute inset-0 flex items-center justify-center',
      'bg-white bg-opacity-80 backdrop-blur-sm',
      'z-50 transition-all duration-300'
    ]"
  >
    <div class="flex flex-col items-center space-y-3">
      <el-icon 
        :size="size" 
        class="animate-spin text-blue-500"
      >
        <Loading />
      </el-icon>
      <p 
        v-if="text" 
        class="text-sm text-gray-600 font-medium"
      >
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

interface Props {
  visible?: boolean
  text?: string
  size?: number
}

withDefaults(defineProps<Props>(), {
  visible: false,
  text: '',
  size: 24
})
</script>

<style scoped>
.loading-overlay {
  border-radius: inherit;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>