<template>
  <el-card 
    :class="[
      'transition-all duration-300 hover:shadow-lg',
      'rounded-xl overflow-hidden',
      bordered ? 'border border-gray-200' : 'border-none shadow-sm',
      loading ? 'relative' : '',
      hoverable ? 'hover:-translate-y-1 cursor-pointer' : '',
      responsive && 'responsive-card'
    ]"
    :body-style="computedBodyStyle"
  >
    <template v-if="$slots.header" #header>
      <div :class="['flex items-center justify-between', headerClass]">
        <slot name="header"></slot>
      </div>
    </template>
    
    <LoadingOverlay :visible="loading" :text="loadingText" />
    
    <slot></slot>
    
    <template v-if="$slots.footer" #footer>
      <div :class="['border-t border-gray-100 pt-4', footerClass]">
        <slot name="footer"></slot>
      </div>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LoadingOverlay from './LoadingOverlay.vue'

interface Props {
  bordered?: boolean
  padding?: string
  loading?: boolean
  loadingText?: string
  hoverable?: boolean
  responsive?: boolean
  headerClass?: string
  footerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  bordered: false,
  padding: '20px',
  loading: false,
  loadingText: '加载中...',
  hoverable: false,
  responsive: true,
  headerClass: '',
  footerClass: ''
})

const computedBodyStyle = computed(() => ({
  padding: props.padding,
  position: props.loading ? 'relative' : 'static'
}))
</script>

<style scoped>
.responsive-card {
  @apply w-full;
}

@media (max-width: 768px) {
  .responsive-card :deep(.el-card__body) {
    @apply p-4;
  }
  
  .responsive-card :deep(.el-card__header) {
    @apply p-4 pb-2;
  }
}

@media (max-width: 480px) {
  .responsive-card :deep(.el-card__body) {
    @apply p-3;
  }
  
  .responsive-card :deep(.el-card__header) {
    @apply p-3 pb-2;
  }
}
</style> 