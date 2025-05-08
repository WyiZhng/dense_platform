<template>
  <div class="space-y-6">
    <!-- 页面标题区域 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <el-icon class="text-blue-500 text-2xl"><Document /></el-icon>
        <h1 class="text-2xl font-bold text-gray-800">检测历史</h1>
      </div>
      
      <el-button 
        type="primary" 
        @click="router.push('/user/check')"
        class="!flex items-center space-x-2"
      >
        <el-icon><Plus /></el-icon>
        <span>新建检测</span>
      </el-button>
    </div>

    <!-- 统计卡片区域 -->
    <div class="grid grid-cols-4 gap-4">
      <div 
        v-for="stat in statistics" 
        :key="stat.title"
        class="stat-card"
      >
        <div class="flex items-center space-x-3">
          <div :class="['stat-icon', stat.iconClass]">
            <el-icon>
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div>
            <div class="text-sm text-gray-500">{{ stat.title }}</div>
            <div class="text-2xl font-bold mt-1">{{ stat.value }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-6">
      <!-- 检测趋势图 -->
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <el-icon class="text-blue-500"><TrendCharts /></el-icon>
              <span class="font-medium">检测趋势</span>
            </div>
            <el-radio-group v-model="trendTimeRange" size="small">
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="year">全年</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="h-80">
          <TrendChart :data="trendData" />
        </div>
      </BaseCard>

      <!-- 状态分布图 -->
      <BaseCard>
        <template #header>
          <div class="flex items-center space-x-2">
            <el-icon class="text-blue-500"><PieChart /></el-icon>
            <span class="font-medium">状态分布</span>
          </div>
        </template>
        <div class="h-80">
          <StatusChart :data="statusData" />
        </div>
      </BaseCard>
    </div>
    <!-- 主要内容区域 -->
    <BaseCard>
      <RouterView></RouterView>
    </BaseCard>

    <!-- 图表区域 -->

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Document, Plus, TrendCharts, PieChart,
  Check, Warning, CircleClose, Loading
} from '@element-plus/icons-vue'
import HistoryList from './parts/HistoryList.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import TrendChart from './parts/TrendChart.vue'
import StatusChart from './parts/StatusChart.vue'

const router = useRouter()
const trendTimeRange = ref('month')

// 统计数据
const statistics = [
  {
    title: '总检测数',
    value: '1,286',
    icon: 'Document',
    iconClass: 'bg-blue-100 text-blue-600'
  },
  {
    title: '检测完成',
    value: '1,180',
    icon: 'Check',
    iconClass: 'bg-green-100 text-green-600'
  },
  {
    title: '异常检测',
    value: '86',
    icon: 'Warning',
    iconClass: 'bg-yellow-100 text-yellow-600'
  },
  {
    title: '检测中',
    value: '20',
    icon: 'Loading',
    iconClass: 'bg-purple-100 text-purple-600'
  }
]

// 趋势数据
const trendData = computed(() => {
  // 这里可以根据 trendTimeRange 返回不同的数据
  return {
    xAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
      {
        name: '检测数量',
        data: [30, 40, 35, 50, 49, 60, 70],
        type: 'line',
        smooth: true
      }
    ]
  }
})

// 状态分布数据
const statusData = {
  series: [
    {
      name: '检测状态',
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 1180, name: '检测完成' },
        { value: 86, name: '异常检测' },
        { value: 20, name: '检测中' }
      ]
    }
  ]
}
</script>

<style scoped>
.stat-card {
  @apply bg-white rounded-xl p-6 shadow-sm
         transition-all duration-300 hover:shadow-md;
}

.stat-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center text-xl;
}

/* 图表容器样式 */
:deep(.echarts) {
  width: 100%;
  height: 100%;
}

/* 按钮组样式 */
:deep(.el-radio-button__inner) {
  @apply px-4 py-1;
}
</style>