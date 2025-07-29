<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :label-width="computedLabelWidth"
    :label-position="labelPosition"
    :class="[
      'base-form',
      responsive && 'responsive-form',
      loading && 'form-loading'
    ]"
    :disabled="loading"
  >
    <LoadingOverlay :visible="loading" :text="loadingText" />
    
    <!-- Form-level error display -->
    <ErrorDisplay
      v-if="showFormErrors && formErrors.length > 0"
      type="banner"
      severity="error"
      :title="errorTitle"
      :errors="formErrors"
      :closable="false"
      class="mb-4"
    />
    
    <slot></slot>
    
    <div v-if="showActions" class="form-actions">
      <slot name="actions">
        <div class="flex justify-end space-x-3">
          <el-button 
            v-if="showCancel"
            @click="handleCancel"
            :disabled="loading"
          >
            {{ cancelText }}
          </el-button>
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="loading"
          >
            {{ submitText }}
          </el-button>
        </div>
      </slot>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, computed, useSlots } from 'vue'
import type { FormInstance } from 'element-plus'
import LoadingOverlay from './LoadingOverlay.vue'
import ErrorDisplay from './ErrorDisplay.vue'
import { useErrorHandler } from '@/composables/useErrorHandler'

interface Props {
  model: Record<string, any>
  rules?: Record<string, any>
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  loading?: boolean
  loadingText?: string
  responsive?: boolean
  showActions?: boolean
  showCancel?: boolean
  submitText?: string
  cancelText?: string
  showFormErrors?: boolean
  formErrors?: string[]
  errorTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  rules: () => ({}),
  labelWidth: '120px',
  labelPosition: 'right',
  loading: false,
  loadingText: '提交中...',
  responsive: true,
  showActions: false,
  showCancel: true,
  submitText: '提交',
  cancelText: '取消',
  showFormErrors: true,
  formErrors: () => [],
  errorTitle: '表单验证失败'
})

const emit = defineEmits<{
  submit: [valid: boolean, model: Record<string, any>]
  cancel: []
  error: [error: any]
}>()

const slots = useSlots()
const formRef = ref<FormInstance>()
const { handleError } = useErrorHandler()

const computedLabelWidth = computed(() => {
  if (props.responsive && window.innerWidth < 768) {
    return props.labelPosition === 'top' ? 'auto' : '80px'
  }
  return props.labelWidth
})

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    emit('submit', valid, props.model)
  } catch (error) {
    // Handle validation errors
    if (error && typeof error === 'object') {
      const validationErrors = Object.values(error).flat() as string[]
      if (validationErrors.length > 0) {
        handleError({
          code: 'VALIDATION_ERROR',
          message: '表单验证失败，请检查输入内容',
          details: validationErrors
        }, 'Form Validation')
      }
    }
    emit('submit', false, props.model)
    emit('error', error)
  }
}

const handleCancel = () => {
  emit('cancel')
}

// Expose form methods
defineExpose({
  validate: () => formRef.value?.validate(),
  validateField: (field: string) => formRef.value?.validateField(field),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate()
})
</script>

<style scoped>
.base-form {
  @apply relative;
}

.base-form :deep(.el-form-item__label) {
  @apply text-gray-700 font-medium;
}

.base-form :deep(.el-input__wrapper) {
  @apply border-gray-300 focus-within:border-blue-500 focus-within:shadow-sm;
}

.base-form :deep(.el-input__wrapper:hover) {
  @apply border-gray-400;
}

.base-form :deep(.el-form-item__error) {
  @apply text-red-500 text-sm mt-1;
}

.form-actions {
  @apply mt-6 pt-4 border-t border-gray-100;
}

.form-loading {
  @apply pointer-events-none;
}

/* Responsive styles */
.responsive-form {
  @apply w-full;
}

@media (max-width: 768px) {
  .responsive-form :deep(.el-form-item) {
    margin-bottom: 1rem;
  }
  
  .responsive-form :deep(.el-form-item__label) {
    font-size: 0.875rem;
  }
  
  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-actions .flex {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .responsive-form :deep(.el-form-item) {
    margin-bottom: 0.75rem;
  }
  
  .responsive-form :deep(.el-form-item__label) {
    font-size: 0.75rem;
  }
}
</style> 