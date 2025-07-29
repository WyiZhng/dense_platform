<template>
  <div class="doctor-profile">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">医生资料</h1>
      <p class="text-gray-600 mt-1">管理您的个人信息和专业资料</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 个人信息卡片 -->
      <div class="lg:col-span-1">
        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">个人信息</h3>
          </template>

          <div class="text-center mb-6">
            <!-- 头像 -->
            <div class="relative inline-block">
              <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <el-icon size="48" class="text-blue-600">
                  <UserFilled />
                </el-icon>
              </div>
              <el-button size="small" class="absolute bottom-0 right-0" circle @click="uploadAvatar">
                <el-icon>
                  <Camera />
                </el-icon>
              </el-button>
            </div>

            <h4 class="text-lg font-semibold text-gray-900">{{ doctorInfo.name || '未设置' }}</h4>
            <p class="text-sm text-gray-500">{{ doctorInfo.position || '医生' }}</p>
            <p class="text-sm text-gray-500">{{ doctorInfo.workplace || '未设置工作单位' }}</p>
          </div>

          <!-- 基本信息 -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">用户ID</span>
              <span class="text-sm font-medium">{{ doctorInfo.id || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">性别</span>
              <span class="text-sm font-medium">{{ getSexText(doctorInfo.sex) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">出生日期</span>
              <span class="text-sm font-medium">{{ doctorInfo.birth || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">手机号</span>
              <span class="text-sm font-medium">{{ doctorInfo.phone || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">邮箱</span>
              <span class="text-sm font-medium">{{ doctorInfo.email || '未设置' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">地址</span>
              <span class="text-sm font-medium">{{ doctorInfo.address || '未设置' }}</span>
            </div>
          </div>

          <div class="mt-6">
            <el-button type="primary" class="w-full" @click="handleEditDialogOpen">
              编辑资料
            </el-button>
          </div>
        </BaseCard>

        <!-- 统计信息 -->
        <BaseCard class="mt-6">
          <template #header>
            <h3 class="text-lg font-semibold">工作统计</h3>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <el-icon class="text-blue-600">
                    <Document />
                  </el-icon>
                </div>
                <div>
                  <p class="text-sm text-gray-600">总报告数</p>
                  <p class="font-semibold">{{ statistics.total_reports || 0 }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <el-icon class="text-green-600">
                    <Check />
                  </el-icon>
                </div>
                <div>
                  <p class="text-sm text-gray-600">已完成</p>
                  <p class="font-semibold">{{ statistics.completed_reports || 0 }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <el-icon class="text-orange-600">
                    <Clock />
                  </el-icon>
                </div>
                <div>
                  <p class="text-sm text-gray-600">待处理</p>
                  <p class="font-semibold">{{ statistics.pending_reports || 0 }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <el-icon class="text-purple-600">
                    <TrendCharts />
                  </el-icon>
                </div>
                <div>
                  <p class="text-sm text-gray-600">完成率</p>
                  <p class="font-semibold">{{ (statistics.completion_rate || 0).toFixed(1) }}%</p>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- 详细信息和设置 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 专业信息 -->
        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">专业信息</h3>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">职位</label>
              <p class="text-sm text-gray-900 p-3 bg-gray-50 rounded">
                {{ doctorInfo.position || '未设置' }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">工作单位</label>
              <p class="text-sm text-gray-900 p-3 bg-gray-50 rounded">
                {{ doctorInfo.workplace || '未设置' }}
              </p>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">专业描述</label>
              <p class="text-sm text-gray-900 p-3 bg-gray-50 rounded min-h-20">
                {{ doctorInfo.description || '暂无专业描述' }}
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- 账户设置 -->
        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">账户设置</h3>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 class="font-medium text-gray-900">修改密码</h4>
                <p class="text-sm text-gray-500">定期更新密码以保护账户安全</p>
              </div>
              <el-button @click="showPasswordDialog = true">
                修改密码
              </el-button>
            </div>

            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 class="font-medium text-gray-900">通知设置</h4>
                <p class="text-sm text-gray-500">管理您接收的通知类型</p>
              </div>
              <el-button @click="showNotificationDialog = true">
                设置通知
              </el-button>
            </div>

            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 class="font-medium text-gray-900">隐私设置</h4>
                <p class="text-sm text-gray-500">控制您的信息可见性</p>
              </div>
              <el-button @click="showPrivacyDialog = true">
                隐私设置
              </el-button>
            </div>
          </div>
        </BaseCard>

        <!-- 最近活动 -->
        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">最近活动</h3>
          </template>

          <div class="space-y-3">
            <div v-for="activity in recentActivities" :key="activity.id"
              class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <el-icon class="text-green-600" size="16">
                  <Check />
                </el-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ formatDateTime(activity.timestamp) }}</p>
              </div>
            </div>
            <div v-if="recentActivities.length === 0" class="text-center text-gray-500 py-4">
              暂无最近活动
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑医生资料" width="600px" @close="resetEditForm">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="性别" prop="sex">
          <el-select v-model="editForm.sex" placeholder="请选择性别">
            <el-option label="女" :value="0" />
            <el-option label="男" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="出生日期" prop="birth">
          <el-date-picker v-model="editForm.birth" type="date" placeholder="请选择出生日期" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input v-model="editForm.address" placeholder="请输入地址" />
        </el-form-item>

        <el-form-item label="职位" prop="position">
          <el-input v-model="editForm.position" placeholder="请输入职位" />
        </el-form-item>

        <el-form-item label="工作单位" prop="workplace">
          <el-input v-model="editForm.workplace" placeholder="请输入工作单位" />
        </el-form-item>

        <el-form-item label="专业描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入专业描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProfile" :loading="updateLoading">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="500px" @close="resetPasswordForm">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
          修改密码
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UserFilled, Camera, Document, Check, Clock, TrendCharts
} from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import {
  getDoctorInfo,
  updateDoctorInfo,
  changePassword,
  getDoctorStatistics
} from '@/api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'
import { useCommonStore } from '@/store'

const { handleError } = useGlobalErrorHandler()
const store = useCommonStore()

// 响应式数据
const loading = ref(false)
const updateLoading = ref(false)
const passwordLoading = ref(false)
const doctorInfo = ref<any>({})
const statistics = ref<any>({})
const recentActivities = ref<any[]>([])
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const showNotificationDialog = ref(false)
const showPrivacyDialog = ref(false)

// 编辑表单
const editForm = reactive({
  name: '',
  sex: null as number | null,
  birth: '',
  phone: '',
  email: '',
  address: '',
  position: '',
  workplace: '',
  description: ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单引用
const editFormRef = ref()
const passwordFormRef = ref()

// 表单验证规则
const editRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
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

// 上传头像
const uploadAvatar = () => {
  ElMessage.info('头像上传功能开发中...')
}

// 加载医生信息
const loadDoctorInfo = async () => {
  loading.value = true

  try {
    const [infoRes, statsRes] = await Promise.all([
      getDoctorInfo(),
      getDoctorStatistics()
    ])

    if (infoRes.data?.data) {
      doctorInfo.value = infoRes.data.data
    }

    if (statsRes.data?.data) {
      statistics.value = statsRes.data.data
    }

    // 模拟最近活动数据
    recentActivities.value = [
      {
        id: 1,
        description: '完成了患者张三的诊断报告',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        description: '参与了疑难病例的协作诊断',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        description: '更新了个人专业信息',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ]

  } catch (error) {
    handleError(error as Error, '加载医生信息失败')
  } finally {
    loading.value = false
  }
}

// 更新个人资料
const handleUpdateProfile = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    updateLoading.value = true

    await updateDoctorInfo(editForm)
    ElMessage.success('个人资料更新成功')
    showEditDialog.value = false
    await loadDoctorInfo() // 重新加载数据

  } catch (error) {
    if (error !== false) {
      handleError(error as Error, '更新个人资料失败')
    }
  } finally {
    updateLoading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true

    // 使用store中的username而不是doctorInfo.id
    const username = store.username

    console.log('修改密码请求参数:', {
      username: username,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    // 确保用户名不为空
    if (!username) {
      throw new Error('用户信息未加载，请刷新页面重试')
    }

    const response = await changePassword(
      username,
      passwordForm.oldPassword,
      passwordForm.newPassword
    )

    if (response.data.code === 0) {
      ElMessage.success(response.data.message || '密码修改成功，请重新登录')
      showPasswordDialog.value = false
      resetPasswordForm()

      // 可以选择自动跳转到登录页面
      setTimeout(() => {
        // 清除登录状态
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        // 跳转到登录页面
        window.location.href = '/login'
      }, 2000)
    } else {
      ElMessage.error(response.data.message || '密码修改失败')
    }

  } catch (error: any) {
    console.error('修改密码失败:', error)

    // 处理具体的错误类型
    if (error.response?.status === 400) {
      const errorData = error.response.data
      if (errorData.message) {
        ElMessage.error(errorData.message)
      } else if (errorData.detail) {
        ElMessage.error(errorData.detail)
      } else {
        ElMessage.error('请求参数错误')
      }
    } else if (error.response?.status === 401) {
      ElMessage.error('当前密码错误')
    } else if (error.response?.status === 422) {
      ElMessage.error('新密码不符合安全要求')
    } else if (error.code === 'UNAUTHORIZED') {
      ElMessage.error('当前密码错误')
    } else if (error.code === 'VALIDATION_ERROR') {
      ElMessage.error('新密码不符合设置条件')
    } else if (error !== false) {
      ElMessage.error(error.message || '密码修改失败，请稍后重试')
    }
  } finally {
    passwordLoading.value = false
  }
}

// 重置表单
const resetEditForm = () => {
  editFormRef.value?.resetFields()
}

const resetPasswordForm = () => {
  passwordFormRef.value?.resetFields()
  Object.assign(passwordForm, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

// 初始化编辑表单
const initEditForm = () => {
  Object.assign(editForm, {
    name: doctorInfo.value.name || '',
    sex: doctorInfo.value.sex,
    birth: doctorInfo.value.birth || '',
    phone: doctorInfo.value.phone || '',
    email: doctorInfo.value.email || '',
    address: doctorInfo.value.address || '',
    position: doctorInfo.value.position || '',
    workplace: doctorInfo.value.workplace || '',
    description: doctorInfo.value.description || ''
  })
}

// 监听编辑对话框打开
const handleEditDialogOpen = () => {
  initEditForm()
  showEditDialog.value = true
}

// 组件挂载时加载数据
onMounted(() => {
  loadDoctorInfo()
})
</script>

<style scoped>
.doctor-profile {
  @apply space-y-6;
}
</style>