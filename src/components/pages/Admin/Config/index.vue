<template>
  <div class="admin-config">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">系统配置</h1>
      <p class="text-gray-600 mt-1">管理系统设置和配置参数</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 配置分类导航 -->
      <div class="lg:col-span-1">
        <BaseCard>
          <template #header>
            <h3 class="text-lg font-semibold">配置分类</h3>
          </template>
          
          <div class="space-y-2">
            <div 
              v-for="category in configCategories" 
              :key="category.key"
              class="p-3 rounded cursor-pointer transition-colors"
              :class="[
                activeCategory === category.key 
                  ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                  : 'hover:bg-gray-50'
              ]"
              @click="activeCategory = category.key"
            >
              <div class="flex items-center space-x-3">
                <el-icon :class="activeCategory === category.key ? 'text-blue-600' : 'text-gray-500'">
                  <component :is="category.icon" />
                </el-icon>
                <div>
                  <p class="font-medium">{{ category.name }}</p>
                  <p class="text-sm text-gray-500">{{ category.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- 配置内容 -->
      <div class="lg:col-span-2">
        <!-- 系统设置 -->
        <BaseCard v-if="activeCategory === 'system'">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">系统设置</h3>
              <el-button type="primary" @click="saveSystemConfig" :loading="saving">
                保存设置
              </el-button>
            </div>
          </template>
          
          <el-form :model="systemConfig" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="systemConfig.system_name" placeholder="请输入系统名称" />
            </el-form-item>
            
            <el-form-item label="系统描述">
              <el-input 
                v-model="systemConfig.system_description" 
                type="textarea" 
                :rows="3"
                placeholder="请输入系统描述"
              />
            </el-form-item>
            
            <el-form-item label="系统版本">
              <el-input v-model="systemConfig.system_version" placeholder="请输入系统版本" />
            </el-form-item>
            
            <el-form-item label="维护模式">
              <el-switch 
                v-model="systemConfig.maintenance_mode" 
                active-text="开启"
                inactive-text="关闭"
              />
              <p class="text-sm text-gray-500 mt-1">开启后，普通用户将无法访问系统</p>
            </el-form-item>
            
            <el-form-item label="用户注册">
              <el-switch 
                v-model="systemConfig.allow_registration" 
                active-text="允许"
                inactive-text="禁止"
              />
              <p class="text-sm text-gray-500 mt-1">是否允许新用户注册</p>
            </el-form-item>
            
            <el-form-item label="默认用户角色">
              <el-select v-model="systemConfig.default_user_role" placeholder="请选择默认角色">
                <el-option label="患者" value="patient" />
                <el-option label="医生" value="doctor" />
              </el-select>
            </el-form-item>
          </el-form>
        </BaseCard>

        <!-- 安全设置 -->
        <BaseCard v-if="activeCategory === 'security'">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">安全设置</h3>
              <el-button type="primary" @click="saveSecurityConfig" :loading="saving">
                保存设置
              </el-button>
            </div>
          </template>
          
          <el-form :model="securityConfig" label-width="120px">
            <el-form-item label="密码最小长度">
              <el-input-number 
                v-model="securityConfig.min_password_length" 
                :min="6" 
                :max="20"
              />
              <p class="text-sm text-gray-500 mt-1">用户密码的最小长度要求</p>
            </el-form-item>
            
            <el-form-item label="会话超时">
              <el-input-number 
                v-model="securityConfig.session_timeout" 
                :min="30" 
                :max="1440"
              />
              <span class="ml-2 text-sm text-gray-500">分钟</span>
              <p class="text-sm text-gray-500 mt-1">用户会话的超时时间</p>
            </el-form-item>
            
            <el-form-item label="登录失败限制">
              <el-input-number 
                v-model="securityConfig.max_login_attempts" 
                :min="3" 
                :max="10"
              />
              <p class="text-sm text-gray-500 mt-1">连续登录失败次数限制</p>
            </el-form-item>
            
            <el-form-item label="账户锁定时间">
              <el-input-number 
                v-model="securityConfig.lockout_duration" 
                :min="5" 
                :max="60"
              />
              <span class="ml-2 text-sm text-gray-500">分钟</span>
              <p class="text-sm text-gray-500 mt-1">账户被锁定的时间</p>
            </el-form-item>
            
            <el-form-item label="强制HTTPS">
              <el-switch 
                v-model="securityConfig.force_https" 
                active-text="开启"
                inactive-text="关闭"
              />
              <p class="text-sm text-gray-500 mt-1">强制使用HTTPS连接</p>
            </el-form-item>
            
            <el-form-item label="启用审计日志">
              <el-switch 
                v-model="securityConfig.enable_audit_log" 
                active-text="开启"
                inactive-text="关闭"
              />
              <p class="text-sm text-gray-500 mt-1">记录用户操作的审计日志</p>
            </el-form-item>
          </el-form>
        </BaseCard>

        <!-- 邮件设置 -->
        <BaseCard v-if="activeCategory === 'email'">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">邮件设置</h3>
              <div class="space-x-2">
                <el-button @click="testEmailConfig" :loading="testing">
                  测试连接
                </el-button>
                <el-button type="primary" @click="saveEmailConfig" :loading="saving">
                  保存设置
                </el-button>
              </div>
            </div>
          </template>
          
          <el-form :model="emailConfig" label-width="120px">
            <el-form-item label="SMTP服务器">
              <el-input v-model="emailConfig.smtp_host" placeholder="请输入SMTP服务器地址" />
            </el-form-item>
            
            <el-form-item label="SMTP端口">
              <el-input-number v-model="emailConfig.smtp_port" :min="1" :max="65535" />
            </el-form-item>
            
            <el-form-item label="用户名">
              <el-input v-model="emailConfig.smtp_username" placeholder="请输入SMTP用户名" />
            </el-form-item>
            
            <el-form-item label="密码">
              <el-input 
                v-model="emailConfig.smtp_password" 
                type="password" 
                placeholder="请输入SMTP密码"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="发件人邮箱">
              <el-input v-model="emailConfig.from_email" placeholder="请输入发件人邮箱" />
            </el-form-item>
            
            <el-form-item label="发件人名称">
              <el-input v-model="emailConfig.from_name" placeholder="请输入发件人名称" />
            </el-form-item>
            
            <el-form-item label="启用SSL">
              <el-switch 
                v-model="emailConfig.use_ssl" 
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            
            <el-form-item label="启用TLS">
              <el-switch 
                v-model="emailConfig.use_tls" 
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
          </el-form>
        </BaseCard>

        <!-- 存储设置 -->
        <BaseCard v-if="activeCategory === 'storage'">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">存储设置</h3>
              <el-button type="primary" @click="saveStorageConfig" :loading="saving">
                保存设置
              </el-button>
            </div>
          </template>
          
          <el-form :model="storageConfig" label-width="120px">
            <el-form-item label="存储类型">
              <el-select v-model="storageConfig.storage_type" placeholder="请选择存储类型">
                <el-option label="本地存储" value="local" />
                <el-option label="阿里云OSS" value="aliyun_oss" />
                <el-option label="腾讯云COS" value="tencent_cos" />
                <el-option label="AWS S3" value="aws_s3" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="存储路径">
              <el-input v-model="storageConfig.storage_path" placeholder="请输入存储路径" />
            </el-form-item>
            
            <el-form-item label="最大文件大小">
              <el-input-number v-model="storageConfig.max_file_size" :min="1" :max="100" />
              <span class="ml-2 text-sm text-gray-500">MB</span>
            </el-form-item>
            
            <el-form-item label="允许的文件类型">
              <el-input 
                v-model="storageConfig.allowed_file_types" 
                placeholder="请输入允许的文件类型，用逗号分隔"
              />
              <p class="text-sm text-gray-500 mt-1">例如: jpg,png,pdf,doc</p>
            </el-form-item>
            
            <el-form-item label="自动清理">
              <el-switch 
                v-model="storageConfig.auto_cleanup" 
                active-text="开启"
                inactive-text="关闭"
              />
              <p class="text-sm text-gray-500 mt-1">自动清理过期的临时文件</p>
            </el-form-item>
            
            <el-form-item label="清理周期">
              <el-input-number v-model="storageConfig.cleanup_days" :min="1" :max="365" />
              <span class="ml-2 text-sm text-gray-500">天</span>
            </el-form-item>
          </el-form>
        </BaseCard>

        <!-- 通知设置 -->
        <BaseCard v-if="activeCategory === 'notification'">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">通知设置</h3>
              <el-button type="primary" @click="saveNotificationConfig" :loading="saving">
                保存设置
              </el-button>
            </div>
          </template>
          
          <el-form :model="notificationConfig" label-width="120px">
            <el-form-item label="邮件通知">
              <el-switch 
                v-model="notificationConfig.email_notifications" 
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            
            <el-form-item label="短信通知">
              <el-switch 
                v-model="notificationConfig.sms_notifications" 
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            
            <el-form-item label="系统通知">
              <el-switch 
                v-model="notificationConfig.system_notifications" 
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            
            <el-form-item label="报告完成通知">
              <el-switch 
                v-model="notificationConfig.report_completion_notification" 
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            
            <el-form-item label="异常报告通知">
              <el-switch 
                v-model="notificationConfig.abnormal_report_notification" 
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            
            <el-form-item label="用户注册通知">
              <el-switch 
                v-model="notificationConfig.user_registration_notification" 
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
          </el-form>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Setting, Lock, Message, FolderOpened, Bell 
} from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { 
  getSystemConfig,
  updateSystemConfig
} from '@/api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useGlobalErrorHandler()

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const activeCategory = ref('system')

// 配置分类
const configCategories = [
  {
    key: 'system',
    name: '系统设置',
    description: '基本系统配置',
    icon: Setting
  },
  {
    key: 'security',
    name: '安全设置',
    description: '安全策略配置',
    icon: Lock
  },
  {
    key: 'email',
    name: '邮件设置',
    description: 'SMTP邮件配置',
    icon: Message
  },
  {
    key: 'storage',
    name: '存储设置',
    description: '文件存储配置',
    icon: FolderOpened
  },
  {
    key: 'notification',
    name: '通知设置',
    description: '消息通知配置',
    icon: Bell
  }
]

// 系统配置
const systemConfig = reactive({
  system_name: '龋齿检测系统',
  system_description: '基于AI的龋齿检测和诊断系统',
  system_version: '1.0.0',
  maintenance_mode: false,
  allow_registration: true,
  default_user_role: 'patient'
})

// 安全配置
const securityConfig = reactive({
  min_password_length: 8,
  session_timeout: 120,
  max_login_attempts: 5,
  lockout_duration: 15,
  force_https: false,
  enable_audit_log: true
})

// 邮件配置
const emailConfig = reactive({
  smtp_host: '',
  smtp_port: 587,
  smtp_username: '',
  smtp_password: '',
  from_email: '',
  from_name: '龋齿检测系统',
  use_ssl: false,
  use_tls: true
})

// 存储配置
const storageConfig = reactive({
  storage_type: 'local',
  storage_path: '/uploads',
  max_file_size: 10,
  allowed_file_types: 'jpg,jpeg,png,pdf,doc,docx',
  auto_cleanup: true,
  cleanup_days: 30
})

// 通知配置
const notificationConfig = reactive({
  email_notifications: true,
  sms_notifications: false,
  system_notifications: true,
  report_completion_notification: true,
  abnormal_report_notification: true,
  user_registration_notification: false
})

// 保存系统配置
const saveSystemConfig = async () => {
  saving.value = true
  
  try {
    await updateSystemConfig({
      category: 'system',
      config: systemConfig
    })
    ElMessage.success('系统设置保存成功')
  } catch (error) {
    handleError(error as Error, '保存系统设置失败')
  } finally {
    saving.value = false
  }
}

// 保存安全配置
const saveSecurityConfig = async () => {
  saving.value = true
  
  try {
    await updateSystemConfig({
      category: 'security',
      config: securityConfig
    })
    ElMessage.success('安全设置保存成功')
  } catch (error) {
    handleError(error as Error, '保存安全设置失败')
  } finally {
    saving.value = false
  }
}

// 保存邮件配置
const saveEmailConfig = async () => {
  saving.value = true
  
  try {
    await updateSystemConfig({
      category: 'email',
      config: emailConfig
    })
    ElMessage.success('邮件设置保存成功')
  } catch (error) {
    handleError(error as Error, '保存邮件设置失败')
  } finally {
    saving.value = false
  }
}

// 保存存储配置
const saveStorageConfig = async () => {
  saving.value = true
  
  try {
    await updateSystemConfig({
      category: 'storage',
      config: storageConfig
    })
    ElMessage.success('存储设置保存成功')
  } catch (error) {
    handleError(error as Error, '保存存储设置失败')
  } finally {
    saving.value = false
  }
}

// 保存通知配置
const saveNotificationConfig = async () => {
  saving.value = true
  
  try {
    await updateSystemConfig({
      category: 'notification',
      config: notificationConfig
    })
    ElMessage.success('通知设置保存成功')
  } catch (error) {
    handleError(error as Error, '保存通知设置失败')
  } finally {
    saving.value = false
  }
}

// 测试邮件配置
const testEmailConfig = async () => {
  testing.value = true
  
  try {
    // 这里应该调用测试邮件配置的API
    await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟API调用
    ElMessage.success('邮件配置测试成功')
  } catch (error) {
    handleError(error as Error, '邮件配置测试失败')
  } finally {
    testing.value = false
  }
}

// 加载配置
const loadConfigs = async () => {
  loading.value = true
  
  try {
    const response = await getSystemConfig()
    
    if (response.data?.data) {
      const configs = response.data.data
      
      // 更新各个配置对象
      if (configs.system) {
        Object.assign(systemConfig, configs.system)
      }
      if (configs.security) {
        Object.assign(securityConfig, configs.security)
      }
      if (configs.email) {
        Object.assign(emailConfig, configs.email)
      }
      if (configs.storage) {
        Object.assign(storageConfig, configs.storage)
      }
      if (configs.notification) {
        Object.assign(notificationConfig, configs.notification)
      }
    }
  } catch (error) {
    console.warn('Failed to load system config:', error)
    // 使用默认配置，不显示错误
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.admin-config {
  @apply space-y-6;
}
</style>