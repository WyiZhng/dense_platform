<template>
  <div class="w-full max-w-md">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">欢迎回来</h2>
    <p class="text-gray-500 mb-8">请登录您的账号以继续使用</p>

    <el-form 
      ref="formRef"
      :model="form"
      :rules="rules"
      class="space-y-6"
    >
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名"
          :prefix-icon="User"
          class="auth-input"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          class="auth-input"
          show-password
        />
      </el-form-item>

      <div class="flex items-center justify-between">
        <el-checkbox v-model="rememberMe">记住我</el-checkbox>
        <el-button 
          type="text" 
          class="text-blue-500 hover:text-blue-600"
        >
          忘记密码？
        </el-button>
      </div>

      <el-button
        type="primary"
        class="w-full h-12 text-base !mt-8"
        :loading="loading"
        @click="handleSubmit"
      >
        登录
      </el-button>

      <div class="text-center text-gray-500">
        还没有账号？
        <el-button 
          type="text" 
          class="text-blue-500 hover:text-blue-600"
          @click="isLoginView = false"
        >
          立即注册
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import type { VueCookies } from 'vue-cookies'
import { login } from '@/api'
import { useRouter } from 'vue-router'
import { useCommonStore } from '@/store'

const router = useRouter()
const store = useCommonStore()
const $cookies = inject<VueCookies>('$cookies')
const isLoginView = inject('isLoginView') as Ref<boolean>
const loading = ref(false)
const rememberMe = ref(false)

const formRef = ref<FormInstance>()
const form = ref({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const res = await login(form.value.username, form.value.password)
    if (res.data.code === '0') {
      ElMessage.success('登录成功')
      $cookies?.set('token', res.data.token)
      router.push('/user/home')
    } else {
      ElMessage.error(res.data.message || '登录失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-input {
  @apply h-12;
}

:deep(.el-input__wrapper) {
  @apply rounded-lg bg-gray-50 border-none;
}

:deep(.el-input__inner) {
  @apply h-12 text-base;
}

:deep(.el-input__prefix) {
  @apply text-gray-400;
}

:deep(.el-checkbox__label) {
  @apply text-gray-500;
}
</style>
