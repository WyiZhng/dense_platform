<template>
  <div class="doctor-dashboard">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">医生工作台</h1>
      <p class="text-gray-600 mt-1">欢迎回来，{{ doctorName }}</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">总报告数</p>
            <p class="text-2xl font-bold text-blue-600">{{ statistics.total_reports || 0 }}</p>
          </div>
          <el-icon size="32" class="text-blue-500">
            <Document />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          完成率: {{ statistics.completion_rate?.toFixed(1) || 0 }}%
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">待处理</p>
            <p class="text-2xl font-bold text-orange-600">{{ statistics.pending_reports || 0 }}</p>
          </div>
          <el-icon size="32" class="text-orange-500">
            <Clock />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          需要诊断
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">已完成</p>
            <p class="text-2xl font-bold text-green-600">{{ statistics.completed_reports || 0 }}</p>
          </div>
          <el-icon size="32" class="text-green-500">
            <Check />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          本周: {{ statistics.recent_reports || 0 }}
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">异常报告</p>
            <p class="text-2xl font-bold text-red-600">{{ statistics.abnormal_reports || 0 }}</p>
          </div>
          <el-icon size="32" class="text-red-500">
            <Warning />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          需要关注
        </div>
      </BaseCard>
    </div>

    <!-- 主要工作区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 待处理报告 -->
      <div class="lg:col-span-2">
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">待处理报告</h3>
              <router-link to="/doctor/reports" class="text-blue-500 text-sm hover:underline">
                查看全部
              </router-link>
            </div>
          </template>
          <div class="space-y-4 max-h-96 overflow-y-auto">
            <div v-for="report in pendingReports.slice(0, 5)" :key="report.id"
              class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" @click="viewReport(report.id)">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <el-icon class="text-blue-600">
                      <User />
                    </el-icon>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ report.patient_name }}</p>
                    <p class="text-sm text-gray-500">ID: {{ report.user }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <el-tag type="warning" size="small">待诊断</el-tag>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ formatDate(report.submitTime) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center justify-between text-sm text-gray-600">
                <span>图像数量: {{ report.images?.length || 0 }}</span>
                <el-button size="small" type="primary">开始诊断</el-button>
              </div>
            </div>
            <div v-if="pendingReports.length === 0" class="text-center text-gray-500 py-8">
              暂无待处理报告
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- 快速操作和通知 -->
      <div class="space-y-6">
        <!-- 快速操作 -->
        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">快速操作</h3>
          </template>
          <div class="space-y-3">
            <router-link to="/doctor/reports" class="block">
              <el-button class="w-full" type="primary">
                <el-icon class="mr-2">
                  <Document />
                </el-icon>
                查看所有报告
              </el-button>
            </router-link>

            <router-link to="/doctor/collaboration" class="block">
              <el-button class="w-full">
                <el-icon class="mr-2">
                  <ChatDotRound />
                </el-icon>
                协作诊断
              </el-button>
            </router-link>

            <el-button class="w-full" @click="refreshData" :loading="loading">
              <el-icon class="mr-2">
                <Refresh />
              </el-icon>
              刷新数据
            </el-button>
          </div>
        </BaseCard>

        <!-- 紧急评论 -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">紧急评论</h3>
              <el-badge :value="urgentComments.length" :hidden="urgentComments.length === 0">
                <el-icon class="text-red-500">
                  <Bell />
                </el-icon>
              </el-badge>
            </div>
          </template>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div v-for="comment in urgentComments.slice(0, 3)" :key="comment.id"
              class="p-3 bg-red-50 border border-red-200 rounded">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <el-tag type="danger" size="small">紧急</el-tag>
                  <span class="text-sm font-medium">{{ comment.user_name }}</span>
                </div>
                <span class="text-xs text-gray-500">
                  {{ formatDateTime(comment.created_at) }}
                </span>
              </div>
              <p class="text-sm text-gray-700 line-clamp-2">{{ comment.content }}</p>
              <el-button size="small" type="primary" class="mt-2" @click="viewReport(comment.report_id)">
                查看报告
              </el-button>
            </div>
            <div v-if="urgentComments.length === 0" class="text-center text-gray-500 py-4">
              暂无紧急评论
            </div>
          </div>
        </BaseCard>

        <!-- 协作提醒 -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">协作提醒</h3>
              <el-badge :value="collaborationMentions.length" :hidden="collaborationMentions.length === 0">
                <el-icon class="text-blue-500">
                  <Message />
                </el-icon>
              </el-badge>
            </div>
          </template>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div v-for="mention in collaborationMentions.slice(0, 3)" :key="mention.id"
              class="p-3 bg-blue-50 border border-blue-200 rounded">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <el-tag type="primary" size="small">协作</el-tag>
                  <span class="text-sm font-medium">{{ mention.user_name }}</span>
                </div>
                <span class="text-xs text-gray-500">
                  {{ formatDateTime(mention.created_at) }}
                </span>
              </div>
              <p class="text-sm text-gray-700 line-clamp-2">{{ mention.content }}</p>
              <el-button size="small" type="primary" class="mt-2" @click="viewReport(mention.report_id)">
                查看详情
              </el-button>
            </div>
            <div v-if="collaborationMentions.length === 0" class="text-center text-gray-500 py-4">
              暂无协作提醒
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- 最近活动 -->
    <BaseCard>
      <template #header>
        <h3 class="text-lg font-semibold">最近活动</h3>
      </template>
      <div class="space-y-4">
        <div v-for="activity in recentActivities.slice(0, 8)" :key="activity.id"
          class="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <el-icon class="text-green-600" size="16">
                <Check />
              </el-icon>
            </div>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-900">
              完成了患者 <span class="font-medium">{{ activity.patient_name }}</span> 的诊断
            </p>
            <p class="text-xs text-gray-500">{{ formatDateTime(activity.timestamp) }}</p>
          </div>
          <el-button size="small" @click="viewReport(activity.report_id)">
            查看
          </el-button>
        </div>
        <div v-if="recentActivities.length === 0" class="text-center text-gray-500 py-8">
          暂无最近活动
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document, Clock, Check, Warning, User, ChatDotRound,
  Refresh, Bell, Message
} from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import {
  getDoctorStatistics,
  getPendingDoctorReports,
  getUrgentComments,
  getCollaborationMentions,
  getCurrentUser
} from '@/api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'

const router = useRouter()
const { handleError } = useGlobalErrorHandler()

// 响应式数据
const loading = ref(false)
const doctorName = ref('医生')
const statistics = ref<any>({})
const pendingReports = ref<any[]>([])
const urgentComments = ref<any[]>([])
const collaborationMentions = ref<any[]>([])
const recentActivities = ref<any[]>([])

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 查看报告详情
const viewReport = (reportId: string) => {
  router.push(`/doctor/reports/${reportId}`)
}

// 加载数据
const loadData = async () => {
  loading.value = true

  try {
    console.log('开始加载医生仪表盘数据...')

    // 检查认证状态
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    if (!token) {
      ElMessage.error('请先登录')
      router.push('/login')
      return
    }

    console.log('Token存在，开始加载数据')

    // 分别加载数据，便于调试
    let userRes, statsRes, pendingRes

    try {
      console.log('正在获取用户信息...')
      userRes = await getCurrentUser()
      console.log('用户信息响应:', userRes)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      userRes = { data: null }
    }

    try {
      console.log('正在获取统计数据...')
      statsRes = await getDoctorStatistics()
      console.log('统计数据响应:', statsRes)
    } catch (error) {
      console.error('获取统计数据失败:', error)
      statsRes = { data: { data: {} } }
    }

    try {
      console.log('正在获取待处理报告...')
      pendingRes = await getPendingDoctorReports()
      console.log('待处理报告响应:', pendingRes)
    } catch (error) {
      console.error('获取待处理报告失败:', error)
      pendingRes = { data: { reports: [] } }
    }

    // 设置医生姓名
    if (userRes.data?.data?.name) {
      doctorName.value = userRes.data.data.name
    } else if (userRes.data?.data?.user_detail?.name) {
      doctorName.value = userRes.data.data.user_detail.name
    } else if (userRes.data?.name) {
      doctorName.value = userRes.data.name
    } else if (userRes.data?.user_detail?.name) {
      doctorName.value = userRes.data.user_detail.name
    }
    console.log('医生姓名设置为:', doctorName.value)

    // 设置统计数据
    if (statsRes.data?.data) {
      statistics.value = statsRes.data.data
      console.log('统计数据设置为:', statistics.value)
    } else if (statsRes.data) {
      statistics.value = statsRes.data
      console.log('统计数据设置为(备用):', statistics.value)
    }

    // 设置待处理报告
    let reports = []
    if (pendingRes.data?.reports) {
      reports = pendingRes.data.reports
    } else if (pendingRes.data?.data?.reports) {
      reports = pendingRes.data.data.reports
    } else if (Array.isArray(pendingRes.data)) {
      reports = pendingRes.data
    }

    pendingReports.value = reports
    console.log('待处理报告设置为:', pendingReports.value)

    // 临时模拟紧急评论和协作提醒数据
    if (pendingReports.value.length > 0) {
      urgentComments.value = pendingReports.value.slice(0, 2).map(report => ({
        id: `urgent-${report.id}`,
        report_id: report.id,
        user_name: report.patient_name || '患者',
        content: '请尽快查看这份报告，有紧急情况需要处理',
        created_at: report.submitTime
      }))

      collaborationMentions.value = pendingReports.value.slice(0, 2).map(report => ({
        id: `collab-${report.id}`,
        report_id: report.id,
        user_name: '系统',
        content: `有新的报告需要您的诊断，患者：${report.patient_name || '未知'}`,
        created_at: report.submitTime
      }))

      // 模拟最近活动数据（实际应该从API获取）
      recentActivities.value = pendingReports.value
        .slice(0, 5)
        .map(report => ({
          id: report.id,
          report_id: report.id,
          patient_name: report.patient_name || report.user,
          timestamp: report.submitTime
        }))
    }

    console.log('医生仪表盘数据加载完成')
    ElMessage.success('数据加载成功')
  } catch (error) {
    console.error('加载仪表盘数据时发生错误:', error)
    ElMessage.error('加载数据失败，请稍后重试')
    handleError(error as Error, '加载工作台数据失败')
  } finally {
    loading.value = false
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
.doctor-dashboard {
  @apply space-y-6;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 首页按钮颜色调整 - 使用更浅的颜色 */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%) !important;
  border: none !important;
  opacity: 0.8;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
  transform: translateY(-1px);
  opacity: 1;
}

/* 文本按钮样式调整 */
:deep(.el-button--primary.is-text) {
  background: transparent !important;
  color: #60a5fa !important;
  border: none !important;
}

:deep(.el-button--primary.is-text:hover) {
  background: rgba(96, 165, 250, 0.1) !important;
  color: #3b82f6 !important;
  transform: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .doctor-dashboard {
    @apply space-y-4;
  }
}
</style>