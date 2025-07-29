<template>
  <div class="admin-dashboard">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">管理员仪表板</h1>
      <p class="text-gray-600 mt-1">系统概览和关键指标</p>
    </div>

    <!-- 系统概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">总用户数</p>
            <p class="text-2xl font-bold text-blue-600">{{ overview.users?.total || 0 }}</p>
          </div>
          <el-icon size="32" class="text-blue-500">
            <UserFilled />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          今日新增: {{ overview.users?.new_today || 0 }}
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">总报告数</p>
            <p class="text-2xl font-bold text-green-600">{{ overview.reports?.total || 0 }}</p>
          </div>
          <el-icon size="32" class="text-green-500">
            <Document />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          今日新增: {{ overview.reports?.new_today || 0 }}
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">待处理报告</p>
            <p class="text-2xl font-bold text-orange-600">{{ overview.reports?.pending || 0 }}</p>
          </div>
          <el-icon size="32" class="text-orange-500">
            <Clock />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          异常报告: {{ overview.reports?.abnormal || 0 }}
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">活跃会话</p>
            <p class="text-2xl font-bold text-purple-600">{{ overview.system?.active_sessions || 0 }}</p>
          </div>
          <el-icon size="32" class="text-purple-500">
            <Connection />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          在线用户
        </div>
      </BaseCard>
    </div>

    <!-- 图表和统计 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 用户注册趋势 -->
      <BaseCard>
        <template #header>
          <h3 class="text-lg font-semibold">用户注册趋势</h3>
        </template>
        <div class="h-64" ref="userChartRef"></div>
      </BaseCard>

      <!-- 报告状态分布 -->
      <BaseCard>
        <template #header>
          <h3 class="text-lg font-semibold">报告状态分布</h3>
        </template>
        <div class="h-64" ref="reportChartRef"></div>
      </BaseCard>
    </div>

    <!-- 系统健康状态 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">系统健康状态</h3>
            <el-tag 
              :type="healthStatusType" 
              size="small"
            >
              {{ healthStatusText }}
            </el-tag>
          </div>
        </template>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">数据库状态</span>
            <el-tag 
              :type="health.database_status === 'healthy' ? 'success' : 'danger'" 
              size="small"
            >
              {{ health.database_status === 'healthy' ? '正常' : '异常' }}
            </el-tag>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">过期会话</span>
            <span class="text-sm font-medium">{{ health.metrics?.expired_sessions || 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">积压报告</span>
            <span class="text-sm font-medium">{{ health.metrics?.stale_reports || 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">近期错误</span>
            <span class="text-sm font-medium">{{ health.metrics?.recent_errors || 0 }}</span>
          </div>
        </div>
        <div class="mt-4" v-if="health.issues && health.issues.length > 0">
          <h4 class="text-sm font-medium text-red-600 mb-2">需要关注的问题:</h4>
          <ul class="text-xs text-red-600 space-y-1">
            <li v-for="issue in health.issues" :key="issue">• {{ issue }}</li>
          </ul>
        </div>
      </BaseCard>

      <!-- 待处理报告 -->
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">待处理报告</h3>
            <router-link to="/admin/reports" class="text-blue-500 text-sm hover:underline">
              查看全部
            </router-link>
          </div>
        </template>
        <div class="space-y-3 max-h-64 overflow-y-auto">
          <div 
            v-for="report in pendingReports.slice(0, 5)" 
            :key="report.id"
            class="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div>
              <p class="text-sm font-medium">{{ report.patient_name }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(report.submit_time) }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-orange-600">{{ report.days_pending }}天</p>
              <p class="text-xs text-gray-500">{{ report.doctor_name }}</p>
            </div>
          </div>
          <div v-if="pendingReports.length === 0" class="text-center text-gray-500 py-4">
            暂无待处理报告
          </div>
        </div>
      </BaseCard>

      <!-- 最近活动 -->
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">最近活动</h3>
            <router-link to="/admin/audit" class="text-blue-500 text-sm hover:underline">
              查看全部
            </router-link>
          </div>
        </template>
        <div class="space-y-3 max-h-64 overflow-y-auto">
          <div 
            v-for="activity in recentActivities.slice(0, 8)" 
            :key="activity.id"
            class="flex items-start space-x-3"
          >
            <div class="flex-shrink-0">
              <el-icon 
                :class="activity.success ? 'text-green-500' : 'text-red-500'"
                size="16"
              >
                <component :is="activity.success ? 'Check' : 'Close'" />
              </el-icon>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900">{{ activity.user_name }}</p>
              <p class="text-xs text-gray-500">{{ activity.action }}</p>
              <p class="text-xs text-gray-400">{{ formatDateTime(activity.timestamp) }}</p>
            </div>
          </div>
          <div v-if="recentActivities.length === 0" class="text-center text-gray-500 py-4">
            暂无活动记录
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- 快速操作 -->
    <BaseCard>
      <template #header>
        <h3 class="text-lg font-semibold">快速操作</h3>
      </template>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <el-button 
          type="primary" 
          @click="cleanupSessions"
          :loading="cleanupLoading"
          class="h-12"
        >
          <el-icon class="mr-2"><Delete /></el-icon>
          清理过期会话
        </el-button>
        
        <router-link to="/admin/users">
          <el-button class="w-full h-12">
            <el-icon class="mr-2"><UserFilled /></el-icon>
            用户管理
          </el-button>
        </router-link>
        
        <router-link to="/admin/roles">
          <el-button class="w-full h-12">
            <el-icon class="mr-2"><Setting /></el-icon>
            角色管理
          </el-button>
        </router-link>
        
        <el-button 
          @click="refreshData"
          :loading="loading"
          class="h-12"
        >
          <el-icon class="mr-2"><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  UserFilled, Document, Clock, Connection, Check, Close, 
  Delete, Setting, Refresh 
} from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { 
  getSystemOverview, 
  getSystemHealth, 
  getPendingReports, 
  getRecentActivity,
  cleanupExpiredSessions,
  getUserStatistics,
  getReportStatistics
} from '@/api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'
import * as echarts from 'echarts'

const { handleError } = useGlobalErrorHandler()

// 响应式数据
const loading = ref(false)
const cleanupLoading = ref(false)
const overview = ref<any>({})
const health = ref<any>({})
const pendingReports = ref<any[]>([])
const recentActivities = ref<any[]>([])
const userChartRef = ref<HTMLElement>()
const reportChartRef = ref<HTMLElement>()

// 计算属性
const healthStatusType = computed(() => {
  switch (health.value.overall_status) {
    case 'healthy': return 'success'
    case 'warning': return 'warning'
    case 'critical': return 'danger'
    default: return 'info'
  }
})

const healthStatusText = computed(() => {
  switch (health.value.overall_status) {
    case 'healthy': return '健康'
    case 'warning': return '警告'
    case 'critical': return '严重'
    default: return '未知'
  }
})

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 初始化图表
const initCharts = async () => {
  await nextTick()
  
  try {
    // 用户统计图表
    if (userChartRef.value) {
      const userChart = echarts.init(userChartRef.value)
      const userStats = await getUserStatistics(30)
      
      const userChartOption = {
        title: {
          text: '最近30天用户注册',
          textStyle: { fontSize: 14 }
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: userStats.data?.data?.registration_trend?.map((item: any) => item.date) || []
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: userStats.data?.data?.registration_trend?.map((item: any) => item.count) || [],
          type: 'line',
          smooth: true,
          areaStyle: {}
        }]
      }
      
      userChart.setOption(userChartOption)
    }

    // 报告统计图表
    if (reportChartRef.value) {
      const reportChart = echarts.init(reportChartRef.value)
      const reportStats = await getReportStatistics(30)
      
      const reportChartOption = {
        title: {
          text: '报告状态分布',
          textStyle: { fontSize: 14 }
        },
        tooltip: {
          trigger: 'item'
        },
        series: [{
          type: 'pie',
          radius: '60%',
          data: reportStats.data?.data?.status_distribution?.map((item: any) => ({
            value: item.count,
            name: item.status
          })) || []
        }]
      }
      
      reportChart.setOption(reportChartOption)
    }
  } catch (error) {
    console.warn('Failed to load chart data:', error)
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  
  try {
    const [overviewRes, healthRes, pendingRes, activityRes] = await Promise.all([
      getSystemOverview(),
      getSystemHealth(),
      getPendingReports(1, 10),
      getRecentActivity(20)
    ])

    overview.value = overviewRes.data?.data || {}
    health.value = healthRes.data?.data || {}
    pendingReports.value = pendingRes.data?.data?.reports || []
    recentActivities.value = activityRes.data?.data?.activities || []

    // 初始化图表
    await initCharts()
    
  } catch (error) {
    handleError(error as Error, '加载仪表板数据失败')
  } finally {
    loading.value = false
  }
}

// 清理过期会话
const cleanupSessions = async () => {
  cleanupLoading.value = true
  
  try {
    const result = await cleanupExpiredSessions()
    ElMessage.success(`成功清理 ${result.data?.data?.cleaned_sessions || 0} 个过期会话`)
    await loadData() // 重新加载数据
  } catch (error) {
    handleError(error as Error, '清理过期会话失败')
  } finally {
    cleanupLoading.value = false
  }
}

// 刷新数据
const refreshData = async () => {
  await loadData()
  ElMessage.success('数据已刷新')
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-dashboard {
  @apply space-y-6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .admin-dashboard {
    @apply space-y-4;
  }
}
</style>