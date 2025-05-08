<template>
  <div class="space-y-8">
    <!-- 欢迎区域 -->
    <div class="welcome-banner">
      <div class="max-w-4xl mx-auto px-8 py-12">
        <h1 class="text-3xl font-bold text-white mb-4">
          欢迎使用龋齿检测平台
        </h1>
        <p class="text-blue-100 text-lg max-w-2xl">
          专业的口腔健康智能诊断系统，让您的口腔健康有保障
        </p>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="grid grid-cols-3 gap-6 px-8">
      <DataCard 
        title="总用户数量" 
        :num="25" 
        percent="+25%" 
        trend="up"
        subtitle="较上月增长"
      >
        <template #icon>
          <User class="text-blue-500 text-2xl" />
        </template>
      </DataCard>

      <DataCard 
        title="本月检测量" 
        :num="158" 
        percent="+15%" 
        trend="up"
        subtitle="检测数量增长"
      >
        <template #icon>
          <Edit class="text-green-500 text-2xl" />
        </template>
      </DataCard>

      <DataCard 
        title="诊断准确率" 
        :num="92" 
        unit="%" 
        percent="+5%" 
        trend="up"
        subtitle="准确率提升"
      >
        <template #icon>
          <el-icon class="text-purple-500 text-2xl">
            <DataLine />
          </el-icon>
        </template>
      </DataCard>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-3 gap-6 px-8">
      <!-- 左侧历史记录 -->
      <div class="col-span-2 bg-white rounded-xl shadow-sm">
        <div class="p-6 border-b">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <el-icon class="text-blue-500 text-xl"><Histogram /></el-icon>
              <h2 class="text-lg font-medium">检测历史</h2>
            </div>
            <el-button 
              type="primary" 
              text 
              class="text-blue-500"
              @click="router.push('/user/history')"
            >
              查看全部
              <el-icon class="ml-1"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="p-4">
          <HistoryList :filter-visible="false" />
        </div>
      </div>

      <!-- 右侧功能卡片 -->
      <div class="space-y-6">
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          class="feature-card"
        >
          <video 
            class="w-full h-40 object-cover rounded-t-xl" 
            :src="feature.video"
            autoplay 
            muted 
            loop
          />
          <div class="p-6">
            <h3 class="text-lg font-medium mb-2">{{ feature.title }}</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { User, Edit, DataLine, Histogram, ArrowRight } from '@element-plus/icons-vue'
import DataCard from './parts/DataCard.vue'
import HistoryList from '@/components/pages/CariesHistory/parts/HistoryList.vue'


const router = useRouter()

const features = [
  {
    title: '智能检测 ⏱️',
    description: '先进的AI技术，秒级完成口腔健康分析，让您快速了解自己的口腔状况。',
    video: '/src/assets/data.mp4'
  },
  {
    title: '专业报告 📋',
    description: '生成专业的检测报告，包含详细的问题分析和个性化建议。',
    video: '/src/assets/信息2.mp4'
  },
  {
    title: '专家问诊 👨‍⚕️',
    description: '连接专业医生资源，提供在线问诊服务，为您的口腔健康保驾护航。',
    video: '/src/assets/分析.mp4'
  }
]


</script>

<style scoped>
.welcome-banner {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden;
}

.welcome-banner::before {
  content: '';
  @apply absolute inset-0 bg-white opacity-10 transform -skew-y-6 scale-150;
}

.feature-card {
  @apply bg-white rounded-xl shadow-sm overflow-hidden
         transition-transform duration-300 hover:-translate-y-1 hover:shadow-md;
}

/* 数据卡片动画 */
.data-card-enter-active {
  transition: all 0.3s ease-out;
}

.data-card-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* 历史记录表格样式 */
:deep(.el-table) {
  @apply rounded-lg overflow-hidden;
}

:deep(.el-table th) {
  @apply bg-gray-50;
}

:deep(.el-table--striped .el-table__row--striped td) {
  @apply bg-gray-50;
}
</style>
