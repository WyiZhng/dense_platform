<template>
  <div class="w-full max-w-md">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">创建账号</h2>
    <p class="text-gray-500 mb-8">填写以下信息以注册新账号</p>

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

      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请确认密码"
          :prefix-icon="Lock"
          class="auth-input"
          show-password
        />
      </el-form-item>

      <el-form-item prop="userType">
        <el-select
          v-model="form.userType"
          placeholder="请选择用户类型"
          class="w-full auth-input"
        >
          <el-option label="患者" :value="0" />
          <el-option label="医生" :value="1" />
        </el-select>
      </el-form-item>

      <el-button
        type="primary"
        class="w-full h-12 text-base !mt-8"
        :loading="loading"
        @click="handleSubmit"
      >
        注册
      </el-button>

      <div class="text-center text-gray-500">
        已有账号？
        <el-button 
          type="text" 
          class="text-blue-500 hover:text-blue-600"
          @click="isLoginView = true"
        >
          立即登录
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { register } from '@/api'
import Sha256 from "crypto-js/sha256"
const isLoginView = inject('isLoginView') as any
const loading = ref(false)

const formRef = ref<FormInstance>()
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  userType: undefined as number | undefined
})

const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.value.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const res = await register(form.value.username, Sha256(form.value.password).toString(), form.value.userType!)
    if (res.data.code === '0') {
      ElMessage.success('注册成功')
      isLoginView.value = true
    } else {
      ElMessage.error(res.data.message || '注册失败')
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

:deep(.el-select__wrapper) {
  @apply bg-gray-50;
}
</style>