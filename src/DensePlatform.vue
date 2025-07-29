<template>
  <ErrorBoundary @error="handleGlobalError">
    <div class="min-h-screen bg-gray-50">
      <!-- 顶部导航栏 -->
      <div class="fixed top-0 left-0 right-0 z-50">
        <Header :name="store.username" :login="login"/>
        
        <!-- 主导航 - 桌面版 -->
      <div class="hidden md:block bg-white border-b shadow-sm">
        <div class="max-w-7xl mx-auto px-4">
          <el-menu 
            :router="true" 
            mode="horizontal" 
            :default-active="route.path"
            class="border-0"
          >
            <el-menu-item 
              v-for="item in currentMenuItems" 
              :key="item.path"
              :index="item.path" 
              class="!px-6"
            >
              <template #title>
                <div class="flex items-center space-x-2">
                  <el-icon><component :is="item.icon" /></el-icon>
                  <span>{{ item.label }}</span>
                </div>
              </template>
            </el-menu-item>
          </el-menu>
        </div>
      </div>

      <!-- 移动端底部导航 -->
      <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div class="flex">
          <router-link
            v-for="item in currentMobileMenuItems"
            :key="item.path"
            :to="item.path"
            class="flex-1 flex flex-col items-center py-2 px-1"
            :class="[
              route.path === item.path 
                ? 'text-blue-500 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-500'
            ]"
          >
            <el-icon :size="20" class="mb-1">
              <component :is="item.icon" />
            </el-icon>
            <span class="text-xs">{{ item.label }}</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <el-main 
      :class="[
        'transition-all duration-300',
        'pt-32 md:pt-32 pb-8 md:pb-8',
        // 移动端底部导航的额外间距
        'mb-16 md:mb-0'
      ]"
    >
      <div class="max-w-7xl mx-auto px-4">
        <div class="responsive-content">
          <RouterView />
        </div>
      </div>
    </el-main>

    <!-- 移动端菜单遮罩 -->
    <div 
      v-if="showMobileMenu"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      @click="showMobileMenu = false"
    />
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, Monitor, Document, User, Setting, DataAnalysis, UserFilled, ChatDotRound } from '@element-plus/icons-vue'
import { useCommonStore } from '@/store'
import { UserType } from '@/common'
import Header from './components/parts/Header.vue'
import ErrorBoundary from './components/common/ErrorBoundary.vue'
import type { VueCookies } from 'vue-cookies'
import { getCurrentUser } from './api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor'
import { useApiCache, cacheKeys, cacheOptions } from '@/composables/useApiCache'

const route = useRoute()
const router = useRouter()
const store = useCommonStore()
const $cookies = inject<VueCookies>('$cookies')
const login = computed(() => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  return !!token && !!store.username
})
const { handleError } = useGlobalErrorHandler()

// Performance monitoring
const { measureApiCall, getPerformanceReport } = usePerformanceMonitor()
const { cachedCall } = useApiCache()

// Mobile menu state
const showMobileMenu = ref(false)

// Global error handler
const handleGlobalError = (error: Error, instance: any, info: string) => {
  console.error('Global application error:', error, info)
  handleError(error, `Application Error: ${info}`)
}

// Menu items for different user types
const patientMenuItems = [
  {
    path: '/user/home',
    label: '首页',
    icon: House
  },
  {
    path: '/user/check',
    label: '龋齿检测',
    icon: Monitor
  },
  {
    path: '/user/history',
    label: '检测记录',
    icon: Document
  },
  {
    path: '/user/personal',
    label: '个人中心',
    icon: User
  }
]

const doctorMenuItems = [
  {
    path: '/doctor/dashboard',
    label: '工作台',
    icon: DataAnalysis
  },
  {
    path: '/doctor/reports',
    label: '报告管理',
    icon: Document
  },
  {
    path: '/doctor/collaboration',
    label: '协作诊断',
    icon: ChatDotRound
  },
  {
    path: '/doctor/profile',
    label: '医生资料',
    icon: UserFilled
  }
]

const adminMenuItems = [
  {
    path: '/admin/dashboard',
    label: '仪表板',
    icon: DataAnalysis
  },
  {
    path: '/admin/users',
    label: '用户管理',
    icon: UserFilled
  },
  {
    path: '/admin/roles',
    label: '角色管理',
    icon: Setting
  },
  {
    path: '/admin/audit',
    label: '审计日志',
    icon: Document
  }
]

// Mobile menu items (simplified for mobile)
const patientMobileMenuItems = [
  {
    path: '/user/home',
    label: '首页',
    icon: House
  },
  {
    path: '/user/check',
    label: '检测',
    icon: Monitor
  },
  {
    path: '/user/history',
    label: '记录',
    icon: Document
  },
  {
    path: '/user/personal',
    label: '我的',
    icon: User
  }
]

const doctorMobileMenuItems = [
  {
    path: '/doctor/dashboard',
    label: '工作台',
    icon: DataAnalysis
  },
  {
    path: '/doctor/reports',
    label: '报告',
    icon: Document
  },
  {
    path: '/doctor/collaboration',
    label: '协作',
    icon: ChatDotRound
  },
  {
    path: '/doctor/profile',
    label: '我的',
    icon: UserFilled
  }
]

const adminMobileMenuItems = [
  {
    path: '/admin/dashboard',
    label: '仪表板',
    icon: DataAnalysis
  },
  {
    path: '/admin/users',
    label: '用户',
    icon: UserFilled
  },
  {
    path: '/admin/roles',
    label: '角色',
    icon: Setting
  },
  {
    path: '/admin/audit',
    label: '日志',
    icon: Document
  }
]

// Computed properties for current menu items based on user type and route
const currentMenuItems = computed(() => {
  const path = route.path
  
  if (path.startsWith('/admin')) {
    return adminMenuItems
  } else if (path.startsWith('/doctor')) {
    return doctorMenuItems
  } else {
    return patientMenuItems
  }
})

const currentMobileMenuItems = computed(() => {
  const path = route.path
  
  if (path.startsWith('/admin')) {
    return adminMobileMenuItems
  } else if (path.startsWith('/doctor')) {
    return doctorMobileMenuItems
  } else {
    return patientMobileMenuItems
  }
})

// Load user info with caching and performance monitoring
onMounted(async () => {
  // Check if user is logged in by checking for stored token
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  
  if (token) {
    console.log('🔍 检测到token，尝试获取用户信息...')
    try {
      // Use new API to get current user info
      const userInfo = await measureApiCall(
        'getCurrentUser',
        () => cachedCall(
          cacheKeys.userInfo(token),
          () => getCurrentUser(),
          cacheOptions.standard
        )
      )
      
      console.log('📡 API响应:', userInfo)
      
      if (userInfo.data && (userInfo.data.code === 0 || userInfo.data.data)) {
        const userData = userInfo.data.data || userInfo.data
        store.username = userData.user_id || userData.username || userData.name || 'User'
        store.userId = userData.user_id || userData.id || ''
        store.usertype = userData.type !== undefined ? userData.type : userData.user_type !== undefined ? userData.user_type : UserType.Patient
        
        // Load user roles and permissions if available
        if (userData.roles) {
          store.userRoles = userData.roles
        }
        if (userData.permissions) {
          store.userPermissions = userData.permissions
        }
        
        console.log('User loaded:', {
          username: store.username,
          userId: store.userId,
          usertype: store.usertype,
          roles: store.userRoles,
          permissions: store.userPermissions
        })
      } else {
        console.warn('Invalid user data received:', userInfo.data)
        // Clear invalid token
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        store.clearUserInfo()
      }
    } catch (error) {
      console.error('Failed to load user information:', error)
      handleError(error as Error, 'Failed to load user information')
      // If token is invalid, clear it
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
      store.clearUserInfo()
      // Only redirect to login if we're not already on login/register page
      if (!route.path.includes('/login') && !route.path.includes('/register')) {
        router.push('/login')
      }
    }
  } else {
    // No token found, clear store
    store.clearUserInfo()
    // Only redirect to login if we're trying to access protected routes
    if (!route.path.includes('/login') && !route.path.includes('/register') && route.path !== '/') {
      router.push('/login')
    }
  }
  
  // Log performance report in development
  if (import.meta.env.DEV) {
    setTimeout(() => {
      const report = getPerformanceReport()
      console.log('Performance Report:', report)
    }, 2000)
  }
})
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

/* Responsive content styles */
.responsive-content {
  @apply w-full;
}

/* Mobile navigation styles */
.mobile-nav-item {
  @apply transition-all duration-200;
}

.mobile-nav-item:active {
  @apply scale-95;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .responsive-content {
    @apply px-2;
  }
}

@media (max-width: 480px) {
  .responsive-content {
    @apply px-1;
  }
}

/* Smooth transitions for layout changes */
@media (prefers-reduced-motion: no-preference) {
  .responsive-content {
    @apply transition-all duration-300;
  }
}
</style>