<template>
  <div class="user-detail">
    <!-- 页面标题和操作 -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-4">
        <el-button @click="goBack" circle>
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">用户详情</h1>
          <p class="text-gray-600 mt-1">查看和管理用户信息</p>
        </div>
      </div>
      <div class="flex space-x-3">
        <el-button @click="editUser">
          <el-icon class="mr-2"><Edit /></el-icon>
          编辑用户
        </el-button>
        <el-button 
          :type="userInfo.is_active ? 'danger' : 'success'"
          @click="toggleUserStatus"
        >
          {{ userInfo.is_active ? '禁用用户' : '启用用户' }}
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <el-icon size="32" class="animate-spin text-blue-500">
        <Loading />
      </el-icon>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 基本信息 -->
      <div class="lg:col-span-1">
        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">基本信息</h3>
          </template>
          
          <div class="text-center mb-6">
            <!-- 头像 -->
            <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <el-icon size="48" class="text-blue-600">
                <UserFilled />
              </el-icon>
            </div>
            
            <h4 class="text-lg font-semibold text-gray-900">{{ userInfo.name || userInfo.id }}</h4>
            <el-tag :type="userInfo.type === 0 ? 'primary' : 'success'" class="mt-2">
              {{ userInfo.type === 0 ? '患者' : '医生' }}
            </el-tag>
            <el-tag 
              :type="userInfo.is_active ? 'success' : 'danger'" 
              class="mt-2 ml-2"
            >
              {{ userInfo.is_active ? '活跃' : '禁用' }}
            </el-tag>
          </div>

          <!-- 详细信息 -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">用户ID</span>
              <span class="text-sm font-medium">{{ userInfo.id }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">姓名</span>
              <span class="text-sm font-medium">{{ userInfo.name || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">性别</span>
              <span class="text-sm font-medium">{{ getSexText(userInfo.sex) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">出生日期</span>
              <span class="text-sm font-medium">{{ userInfo.birth || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">手机号</span>
              <span class="text-sm font-medium">{{ userInfo.phone || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">邮箱</span>
              <span class="text-sm font-medium">{{ userInfo.email || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">地址</span>
              <span class="text-sm font-medium">{{ userInfo.address || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">创建时间</span>
              <span class="text-sm font-medium">{{ formatDateTime(userInfo.created_at) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">最后登录</span>
              <span class="text-sm font-medium">
                {{ userInfo.last_login ? formatDateTime(userInfo.last_login) : '从未登录' }}
              </span>
            </div>
          </div>
        </BaseCard>

        <!-- 医生专业信息 -->
        <BaseCard v-if="userInfo.type === 1" class="mt-6">
          <template #header>
            <h3 class="text-lg font-semibold">专业信息</h3>
          </template>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">职位</span>
              <span class="text-sm font-medium">{{ userInfo.position || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">工作单位</span>
              <span class="text-sm font-medium">{{ userInfo.workplace || '未设置' }}</span>
            </div>
          </div>
        </BaseCard>

        <!-- 用户角色 -->
        <BaseCard class="mt-6">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">用户角色</h3>
              <el-button size="small" @click="manageRoles">
                管理角色
              </el-button>
            </div>
          </template>
          
          <div class="space-y-2">
            <el-tag 
              v-for="role in userRoles" 
              :key="role.name"
              class="mr-2 mb-2"
            >
              {{ role.name }}
            </el-tag>
            <div v-if="userRoles.length === 0" class="text-center text-gray-500 py-4">
              暂无角色
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- 详细信息和活动 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 统计信息 -->
        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">统计信息</h3>
          </template>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ userStats.total_reports || 0 }}</div>
              <div class="text-sm text-gray-600">总报告数</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ userStats.completed_reports || 0 }}</div>
              <div class="text-sm text-gray-600">已完成</div>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ userStats.pending_reports || 0 }}</div>
              <div class="text-sm text-gray-600">待处理</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ userStats.login_count || 0 }}</div>
              <div class="text-sm text-gray-600">登录次数</div>
            </div>
          </div>
        </BaseCard>

        <!-- 审计日志 -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">审计日志</h3>
              <router-link :to="`/admin/audit?user_id=${userId}`" class="text-blue-500 text-sm hover:underline">
                查看全部
              </router-link>
            </div>
          </template>
          
          <BaseTable
            :data="auditLogs"
            :loading="auditLoading"
            :show-pagination="false"
          >
            <el-table-column prop="action" label="操作" width="120" />
            <el-table-column prop="resource_type" label="资源类型" width="100" />
            <el-table-column prop="resource_id" label="资源ID" width="100" />
            <el-table-column prop="timestamp" label="时间" width="150">
              <template #default="{ row }">
                {{ formatDateTime(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column prop="success" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                  {{ row.success ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="error_message" label="错误信息" min-width="200">
              <template #default="{ row }">
                <span v-if="row.error_message" class="text-red-600 text-sm">
                  {{ row.error_message }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </template>
            </el-table-column>
          </BaseTable>
        </BaseCard>

        <!-- 最近活动 -->
        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">最近活动</h3>
          </template>
          
          <div class="space-y-4">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded"
            >
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <el-icon class="text-blue-600" size="16">
                    <component :is="getActivityIcon(activity.type)" />
                  </el-icon>
                </div>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ formatDateTime(activity.timestamp) }}</p>
              </div>
            </div>
            <div v-if="recentActivities.length === 0" class="text-center text-gray-500 py-8">
              暂无最近活动
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Edit, UserFilled, Loading, Document, 
  Check, Clock, User 
} from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import { 
  getUserDetails,
  getUserRoles,
  getUserAuditLogs,
  deactivateUser,
  activateUser
} from '@/api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'

const route = useRoute()
const router = useRouter()
const { handleError } = useGlobalErrorHandler()

// 响应式数据
const loading = ref(false)
const auditLoading = ref(false)
const userId = ref(route.params.id as string)
const userInfo = ref<any>({})
const userRoles = ref<any[]>([])
const userStats = ref<any>({})
const auditLogs = ref<any[]>([])
const recentActivities = ref<any[]>([])

// 获取性别文本
const getSexText = (sex: number | null) => {
  if (sex === 0) return '女'
  if (sex === 1) return '男'
  return '未设置'
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 获取活动图标
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'login': return User
    case 'report': return Document
    case 'complete': return Check
    default: return Clock
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 编辑用户
const editUser = () => {
  router.push(`/admin/users/${userId.value}/edit`)
}

// 管理角色
const manageRoles = () => {
  router.push(`/admin/users/${userId.value}/roles`)
}

// 切换用户状态
const toggleUserStatus = async () => {
  const action = userInfo.value.is_active ? '禁用' : '启用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 ${userInfo.value.id} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (userInfo.value.is_active) {
      await deactivateUser(userId.value)
    } else {
      await activateUser(userId.value)
    }
    
    ElMessage.success(`用户${action}成功`)
    await loadUserDetails()
    
  } catch (error) {
    if (error !== 'cancel') {
      handleError(error as Error, `${action}用户失败`)
    }
  }
}

// 加载用户详情
const loadUserDetails = async () => {
  loading.value = true
  
  try {
    const [detailsRes, rolesRes] = await Promise.all([
      getUserDetails(userId.value),
      getUserRoles(userId.value)
    ])

    if (detailsRes.data?.data) {
      userInfo.value = detailsRes.data.data
    }

    if (rolesRes.data?.data) {
      userRoles.value = rolesRes.data.data.roles || []
    }

    // 模拟统计数据
    userStats.value = {
      total_reports: Math.floor(Math.random() * 50),
      completed_reports: Math.floor(Math.random() * 30),
      pending_reports: Math.floor(Math.random() * 10),
      login_count: Math.floor(Math.random() * 100)
    }

    // 模拟最近活动
    recentActivities.value = [
      {
        id: 1,
        type: 'login',
        description: '用户登录系统',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        type: 'report',
        description: '提交了新的检测报告',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        type: 'complete',
        description: '完成了个人信息更新',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ]
    
  } catch (error) {
    handleError(error as Error, '加载用户详情失败')
  } finally {
    loading.value = false
  }
}

// 加载审计日志
const loadAuditLogs = async () => {
  auditLoading.value = true
  
  try {
    const response = await getUserAuditLogs(userId.value, 1, 10)
    
    if (response.data?.data) {
      auditLogs.value = response.data.data.audit_logs || []
    }
  } catch (error) {
    console.warn('Failed to load audit logs:', error)
  } finally {
    auditLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUserDetails()
  loadAuditLogs()
})
</script>

<style scoped>
.user-detail {
  @apply space-y-6;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>