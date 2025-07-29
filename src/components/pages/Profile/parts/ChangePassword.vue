<template>
  <div class="change-password-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="max-w-md">
      <el-form-item label="当前密码" prop="oldPassword">
        <el-input 
          v-model="form.oldPassword" 
          type="password" 
          placeholder="请输入当前密码" 
          show-password
          :prefix-icon="Lock"
        />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input 
          v-model="form.newPassword" 
          type="password" 
          placeholder="请输入新密码" 
          show-password
          :prefix-icon="Lock"
        />
      </el-form-item>

      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="请再次输入新密码" 
          show-password
          :prefix-icon="Lock"
        />
      </el-form-item>

      <div class="flex justify-end space-x-3 mt-6">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          修改密码
        </el-button>
      </div>
    </el-form>

    <!-- 密码强度提示 -->
    <div class="mt-4 p-4 bg-blue-50 rounded-lg">
      <h4 class="text-sm font-medium text-blue-800 mb-2">密码要求：</h4>
      <ul class="text-sm text-blue-600 space-y-1">
        <li>• 长度至少8位</li>
        <li>• 包含大写字母、小写字母和数字</li>
        <li>• 可包含特殊字符以增强安全性</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { changePassword } from '@/api'
import { useCommonStore } from '@/store'

const store = useCommonStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入新密码'))
    return
  }
  
  if (value.length < 8) {
    callback(new Error('密码长度不能少于8位'))
    return
  }
  
  // 检查是否包含大写字母、小写字母和数字
  const hasUpperCase = /[A-Z]/.test(value)
  const hasLowerCase = /[a-z]/.test(value)
  const hasNumber = /\d/.test(value)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    callback(new Error('密码必须包含大写字母、小写字母和数字'))
    return
  }
  
  callback()
}

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请确认新密码'))
    return
  }
  
  if (value !== form.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  
  callback()
}

const rules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const response = await changePassword(
      store.username,
      form.value.oldPassword,
      form.value.newPassword
    )

    if (response.data.code === 0) {
      ElMessage.success(response.data.message || '密码修改成功，请重新登录')
      resetForm()
      
      // 可以选择自动跳转到登录页面
      setTimeout(() => {
        // 清除登录状态
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        // 跳转到登录页面
        window.location.href = '/login'
      }, 2000)
    } else {
      ElMessage.error(response.data.message || '密码修改失败')
    }
  } catch (error: any) {
    console.error('Change password error:', error)
    
    // 处理具体的错误类型
    if (error.response?.status === 400) {
      const errorData = error.response.data
      if (errorData.message) {
        ElMessage.error(errorData.message)
      } else if (errorData.detail) {
        ElMessage.error(errorData.detail)
      } else {
        ElMessage.error('请求参数错误')
      }
    } else if (error.response?.status === 401) {
      ElMessage.error('当前密码错误')
    } else if (error.response?.status === 422) {
      ElMessage.error('新密码不符合安全要求')
    } else if (error.code === 'UNAUTHORIZED') {
      ElMessage.error('当前密码错误')
    } else if (error.code === 'VALIDATION_ERROR') {
      ElMessage.error('新密码不符合设置条件')
    } else {
      ElMessage.error(error.message || '密码修改失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.change-password-form {
  @apply space-y-4;
}

:deep(.el-form-item__label) {
  @apply text-gray-700 font-medium;
}

:deep(.el-input__wrapper) {
  @apply rounded-lg border-gray-200 transition-all duration-200;
}

:deep(.el-input__wrapper:hover) {
  @apply border-blue-300;
}

:deep(.el-input__wrapper.is-focus) {
  @apply border-blue-500 shadow-sm;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.el-button--primary) {
  @apply rounded-lg;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
</style>