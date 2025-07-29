<template>
  <div class="admin-audit">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">审计日志</h1>
      <p class="text-gray-600 mt-1">查看系统操作记录和安全审计</p>
    </div>

    <!-- 筛选和搜索 -->
    <BaseCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <el-input
          v-model="filterForm.userId"
          placeholder="用户ID"
          clearable
          @input="handleFilter"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="filterForm.action"
          placeholder="操作类型"
          clearable
          @change="handleFilter"
        >
          <el-option label="登录" value="login" />
          <el-option label="登出" value="logout" />
          <el-option label="创建用户" value="create_user" />
          <el-option label="更新用户" value="update_user" />
          <el-option label="删除用户" value="delete_user" />
          <el-option label="创建报告" value="create_report" />
          <el-option label="更新报告" value="update_report" />
          <el-option label="删除报告" value="delete_report" />
        </el-select>
        
        <el-select
          v-model="filterForm.success"
          placeholder="操作结果"
          clearable
          @change="handleFilter"
        >
          <el-option label="成功" :value="true" />
          <el-option label="失败" :value="false" />
        </el-select>
        
        <el-date-picker
          v-model="filterForm.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          @change="handleFilter"
        />
        
        <el-button @click="resetFilter">重置筛选</el-button>
      </div>
    </BaseCard>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">总操作数</p>
            <p class="text-2xl font-bold text-blue-600">{{ statistics.total_operations || 0 }}</p>
          </div>
          <el-icon size="32" class="text-blue-500">
            <Document />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          今日: {{ statistics.today_operations || 0 }}
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">成功操作</p>
            <p class="text-2xl font-bold text-green-600">{{ statistics.success_operations || 0 }}</p>
          </div>
          <el-icon size="32" class="text-green-500">
            <Check />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          成功率: {{ (statistics.success_rate || 0).toFixed(1) }}%
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">失败操作</p>
            <p class="text-2xl font-bold text-red-600">{{ statistics.failed_operations || 0 }}</p>
          </div>
          <el-icon size="32" class="text-red-500">
            <Close />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          需要关注
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">活跃用户</p>
            <p class="text-2xl font-bold text-purple-600">{{ statistics.active_users || 0 }}</p>
          </div>
          <el-icon size="32" class="text-purple-500">
            <UserFilled />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          最近24小时
        </div>
      </BaseCard>
    </div>

    <!-- 审计日志列表 -->
    <BaseCard>
      <BaseTable
        :data="auditLogs"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user_id" label="用户ID" width="120">
          <template #default="{ row }">
            <router-link 
              v-if="row.user_id"
              :to="`/admin/users/${row.user_id}`" 
              class="text-blue-500 hover:underline"
            >
              {{ row.user_id }}
            </router-link>
            <span v-else class="text-gray-400">系统</span>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="用户名" width="120">
          <template #default="{ row }">
            {{ row.user_name || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" width="150">
          <template #default="{ row }">
            <el-tag size="small" :type="getActionType(row.action)">
              {{ getActionText(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resource_type" label="资源类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">
              {{ row.resource_type || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resource_id" label="资源ID" width="120">
          <template #default="{ row }">
            {{ row.resource_id || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="success" label="结果" width="80">
          <template #default="{ row }">
            <el-tag :type="row.success ? 'success' : 'danger'" size="small">
              {{ row.success ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="ip_address" label="IP地址" width="120">
          <template #default="{ row }">
            {{ row.ip_address || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="user_agent" label="用户代理" min-width="200">
          <template #default="{ row }">
            <div class="truncate" :title="row.user_agent">
              {{ row.user_agent || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetails(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </BaseTable>
    </BaseCard>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="审计日志详情"
      width="800px"
    >
      <div v-if="currentLog">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 基本信息 -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3">基本信息</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">日志ID:</span>
                <span class="font-medium">{{ currentLog.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">用户ID:</span>
                <span class="font-medium">{{ currentLog.user_id || '系统' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">用户名:</span>
                <span class="font-medium">{{ currentLog.user_name || '未知' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">操作:</span>
                <el-tag size="small" :type="getActionType(currentLog.action)">
                  {{ getActionText(currentLog.action) }}
                </el-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">资源类型:</span>
                <span class="font-medium">{{ currentLog.resource_type || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">资源ID:</span>
                <span class="font-medium">{{ currentLog.resource_id || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">操作结果:</span>
                <el-tag :type="currentLog.success ? 'success' : 'danger'" size="small">
                  {{ currentLog.success ? '成功' : '失败' }}
                </el-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">时间:</span>
                <span class="font-medium">{{ formatDateTime(currentLog.timestamp) }}</span>
              </div>
            </div>
          </div>

          <!-- 技术信息 -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3">技术信息</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">IP地址:</span>
                <span class="font-medium">{{ currentLog.ip_address || '-' }}</span>
              </div>
              <div>
                <span class="text-gray-600">用户代理:</span>
                <p class="text-xs text-gray-700 mt-1 break-all">
                  {{ currentLog.user_agent || '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="currentLog.error_message" class="mt-6">
          <h4 class="font-medium text-red-600 mb-3">错误信息</h4>
          <div class="bg-red-50 border border-red-200 rounded p-3">
            <p class="text-sm text-red-700">{{ currentLog.error_message }}</p>
          </div>
        </div>

        <!-- 变更详情 -->
        <div v-if="currentLog.old_values || currentLog.new_values" class="mt-6">
          <h4 class="font-medium text-gray-900 mb-3">变更详情</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="currentLog.old_values">
              <h5 class="text-sm font-medium text-gray-700 mb-2">变更前:</h5>
              <pre class="bg-gray-50 border rounded p-3 text-xs overflow-auto">{{ formatJson(currentLog.old_values) }}</pre>
            </div>
            <div v-if="currentLog.new_values">
              <h5 class="text-sm font-medium text-gray-700 mb-2">变更后:</h5>
              <pre class="bg-gray-50 border rounded p-3 text-xs overflow-auto">{{ formatJson(currentLog.new_values) }}</pre>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { 
  User, Document, Check, Close, UserFilled 
} from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import { getAuditLogs } from '@/api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'

const route = useRoute()
const { handleError } = useGlobalErrorHandler()

// 响应式数据
const loading = ref(false)
const auditLogs = ref<any[]>([])
const statistics = ref<any>({})
const showDetailDialog = ref(false)
const currentLog = ref<any>(null)

// 筛选表单
const filterForm = reactive({
  userId: (route.query.user_id as string) || '',
  action: '',
  success: null as boolean | null,
  dateRange: null as string[] | null
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 操作类型映射
const actionTypeMap: Record<string, string> = {
  login: 'success',
  logout: 'info',
  create_user: 'primary',
  update_user: 'warning',
  delete_user: 'danger',
  create_report: 'primary',
  update_report: 'warning',
  delete_report: 'danger'
}

const actionTextMap: Record<string, string> = {
  login: '登录',
  logout: '登出',
  create_user: '创建用户',
  update_user: '更新用户',
  delete_user: '删除用户',
  create_report: '创建报告',
  update_report: '更新报告',
  delete_report: '删除报告'
}

// 获取操作类型
const getActionType = (action: string) => {
  return actionTypeMap[action] || 'info'
}

// 获取操作文本
const getActionText = (action: string) => {
  return actionTextMap[action] || action
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 格式化JSON
const formatJson = (jsonStr: string) => {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2)
  } catch {
    return jsonStr
  }
}

// 查看详情
const viewDetails = (log: any) => {
  currentLog.value = log
  showDetailDialog.value = true
}

// 筛选处理
const handleFilter = () => {
  pagination.page = 1
  loadAuditLogs()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    userId: '',
    action: '',
    success: null,
    dateRange: null
  })
  handleFilter()
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.page = page
  loadAuditLogs()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadAuditLogs()
}

// 加载审计日志
const loadAuditLogs = async () => {
  loading.value = true
  
  try {
    const params: any = {
      page: pagination.page,
      page_size: pagination.pageSize
    }
    
    // 添加筛选参数
    if (filterForm.userId) params.user_id = filterForm.userId
    if (filterForm.action) params.action = filterForm.action
    if (filterForm.success !== null) params.success = filterForm.success
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.date_from = filterForm.dateRange[0].split(' ')[0] // 只取日期部分
      params.date_to = filterForm.dateRange[1].split(' ')[0]
    }
    
    const response = await getAuditLogs(params)
    
    if (response.data?.data) {
      // 后端返回的是 events 字段，不是 audit_logs
      auditLogs.value = response.data.data.events || []
      pagination.total = response.data.data.total_count || 0
      
      // 计算统计数据
      const events = auditLogs.value
      const successCount = events.filter(log => log.success).length
      const failedCount = events.filter(log => !log.success).length
      const uniqueUsers = new Set(events.filter(log => log.user_id).map(log => log.user_id)).size
      
      statistics.value = {
        total_operations: response.data.data.total_count || 0,
        today_operations: events.filter(log => {
          const logDate = new Date(log.timestamp).toDateString()
          const today = new Date().toDateString()
          return logDate === today
        }).length,
        success_operations: successCount,
        failed_operations: failedCount,
        success_rate: events.length > 0 ? (successCount / events.length * 100) : 0,
        active_users: uniqueUsers
      }
    }
    
  } catch (error) {
    handleError(error as Error, '加载审计日志失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadAuditLogs()
})
</script>

<style scoped>
.admin-audit {
  @apply space-y-6;
}

.truncate {
  @apply overflow-hidden whitespace-nowrap text-ellipsis;
}
</style>