<template>
  <div class="space-y-6">
    <!-- 个人头像 -->
    <BaseCard>
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2 text-blue-500"><UserFilled /></el-icon>
          <span class="text-lg font-medium">个人头像</span>
        </div>
      </template>
      
      <div class="flex items-center space-x-6">
        <el-avatar 
          :size="100" 
          :src="avatarUrl" 
          class="border-4 border-gray-100"
        />
        <div class="space-y-3">
          <Upload 
            @onSuccess="handleAvatarSuccess"
            class="upload-avatar"
          />
          <div class="text-gray-500 text-sm">
            支持 jpg、png、webp 格式，文件小于 4MB
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- 基本信息 -->
    <BaseCard>
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2 text-blue-500"><Document /></el-icon>
          <span class="text-lg font-medium">基本信息</span>
        </div>
      </template>

      <BaseForm 
        :model="store.detail" 
        label-width="100px"
        class="max-w-2xl"
      >
        <el-form-item label="用户ID" class="mb-6">
          <el-input v-model="store.username" disabled />
        </el-form-item>

        <el-form-item label="姓名" class="mb-6">
          <el-input v-model="store.detail.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="性别" class="mb-6">
          <el-radio-group v-model="store.detail.sex">
            <el-radio :label="0">女</el-radio>
            <el-radio :label="1">男</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="出生日期" class="mb-6">
          <el-date-picker
            v-model="store.detail.birth"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="联系电话" class="mb-6">
          <el-input 
            v-model="store.detail.phone"
            placeholder="请输入联系电话"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="邮箱" class="mb-6">
          <el-input 
            v-model="store.detail.email"
            placeholder="请输入邮箱地址"
            type="email"
          />
        </el-form-item>

        <el-form-item label="居住地址" class="mb-6">
          <el-input 
            v-model="store.detail.address"
            placeholder="请输入居住地址"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </BaseForm>

      <div class="flex justify-end mt-6">
        <el-button type="primary" @click="saveUserInfo">保存修改</el-button>
      </div>
    </BaseCard>

    <!-- 医生专属信息 -->
    <BaseCard v-if="store.usertype === UserType.Doctor">
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2 text-blue-500"><Stethoscope /></el-icon>
          <span class="text-lg font-medium">执业信息</span>
        </div>
      </template>

      <BaseForm 
        :model="doctorForm" 
        label-width="100px"
        class="max-w-2xl"
      >
        <el-form-item label="所属医院" class="mb-6">
          <el-input v-model="doctorForm.workplace" placeholder="请输入医院名称" />
        </el-form-item>

        <el-form-item label="所属科室" class="mb-6">
          <el-input v-model="doctorForm.position" placeholder="请输入科室名称" />
        </el-form-item>
      </BaseForm>

      <div class="flex justify-end mt-6">
        <el-button type="primary" @click="saveDoctorInfo">保存修改</el-button>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled, Document,Document as Stethoscope } from '@element-plus/icons-vue'
import { useCommonStore } from '@/store'
import { UserType } from '@/common'
import { submitUserInfo, submitDoctorInfo, uploadAvatar } from '@/api'
import Upload from './parts/Upload.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseForm from '@/components/common/BaseForm.vue'
import { useCookies } from '@/common'

const store = useCommonStore()
const $cookies = useCookies()
const avatarUrl = ref('')

const doctorForm = ref({
  workplace: '',
  position: ''
})

// 头像上传成功处理
const handleAvatarSuccess = async (response: any) => {
  try {
    const result = await uploadAvatar($cookies.get('token'), response.image)
    if (result.data.code === '0') {
      ElMessage.success('头像上传成功')
      avatarUrl.value = URL.createObjectURL(response.raw)
    }
  } catch (error) {
    ElMessage.error('头像上传失败')
  }
}

// 保存用户基本信息
const saveUserInfo = async () => {
  try {
    const result = await submitUserInfo($cookies.get('token'), store.detail)
    if (result.data.code === '0') {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error('保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 保存医生信息
const saveDoctorInfo = async () => {
  try {
    const result = await submitDoctorInfo($cookies.get('token'), doctorForm.value)
    if (result.data.code === '0') {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error('保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
.upload-avatar :deep(.avatar-uploader) {
  @apply border-2 border-dashed border-gray-300 rounded-lg 
         hover:border-blue-500 transition-colors cursor-pointer;
}

.upload-avatar :deep(.avatar-uploader-icon) {
  @apply text-gray-400 text-xl;
} 
</style>
