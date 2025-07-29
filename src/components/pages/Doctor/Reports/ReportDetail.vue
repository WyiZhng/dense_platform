<template>
  <div class="report-detail">
    <!-- 页面标题和操作 -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-4">
        <el-button @click="goBack" circle>
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">报告详情</h1>
          <p class="text-gray-600 mt-1">报告ID: {{ reportId }}</p>
        </div>
      </div>
      <div class="flex space-x-3">
        <el-button v-if="report.current_status === 0 || report.current_status === 'Checking'" type="primary" @click="startDiagnosis">
          开始诊断
        </el-button>
        <el-button @click="refreshData" :loading="loading">
          <el-icon class="mr-2"><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <el-icon size="32" class="animate-spin text-blue-500">
        <Loading />
      </el-icon>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 报告基本信息 -->
      <div class="lg:col-span-1">
        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">报告信息</h3>
          </template>
          
          <div class="space-y-4">
            <!-- 患者信息 -->
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <el-icon class="text-blue-600" size="20"><User /></el-icon>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ report.patient_name || '未知患者' }}</p>
                <p class="text-sm text-gray-500">患者ID: {{ report.user }}</p>
              </div>
            </div>

            <!-- 报告状态 -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">报告状态</span>
              <el-tag :type="getStatusType(report.current_status)" size="small">
                {{ getStatusText(report.current_status) }}
              </el-tag>
            </div>

            <!-- 提交时间 -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">提交时间</span>
              <span class="text-sm font-medium">{{ formatDateTime(report.submitTime) }}</span>
            </div>

            <!-- 医生信息 -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">负责医生</span>
              <span class="text-sm font-medium">{{ report.doctor_name || '未分配' }}</span>
            </div>

            <!-- 图像数量 -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">图像数量</span>
              <el-badge :value="report.images?.length || 0" class="item">
                <el-icon class="text-blue-500"><Picture /></el-icon>
              </el-badge>
            </div>
          </div>
        </BaseCard>

        <!-- 患者详细信息 -->
        <BaseCard v-if="report.patient_details" class="mt-6">
          <template #header>
            <h3 class="text-lg font-semibold">患者详情</h3>
          </template>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">性别</span>
              <span class="text-sm font-medium">{{ getSexText(report.patient_details.sex) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">出生日期</span>
              <span class="text-sm font-medium">{{ report.patient_details.birth || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">手机号</span>
              <span class="text-sm font-medium">{{ report.patient_details.phone || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">邮箱</span>
              <span class="text-sm font-medium">{{ report.patient_details.email || '未设置' }}</span>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- 报告内容和诊断 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 原始医学图像 -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">原始医学图像</h3>
              <el-button 
                v-if="report.images && report.images.length > 0" 
                @click="loadImages" 
                :loading="imageLoading"
                size="small"
              >
                {{ sourceImages.length > 0 ? '刷新图像' : '加载图像' }}
              </el-button>
            </div>
          </template>
          
          <div v-if="imageLoading" class="flex justify-center py-8">
            <el-icon size="24" class="animate-spin text-blue-500">
              <Loading />
            </el-icon>
          </div>
          
          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <!-- 显示已加载的原始图像 -->
            <div 
              v-for="(imageUrl, index) in sourceImages" 
              :key="`source-${index}`"
              class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              @click="viewImage(imageUrl, 'source')"
            >
              <img 
                :src="imageUrl" 
                :alt="`原始图像 ${index + 1}`"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
            </div>
            
            <!-- 显示未加载的图像占位符 -->
            <div 
              v-for="(imageId, index) in report.images || []" 
              v-if="sourceImages.length === 0"
              :key="`placeholder-${index}`"
              class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
              @click="loadImages"
            >
              <div class="text-center">
                <el-icon size="32" class="text-gray-400 mb-2">
                  <Picture />
                </el-icon>
                <p class="text-xs text-gray-500">点击加载</p>
              </div>
            </div>
            
            <div v-if="!report.images || report.images.length === 0" class="col-span-full text-center text-gray-500 py-8">
              暂无原始图像
            </div>
          </div>
        </BaseCard>

        <!-- 结果图像 -->
        <BaseCard v-if="report.result_images && report.result_images.length > 0">
          <template #header>
            <h3 class="text-lg font-semibold">分析结果图像</h3>
          </template>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <!-- 显示已加载的结果图像 -->
            <div 
              v-for="(imageUrl, index) in resultImages" 
              :key="`result-${index}`"
              class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              @click="viewImage(imageUrl, 'result')"
            >
              <img 
                :src="imageUrl" 
                :alt="`结果图像 ${index + 1}`"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
            </div>
            
            <!-- 显示未加载的结果图像占位符 -->
            <div 
              v-for="(imageId, index) in report.result_images || []" 
              v-if="resultImages.length === 0"
              :key="`result-placeholder-${index}`"
              class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
              @click="loadImages"
            >
              <div class="text-center">
                <el-icon size="32" class="text-green-400 mb-2">
                  <Picture />
                </el-icon>
                <p class="text-xs text-gray-500">分析结果</p>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- 诊断结果 -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">诊断结果</h3>
              <el-button 
                v-if="report.current_status === 0 || report.current_status === 'Checking'"
                type="primary" 
                @click="showDiagnosisDialog = true"
              >
                添加诊断
              </el-button>
            </div>
          </template>
          
          <div v-if="report.diagnose" class="prose max-w-none">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="text-blue-800 font-medium mb-2">诊断意见</h4>
              <p class="text-blue-700 whitespace-pre-wrap">{{ report.diagnose }}</p>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            <el-icon size="48" class="text-gray-300 mb-4">
              <Document />
            </el-icon>
            <p>暂无诊断结果</p>
            <el-button 
              v-if="report.current_status === 0 || report.current_status === 'Checking'"
              type="primary" 
              class="mt-4"
              @click="showDiagnosisDialog = true"
            >
              开始诊断
            </el-button>
          </div>
        </BaseCard>

        <!-- 评论和讨论 -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">评论讨论</h3>
              <el-button @click="showCommentDialog = true">
                添加评论
              </el-button>
            </div>
          </template>
          
          <div class="space-y-4">
            <div 
              v-for="comment in comments" 
              :key="comment.id"
              class="border-l-4 border-blue-200 pl-4 py-2"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span class="font-medium text-gray-900">{{ comment.user_name }}</span>
                  <el-tag size="small" :type="comment.user_type === 'Doctor' ? 'success' : 'primary'">
                    {{ comment.user_type === 'Doctor' ? '医生' : '患者' }}
                  </el-tag>
                  <el-tag v-if="comment.priority !== 'normal'" size="small" type="warning">
                    {{ comment.priority }}
                  </el-tag>
                </div>
                <span class="text-xs text-gray-500">{{ formatDateTime(comment.created_at) }}</span>
              </div>
              <p class="text-gray-700 text-sm">{{ comment.content }}</p>
            </div>
            <div v-if="comments.length === 0" class="text-center text-gray-500 py-8">
              暂无评论
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- 诊断对话框 -->
    <el-dialog
      v-model="showDiagnosisDialog"
      title="添加诊断"
      width="600px"
      @close="resetDiagnosisForm"
    >
      <el-form
        ref="diagnosisFormRef"
        :model="diagnosisForm"
        :rules="diagnosisRules"
        label-width="100px"
      >
        <el-form-item label="诊断结果" prop="diagnose">
          <el-input
            v-model="diagnosisForm.diagnose"
            type="textarea"
            :rows="6"
            placeholder="请输入详细的诊断结果..."
          />
        </el-form-item>
        
        <el-form-item label="报告状态" prop="status">
          <el-select v-model="diagnosisForm.status" placeholder="请选择状态">
            <el-option label="已完成" value="Completed" />
            <el-option label="发现异常" value="Abnormality" />
            <el-option label="需要进一步检查" value="Checking" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showDiagnosisDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDiagnosis" :loading="diagnosisLoading">
          保存诊断
        </el-button>
      </template>
    </el-dialog>

    <!-- 评论对话框 -->
    <el-dialog
      v-model="showCommentDialog"
      title="添加评论"
      width="500px"
      @close="resetCommentForm"
    >
      <el-form
        ref="commentFormRef"
        :model="commentForm"
        :rules="commentRules"
        label-width="80px"
      >
        <el-form-item label="评论内容" prop="content">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入评论内容..."
          />
        </el-form-item>
        
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="commentForm.priority" placeholder="请选择优先级">
            <el-option label="普通" value="normal" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCommentDialog = false">取消</el-button>
        <el-button type="primary" @click="submitComment" :loading="commentLoading">
          发送评论
        </el-button>
      </template>
    </el-dialog>

    <!-- 图片查看对话框 -->
    <el-dialog
      v-model="showImageDialog"
      :title="currentImageType === 'source' ? '原始医学图像' : '分析结果图像'"
      width="80%"
      center
    >
      <div class="flex justify-center">
        <img 
          :src="currentImage" 
          :alt="currentImageType === 'source' ? '原始图像' : '结果图像'"
          class="max-w-full max-h-96 object-contain"
          @error="handleImageError"
        />
      </div>
      
      <template #footer>
        <div class="flex justify-center space-x-3">
          <el-button @click="downloadImage">下载图片</el-button>
          <el-button type="primary" @click="showImageDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, Refresh, Loading, User, Picture, Document 
} from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { 
  getDoctorReportDetail,
  updateDoctorReport,
  createDoctorComment,
  getDoctorComments,
  getImageData,
  getResultImageData
} from '@/api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'

const route = useRoute()
const router = useRouter()
const { handleError } = useGlobalErrorHandler()

// 响应式数据
const loading = ref(false)
const diagnosisLoading = ref(false)
const commentLoading = ref(false)
const reportId = ref(route.params.id as string)
const report = ref<any>({})
const comments = ref<any[]>([])
const showDiagnosisDialog = ref(false)
const showCommentDialog = ref(false)

// 图片相关状态
const sourceImages = ref<string[]>([])
const resultImages = ref<string[]>([])
const imageLoading = ref(false)
const showImageDialog = ref(false)
const currentImage = ref('')
const currentImageType = ref<'source' | 'result'>('source')

// 诊断表单
const diagnosisForm = reactive({
  diagnose: '',
  status: 'Completed'
})

// 评论表单
const commentForm = reactive({
  content: '',
  priority: 'normal'
})

// 表单引用
const diagnosisFormRef = ref()
const commentFormRef = ref()

// 表单验证规则
const diagnosisRules = {
  diagnose: [
    { required: true, message: '请输入诊断结果', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择报告状态', trigger: 'change' }
  ]
}

const commentRules = {
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' }
  ]
}

// 状态相关方法
const getStatusType = (status: string | number) => {
  // 处理数字状态（后端IntEnum）和字符串状态
  const statusValue = typeof status === 'number' ? status : parseInt(status)
  
  switch (statusValue) {
    case 0: // Checking
    case 'Checking': 
      return 'warning'
    case 1: // Completed
    case 'Completed': 
      return 'success'
    case 2: // Abnormality
    case 'Abnormality': 
      return 'danger'
    case 3: // Error
    case 'Error': 
      return 'info'
    default: 
      return 'info'
  }
}

const getStatusText = (status: string | number) => {
  // 处理数字状态（后端IntEnum）和字符串状态
  const statusValue = typeof status === 'number' ? status : parseInt(status)
  
  console.log('Status value:', status, 'Parsed:', statusValue) // 调试日志
  
  switch (statusValue) {
    case 0: // Checking
    case 'Checking': 
      return '待处理'
    case 1: // Completed
    case 'Completed': 
      return '已完成'
    case 2: // Abnormality
    case 'Abnormality': 
      return '异常'
    case 3: // Error
    case 'Error': 
      return '错误'
    default: 
      return '未知'
  }
}

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

// 返回上一页
const goBack = () => {
  router.back()
}

// 加载图片数据
const loadImages = async () => {
  if (!report.value.images || report.value.images.length === 0) {
    return
  }
  
  imageLoading.value = true
  
  try {
    // 加载原始图片
    // 过滤掉无效的图片ID
    const validSourceImageIds = report.value.images.filter((imageId: string) => {
      return imageId && imageId !== 'None' && imageId !== 'null' && imageId.trim() !== ''
    })
    
    const sourceImagePromises = validSourceImageIds.map(async (imageId: string) => {
      try {
        console.log(`Loading source image: ${imageId}`)
        const response = await getImageData(imageId)
        const blob = new Blob([response.data], { type: 'image/jpeg' })
        return URL.createObjectURL(blob)
      } catch (error) {
        console.warn(`Failed to load source image ${imageId}:`, error)
        return null
      }
    })
    
    const loadedSourceImages = await Promise.all(sourceImagePromises)
    sourceImages.value = loadedSourceImages.filter(img => img !== null) as string[]
    
    // 加载结果图片
    if (report.value.result_images && report.value.result_images.length > 0) {
      // 过滤掉无效的图片ID
      const validResultImageIds = report.value.result_images.filter((imageId: string) => {
        return imageId && imageId !== 'None' && imageId !== 'null' && imageId.trim() !== ''
      })
      
      if (validResultImageIds.length > 0) {
        const resultImagePromises = validResultImageIds.map(async (imageId: string) => {
          try {
            console.log(`Loading result image: ${imageId}`)
            const response = await getResultImageData(imageId)
            const blob = new Blob([response.data], { type: 'image/jpeg' })
            return URL.createObjectURL(blob)
          } catch (error) {
            console.warn(`Failed to load result image ${imageId}:`, error)
            return null
          }
        })
        
        const loadedResultImages = await Promise.all(resultImagePromises)
        resultImages.value = loadedResultImages.filter(img => img !== null) as string[]
      }
    }
    
  } catch (error) {
    console.error('Failed to load images:', error)
  } finally {
    imageLoading.value = false
  }
}

// 查看图像
const viewImage = (imageUrl: string, type: 'source' | 'result' = 'source') => {
  currentImage.value = imageUrl
  currentImageType.value = type
  showImageDialog.value = true
}

// 清理图片URL
const cleanupImageUrls = () => {
  sourceImages.value.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
  resultImages.value.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
  sourceImages.value = []
  resultImages.value = []
}

// 开始诊断
const startDiagnosis = () => {
  showDiagnosisDialog.value = true
}

// 提交诊断
const submitDiagnosis = async () => {
  if (!diagnosisFormRef.value) return
  
  try {
    await diagnosisFormRef.value.validate()
    diagnosisLoading.value = true
    
    await updateDoctorReport(
      reportId.value,
      diagnosisForm.status,
      diagnosisForm.diagnose
    )
    
    ElMessage.success('诊断已保存')
    showDiagnosisDialog.value = false
    await loadReportDetail()
    
  } catch (error) {
    if (error !== false) {
      handleError(error as Error, '保存诊断失败')
    }
  } finally {
    diagnosisLoading.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentFormRef.value) return
  
  try {
    await commentFormRef.value.validate()
    commentLoading.value = true
    
    await createDoctorComment(
      reportId.value,
      commentForm.content,
      undefined,
      'general',
      commentForm.priority
    )
    
    ElMessage.success('评论已发送')
    showCommentDialog.value = false
    await loadComments()
    
  } catch (error) {
    if (error !== false) {
      handleError(error as Error, '发送评论失败')
    }
  } finally {
    commentLoading.value = false
  }
}

// 重置表单
const resetDiagnosisForm = () => {
  diagnosisFormRef.value?.resetFields()
  diagnosisForm.diagnose = ''
  diagnosisForm.status = 'Completed'
}

const resetCommentForm = () => {
  commentFormRef.value?.resetFields()
  commentForm.content = ''
  commentForm.priority = 'normal'
}

// 图片错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('Image failed to load:', img.src)
  // 可以设置默认图片或显示错误状态
}

// 下载图片
const downloadImage = () => {
  if (!currentImage.value) return
  
  try {
    const link = document.createElement('a')
    link.href = currentImage.value
    link.download = `${currentImageType.value === 'source' ? '原始图像' : '结果图像'}_${reportId.value}_${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('图片下载已开始')
  } catch (error) {
    console.error('Download failed:', error)
    ElMessage.error('图片下载失败')
  }
}

// 加载报告详情
const loadReportDetail = async () => {
  loading.value = true
  
  try {
    const response = await getDoctorReportDetail(reportId.value)
    
    console.log('API Response:', response.data) // 调试日志
    
    // 根据后端API响应格式，报告数据在response.data.report中
    if (response.data?.report) {
      report.value = response.data.report
      // 自动加载图片
      if (report.value.images && report.value.images.length > 0) {
        await loadImages()
      }
    } else if (response.data?.data?.report) {
      // 备用路径，以防响应格式不同
      report.value = response.data.data.report
      // 自动加载图片
      if (report.value.images && report.value.images.length > 0) {
        await loadImages()
      }
    } else {
      console.warn('Unexpected response format:', response.data)
      report.value = {}
    }
  } catch (error) {
    handleError(error as Error, '加载报告详情失败')
  } finally {
    loading.value = false
  }
}

// 加载评论
const loadComments = async () => {
  try {
    const response = await getDoctorComments(reportId.value)
    
    if (response.data?.data) {
      comments.value = response.data.data.comments || []
    }
  } catch (error) {
    console.warn('Failed to load comments:', error)
  }
}

// 刷新数据
const refreshData = async () => {
  await Promise.all([
    loadReportDetail(),
    loadComments()
  ])
  ElMessage.success('数据已刷新')
}

// 组件挂载时加载数据
onMounted(() => {
  loadReportDetail()
  loadComments()
})

// 组件卸载时清理资源
onUnmounted(() => {
  cleanupImageUrls()
})
</script>

<style scoped>
.report-detail {
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

.prose {
  @apply text-gray-700;
}
</style>