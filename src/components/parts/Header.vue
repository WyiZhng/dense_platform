<template>
  <div class="bg-white border-b shadow-sm">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo和标题区域 -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center hover:opacity-90 transition-opacity cursor-pointer">
            <el-icon size="32" class="text-blue-500">
              <logo />
            </el-icon>
            <span class="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              龋齿检测平台
            </span>
          </div>
        </div>

        <!-- 右侧功能区 -->
        <div class="flex items-center space-x-8">
          <!-- 功能按钮组 -->
          <div class="flex items-center space-x-1">
            <el-tooltip content="全屏显示" placement="bottom">
              <el-button class="btn-icon" :icon="FullScreen" text>
                <el-icon><FullScreen /></el-icon>
              </el-button>
            </el-tooltip>
            
            <el-tooltip content="切换主题" placement="bottom">
              <el-button class="btn-icon" text>
                <el-icon><Sunny /></el-icon>
              </el-button>
            </el-tooltip>
            
            <el-tooltip content="消息通知" placement="bottom">
              <el-button class="btn-icon relative" text>
                <el-icon><Bell /></el-icon>
                <span v-if="unreadCount" class="notification-badge">
                  {{ unreadCount }}
                </span>
              </el-button>
            </el-tooltip>
          </div>

          <!-- 分割线 -->
          <div class="h-8 w-px bg-gray-200"></div>

          <!-- 用户信息区域 -->
          <div 
            @click="!login ? userLogin() : undefined" 
            class="flex items-center space-x-3 cursor-pointer group"
          >
            <el-avatar 
              :size="32" 
              :src="src"
              class="border-2 border-gray-100 group-hover:border-blue-100 transition-colors"
            />
            <div class="flex items-center">
              <span class="text-gray-700 font-medium">
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
import { ArrowDown, Bell, FullScreen, Sunny, CaretBottom, User, SwitchButton } from '@element-plus/icons-vue';
import { inject, ref } from 'vue';
import logo from '../icon/logo.vue';
import Login from '../pages/AccountAccess/index.vue';
import type { VueCookies } from 'vue-cookies';
import { getAvatar } from '@/api';
import { useCommonStore } from "@/store";
import { UserType } from "@/common";
import { useRoute, useRouter } from 'vue-router'

const $cookies = inject<VueCookies>('$cookies');
const showDialogVariable = ref(false);
const src = ref<string>();
const store = useCommonStore();
const route = useRoute()
const router = useRouter()

export interface HeaderProps {
  name: string,
  login?: boolean
}



const props = withDefaults(defineProps<HeaderProps>(), {
  name: "",
  login: false,
});



if($cookies?.isKey("token")){
  getAvatar($cookies.get("token")).then(x => {
    const blob = x.data;
    const imageUrl = URL.createObjectURL(blob);
    src.value = imageUrl;
  })
}

function userLogin() {
  showDialog();
}

function showDialog() {
  showDialogVariable.value = true;
}

function logout(){
  if($cookies?.isKey("token")){
    $cookies.remove("token","/");
  }
  store.username = "";
  store.usertype = UserType.Patient;
  store.menu = undefined
  store.detail = {
    name: "",
    sex: "",
    birth: "",
    phone:"",
    email:"",
    password:"",
    address:""
  }
  window.location.reload();
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

