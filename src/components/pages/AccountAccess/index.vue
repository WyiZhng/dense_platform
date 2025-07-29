<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <el-container class="min-h-screen">
      <!-- 左侧品牌展示区域 -->
      <el-aside width="50%" class="hidden lg:flex">
        <div class="w-full bg-white/80 backdrop-blur-sm flex flex-col justify-center items-center p-12 relative overflow-hidden">
          <!-- 装饰性背景 -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div class="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"></div>
          <div class="absolute bottom-20 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"></div>
          
          <!-- 品牌Logo和插图 -->
          <div class="relative z-10 text-center">
            <div class="mb-8">
              <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <el-icon size="40" class="text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </el-icon>
              </div>
              
              <!-- 医疗插图 -->
              <div class="w-80 h-60 mx-auto mb-8 relative">
                <div class="absolute inset-0 bg-gradient-to-t from-blue-100/50 to-transparent rounded-3xl"></div>
                <img src="/src/assets/imgs/fg.png" alt="医疗图片" class="w-full h-full object-contain relative z-10" />
              </div>
            </div>
            
            <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              智能龋齿检测平台
            </h1>
            <p class="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
              基于人工智能的专业口腔健康诊断系统<br/>
              为您的口腔健康保驾护航
            </p>
            
            <!-- 特色功能展示 -->
            <div class="mt-8 grid grid-cols-3 gap-4 text-center">
              <div class="p-3 transform transition-transform hover:scale-110 duration-300">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <el-icon class="text-blue-600" size="20">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </el-icon>
                </div>
                <p class="text-sm text-gray-600">智能检测</p>
              </div>
              <div class="p-3 transform transition-transform hover:scale-110 duration-300">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <el-icon class="text-green-600" size="20">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </el-icon>
                </div>
                <p class="text-sm text-gray-600">快速诊断</p>
              </div>
              <div class="p-3 transform transition-transform hover:scale-110 duration-300">
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <el-icon class="text-purple-600" size="20">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </el-icon>
                </div>
                <p class="text-sm text-gray-600">专业可靠</p>
              </div>
            </div>
          </div>
        </div>
      </el-aside>

      <!-- 右侧登录表单区域 -->
      <el-main class="flex items-center justify-center p-0">
        <div class="w-full max-w-md p-8">
          <!-- 移动端品牌展示 -->
          <div class="lg:hidden text-center mb-8">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <el-icon size="28" class="text-white">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </el-icon>
            </div>
            <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              龋齿检测平台
            </h2>
          </div>

          <!-- 登录/注册表单卡片 -->
          <el-card class="login-card" shadow="hover">
            <Login v-if="isLoginView" />
            <Register v-else />
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { provide, ref, onMounted } from 'vue'
import Login from './parts/Login.vue'
import Register from './parts/Register.vue'

const isLoginView = ref(true)
provide('isLoginView', isLoginView)

// 添加页面加载动画效果
const pageLoaded = ref(false)
onMounted(() => {
  setTimeout(() => {
    pageLoaded.value = true
  }, 300)
})
</script>

<style scoped>
.login-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  /* 添加过渡动画 */
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-card__body) {
  padding: 32px;
}

/* 渐变文字效果 */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* 毛玻璃效果 */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .login-card {
    box-shadow: none;
    border: 1px solid #e5e7eb;
  }
}

/* 添加表单切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>    