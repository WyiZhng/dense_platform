import { ref, reactive, computed, watch, readonly } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

// Validation rule types
export interface ValidationRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change' | 'submit'
  validator?: (rule: any, value: any, callback: any) => void
  min?: number
  max?: number
  pattern?: RegExp
  type?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email'
}

export interface FieldConfig {
  rules?: ValidationRule[]
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export interface FormConfig {
  [key: string]: FieldConfig
}

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  config: FormConfig = {}
) {
  // Form data and state
  const formData = reactive<T>({ ...initialData })
  const formRef = ref<FormInstance>()
  const isValidating = ref(false)
  const isSubmitting = ref(false)
  
  // Field states
  const fieldErrors = reactive<Record<string, string[]>>({})
  const fieldTouched = reactive<Record<string, boolean>>({})
  const fieldValidating = reactive<Record<string, boolean>>({})

  // Built-in validators
  const validators = {
    // Required field validator
    required: (message = '此字段为必填项') => ({
      required: true,
      message,
      trigger: 'blur'
    }),

    // Email validator
    email: (message = '请输入有效的邮箱地址') => ({
      type: 'email' as const,
      message,
      trigger: 'blur'
    }),

    // Phone number validator
    phone: (message = '请输入有效的手机号码') => ({
      pattern: /^1[3-9]\d{9}$/,
      message,
      trigger: 'blur'
    }),

    // Password strength validator
    password: (message = '密码至少8位，包含字母和数字') => ({
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback()
          return
        }
        if (value.length < 8) {
          callback(new Error('密码至少需要8位字符'))
          return
        }
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          callback(new Error('密码必须包含字母和数字'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }),

    // Confirm password validator
    confirmPassword: (passwordField: string, message = '两次输入的密码不一致') => ({
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback()
          return
        }
        if (value !== formData[passwordField]) {
          callback(new Error(message))
          return
        }
        callback()
      },
      trigger: 'blur'
    }),

    // Length validator
    length: (min: number, max?: number, message?: string) => ({
      min,
      max,
      message: message || (max ? `长度应在 ${min} 到 ${max} 个字符之间` : `长度至少 ${min} 个字符`),
      trigger: 'blur'
    }),

    // Number range validator
    range: (min: number, max: number, message?: string) => ({
      type: 'number' as const,
      min,
      max,
      message: message || `数值应在 ${min} 到 ${max} 之间`,
      trigger: 'blur'
    }),

    // Custom pattern validator
    pattern: (pattern: RegExp, message: string) => ({
      pattern,
      message,
      trigger: 'blur'
    }),

    // Custom validator
    custom: (validator: (value: any) => boolean | string, message: string) => ({
      validator: (rule: any, value: any, callback: any) => {
        const result = validator(value)
        if (result === true) {
          callback()
        } else if (typeof result === 'string') {
          callback(new Error(result))
        } else {
          callback(new Error(message))
        }
      },
      trigger: 'blur'
    }),

    // Async validator
    async: (validator: (value: any) => Promise<boolean | string>, message: string) => ({
      validator: async (rule: any, value: any, callback: any) => {
        try {
          const result = await validator(value)
          if (result === true) {
            callback()
          } else if (typeof result === 'string') {
            callback(new Error(result))
          } else {
            callback(new Error(message))
          }
        } catch (error) {
          callback(new Error(message))
        }
      },
      trigger: 'blur'
    })
  }

  // Generate form rules from config
  const formRules = computed<FormRules>(() => {
    const rules: FormRules = {}
    
    Object.keys(config).forEach(field => {
      const fieldConfig = config[field]
      if (fieldConfig.rules) {
        rules[field] = fieldConfig.rules
      } else if (fieldConfig.required) {
        rules[field] = [validators.required()]
      }
    })
    
    return rules
  })

  // Computed properties
  const isValid = computed(() => {
    return Object.keys(fieldErrors).every(field => 
      !fieldErrors[field] || fieldErrors[field].length === 0
    )
  })

  const hasErrors = computed(() => !isValid.value)

  const touchedFields = computed(() => 
    Object.keys(fieldTouched).filter(field => fieldTouched[field])
  )

  const errorCount = computed(() => 
    Object.values(fieldErrors).reduce((count, errors) => count + errors.length, 0)
  )

  // Watch for form data changes to clear errors
  watch(
    () => formData,
    (newData, oldData) => {
      Object.keys(newData).forEach(field => {
        if (newData[field] !== oldData?.[field] && fieldErrors[field]) {
          clearFieldError(field)
        }
      })
    },
    { deep: true }
  )

  // Validation methods
  const validateField = async (field: string): Promise<boolean> => {
    if (!formRef.value) return false
    
    fieldValidating[field] = true
    fieldTouched[field] = true
    
    try {
      await formRef.value.validateField(field)
      clearFieldError(field)
      return true
    } catch (error: any) {
      setFieldError(field, [error?.message || '验证失败'])
      return false
    } finally {
      fieldValidating[field] = false
    }
  }

  const validateForm = async (): Promise<boolean> => {
    if (!formRef.value) return false
    
    isValidating.value = true
    
    try {
      await formRef.value.validate()
      clearAllErrors()
      return true
    } catch (error) {
      // Mark all fields as touched
      Object.keys(formData).forEach(field => {
        fieldTouched[field] = true
      })
      return false
    } finally {
      isValidating.value = false
    }
  }

  const validateFields = async (fields: string[]): Promise<boolean> => {
    if (!formRef.value) return false
    
    const results = await Promise.allSettled(
      fields.map(field => validateField(field))
    )
    
    return results.every(result => 
      result.status === 'fulfilled' && result.value === true
    )
  }

  // Error management
  const setFieldError = (field: string, errors: string[]) => {
    fieldErrors[field] = errors
    fieldTouched[field] = true
  }

  const clearFieldError = (field: string) => {
    delete fieldErrors[field]
  }

  const clearAllErrors = () => {
    Object.keys(fieldErrors).forEach(field => {
      delete fieldErrors[field]
    })
  }

  const getFieldError = (field: string): string[] => {
    return fieldErrors[field] || []
  }

  const hasFieldError = (field: string): boolean => {
    return !!(fieldErrors[field] && fieldErrors[field].length > 0)
  }

  const getFirstFieldError = (field: string): string | null => {
    const errors = getFieldError(field)
    return errors.length > 0 ? errors[0] : null
  }

  // Form state management
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
    Object.assign(formData, initialData)
    clearAllErrors()
    Object.keys(fieldTouched).forEach(field => {
      fieldTouched[field] = false
    })
  }

  const clearValidation = () => {
    if (formRef.value) {
      formRef.value.clearValidate()
    }
    clearAllErrors()
  }

  const setFormData = (data: Partial<T>) => {
    Object.assign(formData, data)
  }

  const getFormData = (): T => {
    return { ...formData } as T
  }

  // Touch management
  const touchField = (field: string) => {
    fieldTouched[field] = true
  }

  const touchAllFields = () => {
    Object.keys(formData).forEach(field => {
      fieldTouched[field] = true
    })
  }

  const isFieldTouched = (field: string): boolean => {
    return fieldTouched[field] || false
  }

  // Submit handling
  const handleSubmit = async (
    submitFn: (data: T) => Promise<any>,
    options: {
      showSuccess?: boolean
      successMessage?: string
      onSuccess?: (result: any) => void
      onError?: (error: any) => void
    } = {}
  ) => {
    if (isSubmitting.value) return
    
    const isFormValid = await validateForm()
    if (!isFormValid) {
      touchAllFields()
      return
    }
    
    isSubmitting.value = true
    
    try {
      const result = await submitFn(getFormData())
      
      if (options.showSuccess !== false) {
        // Show success message (handled by error handler)
      }
      
      options.onSuccess?.(result)
      return result
    } catch (error) {
      options.onError?.(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    // Form data and refs
    formData,
    formRef,
    formRules,
    
    // State
    isValidating: readonly(isValidating),
    isSubmitting: readonly(isSubmitting),
    isValid,
    hasErrors,
    errorCount,
    touchedFields,
    
    // Validation methods
    validateField,
    validateForm,
    validateFields,
    
    // Error management
    fieldErrors: readonly(fieldErrors),
    setFieldError,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasFieldError,
    getFirstFieldError,
    
    // Form management
    resetForm,
    clearValidation,
    setFormData,
    getFormData,
    
    // Touch management
    fieldTouched: readonly(fieldTouched),
    touchField,
    touchAllFields,
    isFieldTouched,
    
    // Submit handling
    handleSubmit,
    
    // Validators
    validators
  }
}

// Common form configurations
export const commonFormConfigs = {
  // User registration form
  userRegistration: {
    username: {
      rules: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度应在 3 到 20 个字符之间', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
      ],
      label: '用户名',
      placeholder: '请输入用户名',
      required: true
    },
    password: {
      rules: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 8, message: '密码至少需要8位字符', trigger: 'blur' },
        { 
          validator: (rule: any, value: string, callback: any) => {
            if (!value) {
              callback()
              return
            }
            if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
              callback(new Error('密码必须包含字母和数字'))
              return
            }
            callback()
          },
          trigger: 'blur'
        }
      ],
      label: '密码',
      placeholder: '请输入密码',
      required: true
    },
    email: {
      rules: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
      ],
      label: '邮箱',
      placeholder: '请输入邮箱地址',
      required: true
    }
  },

  // User login form
  userLogin: {
    username: {
      rules: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      label: '用户名',
      placeholder: '请输入用户名',
      required: true
    },
    password: {
      rules: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ],
      label: '密码',
      placeholder: '请输入密码',
      required: true
    }
  }
}