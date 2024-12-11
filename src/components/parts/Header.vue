<template>
  <div class="header-container bg-white border-b border-gray-200">
    <div class="flex justify-between items-center h-16 px-6">
      <!-- 左侧 Logo 和标题 -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
          <el-icon size="32" class="text-primary">
            <logo></logo>
          </el-icon>
          <h3 class="ml-3 text-xl font-semibold text-gray-800">龋齿检测平台</h3>
        </div>
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

        <!-- 用户信息区域 -->
        <div 
          @click="!login ? userLogin() : undefined" 
          class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
        >
          <el-avatar 
            :size="32" 
            :src="src"
            class="border-2 border-gray-200"
          />
          <span class="text-gray-700 font-medium">{{ login ? name : "未登录" }}</span>
          
          <el-dropdown trigger="click">
            <el-icon class="text-gray-400 hover:text-gray-600">
              <ArrowDown />
            </el-icon>
            
            <template #dropdown>
              <el-dropdown-menu v-if="login">
                <el-dropdown-item>
                  <i class="el-icon-user mr-2"></i>个人信息
                </el-dropdown-item>
                <el-dropdown-item>
                  <i class="el-icon-document mr-2"></i>我的报告
                </el-dropdown-item>
                <el-dropdown-item divided @click="logout()">
                  <i class="el-icon-switch-button mr-2"></i>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown, Bell, FullScreen, Sunny } from '@element-plus/icons-vue';
import { inject, ref } from 'vue';
import logo from '../icon/logo.vue';
import Login from '../pages/AccountAccess/index.vue';
import type { VueCookies } from 'vue-cookies';
import { getAvatar } from '@/api';
import { useCommonStore } from "@/store";
import { UserType } from "@/common";

const $cookies = inject<VueCookies>('$cookies');
const showDialogVariable = ref(false);
const src = ref<string>();
const store = useCommonStore();

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
.header-container {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-icon {
  @apply h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors;
}

.notification-badge :deep(.el-badge__content) {
  @apply bg-red-500;
}

.el-dropdown-menu {
  @apply min-w-[160px];
}

.el-dropdown-item i {
  @apply inline-block align-middle;
}

/* 头像加载动画 */
.el-avatar {
  transition: transform 0.3s ease;
}

.el-avatar:hover {
  transform: scale(1.05);
}
</style>

