<template>
  <div class="h-screen bg-gray-50">
    <el-container class="h-full">
      <!-- 头部区域 -->
      <el-header class="p-0 border-b bg-white">
        <Header :name="store.username" :login></Header>
      </el-header>
      
      <el-container class="h-[calc(100vh-64px)]">
        <!-- 侧边栏 -->
        <el-aside width="250px" class="border-r bg-white">
          <el-menu 
            :router="true" 
            ref="menu" 
            :default-active="route.path" 
            class="h-full border-0"
          >
            <el-menu-item index="/user/home" class="menu-item">
              <el-icon><House /></el-icon>
              <span>主页</span>
            </el-menu-item>
            
            <el-menu-item index="/user/personal" class="menu-item">
              <el-icon><User /></el-icon>
              <span>个人信息</span>
            </el-menu-item>
            
            <el-sub-menu index="3" class="menu-sub">
              <template #title>
                <el-icon><Notification /></el-icon>
                <span>检测管理</span>
              </template>
              <el-menu-item index="/user/check">
                <el-icon><PieChart /></el-icon>
                <span>龋齿检测</span>
              </el-menu-item>
              <el-menu-item index="/user/history">
                <el-icon><Clock /></el-icon>
                <span>历史记录</span>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>

        <!-- 主要内容区域 -->
        <el-main class="p-6 bg-gray-50">
          <RouterView></RouterView>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import Header from './components/parts/Header.vue';
import {House, User, Notification, PieChart, Clock} from '@element-plus/icons-vue';
import {ref, inject} from 'vue';
import {type VueCookies} from 'vue-cookies';
import {useRoute, useRouter} from 'vue-router';
import {getUserInfo, getUserSimpleInfo} from './api';
import {ElMessage} from 'element-plus';
import {ElMenu} from "element-plus";
import {useCommonStore} from "@/store";
const route = useRoute();
const router = useRouter();
const name = ref("")
const login = ref(false)
const $cookies = inject<VueCookies>('$cookies');
$cookies?.config(Date.now() + 7,"/","localhost")
const menu = ref(null);
const store = useCommonStore();

store.menu = menu;

if ($cookies?.isKey("token")) {
  login.value = true;
  const token:string = $cookies.get("token");
  getUserInfo(token).then(x=>{
    if(x.data.code != "0" && x.data.code != "33") {
      ElMessage.error("获取用户信息失败")
      return;
    }
    store.detail = x.data.form
  }).catch((reason)=>{
    ElMessage.error(reason);
  });
  getUserSimpleInfo(token).then(x=>{
    if(x.data.code != "0" && x.data.code != "33") {
      ElMessage.error("获取用户信息失败")
      return;
    }
    store.username = x.data.user.id;
    store.usertype = x.data.user.type;
  }).catch((reason)=>{
    ElMessage.error(reason);
  });

}
router.replace("/user/home");
</script>

<style scoped>
.menu-item {
  @apply hover:bg-gray-50;
}

.menu-sub :deep(.el-sub-menu__title) {
  @apply hover:bg-gray-50;
}

/* 自定义滚动条样式 */
.el-main {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #CBD5E0 #EDF2F7;
}

.el-main::-webkit-scrollbar {
  width: 6px;
}

.el-main::-webkit-scrollbar-track {
  background: #EDF2F7;
}

.el-main::-webkit-scrollbar-thumb {
  background-color: #CBD5E0;
  border-radius: 3px;
}
</style>