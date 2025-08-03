<template>
  <div class="bg-white border-b shadow-sm">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-10">
        <!-- Logo和标题区域 -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center hover:opacity-90 transition-opacity cursor-pointer" @click="goToHome">
            <el-icon :size="logoSize" class="text-blue-500">
              <logo />
            </el-icon>
            <span :class="[
              'ml-3 font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent',
              'hidden sm:block',
              titleClass
            ]">
              龋齿检测平台
            </span>
            <!-- 移动端简化标题 -->
            <span class="ml-2 sm:hidden text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              龋齿检测
            </span>
          </div>
        </div>

        <!-- 右侧功能区 -->
        <div class="flex items-center space-x-4 sm:space-x-8">
          <!-- 功能按钮组 - 桌面版 -->
          <div class="hidden md:flex items-center space-x-4">
            <!-- 可以在这里添加其他功能按钮 -->
          </div>

          <!-- 分割线 - 桌面版 -->
          <div class="hidden sm:block h-8 w-px bg-gray-200"></div>

          <!-- 用户信息区域 -->
          <div 
            @click="!login ? userLogin() : undefined" 
            class="flex items-center space-x-2 sm:space-x-3 cursor-pointer group"
          >
            <el-avatar 
              :size="avatarSize" 
              :src="src"
              class="border-2 border-gray-100 group-hover:border-blue-100 transition-colors"
            />
            <div class="flex items-center">
              <span :class="[
                'text-gray-700 font-medium truncate max-w-24 sm:max-w-none',
                nameClass
              ]">
                {{ login ? props.name : "未登录" }}
              </span>
              <el-dropdown trigger="click" v-if="login">
                <el-icon class="ml-1 text-gray-400 group-hover:text-gray-600 transition-colors">
                  <CaretBottom />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu class="user-dropdown">
                    <el-dropdown-item @click="router.push('/user/personal')">
                      <el-icon><User /></el-icon>
                      <span>个人中心</span>
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="logout">
                      <el-icon><SwitchButton /></el-icon>
                      <span>退出登录</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {CaretBottom, SwitchButton, User} from '@element-plus/icons-vue';
import {inject, ref, computed, onMounted} from 'vue';
import logo from '../icon/logo.vue';
import type {VueCookies} from 'vue-cookies';
import {getAvatar, logout as apiLogout} from '@/api';
import {useCommonStore} from "@/store";
import {UserType} from "@/common";
import {useRoute, useRouter} from 'vue-router'

const $cookies = inject<VueCookies>('$cookies');
const showDialogVariable = ref(false);
const src = ref<string>();
const store = useCommonStore();
const route = useRoute()
const router = useRouter()
const unreadCount = ref(0);

export interface HeaderProps {
  name: string,
  login?: boolean
}

const props = withDefaults(defineProps<HeaderProps>(), {
  name: "",
  login: false,
});

// Responsive sizing
const logoSize = computed(() => {
  return window.innerWidth < 640 ? 28 : 32
})

const avatarSize = computed(() => {
  return window.innerWidth < 640 ? 28 : 32
})

const titleClass = computed(() => {
  return window.innerWidth < 768 ? 'text-lg' : 'text-xl'
})

const nameClass = computed(() => {
  return window.innerWidth < 640 ? 'text-sm' : 'text-base'
})

// Load avatar when component mounts
onMounted(() => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  if (token) {
    getAvatar().then(x => {
      const blob = x.data;
      src.value = URL.createObjectURL(blob);
    }).catch(error => {
      console.warn('Failed to load avatar:', error);
    })
  }
})

function userLogin() {
  router.push('/login');
}

function goToHome() {
  router.push('/');
}

function showDialog() {
  showDialogVariable.value = true;
}

async function logout(){
  try {
    // Call API logout to invalidate session on server
    await apiLogout();
  } catch (error) {
    console.warn('Logout API call failed:', error);
  }
  
  // Clear all stored tokens
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
  
  // Clear legacy cookie if exists
  if($cookies?.isKey("token")){
    $cookies.remove("token","/");
  }
  
  // Clear store
  store.clearUserInfo();
  
  // Redirect to login page
  router.push('/login');
}
</script>

<style scoped>
.btn-icon {
  @apply h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors;
}

.notification-badge :deep(.el-badge__content) {
  @apply bg-red-500;
}

:deep(.el-dropdown-menu) {
  @apply min-w-[160px];
}

:deep(.el-dropdown-item) {
  @apply flex items-center space-x-2;
}

:deep(.el-dropdown-item .el-icon) {
  @apply mr-1;
}
</style>

