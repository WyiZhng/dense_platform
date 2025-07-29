<template>
  <div class="doctor-collaboration">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">协作诊断</h1>
      <p class="text-gray-600 mt-1">与其他医生协作进行疑难病例诊断</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">待回复评论</p>
            <p class="text-2xl font-bold text-orange-600">{{ collaborationMentions.length }}</p>
          </div>
          <el-icon size="32" class="text-orange-500">
            <Message />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          需要您的专业意见
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">紧急评论</p>
            <p class="text-2xl font-bold text-red-600">{{ urgentComments.length }}</p>
          </div>
          <el-icon size="32" class="text-red-500">
            <Bell />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          需要立即处理
        </div>
      </BaseCard>

      <BaseCard class="text-center">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">协作报告</p>
            <p class="text-2xl font-bold text-blue-600">{{ collaborationReports.length }}</p>
          </div>
          <el-icon size="32" class="text-blue-500">
            <Document />
          </el-icon>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          参与的协作案例
        </div>
      </BaseCard>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 待回复的协作评论 -->
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">待回复评论</h3>
            <el-badge :value="collaborationMentions.length" :hidden="collaborationMentions.length === 0">
              <el-icon class="text-blue-500"><Message /></el-icon>
            </el-badge>
          </div>
        </template>
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div 
            v-for="mention in collaborationMentions" 
            :key="mention.id"
            class="border rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <el-icon class="text-blue-600"><User /></el-icon>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ mention.user_name }}</p>
                  <p class="text-sm text-gray-500">{{ mention.user_type }}</p>
                </div>
              </div>
              <div class="text-right">
                <el-tag type="primary" size="small">协作</el-tag>
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatDateTime(mention.created_at) }}
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-700 mb-3">{{ mention.content }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">报告ID: {{ mention.report_id }}</span>
              <div class="space-x-2">
                <el-button size="small" @click="viewReport(mention.report_id)">
                  查看报告
                </el-button>
                <el-button size="small" type="primary" @click="replyToComment(mention)">
                  回复
                </el-button>
              </div>
            </div>
          </div>
          <div v-if="collaborationMentions.length === 0" class="text-center text-gray-500 py-8">
            暂无待回复的协作评论
          </div>
        </div>
      </BaseCard>

      <!-- 紧急评论 -->
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">紧急评论</h3>
            <el-badge :value="urgentComments.length" :hidden="urgentComments.length === 0">
              <el-icon class="text-red-500"><Bell /></el-icon>
            </el-badge>
          </div>
        </template>
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div 
            v-for="comment in urgentComments" 
            :key="comment.id"
            class="border border-red-200 rounded-lg p-4 bg-red-50"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <el-icon class="text-red-600"><Warning /></el-icon>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ comment.user_name }}</p>
                  <p class="text-sm text-gray-500">{{ comment.user_type }}</p>
                </div>
              </div>
              <div class="text-right">
                <el-tag type="danger" size="small">紧急</el-tag>
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatDateTime(comment.created_at) }}
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-700 mb-3">{{ comment.content }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">报告ID: {{ comment.report_id }}</span>
              <div class="space-x-2">
                <el-button size="small" @click="viewReport(comment.report_id)">
                  查看报告
                </el-button>
                <el-button size="small" type="danger" @click="handleUrgentComment(comment)">
                  立即处理
                </el-button>
              </div>
            </div>
          </div>
          <div v-if="urgentComments.length === 0" class="text-center text-gray-500 py-8">
            暂无紧急评论
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- 协作报告列表 -->
    <BaseCard class="mt-6">
      <template #header>
        <h3 class="text-lg font-semibold">协作报告</h3>
      </template>
      <BaseTable
        :data="collaborationReports"
        :loading="loading"
        :show-pagination="false"
      >
        <el-table-column prop="id" label="报告ID" width="100" />
        <el-table-column prop="patient_name" label="患者" width="120">
          <template #default="{ row }">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <el-icon class="text-blue-600" size="14"><User /></el-icon>
              </div>
              <span class="font-medium">{{ row.patient_name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="primary_doctor" label="主治医生" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusType(row.status)" 
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_activity" label="最后活动" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.last_activity) }}
          </template>
        </el-table-column>
        <el-table-column prop="collaboration_type" label="协作类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.collaboration_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewReport(row.id)">
              查看详情
            </el-button>
            <el-button size="small" type="primary" @click="joinCollaboration(row)">
              参与协作
            </el-button>
          </template>
        </el-table-column>
      </BaseTable>
    </BaseCard>

    <!-- 回复评论对话框 -->
    <el-dialog
      v-model="showReplyDialog"
      title="回复评论"
      width="600px"
      @close="resetReplyForm"
    >
      <div v-if="currentComment">
        <!-- 原评论内容 -->
        <div class="mb-4 p-4 bg-gray-50 rounded">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <el-icon class="text-blue-600" size="14"><User /></el-icon>
            </div>
            <div>
              <span class="font-medium">{{ currentComment.user_name }}</span>
              <span class="text-sm text-gray-500 ml-2">{{ formatDateTime(currentComment.created_at) }}</span>
            </div>
          </div>
          <p class="text-sm text-gray-700">{{ currentComment.content }}</p>
        </div>

        <!-- 回复表单 -->
        <el-form
          ref="replyFormRef"
          :model="replyForm"
          :rules="replyRules"
          label-width="80px"
        >
          <el-form-item label="回复内容" prop="content">
            <el-input
              v-model="replyForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入您的专业意见..."
            />
          </el-form-item>
          
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="replyForm.priority" placeholder="请选择优先级">
              <el-option label="普通" value="normal" />
              <el-option label="高" value="high" />
              <el-option label="紧急" value="urgent" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="showReplyDialog = false">取消</el-button>
        <el-button type="primary" @click="submitReply" :loading="replyLoading">
          发送回复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Message, Bell, Document, User, Warning 
} from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import { 
  getCollaborationMentions,
  getUrgentComments,
  getCollaborationReports,
  createDoctorComment
} from '@/api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'

const router = useRouter()
const { handleError } = useGlobalErrorHandler()

// 响应式数据
const loading = ref(false)
const replyLoading = ref(false)
const collaborationMentions = ref<any[]>([])
const urgentComments = ref<any[]>([])
const collaborationReports = ref<any[]>([])
const showReplyDialog = ref(false)
const currentComment = ref<any>(null)

// 回复表单
const replyForm = reactive({
  content: '',
  priority: 'normal'
})

// 表单引用
const replyFormRef = ref()

// 表单验证规则
const replyRules = {
  content: [
    { required: true, message: '请输入回复内容', trigger: 'blur' }
  ]
}

// 状态相关方法
const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'pending': return 'warning'
    case 'completed': return 'info'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '进行中'
    case 'pending': return '待处理'
    case 'completed': return '已完成'
    default: return '未知'
  }
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 查看报告详情
const viewReport = (reportId: string) => {
  router.push(`/doctor/reports/${reportId}`)
}

// 回复评论
const replyToComment = (comment: any) => {
  currentComment.value = comment
  replyForm.content = ''
  replyForm.priority = 'normal'
  showReplyDialog.value = true
}

// 处理紧急评论
const handleUrgentComment = (comment: any) => {
  // 直接跳转到报告详情页面处理
  viewReport(comment.report_id)
}

// 参与协作
const joinCollaboration = (report: any) => {
  viewReport(report.id)
}

// 提交回复
const submitReply = async () => {
  if (!replyFormRef.value || !currentComment.value) return
  
  try {
    await replyFormRef.value.validate()
    replyLoading.value = true
    
    await createDoctorComment(
      currentComment.value.report_id,
      replyForm.content,
      currentComment.value.id,
      'collaboration',
      replyForm.priority
    )
    
    ElMessage.success('回复已发送')
    showReplyDialog.value = false
    await loadData() // 重新加载数据
    
  } catch (error) {
    if (error !== false) {
      handleError(error as Error, '发送回复失败')
    }
  } finally {
    replyLoading.value = false
  }
}

// 重置回复表单
const resetReplyForm = () => {
  replyFormRef.value?.resetFields()
  currentComment.value = null
}

// 加载数据
const loadData = async () => {
  loading.value = true
  
  try {
    const [mentionsRes, urgentRes, reportsRes] = await Promise.all([
      getCollaborationMentions(),
      getUrgentComments(),
      getCollaborationReports()
    ])

    collaborationMentions.value = mentionsRes.data?.data?.comments || []
    urgentComments.value = urgentRes.data?.data?.comments || []
    
    // 模拟协作报告数据（实际应该从API获取）
    collaborationReports.value = [
      {
        id: '1',
        patient_name: '张三',
        primary_doctor: '李医生',
        status: 'active',
        last_activity: new Date().toISOString(),
        collaboration_type: '疑难诊断'
      },
      {
        id: '2',
        patient_name: '李四',
        primary_doctor: '王医生',
        status: 'pending',
        last_activity: new Date(Date.now() - 86400000).toISOString(),
        collaboration_type: '二次确认'
      }
    ]
    
  } catch (error) {
    handleError(error as Error, '加载协作数据失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.doctor-collaboration {
  @apply space-y-6;
}
</style>