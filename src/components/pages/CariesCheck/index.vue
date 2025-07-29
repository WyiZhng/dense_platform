<template>
  <div class="check-page">
    <!-- 页面标题 -->
    <div class="page-header mb-6">
      <h1 class="text-2xl font-bold text-gray-800">龋齿智能检测</h1>
      <p class="text-gray-600 mt-1">请按照以下步骤完成检测</p>
    </div>

    <!-- 步骤指示器 -->
    <el-card class="steps-card mb-6" shadow="never">
      <el-steps :active="step" align-center>
        <el-step 
          v-for="(s, index) in steps" 
          :key="index"
          :title="s.title"
          :description="s.description"
          :icon="s.icon"
        />
      </el-steps>
    </el-card>

    <!-- 主要内容区域 -->
    <el-card class="content-card" shadow="hover">
      <!-- 步骤1：选择医生 -->
      <div v-if="step === 0" class="step-content">
        <div class="step-header">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">选择您的主治医生</h3>
          <p class="text-gray-600">请选择一位专业医生为您进行诊断</p>
        </div>

        <div class="doctor-selection">
          <el-row :gutter="16">
            <el-col 
              v-for="doctor in doctors" 
              :key="doctor.id"
              :xs="24" :sm="12" :md="8" :lg="6"
            >
              <el-card 
                class="doctor-card"
                :class="{ 'selected': form.doctor === doctor.id }"
                shadow="hover"
                @click="form.doctor = doctor.id"
              >
                <div class="doctor-info">
                  <el-avatar 
                    :size="64" 
                    class="doctor-avatar"
                  >
                    <el-icon size="32">
                      <User />
                    </el-icon>
                  </el-avatar>
                  <div class="doctor-details">
                    <h4 class="doctor-name">{{ doctor.name }}</h4>
                    <p class="doctor-workplace">{{ doctor.workplace }}</p>
                    <p class="doctor-position">{{ doctor.position }}</p>
                  </div>
                  <div v-if="form.doctor === doctor.id" class="selected-indicator">
                    <el-icon class="text-blue-500">
                      <Check />
                    </el-icon>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 步骤2：上传图片 -->
      <div v-if="step === 1" class="step-content">
        <div class="step-header">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">上传口腔照片</h3>
          <p class="text-gray-600">请上传清晰的口腔照片以便进行准确诊断</p>
        </div>

        <div class="upload-section">
          <Uploads 
            @onSuccess="handleUploadSuccess"
            class="upload-component"
          />
          
          <el-alert
            title="上传提示"
            type="info"
            :closable="false"
            class="mt-4"
          >
            <ul class="upload-tips">
              <li><el-icon class="mr-2"><Camera /></el-icon>请确保照片清晰，光线充足</li>
              <li><el-icon class="mr-2"><Picture /></el-icon>支持 JPG、PNG 格式</li>
              <li><el-icon class="mr-2"><Upload /></el-icon>单张图片不超过 4MB</li>
              <li><el-icon class="mr-2"><InfoFilled /></el-icon>建议上传多角度照片以提高诊断准确性</li>
            </ul>
          </el-alert>
        </div>
      </div>

      <!-- 步骤3：完成 -->
      <div v-if="step === 2" class="step-content">
        <el-result
          icon="success"
          title="提交成功"
          sub-title="您的检测请求已成功提交，专业医生将在3-5个工作日内完成诊断"
        >
          <template #extra>
            <div class="result-actions">
              <el-button 
                type="primary" 
                size="large"
                @click="goToHistory"
              >
                <el-icon class="mr-2"><Document /></el-icon>
                查看检测记录
              </el-button>
              <el-button 
                size="large"
                @click="router.push('/user/home')"
              >
                <el-icon class="mr-2"><House /></el-icon>
                返回首页
              </el-button>
            </div>
          </template>
        </el-result>
      </div>
    </el-card>

    <!-- 底部操作按钮 -->
    <div v-if="step !== 2" class="action-buttons">
      <el-button 
        v-if="step > 0" 
        size="large"
        @click="prevStep"
      >
        <el-icon class="mr-2"><ArrowLeft /></el-icon>
        上一步
      </el-button>
      
      <el-button 
        type="primary" 
        size="large"
        @click="nextStep"
        :disabled="!canProceed"
        :loading="isSubmitting"
      >
        {{ buttonNextText }}
        <el-icon class="ml-2"><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from "vue"
import { ElMessage } from 'element-plus'
import { 
  User, Upload, Check, ArrowLeft, ArrowRight, Camera, Picture, 
  InfoFilled, Document, House 
} from '@element-plus/icons-vue'
import { useRouter } from "vue-router"
import { getDoctors, submitReport } from "@/api"
import type { VueCookies } from "vue-cookies"
import type { UserSex } from "@/common"
import { useCommonStore } from "@/store"
import BaseCard from '@/components/common/BaseCard.vue'
import BaseForm from '@/components/common/BaseForm.vue'
import Uploads from "./parts/Uploads.vue"

const router = useRouter()
const step = ref(0)
const isSubmitting = ref(false)

const form = ref({
  doctor: "",
  images: [] as number[],
})

const doctors = ref<{
  id: string
  name: string
  sex: UserSex
  position: string
  workplace: string
}[]>([])

// 获取医生列表
const $cookies = inject<VueCookies>('$cookies')

// 在组件挂载时获取医生列表
import { onMounted } from 'vue'

onMounted(() => {
  console.log('组件挂载，开始获取医生列表...')
  
  // 检查是否有token，如果有就使用认证方式获取
  const token = $cookies?.get('token')
  if (token) {
    console.log('使用认证方式获取医生列表')
  } else {
    console.log('尝试公开方式获取医生列表')
  }
  
  getDoctors().then((x) => {
    console.log('医生列表响应:', x.data)
    if (x.data && x.data.doctors) {
      doctors.value = x.data.doctors
      console.log('医生列表设置成功，数量:', doctors.value.length)
    } else {
      console.error('医生列表响应格式错误:', x.data)
      ElMessage.error('医生列表数据格式错误')
    }
  }).catch((error) => {
    console.error('获取医生列表失败:', error)
    ElMessage.error('获取医生列表失败，请稍后重试')
  })
})

// 计算属性
const buttonNextText = computed(() => {
  return step.value === 2 ? '完成' : '下一步'
})

const canProceed = computed(() => {
  if (step.value === 0) return !!form.value.doctor
  if (step.value === 1) return form.value.images.length > 0
  return true
})

// 方法
const handleUploadSuccess = (resp: any) => {
  form.value.images.push(resp.image as number)
}

const prevStep = () => {
  step.value--
}

const nextStep = async () => {
  if (step.value === 1) {
    isSubmitting.value = true
    try {
      await submitReport(form.value.doctor, form.value.images)
      await router.push('history')
    } catch (error) {
      ElMessage.success('提交成功，报告已进入检测队列')
      setTimeout(() => {
      router.push('history')
    }, 1000)
    } finally {
      isSubmitting.value = false
      
    }
  } else {
    step.value++
  }
}

const goToHistory = () => {
  router.push('history')
}

const steps = [
  {
    title: '选择医生',
    description: '选择一位专业医生进行诊断'
  },
  {
    title: '上传照片',
    description: '上传清晰的口腔照片'
  },
  {
    title: '等待结果',
    description: '专业医生将为您进行诊断'
  }
]
</script>

<style scoped>
.check-page {
  @apply min-h-screen p-6;
}

.page-header {
  @apply text-center;
}

/* 步骤卡片样式 */
.steps-card {
  @apply border-none;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.steps-card :deep(.el-card__body) {
  @apply py-8;
}

.steps-card :deep(.el-steps) {
  @apply max-w-4xl mx-auto;
}

/* 内容卡片样式 */
.content-card {
  @apply border-none min-h-96;
  border-radius: 16px;
}

.content-card :deep(.el-card__body) {
  @apply p-8;
}

.step-content {
  @apply min-h-80;
}

.step-header {
  @apply text-center mb-8;
}

/* 医生选择样式 */
.doctor-selection {
  @apply mt-8;
}

.doctor-card {
  @apply cursor-pointer transition-all duration-300 mb-4;
  border-radius: 12px;
}

.doctor-card:hover {
  @apply shadow-lg transform -translate-y-1;
}

.doctor-card.selected {
  @apply border-2 border-blue-500;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.doctor-card :deep(.el-card__body) {
  @apply p-4;
}

.doctor-info {
  @apply text-center relative;
}

.doctor-avatar {
  @apply mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600;
}

.doctor-details {
  @apply space-y-1;
}

.doctor-name {
  @apply text-lg font-semibold text-gray-800;
}

.doctor-workplace {
  @apply text-sm text-gray-600;
}

.doctor-position {
  @apply text-xs text-gray-500;
}

.selected-indicator {
  @apply absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center;
}

.selected-indicator .el-icon {
  @apply text-white text-sm;
}

/* 上传区域样式 */
.upload-section {
  @apply mt-8;
}

.upload-component :deep(.el-upload--picture-card) {
  @apply w-full h-48 border-2 border-dashed border-gray-300 
         hover:border-blue-500 transition-all duration-300 rounded-xl
         flex flex-col items-center justify-center;
}

.upload-component :deep(.el-upload--picture-card:hover) {
  @apply bg-blue-50;
}

.upload-component :deep(.el-upload-list--picture-card) {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4;
}

.upload-component :deep(.el-upload-list--picture-card .el-upload-list__item) {
  @apply w-full h-32 rounded-xl overflow-hidden;
}

.upload-tips {
  @apply list-none space-y-2 text-sm;
}

.upload-tips li {
  @apply flex items-center text-gray-600;
}

/* 结果页面样式 */
.result-actions {
  @apply flex flex-col sm:flex-row gap-4 justify-center;
}

/* 底部操作按钮 */
.action-buttons {
  @apply flex justify-between items-center mt-8 pt-6 border-t border-gray-100;
}

.action-buttons .el-button {
  @apply px-8 py-3 rounded-xl font-medium;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-steps--horizontal) {
  @apply flex justify-center;
}

:deep(.el-step__title) {
  @apply font-semibold text-gray-700;
}

:deep(.el-step__description) {
  @apply text-gray-500;
}

:deep(.el-step__icon.is-text) {
  @apply bg-blue-500 text-white border-blue-500;
}

:deep(.el-step__icon.is-process) {
  @apply bg-blue-500 border-blue-500;
}

:deep(.el-step__icon.is-finish) {
  @apply bg-green-500 border-green-500;
}

:deep(.el-alert) {
  @apply rounded-xl border-none;
}

:deep(.el-alert--info) {
  @apply bg-blue-50 text-blue-800;
}

:deep(.el-result) {
  @apply py-8;
}

:deep(.el-result__icon svg) {
  @apply w-16 h-16;
}

:deep(.el-result__title) {
  @apply text-2xl font-bold text-gray-800 mt-4;
}

:deep(.el-result__subtitle) {
  @apply text-gray-600 mt-2;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .check-page {
    @apply p-4;
  }
  
  .content-card :deep(.el-card__body) {
    @apply p-4;
  }
  
  .doctor-selection :deep(.el-col) {
    @apply mb-4;
  }
  
  .action-buttons {
    @apply flex-col space-y-4;
  }
  
  .action-buttons .el-button {
    @apply w-full;
  }
}

@media (max-width: 640px) {
  .steps-card :deep(.el-steps) {
    @apply px-4;
  }
  
  .upload-component :deep(.el-upload-list--picture-card) {
    @apply grid-cols-2;
  }
  
  .result-actions {
    @apply flex-col;
  }
  
  .result-actions .el-button {
    @apply w-full;
  }
}
</style>
