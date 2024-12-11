<template>
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 h-16">
      <div class="flex items-center justify-between h-full">
        <!-- Logo区域 -->
        <div class="flex items-center space-x-3">
          <el-icon size="32" class="text-blue-500">
            <logo />
          </el-icon>
          <h1 class="text-xl font-bold text-gray-800">龋齿检测平台</h1>
        </div>

        <!-- 右侧功能区 -->
        <div class="flex items-center space-x-6">
          <!-- 功能按钮组 -->
          <div class="flex items-center space-x-2">
            <el-tooltip content="全屏显示" placement="bottom">
              <el-button class="btn-icon" :icon="FullScreen" text />
            </el-tooltip>
            
            <el-tooltip content="切换主题" placement="bottom">
              <el-button class="btn-icon" :icon="Sunny" text />
            </el-tooltip>
            
            <el-tooltip content="消息通知" placement="bottom">
              <el-button class="btn-icon" :icon="Bell" text>
                <el-badge :value="3" class="notification-badge" />
              </el-button>
            </el-tooltip>
          </div>

          <!-- 用户信息 -->
          <div 
            @click="!login ? userLogin() : undefined" 
            class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg"
          >
            <el-avatar :size="32" :src="src" />
            <span class="text-gray-700">{{ login ? name : "未登录" }}</span>
            <el-dropdown trigger="click">
              <el-icon class="text-gray-400"><CaretBottom /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/user/personal')">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

