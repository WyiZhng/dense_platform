<template>
  <div class="login-form">
    <!-- 欢迎标题 -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">欢迎回来</h2>
      <p class="text-gray-500">请登录您的账号以继续使用</p>
    </div>

    <!-- 登录表单 -->
    <el-form ref="formRef" :model="form" :rules="rules" size="large" class="login-form-content">
      <el-form-item prop="username" class="form-item-spacing">
        <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" class="form-input" />
      </el-form-item>

      <el-form-item prop="password" class="form-item-spacing">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" class="form-input"
          show-password />
      </el-form-item>

      <div class="flex items-center justify-between mb-6">
        <el-checkbox v-model="rememberMe">
          记住我
        </el-checkbox>
        <el-link type="primary" :underline="false" class="text-sm">
          忘记密码？
        </el-link>
      </div>

      <el-button type="primary" size="large" class="w-full login-button" :loading="loading" @click="handleSubmit">
        <span v-if="!loading">登录</span>
        <span v-else>登录中...</span>
      </el-button>

      <el-divider class="my-6">
        <span class="text-gray-400 text-sm">或</span>
      </el-divider>

      <div class="text-center">
        <span class="text-gray-500 text-sm">还没有账号？</span>
        <el-link type="primary" :underline="false" @click="isLoginView = false" class="ml-1">
          立即注册
        </el-link>
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
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // Use new API with enhanced authentication
    const res = await login(form.value.username, form.value.password, rememberMe.value)

    if (res.data.code === 0) {
      ElMessage.success('登录成功')

      // Store user info in store
      const userData = res.data.data || res.data
      store.username = userData.user_id || userData.username || form.value.username
      store.userId = userData.user_id || userData.id || ''
      store.usertype = userData.type !== undefined ? userData.type : userData.user_type || 0

      // Store roles and permissions if available
      if (userData.roles) {
        store.userRoles = userData.roles
      }
      if (userData.permissions) {
        store.userPermissions = userData.permissions
      }

      console.log('Login successful, user data:', {
        username: store.username,
        userId: store.userId,
        usertype: store.usertype,
        roles: store.userRoles
      })

      // Token is automatically stored by the API function
      // Navigate to appropriate home page based on user type
      // 优先判断用户名是否为admin
      if (form.value.username.toLowerCase() === 'admin') {
        console.log('Admin username detected, redirecting to admin dashboard')
        await router.push('/admin/dashboard')
      } else if (userData.is_admin || (store.userRoles && store.userRoles.some(role => role.name === 'admin'))) {
        console.log('Admin role detected, redirecting to admin dashboard')
        await router.push('/admin/dashboard')
      } else if (store.usertype === 1) { // Doctor
        console.log('Doctor type detected, redirecting to doctor dashboard')
        await router.push('/doctor/dashboard')
      } else { // Patient
        console.log('Patient type detected, redirecting to user home')
        await router.push('/user/home')
      }
    } else {
      ElMessage.error(res.data.message || '登录失败')
    }
  } catch (error: any) {
    console.error('Login error:', error)

    // Handle specific error types
    if (error.code === 'UNAUTHORIZED') {
      ElMessage.error('用户名或密码错误')
    } else if (error.response?.status === 401) {
      ElMessage.error('用户名或密码错误')
    } else if (error.response?.status === 403) {
      ElMessage.error('账号已被禁用')
    } else {
      ElMessage.error(error.message || '登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-form {
  @apply w-full;
}

.login-form-content {
  @apply space-y-6;
}

/* 增加表单项的上下间距，确保placeholder文字完全显示 */
.form-item-spacing {
  @apply my-4; /* 修改为上下相等的间距 */
}

.form-item-spacing :deep(.el-form-item__content) {
  @apply min-h-14;
}

.form-input :deep(.el-input__wrapper) {
  @apply h-12 rounded-xl border-gray-200 shadow-sm transition-all duration-200;
}

.form-input :deep(.el-input__wrapper:hover) {
  @apply border-blue-300 shadow-md;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  @apply border-blue-500 shadow-lg;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-input :deep(.el-input__inner) {
  @apply text-gray-700 placeholder-gray-400;
}

.form-input :deep(.el-input__prefix) {
  @apply text-gray-400;
}

.login-button {
  @apply h-12 rounded-xl font-medium text-base shadow-lg;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

:deep(.el-checkbox__label) {
  @apply text-gray-600 font-medium;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  @apply bg-blue-500 border-blue-500;
}

:deep(.el-link.el-link--primary) {
  @apply text-blue-500 font-medium;
}

:deep(.el-divider__text) {
  @apply bg-white px-4;
}

:deep(.el-form-item__error) {
  @apply text-red-500 text-sm mt-1 font-medium;
  transform: translateY(-6px); /* 将验证错误信息向上移动 */
}

/* 响应式调整 */
@media (max-width: 640px) {
  .login-form-content {
    @apply space-y-3;
  }

  .form-input :deep(.el-input__wrapper) {
    @apply h-11;
  }

  .login-button {
    @apply h-11 text-sm;
  }
}
</style>
