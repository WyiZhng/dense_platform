<template>
  <div class="home-page">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-card mb-6" shadow="never">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            欢迎使用龋齿检测平台
          </h1>
          <p class="welcome-subtitle">
            基于人工智能的专业口腔健康诊断系统，为您的口腔健康保驾护航
          </p>
          <div class="welcome-actions">
            <el-button type="primary" size="large" @click="router.push('/user/check')">
              <el-icon class="mr-2"><Camera /></el-icon>
              开始检测
            </el-button>
            <el-button size="large" @click="router.push('/user/history')">
              <el-icon class="mr-2"><Document /></el-icon>
              查看历史
            </el-button>
          </div>
        </div>
        <div class="welcome-illustration">
          <div class="illustration-bg">
            <el-icon size="120" class="text-blue-200">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </el-icon>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 统计数据 -->
    <el-row :gutter="24" class="mb-6">
      <el-col :xs="24" :sm="8" :md="8">
        <el-card class="stat-card" shadow="hover">
          <el-statistic
            title="总检测次数"
            :value="158"
            :precision="0"
          >
            <template #prefix>
              <el-icon class="text-blue-500">
                <DataLine />
              </el-icon>
            </template>
            <template #suffix>
              <span class="text-sm text-green-500 ml-2">+15%</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="8" :md="8">
        <el-card class="stat-card" shadow="hover">
          <el-statistic
            title="诊断准确率"
            :value="92.5"
            suffix="%"
            :precision="1"
          >
            <template #prefix>
              <el-icon class="text-green-500">
                <TrendCharts />
              </el-icon>
            </template>
            <template #suffix>
              <span class="text-sm text-green-500 ml-2">+5%</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="8" :md="8">
        <el-card class="stat-card" shadow="hover">
          <el-statistic
            title="本月新增"
            :value="25"
            :precision="0"
          >
            <template #prefix>
              <el-icon class="text-purple-500">
                <User />
              </el-icon>
            </template>
            <template #suffix>
              <span class="text-sm text-green-500 ml-2">+25%</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要内容区域 -->
    <el-row :gutter="24">
      <!-- 检测历史 -->
      <el-col :xs="24" :lg="16">
        <el-card class="history-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="flex items-center">
                <el-icon class="text-blue-500 mr-2">
                  <Histogram />
                </el-icon>
                <span class="text-lg font-medium">最近检测记录</span>
              </div>
              <el-button type="primary" text @click="router.push('/user/history')">
                查看全部
                <el-icon class="ml-1"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <HistoryList :filter-visible="false" />
        </el-card>
      </el-col>

      <!-- 功能特色 -->
      <el-col :xs="24" :lg="8">
        <div class="feature-section">
          <el-card 
            v-for="(feature, index) in features" 
            :key="index"
            class="feature-card mb-4"
            shadow="hover"
          >
            <div class="feature-content">
              <div class="feature-icon">
                <el-icon :size="32" :class="feature.iconClass">
                  <component :is="feature.icon" />
                </el-icon>
              </div>
              <div class="feature-text">
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
              </div>
            </div>
          </el-card>

          <!-- 快速操作 -->
          <el-card class="quick-actions-card" shadow="hover">
            <template #header>
              <span class="text-lg font-medium">快速操作</span>
            </template>
            <div class="quick-actions">
              <el-button 
                type="primary" 
                class="action-btn"
                @click="router.push('/user/check')"
              >
                <el-icon><Camera /></el-icon>
                <span>开始检测</span>
              </el-button>
              <el-button 
                class="action-btn"
                @click="router.push('/user/personal')"
              >
                <el-icon><User /></el-icon>
                <span>个人中心</span>
              </el-button>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { 
  User, DataLine, Histogram, ArrowRight, Camera, Document, 
  TrendCharts, Monitor, ChatDotRound 
} from '@element-plus/icons-vue'
import HistoryList from '@/components/pages/CariesHistory/parts/HistoryList.vue'

const router = useRouter()

const features = [
  {
    title: '智能检测',
    description: '先进的AI技术，秒级完成口腔健康分析，让您快速了解自己的口腔状况。',
    icon: Monitor,
    iconClass: 'text-blue-500'
  },
  {
    title: '专业报告',
    description: '生成专业的检测报告，包含详细的问题分析和个性化建议。',
    icon: Document,
    iconClass: 'text-green-500'
  },
  {
    title: '专家问诊',
    description: '连接专业医生资源，提供在线问诊服务，为您的口腔健康保驾护航。',
    icon: ChatDotRound,
    iconClass: 'text-purple-500'
  }
]
</script>

<style scoped>
.home-page {
  @apply min-h-screen;
}

/* 欢迎卡片样式 */
.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16px;
  overflow: hidden;
}

.welcome-card :deep(.el-card__body) {
  padding: 0;
}

.welcome-content {
  @apply flex items-center justify-between p-8;
  min-height: 200px;
}

.welcome-text {
  @apply flex-1 text-white;
}

.welcome-title {
  @apply text-3xl font-bold mb-4;
  background: linear-gradient(45deg, #ffffff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  @apply text-blue-100 text-lg mb-6 leading-relaxed;
}

.welcome-actions {
  @apply flex space-x-4;
}

.welcome-actions .el-button {
  @apply px-6 py-3 rounded-xl font-medium;
}

.welcome-illustration {
  @apply hidden md:block flex-shrink-0 ml-8;
}

.illustration-bg {
  @apply w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm;
}

/* 统计卡片样式 */
.stat-card {
  @apply transition-all duration-300 hover:shadow-lg;
  border-radius: 12px;
}

.stat-card :deep(.el-statistic__head) {
  @apply text-gray-600 font-medium mb-2;
}

.stat-card :deep(.el-statistic__content) {
  @apply flex items-center;
}

.stat-card :deep(.el-statistic__number) {
  @apply text-2xl font-bold text-gray-800;
}

/* 历史记录卡片 */
.history-card {
  border-radius: 12px;
}

.card-header {
  @apply flex items-center justify-between;
}

/* 功能特色卡片 */
.feature-section {
  @apply space-y-4;
}

.feature-card {
  @apply transition-all duration-300 hover:shadow-lg;
  border-radius: 12px;
}

.feature-content {
  @apply flex items-start space-x-4 p-4;
}

.feature-icon {
  @apply flex-shrink-0 w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center;
}

.feature-text {
  @apply flex-1;
}

.feature-title {
  @apply text-lg font-semibold text-gray-800 mb-2;
}

.feature-description {
  @apply text-gray-600 text-sm leading-relaxed;
}

/* 快速操作卡片 */
.quick-actions-card {
  border-radius: 12px;
}

.quick-actions {
  @apply grid grid-cols-1 gap-3;
}

.action-btn {
  @apply w-full h-12 flex items-center justify-center space-x-2 rounded-xl;
}

.action-btn span {
  @apply font-medium;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .welcome-content {
    @apply flex-col text-center p-6;
  }
  
  .welcome-illustration {
    @apply block mt-6;
  }
  
  .welcome-actions {
    @apply flex-col space-x-0 space-y-3 w-full;
  }
  
  .welcome-actions .el-button {
    @apply w-full;
  }
}

@media (max-width: 640px) {
  .quick-actions {
    @apply grid-cols-1;
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-card) {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-card:hover) {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

:deep(.el-table) {
  @apply rounded-lg overflow-hidden;
}

:deep(.el-table th) {
  @apply bg-gray-50 text-gray-700 font-semibold;
}

:deep(.el-table--striped .el-table__row--striped td) {
  @apply bg-gray-50;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #2563eb 0%, #5b21b6 100%);
  transform: translateY(-1px);
}
</style>
