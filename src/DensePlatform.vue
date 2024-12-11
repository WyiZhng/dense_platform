<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <div class="fixed top-0 left-0 right-0 z-50">
      <Header :name="store.username" :login />
      
      <!-- 主导航 -->
      <div class="bg-white border-b shadow-sm">
        <div class="max-w-7xl mx-auto px-4">
          <el-menu 
            :router="true" 
            mode="horizontal" 
            :default-active="route.path"
            class="border-0"
          >
            <el-menu-item index="/user/home" class="!px-6">
              <template #title>
                <div class="flex items-center space-x-2">
                  <el-icon><House /></el-icon>
                  <span>首页</span>
                </div>
              </template>
            </el-menu-item>

            <el-menu-item index="/user/check" class="!px-6">
              <template #title>
                <div class="flex items-center space-x-2">
                  <el-icon><Monitor /></el-icon>
                  <span>龋齿检测</span>
                </div>
              </template>
            </el-menu-item>

            <el-menu-item index="/user/history" class="!px-6">
              <template #title>
                <div class="flex items-center space-x-2">
                  <el-icon><Document /></el-icon>
                  <span>检测记录</span>
                </div>
              </template>
            </el-menu-item>

            <el-menu-item index="/user/personal" class="!px-6">
              <template #title>
                <div class="flex items-center space-x-2">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </div>
              </template>
            </el-menu-item>
          </el-menu>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="pt-32 pb-8 px-4">
      <div class="max-w-7xl mx-auto">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, Monitor, Document, User } from '@element-plus/icons-vue'
import { useCommonStore } from '@/store'
import Header from './components/parts/Header.vue'
import type { VueCookies } from 'vue-cookies'

const route = useRoute()
const router = useRouter()
const store = useCommonStore()
const $cookies = inject<VueCookies>('$cookies')

// ... 其他代码保持不变
</script>

<style scoped>
:deep(.el-menu--horizontal) {
  @apply flex justify-center;
}

:deep(.el-menu-item) {
  @apply h-12 leading-[48px] text-gray-600;
}

:deep(.el-menu-item.is-active) {
  @apply text-blue-500 font-medium;
}

:deep(.el-menu-item:hover) {
  @apply text-blue-500 bg-blue-50;
}

:deep(.el-menu-item .el-icon) {
  @apply text-lg;
}
</style>