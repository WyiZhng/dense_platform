<template>
  <div class="space-y-6">
    <!-- 个人头像 -->
    <BaseCard>
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2 text-blue-500">
            <UserFilled />
          </el-icon>
          <span class="text-lg font-medium">个人头像</span>
        </div>
      </template>

      <div class="flex items-center space-x-6">
        <el-avatar :size="100" :src="avatarUrl" class="border-4 border-gray-100" />
        <div class="space-y-3">
          <Upload @onSuccess="handleAvatarSuccess" class="upload-avatar" />
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
          <el-icon class="mr-2 text-blue-500">
            <Document />
          </el-icon>
          <span class="text-lg font-medium">基本信息</span>
        </div>
      </template>

      <BaseForm :model="store.detail" label-width="100px" class="max-w-2xl">
        <el-form-item label="用户ID" class="mb-6">
          <el-input v-model="store.username" disabled />
        </el-form-item>

        <el-form-item label="姓名" class="mb-6">
          <el-input v-model="store.detail.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="性别" class="mb-6">
          <el-radio-group v-model="store.detail.sex">
            <el-radio :value="0">女</el-radio>
            <el-radio :value="1">男</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="出生日期" class="mb-6">
          <el-date-picker v-model="store.detail.birth" type="date" placeholder="选择日期" value-format="YYYY-MM-DD"
            class="w-full" />
          <!-- 这里修复了日期格式化的问题,但是没有测试 -->
        </el-form-item>

        <el-form-item label="联系电话" class="mb-6">
          <el-input v-model="store.detail.phone" placeholder="请输入联系电话" maxlength="11" />
        </el-form-item>

        <el-form-item label="邮箱" class="mb-6">
          <el-input v-model="store.detail.email" placeholder="请输入邮箱地址" type="email" />
        </el-form-item>

        <el-form-item label="居住地址" class="mb-6">
          <el-input v-model="store.detail.address" placeholder="请输入居住地址" type="textarea" :rows="2" />
        </el-form-item>
      </BaseForm>

      <div class="flex justify-end mt-6">
        <el-button type="primary" @click="saveUserInfo">保存修改</el-button>
      </div>
    </BaseCard>

    <!-- 密码修改 -->
    <BaseCard>
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2 text-blue-500">
            <Lock />
          </el-icon>
          <span class="text-lg font-medium">修改密码</span>
        </div>
      </template>

      <ChangePassword />
    </BaseCard>

    <!-- 医生专属信息 -->
    <BaseCard v-if="store.usertype === UserType.Doctor">
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2 text-blue-500">
            <Stethoscope />
          </el-icon>
          <span class="text-lg font-medium">执业信息</span>
        </div>
      </template>

      <BaseForm :model="doctorForm" label-width="100px" class="max-w-2xl">
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
import { ref, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled, Document, Document as Stethoscope, Lock } from '@element-plus/icons-vue'
import { useCommonStore } from '@/store'
import { UserType } from '@/common'
import { updateUserInfo, updateDoctorInfo, uploadAvatar, getUserInfo, getDoctorInfo, getCurrentUser } from '@/api'
import Upload from './parts/Upload.vue'
import ChangePassword from './parts/ChangePassword.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseForm from '@/components/common/BaseForm.vue'
import { onMounted } from 'vue'
import type { VueCookies } from 'vue-cookies'

const store = useCommonStore()
const avatarUrl = ref('')
const $cookies = inject<VueCookies>('$cookies')

const doctorForm = ref({
  workplace: '',
  position: ''
})

// Load user info on component mount
onMounted(async () => {
  try {
    // Load avatar first
    await loadAvatar()
    
    // Get current user info
    const userResponse = await getCurrentUser()
    if (userResponse.data.code === 0) {
      const userData = userResponse.data.data
      store.usertype = userData.user_type

      // Load detailed user info
      const detailResponse = await getUserInfo()
      console.log('用户详细信息响应:', detailResponse.data)

      if (detailResponse.data.code === 0) {
        // 确保有默认值，防止null错误
        const userDetail = detailResponse.data.form || detailResponse.data.data || {}
        store.detail = {
          name: userDetail.name || '',
          sex: userDetail.sex !== undefined ? userDetail.sex : null,
          birth: userDetail.birth || '',
          phone: userDetail.phone || '',
          email: userDetail.email || '',
          password: '',
          address: userDetail.address || ''
        }
      } else if (detailResponse.data.code === 33) {
        // 用户没有设置信息的情况
        console.log('用户没有设置详细信息，使用默认值')
        store.detail = {
          name: store.username || '',
          sex: null,
          birth: '',
          phone: '',
          email: '',
          password: '',
          address: ''
        }
      }

      // If user is a doctor, load doctor info
      if (userData.user_type === UserType.Doctor) {
        try {
          const doctorResponse = await getDoctorInfo()
          if (doctorResponse.data.code === 0) {
            doctorForm.value = doctorResponse.data.data || { workplace: '', position: '' }
          }
        } catch (error) {
          console.log('Doctor info not available')
          doctorForm.value = { workplace: '', position: '' }
        }
      }
    }
  } catch (error) {
    console.error("获取用户信息失败", error)
    ElMessage.error('获取用户信息失败')

    // 设置默认值以防止null错误
    store.detail = {
      name: store.username || '',
      sex: null,
      birth: '',
      phone: '',
      email: '',
      password: '',
      address: ''
    }
  }
})

// 加载用户头像
const loadAvatar = async () => {
  try {
    const token = $cookies?.get('token')
    console.log('加载头像，token:', token ? `${token.substring(0, 10)}...` : 'null')
    
    const response = await fetch('http://127.0.0.1:8889/api/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('头像API响应状态:', response.status)
    
    if (response.ok) {
      const blob = await response.blob()
      avatarUrl.value = URL.createObjectURL(blob)
      console.log('头像加载成功')
    } else {
      const errorText = await response.text()
      console.log('头像加载失败:', response.status, errorText)
    }
  } catch (error) {
    console.log('加载头像异常:', error)
    // 头像加载失败是正常的，用户可能没有设置头像
  }
}

// 头像上传成功处理
const handleAvatarSuccess = async (response: any) => {
  try {
    console.log('头像上传响应:', response)
    const result = await uploadAvatar(parseInt(response.image))
    if (result.data.code == 0) {
      ElMessage.success('头像设置成功')
      // 重新加载头像
      await loadAvatar()
    } else {
      ElMessage.error('头像设置失败')
    }
  } catch (error) {
    console.error('头像上传错误:', error)
    ElMessage.error('头像上传失败')
  }
}

// 保存用户基本信息
const saveUserInfo = async () => {
  try {
    const result = await updateUserInfo(store.detail)
    if (result.data.code === 0) {
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
    const result = await updateDoctorInfo(doctorForm.value)
    if (result.data.code === 0) {
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
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-avatar :deep(.avatar-uploader):hover {
  border-color: #3b82f6;
}

.upload-avatar :deep(.avatar-uploader-icon) {
  color: #9ca3af;
  font-size: 1.25rem;
}
</style>
