<template>
  <div class="check-container">
    <!-- 左侧步骤说明区域 -->
    <div class="w-1/4 bg-gradient-to-b from-blue-500 to-blue-600 text-white p-8 rounded-l-2xl">
      <div class="sticky top-8">
        <h2 class="text-2xl font-bold mb-8">龋齿检测</h2>
        
        <div class="space-y-8">
          <div 
            v-for="(s, index) in steps" 
            :key="index"
            class="step-item"
            :class="{ 
              'active': step === index,
              'completed': step > index 
            }"
          >
            <div class="step-number">
              <span v-if="step > index">
                <el-icon><Check /></el-icon>
              </span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="space-y-1">
              <div class="text-lg font-medium">{{ s.title }}</div>
              <div class="text-sm opacity-80">{{ s.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="flex-1 p-8">
      <!-- 步骤1：选择医生 -->
      <div v-if="step === 0" class="animate-fade-in">
        <div class="max-w-2xl mx-auto">
          <h3 class="text-xl font-medium mb-6">选择您的主治医生</h3>
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="doctor in doctors"
              :key="doctor.id"
              class="doctor-card"
              :class="{ 'selected': form.doctor === doctor.id }"
              @click="form.doctor = doctor.id"
            >
              <div class="flex items-center space-x-4">
                <el-avatar 
                  :size="48" 
                  class="bg-blue-100 text-blue-600"
                >
                  {{ doctor.name.charAt(0) }}
                </el-avatar>
                <div>
                  <div class="text-lg font-medium">{{ doctor.name }}</div>
                  <div class="text-gray-500">{{ doctor.workplace }}</div>
                  <div class="text-sm text-gray-400">{{ doctor.position }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤2：上传图片 -->
      <div v-if="step === 1" class="animate-fade-in">
        <div class="max-w-3xl mx-auto">
          <h3 class="text-xl font-medium mb-6">上传口腔照片</h3>
          <div class="upload-container">
            <Uploads 
              @onSuccess="handleUploadSuccess"
              class="upload-area"
            />
            <div class="upload-tips">
              <div class="tip-item">
                <el-icon class="text-blue-500"><InfoFilled /></el-icon>
                <span>请上传清晰的口腔照片</span>
              </div>
              <div class="tip-item">
                <el-icon class="text-blue-500"><Picture /></el-icon>
                <span>支持 jpg、png 格式</span>
              </div>
              <div class="tip-item">
                <el-icon class="text-blue-500"><Upload /></el-icon>
                <span>单张图片不超过 4MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤3：完成 -->
      <div v-if="step === 2" class="animate-fade-in">
        <div class="success-container">
          <div class="success-icon">
            <el-icon><Check /></el-icon>
          </div>
          <h3 class="text-2xl font-bold mt-6">提交成功</h3>
          <p class="text-gray-500 mt-2">
            请耐心等待，您的检测将在3-5个工作日内完成
          </p>
          <div class="mt-8 space-x-4">
            <el-button 
              type="primary" 
              size="large"
              @click="goToHistory"
            >
              查看检测记录
            </el-button>
            <el-button 
              size="large"
              @click="router.push('/user/home')"
            >
              返回首页
            </el-button>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div 
        v-if="step !== 2"
        class="fixed bottom-0 left-1/4 right-0 bg-white border-t p-4 flex justify-end space-x-4"
      >
        <el-button 
          v-if="step > 0" 
          @click="prevStep"
          size="large"
        >
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
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from "vue"
import { ElMessage } from 'element-plus'
import { User, Upload, Check, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
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
}[]>()

// 获取医生列表
const $cookies = inject<VueCookies>('$cookies')
if($cookies?.isKey("token")){
  getDoctors($cookies?.get('token')).then((x) => {
    doctors.value = x.data.doctors
  }).catch(() => {
    ElMessage.error('获取医生列表失败')
  })
}

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
      await submitReport($cookies?.get('token'), form.value.doctor, form.value.images)
      await router.push('history')
    } catch (error) {
      ElMessage.error('提交失败，请重试')
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
.check-container {
  @apply flex h-[calc(100vh-64px)] bg-gray-50;
}

.step-item {
  @apply flex items-start space-x-4 p-4 rounded-lg transition-colors;
}

.step-item.active {
  @apply bg-white bg-opacity-10;
}

.step-item.completed .step-number {
  @apply bg-green-400;
}

.step-number {
  @apply w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center 
         text-sm font-medium shrink-0;
}

.doctor-card {
  @apply p-6 rounded-xl border-2 border-gray-200 cursor-pointer
         transition-all duration-300 hover:border-blue-500 hover:shadow-md;
}

.doctor-card.selected {
  @apply border-blue-500 bg-blue-50;
}

.upload-container {
  @apply bg-white rounded-xl p-8 shadow-sm;
}

.upload-tips {
  @apply mt-6 space-y-3;
}

.tip-item {
  @apply flex items-center space-x-2 text-gray-600;
}

.success-container {
  @apply text-center max-w-lg mx-auto mt-20;
}

.success-icon {
  @apply w-20 h-20 rounded-full bg-green-100 text-green-500 
         flex items-center justify-center mx-auto text-4xl;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 上传区域样式 */
.upload-area :deep(.el-upload--picture-card) {
  @apply w-full h-48 border-2 border-dashed border-gray-300 
         hover:border-blue-500 transition-colors rounded-xl
         flex flex-col items-center justify-center;
}

.upload-area :deep(.el-upload-list--picture-card) {
  @apply grid grid-cols-3 gap-4 mt-4;
}

.upload-area :deep(.el-upload-list--picture-card .el-upload-list__item) {
  @apply w-full h-48 rounded-xl overflow-hidden;
}
</style>
