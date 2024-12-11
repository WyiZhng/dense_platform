<template>
  <el-form
    :model="model"
    :rules="rules"
    :label-width="labelWidth"
    class="base-form"
  >
    <slot></slot>
  </el-form>
</template>

<script setup lang="ts">
defineProps({
  model: {
    type: Object,
    required: true
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  labelWidth: {
    type: String,
    default: '120px'
  }
})
</script>

<style scoped>
.base-form :deep(.el-form-item__label) {
  @apply text-gray-700 font-medium;
}

.base-form :deep(.el-input__inner) {
  @apply border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
}
</style> 