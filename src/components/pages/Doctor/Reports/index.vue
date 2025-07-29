<template>
  <div class="doctor-reports">
    <!-- 页面标题和操作 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">报告管理</h1>
        <p class="text-gray-600 mt-1">管理和诊断患者报告</p>
      </div>
      <div class="flex space-x-3">
        <el-button @click="refreshData" :loading="loading">
          <el-icon class="mr-2"><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <BaseCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <el-select
          v-model="filterForm.status"
          placeholder="报告状态"
          clearable
          @change="handleFilter"
        >
          <el-option label="待处理" value="Checking" />
          <el-option label="已完成" value="Completed" />
          <el-option label="异常" value="Abnormality" />
          <el-option label="错误" value="Error" />
        </el-select>
        
        <el-input
          v-model="filterForm.patientId"
          placeholder="患者ID"
          clearable
          @input="handleFilter"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        
        <el-date-picker
          v-model="filterForm.dateFrom"
          type="date"
          placeholder="开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleFilter"
        />
        
        <el-date-picker
          v-model="filterForm.dateTo"
          type="date"
          placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleFilter"
        />
        
        <el-button @click="resetFilter">重置筛选</el-button>
      </div>
    </BaseCard>

    <!-- 报告列表 -->
    <BaseCard>
      <BaseTable
        :data="reports"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="id" label="报告ID" width="100" />
        <el-table-column prop="patient_name" label="患者姓名" width="120">
          <template #default="{ row }">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <el-icon class="text-blue-600" size="14"><User /></el-icon>
              </div>
              <div>
                <p class="font-medium">{{ row.patient_name }}</p>
                <p class="text-xs text-gray-500">{{ row.user }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.submitTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="current_status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusType(row.current_status)" 
              size="small"
            >
              {{ getStatusText(row.current_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="images" label="图像" width="80">
          <template #default="{ row }">
            <el-badge :value="row.images?.length || 0" class="item">
              <el-icon class="text-blue-500"><Picture /></el-icon>
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column prop="diagnose" label="诊断" min-width="200">
          <template #default="{ row }">
            <div v-if="row.diagnose" class="text-sm">
              <p class="line-clamp-2">{{ row.diagnose }}</p>
            </div>
            <span v-else class="text-gray-400 text-sm">待诊断</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="flex space-x-2">
              <el-button size="small" @click="viewReport(row.id)">
                查看
              </el-button>
              <el-button 
                v-if="row.current_status === 0 || row.current_status === 'Checking'"
                size="small" 
                type="primary" 
                @click="startDiagnosis(row)"
              >
                诊断
              </el-button>
              <el-button 
                v-if="row.current_status === 1 || row.current_status === 'Completed'"
                size="small" 
                type="success" 
                @click="viewReport(row.id)"
              >
                已完成
              </el-button>
              <el-dropdown 
                v-if="row.current_status === 0 || row.current_status === 'Checking'"
                @command="(command) => handleQuickAction(command, row)"
              >
                <el-button size="small">
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="complete">标记完成</el-dropdown-item>
                    <el-dropdown-item command="abnormal">标记异常</el-dropdown-item>
                    <el-dropdown-item command="consult">请求会诊</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </BaseTable>
    </BaseCard>

    <!-- 快速诊断对话框 -->
    <el-dialog
      v-model="showDiagnosisDialog"
      title="快速诊断"
      width="800px"
      @close="resetDiagnosisForm"
    >
      <div v-if="currentReport">
        <!-- 患者信息 -->
        <div class="mb-4 p-4 bg-gray-50 rounded">
          <h4 class="font-medium mb-2">患者信息</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>患者姓名: {{ currentReport.patient_name }}</div>
            <div>患者ID: {{ currentReport.user }}</div>
            <div>提交时间: {{ formatDateTime(currentReport.submitTime) }}</div>
            <div>图像数量: {{ currentReport.images?.length || 0 }}</div>
          </div>
        </div>

        <!-- 诊断表单 -->
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
              :rows="4"
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
          
          <el-form-item label="备注" prop="notes">
            <el-input
              v-model="diagnosisForm.notes"
              type="textarea"
              :rows="2"
              placeholder="可选的额外备注..."
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="showDiagnosisDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDiagnosis" :loading="diagnosisLoading">
          保存诊断
        </el-button>
      </template>
    </el-dialog>

    <!-- 会诊请求对话框 -->
    <el-dialog
      v-model="showConsultDialog"
      title="请求会诊"
      width="600px"
      @close="resetConsultForm"
    >
      <el-form
        ref="consultFormRef"
        :model="consultForm"
        :rules="consultRules"
        label-width="100px"
      >
        <el-form-item label="会诊医生" prop="consultingDoctorId">
          <el-select 
            v-model="consultForm.consultingDoctorId" 
            placeholder="请选择会诊医生"
            filterable
          >
            <el-option
              v-for="doctor in availableDoctors"
              :key="doctor.id"
              :label="doctor.name"
              :value="doctor.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="会诊原因" prop="consultationReason">
          <el-input
            v-model="consultForm.consultationReason"
            type="textarea"
            :rows="3"
            placeholder="请描述需要会诊的原因..."
          />
        </el-form-item>
        
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="consultForm.priority" placeholder="请选择优先级">
            <el-option label="低" value="low" />
            <el-option label="普通" value="normal" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showConsultDialog = false">取消</el-button>
        <el-button type="primary" @click="submitConsultation" :loading="consultLoading">
          发送请求
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, User, Picture, ArrowDown } from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import { 
  getReports,
  updateReportStatus,
  getDoctors
} from '@/api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'

const router = useRouter()
const { handleError } = useGlobalErrorHandler()

// 响应式数据
const loading = ref(false)
const diagnosisLoading = ref(false)
const consultLoading = ref(false)
const reports = ref<any[]>([])
const availableDoctors = ref<any[]>([])
const showDiagnosisDialog = ref(false)
const showConsultDialog = ref(false)
const currentReport = ref<any>(null)

// 筛选表单
const filterForm = reactive({
  status: '',
  patientId: '',
  dateFrom: '',
  dateTo: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 诊断表单
const diagnosisForm = reactive({
  diagnose: '',
  status: 'Completed',
  notes: ''
})

// 会诊表单
const consultForm = reactive({
  consultingDoctorId: '',
  consultationReason: '',
  priority: 'normal'
})

// 表单引用
const diagnosisFormRef = ref()
const consultFormRef = ref()

// 表单验证规则
const diagnosisRules = {
  diagnose: [
    { required: true, message: '请输入诊断结果', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择报告状态', trigger: 'change' }
  ]
}

const consultRules = {
  consultingDoctorId: [
    { required: true, message: '请选择会诊医生', trigger: 'change' }
  ],
  consultationReason: [
    { required: true, message: '请输入会诊原因', trigger: 'blur' }
  ]
}

// 状态枚举定义（与用户首页保持一致）
enum Status {
  Checking = 0,
  Completed = 1,
  Abnormality = 2,
  Error = 3,
}

// 状态相关方法
const getStatusType = (status: string | number) => {
  // 处理数字状态（后端IntEnum）和字符串状态
  const statusValue = typeof status === 'number' ? status : parseInt(status)
  
  console.log('Status type check:', status, 'Parsed:', statusValue) // 调试日志
  
  switch (statusValue) {
    case Status.Checking: // 0
    case 'Checking': 
      return 'warning'
    case Status.Completed: // 1
    case 'Completed': 
      return 'success'
    case Status.Abnormality: // 2
    case 'Abnormality': 
      return 'danger'
    case Status.Error: // 3
    case 'Error': 
      return 'info'
    default: 
      return 'info'
  }
}

const getStatusText = (status: string | number) => {
  // 处理数字状态（后端IntEnum）和字符串状态
  const statusValue = typeof status === 'number' ? status : parseInt(status)
  
  console.log('Status text check:', status, 'Parsed:', statusValue) // 调试日志
  
  switch (statusValue) {
    case Status.Checking: // 0
    case 'Checking': 
      return '检测中'
    case Status.Completed: // 1
    case 'Completed': 
      return '检测完成'
    case Status.Abnormality: // 2
    case 'Abnormality': 
      return '状态异常'
    case Status.Error: // 3
    case 'Error': 
      return '检测错误'
    default: 
      return '未知'
  }
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 加载报告列表
const loadReports = async () => {
  loading.value = true
  
  try {
    console.log('正在加载报告列表...')
    const response = await getReports()
    console.log('报告列表响应:', response.data)
    
    if (response.data?.code === 0) {
      reports.value = response.data.reports || []
      pagination.total = reports.value.length
      
      // 应用前端筛选
      if (filterForm.status || filterForm.patientId || filterForm.dateFrom || filterForm.dateTo) {
        reports.value = reports.value.filter(report => {
          let match = true
          
          if (filterForm.status && report.current_status !== filterForm.status) {
            match = false
          }
          
          if (filterForm.patientId && !report.user.includes(filterForm.patientId)) {
            match = false
          }
          
          if (filterForm.dateFrom) {
            const reportDate = new Date(report.submitTime)
            const fromDate = new Date(filterForm.dateFrom)
            if (reportDate < fromDate) {
              match = false
            }
          }
          
          if (filterForm.dateTo) {
            const reportDate = new Date(report.submitTime)
            const toDate = new Date(filterForm.dateTo)
            if (reportDate > toDate) {
              match = false
            }
          }
          
          return match
        })
      }
      
      // 应用分页
      const start = (pagination.page - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      reports.value = reports.value.slice(start, end)
      
      console.log('处理后的报告数据:', reports.value)
    } else {
      console.error('获取报告失败:', response.data?.message)
      ElMessage.error(response.data?.message || '获取报告失败')
    }
  } catch (error) {
    console.error('加载报告列表失败:', error)
    handleError(error as Error, '加载报告列表失败')
  } finally {
    loading.value = false
  }
}

// 加载可用医生列表
const loadDoctors = async () => {
  try {
    const response = await getDoctors()
    if (response.data?.data) {
      availableDoctors.value = response.data.data
    }
  } catch (error) {
    console.warn('Failed to load doctors:', error)
  }
}

// 筛选处理
const handleFilter = () => {
  pagination.page = 1
  loadReports()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    status: '',
    patientId: '',
    dateFrom: '',
    dateTo: ''
  })
  handleFilter()
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.page = page
  loadReports()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadReports()
}

// 查看报告详情
const viewReport = (reportId: string) => {
  router.push(`/doctor/reports/${reportId}`)
}

// 开始诊断
const startDiagnosis = (report: any) => {
  currentReport.value = report
  diagnosisForm.diagnose = report.diagnose || ''
  diagnosisForm.status = 'Completed'
  diagnosisForm.notes = ''
  showDiagnosisDialog.value = true
}

// 快速操作
const handleQuickAction = async (command: string, report: any) => {
  switch (command) {
    case 'complete':
      await quickComplete(report)
      break
    case 'abnormal':
      await quickAbnormal(report)
      break
    case 'consult':
      requestConsult(report)
      break
  }
}

// 快速完成
const quickComplete = async (report: any) => {
  try {
    const { value: diagnose } = await ElMessageBox.prompt(
      '请输入诊断结果',
      '快速完成',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputValidator: (value) => {
          if (!value) {
            return '请输入诊断结果'
          }
          return true
        }
      }
    )
    
    await updateReportStatus(report.id, 'Completed', diagnose)
    ElMessage.success('报告已标记为完成')
    await loadReports()
    
  } catch (error) {
    if (error !== 'cancel') {
      handleError(error as Error, '标记完成失败')
    }
  }
}

// 快速标记异常
const quickAbnormal = async (report: any) => {
  try {
    const { value: diagnose } = await ElMessageBox.prompt(
      '请输入异常描述',
      '标记异常',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputValidator: (value) => {
          if (!value) {
            return '请输入异常描述'
          }
          return true
        }
      }
    )
    
    await updateReportStatus(report.id, 'Abnormality', diagnose)
    ElMessage.success('报告已标记为异常')
    await loadReports()
    
  } catch (error) {
    if (error !== 'cancel') {
      handleError(error as Error, '标记异常失败')
    }
  }
}

// 请求会诊
const requestConsult = (report: any) => {
  currentReport.value = report
  consultForm.consultingDoctorId = ''
  consultForm.consultationReason = ''
  consultForm.priority = 'normal'
  showConsultDialog.value = true
}

// 提交诊断
const submitDiagnosis = async () => {
  if (!diagnosisFormRef.value || !currentReport.value) return
  
  try {
    await diagnosisFormRef.value.validate()
    diagnosisLoading.value = true
    
    await updateReportStatus(
      currentReport.value.id,
      diagnosisForm.status,
      diagnosisForm.diagnose
    )
    
    ElMessage.success('诊断已保存')
    showDiagnosisDialog.value = false
    await loadReports()
    
  } catch (error) {
    if (error !== false) {
      handleError(error as Error, '保存诊断失败')
    }
  } finally {
    diagnosisLoading.value = false
  }
}

// 提交会诊请求
const submitConsultation = async () => {
  if (!consultFormRef.value || !currentReport.value) return
  
  try {
    await consultFormRef.value.validate()
    consultLoading.value = true
    
    await requestConsultation(
      currentReport.value.id,
      consultForm.consultingDoctorId,
      consultForm.consultationReason,
      consultForm.priority
    )
    
    ElMessage.success('会诊请求已发送')
    showConsultDialog.value = false
    
  } catch (error) {
    if (error !== false) {
      handleError(error as Error, '发送会诊请求失败')
    }
  } finally {
    consultLoading.value = false
  }
}

// 重置表单
const resetDiagnosisForm = () => {
  diagnosisFormRef.value?.resetFields()
  currentReport.value = null
}

const resetConsultForm = () => {
  consultFormRef.value?.resetFields()
  currentReport.value = null
}

// 刷新数据
const refreshData = async () => {
  await loadReports()
  ElMessage.success('数据已刷新')
}

// 组件挂载时加载数据
onMounted(() => {
  loadReports()
  loadDoctors()
})
</script>

<style scoped>
.doctor-reports {
  @apply space-y-6;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>