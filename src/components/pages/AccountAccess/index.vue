<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-4">
    <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      <!-- 左侧图片区域 -->
      <div class="hidden lg:flex flex-col items-center space-y-8">
        <img 
          src="@/assets/imgs/fg.png" 
          alt="Welcome" 
          class="max-h-[500px] object-contain"
        />
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-800 mb-4">
            智能龋齿检测平台
          </h1>
          <p class="text-gray-600 max-w-md">
            专业的口腔健康智能诊断系统，让您的口腔健康有保障
          </p>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="w-full max-w-md mx-auto">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <!-- Logo -->
          <div class="flex items-center justify-center mb-8">
            <el-icon size="48" class="text-blue-500">
              <logo />
            </el-icon>
            <h2 class="text-2xl font-bold text-gray-800 ml-4">
              龋齿检测平台
            </h2>
          </div>

          <!-- 登录/注册表单 -->
          <Login v-if="isLoginView" />
          <Register v-else />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import Logo from '@/components/icon/logo.vue'
import Login from './parts/Login.vue'
import Register from './parts/Register.vue'

const isLoginView = ref(true)
provide('isLoginView', isLoginView)
</script>