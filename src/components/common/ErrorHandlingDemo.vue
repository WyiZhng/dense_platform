<template>
  <div class="error-handling-demo p-6 space-y-6">
    <h2 class="text-2xl font-bold text-gray-900">错误处理系统演示</h2>
    
    <!-- Error Display Examples -->
    <BaseCard title="错误显示组件示例">
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-medium mb-2">内联错误显示</h4>
          <ErrorDisplay
            type="inline"
            severity="error"
            title="验证失败"
            message="用户名或密码错误，请重新输入"
            :closable="true"
          />
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-2">卡片错误显示</h4>
          <ErrorDisplay
            type="card"
            severity="warning"
            title="网络连接问题"
            message="网络连接不稳定，部分功能可能受到影响"
            :show-details="true"
            :details="{ code: 'NETWORK_UNSTABLE', timestamp: new Date() }"
          >
            <template #actions>
              <el-button size="small" @click="handleRetry">重试</el-button>
            </template>
          </ErrorDisplay>
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-2">横幅错误显示</h4>
          <ErrorDisplay
            type="banner"
            severity="info"
            title="系统维护通知"
            message="系统将在今晚 22:00-24:00 进行维护，期间可能无法正常使用"
          />
        </div>
        
        <div>
          <h4 class="text-lg font-medium mb-2">列表错误显示</h4>
          <ErrorDisplay
            type="list"
            severity="error"
            :errors="[
              '用户名不能为空',
              '密码长度至少8位',
              '邮箱格式不正确'
            ]"
          />
        </div>
      </div>
    </BaseCard>

    <!-- Form Validation Demo -->
    <BaseCard title="表单验证演示">
      <BaseForm
        :model="formData"
        :rules="formRules"
        :loading="formLoading"
        :show-actions="true"
        :form-errors="formErrors"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
      >
        <FormField
          name="username"
          type="input"
          label="用户名"
          placeholder="请输入用户名"
          v-model="formData.username"
          :required="true"
          :errors="getFieldError('username')"
        />
        
        <FormField
          name="email"
          type="email"
          label="邮箱"
          placeholder="请输入邮箱地址"
          v-model="formData.email"
          :required="true"
          :errors="getFieldError('email')"
        />
        
        <FormField
          name="password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          v-model="formData.password"
          :required="true"
          :errors="getFieldError('password')"
          help-text="密码至少8位，包含字母和数字"
        />
        
        <FormField
          name="confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入密码"
          v-model="formData.confirmPassword"
          :required="true"
          :errors="getFieldError('confirmPassword')"
        />
      </BaseForm>
    </BaseCard>

    <!-- Error Trigger Demo -->
    <BaseCard title="错误触发演示">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <el-button @click="triggerNetworkError" type="danger">
          触发网络错误
        </el-button>
        
        <el-button @click="triggerValidationError" type="warning">
          触发验证错误
        </el-button>
        
        <el-button @click="triggerServerError" type="danger">
          触发服务器错误
        </el-button>
        
        <el-button @click="triggerAuthError" type="warning">
          触发认证错误
        </el-button>
        
        <el-button @click="triggerUnknownError" type="info">
          触发未知错误
        </el-button>
        
        <el-button @click="showSuccessMessage" type="success">
          显示成功消息
        </el-button>
      </div>
    </BaseCard>

    <!-- Toast Demo -->
    <BaseCard title="通知消息演示">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <el-button @click="showSuccessToast" type="success">
          成功通知
        </el-button>
        
        <el-button @click="showErrorToast" type="danger">
          错误通知
        </el-button>
        
        <el-button @click="showWarningToast" type="warning">
          警告通知
        </el-button>
        
        <el-button @click="showInfoToast" type="info">
          信息通知
        </el-button>
        
        <el-button @click="showLoadingToast" type="primary">
          加载通知
        </el-button>
        
        <el-button @click="showMultipleToasts" type="default">
          批量通知
        </el-button>
        
        <el-button @click="clearAllToasts" type="default">
          清除所有
        </el-button>
      </div>
    </BaseCard>

    <!-- Error History -->
    <BaseCard title="错误历史记录">
      <div class="space-y-2">
        <div v-if="errorHistory.length === 0" class="text-gray-500 text-center py-4">
          暂无错误记录
        </div>
        <div
          v-for="error in errorHistory"
          :key="error.timestamp.getTime()"
          class="p-3 bg-gray-50 rounded border-l-4 border-l-red-500"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="font-medium text-gray-900">{{ error.message }}</div>
              <div class="text-sm text-gray-600">{{ error.context }}</div>
              <div class="text-xs text-gray-500">
                {{ error.timestamp.toLocaleString() }}
              </div>
            </div>
            <el-tag :type="getErrorTagType(error.code)" size="small">
              {{ error.code }}
            </el-tag>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import BaseCard from './BaseCard.vue'
import BaseForm from './BaseForm.vue'
import FormField from './FormField.vue'
import ErrorDisplay from './ErrorDisplay.vue'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useFormValidation } from '@/composables/useFormValidation'
import { useGlobalToast } from '@/composables/useToast'

// Composables
const { handleError, showSuccess, getRecentErrors, handleValidationErrors, getFieldError } = useErrorHandler()
const toast = useGlobalToast()

// Form data
const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const formLoading = ref(false)
const formErrors = ref<string[]>([])

// Form validation
const formValidation = useFormValidation(formData)
const { formRules, validators } = formValidation

// Define validation rules
const validationConfig = {
  username: {
    rules: [
      validators.required('用户名不能为空'),
      validators.length(3, 20, '用户名长度应在3-20个字符之间'),
      validators.pattern(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
    ]
  },
  email: {
    rules: [
      validators.required('邮箱不能为空'),
      validators.email('请输入有效的邮箱地址')
    ]
  },
  password: {
    rules: [
      validators.required('密码不能为空'),
      validators.password('密码至少8位，包含字母和数字')
    ]
  },
  confirmPassword: {
    rules: [
      validators.required('确认密码不能为空'),
      validators.confirmPassword('password', '两次输入的密码不一致')
    ]
  }
}

// Error history
const errorHistory = computed(() => getRecentErrors(10))

// Methods
const handleFormSubmit = async (valid: boolean, model: any) => {
  if (!valid) {
    formErrors.value = ['表单验证失败，请检查输入内容']
    return
  }
  
  formLoading.value = true
  formErrors.value = []
  
  try {
    // Simulate API call
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.7) {
          reject(new Error('注册失败，用户名已存在'))
        } else {
          resolve('success')
        }
      }, 2000)
    })
    
    showSuccess('注册成功！')
    
    // Reset form
    Object.assign(formData, {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  } catch (error) {
    handleError(error, 'Form Submission')
  } finally {
    formLoading.value = false
  }
}

const handleFormCancel = () => {
  Object.assign(formData, {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  formErrors.value = []
}

// Error triggers
const triggerNetworkError = () => {
  handleError({
    code: 'NETWORK_ERROR',
    message: '网络连接失败，请检查网络设置',
    details: { url: '/api/test', method: 'GET' }
  }, 'Network Test')
}

const triggerValidationError = () => {
  handleValidationErrors([
    { field: 'username', message: '用户名不能为空' },
    { field: 'email', message: '邮箱格式不正确' }
  ])
}

const triggerServerError = () => {
  handleError({
    code: 'SERVER_ERROR',
    message: '服务器内部错误，请稍后重试',
    details: { status: 500, url: '/api/test' }
  }, 'Server Test')
}

const triggerAuthError = () => {
  handleError({
    code: 'UNAUTHORIZED',
    message: '登录已过期，请重新登录',
    details: { status: 401 }
  }, 'Auth Test')
}

const triggerUnknownError = () => {
  handleError(new Error('这是一个未知错误'), 'Unknown Test')
}

const showSuccessMessage = () => {
  showSuccess('操作成功完成！')
}

// Toast methods
const showSuccessToast = () => {
  toast.success('操作成功！', '成功')
}

const showErrorToast = () => {
  toast.error('操作失败，请重试', '错误')
}

const showWarningToast = () => {
  toast.warning('请注意检查输入内容', '警告')
}

const showInfoToast = () => {
  toast.info('这是一条信息提示', '信息')
}

const showLoadingToast = async () => {
  try {
    await toast.loading(
      new Promise(resolve => setTimeout(resolve, 3000)),
      {
        loading: '正在处理请求...',
        success: '请求处理完成',
        error: '请求处理失败'
      }
    )
  } catch (error) {
    console.error('Loading toast error:', error)
  }
}

const showMultipleToasts = () => {
  toast.showMultiple([
    { type: 'info', message: '开始处理任务 1' },
    { type: 'info', message: '开始处理任务 2' },
    { type: 'success', message: '任务 1 完成' },
    { type: 'success', message: '任务 2 完成' }
  ])
}

const clearAllToasts = () => {
  toast.clearAll()
}

const handleRetry = () => {
  console.log('Retry clicked')
}

const getErrorTagType = (code: string) => {
  if (code.includes('ERROR')) return 'danger'
  if (code.includes('WARNING')) return 'warning'
  if (code.includes('AUTH')) return 'warning'
  return 'info'
}
</script>

<style scoped>
.error-handling-demo {
  @apply max-w-6xl mx-auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .error-handling-demo {
    @apply px-4;
  }
  
  .grid {
    @apply grid-cols-1;
  }
}
</style>