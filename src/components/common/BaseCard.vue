<template>
  <el-card 
    :class="[
      'transition-all duration-300 hover:shadow-lg', 
      bordered ? 'border' : 'border-none'
    ]"
    :body-style="{ padding: padding }"
  >
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>
    <slot></slot>
  </el-card>
</template>

<script setup lang="ts">
defineProps({
  bordered: {
    type: Boolean,
    default: false
  },
  padding: {
    type: String,
    default: '20px'
  }
})
</script> 