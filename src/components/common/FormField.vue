<template>
  <el-form-item
    :prop="name"
    :label="label"
    :required="required"
    :error="fieldError"
    :class="formItemClass"
  >
    <!-- Input Field -->
    <el-input
      v-if="type === 'input' || type === 'password' || type === 'email'"
      v-model="modelValue"
      :type="inputType"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :clearable="clearable"
      :show-password="type === 'password'"
      :prefix-icon="prefixIcon"
      :suffix-icon="suffixIcon"
      :size="size"
      :maxlength="maxlength"
      :show-word-limit="showWordLimit"
      :class="inputClass"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <template v-if="$slots.prepend" #prepend>
        <slot name="prepend"></slot>
      </template>
      <template v-if="$slots.append" #append>
        <slot name="append"></slot>
      </template>
    </el-input>

    <!-- Textarea Field -->
    <el-input
      v-else-if="type === 'textarea'"
      v-model="modelValue"
      type="textarea"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :autosize="autosize"
      :maxlength="maxlength"
      :show-word-limit="showWordLimit"
      :resize="resize"
      :class="inputClass"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <!-- Number Field -->
    <el-input-number
      v-else-if="type === 'number'"
      v-model="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :min="min"
      :max="max"
      :step="step"
      :precision="precision"
      :size="size"
      :controls="controls"
      :controls-position="controlsPosition"
      :class="inputClass"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <!-- Select Field -->
    <el-select
      v-else-if="type === 'select'"
      v-model="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :multiple="multiple"
      :filterable="filterable"
      :size="size"
      :class="inputClass"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <el-option
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </el-select>

    <!-- Date Picker -->
    <el-date-picker
      v-else-if="type === 'date' || type === 'datetime'"
      v-model="modelValue"
      :type="type === 'datetime' ? 'datetime' : 'date'"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :size="size"
      :format="dateFormat"
      :value-format="dateValueFormat"
      :class="inputClass"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <!-- Switch -->
    <el-switch
      v-else-if="type === 'switch'"
      v-model="modelValue"
      :disabled="disabled"
      :size="size"
      :active-text="activeText"
      :inactive-text="inactiveText"
      :active-value="activeValue"
      :inactive-value="inactiveValue"
      @change="handleChange"
    />

    <!-- Radio Group -->
    <el-radio-group
      v-else-if="type === 'radio'"
      v-model="modelValue"
      :disabled="disabled"
      :size="size"
      @change="handleChange"
    >
      <el-radio
        v-for="option in options"
        :key="option.value"
        :label="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </el-radio>
    </el-radio-group>

    <!-- Checkbox Group -->
    <el-checkbox-group
      v-else-if="type === 'checkbox'"
      v-model="modelValue"
      :disabled="disabled"
      :size="size"
      @change="handleChange"
    >
      <el-checkbox
        v-for="option in options"
        :key="option.value"
        :label="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </el-checkbox>
    </el-checkbox-group>

    <!-- Single Checkbox -->
    <el-checkbox
      v-else-if="type === 'single-checkbox'"
      v-model="modelValue"
      :disabled="disabled"
      :size="size"
      @change="handleChange"
    >
      {{ checkboxLabel }}
    </el-checkbox>

    <!-- Slot for custom content -->
    <slot v-else></slot>

    <!-- Help text -->
    <template v-if="helpText" #default>
      <div class="text-xs text-gray-500 mt-1">
        {{ helpText }}
      </div>
    </template>

    <!-- Field errors -->
    <template v-if="showFieldErrors && fieldErrors.length > 0" #error>
      <div class="field-errors">
        <div
          v-for="(error, index) in fieldErrors"
          :key="index"
          class="text-red-500 text-xs mt-1"
        >
          {{ error }}
        </div>
      </div>
    </template>
  </el-form-item>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { FormInstance } from 'element-plus'

interface Option {
  label: string
  value: any
  disabled?: boolean
}

interface Props {
  // Basic props
  name: string
  type?: 'input' | 'password' | 'email' | 'textarea' | 'number' | 'select' | 'date' | 'datetime' | 'switch' | 'radio' | 'checkbox' | 'single-checkbox'
  modelValue?: any
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  size?: 'large' | 'default' | 'small'
  
  // Input specific
  clearable?: boolean
  prefixIcon?: any
  suffixIcon?: any
  maxlength?: number
  showWordLimit?: boolean
  
  // Textarea specific
  rows?: number
  autosize?: boolean | { minRows?: number; maxRows?: number }
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  
  // Number specific
  min?: number
  max?: number
  step?: number
  precision?: number
  controls?: boolean
  controlsPosition?: 'right' | ''
  
  // Select specific
  options?: Option[]
  multiple?: boolean
  filterable?: boolean
  
  // Date specific
  dateFormat?: string
  dateValueFormat?: string
  
  // Switch specific
  activeText?: string
  inactiveText?: string
  activeValue?: any
  inactiveValue?: any
  
  // Checkbox specific
  checkboxLabel?: string
  
  // Validation
  errors?: string[]
  showFieldErrors?: boolean
  
  // Help text
  helpText?: string
  
  // Styling
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'input',
  required: false,
  disabled: false,
  readonly: false,
  size: 'default',
  clearable: true,
  showWordLimit: false,
  rows: 3,
  autosize: false,
  resize: 'vertical',
  controls: true,
  controlsPosition: 'right',
  multiple: false,
  filterable: false,
  dateFormat: 'YYYY-MM-DD',
  dateValueFormat: 'YYYY-MM-DD',
  activeValue: true,
  inactiveValue: false,
  showFieldErrors: true,
  errors: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  input: [value: any]
  change: [value: any]
  blur: [event: Event]
  focus: [event: Event]
}>()

// Try to get form instance from parent
const formInstance = inject<FormInstance | null>('elForm', null)

// Computed properties
const inputType = computed(() => {
  if (props.type === 'password') return 'password'
  if (props.type === 'email') return 'email'
  return 'text'
})

const fieldError = computed(() => {
  if (props.errors && props.errors.length > 0) {
    return props.errors[0]
  }
  return undefined
})

const fieldErrors = computed(() => props.errors || [])

const formItemClass = computed(() => [
  'form-field',
  `form-field--${props.type}`,
  props.class,
  {
    'form-field--error': fieldErrors.value.length > 0,
    'form-field--required': props.required,
    'form-field--disabled': props.disabled
  }
])

const inputClass = computed(() => [
  'form-field__input',
  {
    'form-field__input--error': fieldErrors.value.length > 0
  }
])

// Event handlers
const handleInput = (value: any) => {
  emit('update:modelValue', value)
  emit('input', value)
}

const handleChange = (value: any) => {
  emit('update:modelValue', value)
  emit('change', value)
}

const handleBlur = (event: Event) => {
  emit('blur', event)
  
  // Trigger field validation if form instance is available
  if (formInstance && props.name) {
    formInstance.validateField(props.name)
  }
}

const handleFocus = (event: Event) => {
  emit('focus', event)
}
</script>

<style scoped>
.form-field {
  @apply w-full;
}

.form-field--error :deep(.el-input__wrapper) {
  @apply border-red-300 focus-within:border-red-500;
}

.form-field--error :deep(.el-input__wrapper:hover) {
  @apply border-red-400;
}

.form-field--error :deep(.el-textarea__inner) {
  @apply border-red-300 focus:border-red-500;
}

.form-field--error :deep(.el-select .el-input__wrapper) {
  @apply border-red-300 focus-within:border-red-500;
}

.form-field--required :deep(.el-form-item__label::before) {
  content: '*';
  @apply text-red-500 mr-1;
}

.form-field--disabled {
  @apply opacity-60;
}

.field-errors {
  @apply space-y-1;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .form-field :deep(.el-form-item__label) {
    @apply text-sm;
  }
  
  .form-field :deep(.el-input) {
    @apply text-sm;
  }
  
  .form-field :deep(.el-select) {
    @apply text-sm;
  }
}
</style>