<template>
  <div class="admin-users">
    <!-- 页面标题和操作 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">用户管理</h1>
        <p class="text-gray-600 mt-1">管理系统中的所有用户</p>
      </div>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon class="mr-2"><Plus /></el-icon>
        新建用户
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <BaseCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <el-input
          v-model="searchForm.search"
          placeholder="搜索用户ID、姓名、邮箱或手机"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="searchForm.userType"
          placeholder="用户类型"
          clearable
          @change="handleSearch"
        >
          <el-option label="患者" value="0" />
          <el-option label="医生" value="1" />
        </el-select>
        
        <el-select
          v-model="searchForm.isActive"
          placeholder="状态"
          clearable
          @change="handleSearch"
        >
          <el-option label="活跃" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>
        
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </BaseCard>

    <!-- 用户列表 -->
    <BaseCard>
      <BaseTable
        :data="users"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="id" label="用户ID" width="120" />
        <el-table-column prop="name" label="姓名" width="120">
          <template #default="{ row }">
            {{ row.name || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 0 ? 'primary' : 'success'" size="small">
              {{ row.type === 0 ? '患者' : '医生' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180">
          <template #default="{ row }">
            {{ row.email || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机" width="120">
          <template #default="{ row }">
            {{ row.phone || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
              {{ row.is_active ? '活跃' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_login" label="最后登录" width="150">
          <template #default="{ row }">
            {{ row.last_login ? formatDateTime(row.last_login) : '从未登录' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewUser(row.id)">
              查看
            </el-button>
            <el-button size="small" type="primary" @click="editUser(row)">
              编辑
            </el-button>
            <el-button 
              size="small" 
              :type="row.is_active ? 'danger' : 'success'"
              @click="toggleUserStatus(row)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </BaseTable>
    </BaseCard>

    <!-- 创建用户对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建新用户"
      width="600px"
      @close="resetCreateForm"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="用户ID" prop="user_id">
          <el-input v-model="createForm.user_id" placeholder="请输入用户ID" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="createForm.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="用户类型" prop="user_type">
          <el-select v-model="createForm.user_type" placeholder="请选择用户类型">
            <el-option label="患者" :value="0" />
            <el-option label="医生" :value="1" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="性别" prop="sex">
          <el-select v-model="createForm.sex" placeholder="请选择性别">
            <el-option label="女" :value="0" />
            <el-option label="男" :value="1" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="出生日期" prop="birth">
          <el-date-picker
            v-model="createForm.birth"
            type="date"
            placeholder="请选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="createForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="地址" prop="address">
          <el-input v-model="createForm.address" placeholder="请输入地址" />
        </el-form-item>
        
        <!-- 医生专用字段 -->
        <template v-if="createForm.user_type === 1">
          <el-form-item label="职位" prop="position">
            <el-input v-model="createForm.position" placeholder="请输入职位" />
          </el-form-item>
          
          <el-form-item label="工作单位" prop="workplace">
            <el-input v-model="createForm.workplace" placeholder="请输入工作单位" />
          </el-form-item>
        </template>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateUser" :loading="createLoading">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑用户"
      width="600px"
      @close="resetEditForm"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="用户ID">
          <el-input v-model="editForm.user_id" disabled />
        </el-form-item>
        
        <el-form-item label="新密码" prop="password">
          <el-input 
            v-model="editForm.password" 
            type="password" 
            placeholder="留空则不修改密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="is_active">
          <el-switch v-model="editForm.is_active" />
        </el-form-item>
        
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
          <el-date-picker
            v-model="editForm.birth"
            type="date"
            placeholder="请选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
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
        
        <!-- 医生专用字段 -->
        <template v-if="editForm.user_type === 1">
          <el-form-item label="职位" prop="position">
            <el-input v-model="editForm.position" placeholder="请输入职位" />
          </el-form-item>
          
          <el-form-item label="工作单位" prop="workplace">
            <el-input v-model="editForm.workplace" placeholder="请输入工作单位" />
          </el-form-item>
        </template>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateUser" :loading="updateLoading">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deactivateUser, 
  activateUser 
} from '@/api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'

const router = useRouter()
const { handleError } = useGlobalErrorHandler()

// 响应式数据
const loading = ref(false)
const createLoading = ref(false)
const updateLoading = ref(false)
const users = ref<any[]>([])
const showCreateDialog = ref(false)
const showEditDialog = ref(false)

// 搜索表单
const searchForm = reactive({
  search: '',
  userType: '',
  isActive: null as boolean | null
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 创建用户表单
const createForm = reactive({
  user_id: '',
  password: '',
  user_type: 0,
  name: '',
  sex: null as number | null,
  birth: '',
  phone: '',
  email: '',
  address: '',
  position: '',
  workplace: ''
})

// 编辑用户表单
const editForm = reactive({
  user_id: '',
  password: '',
  is_active: true,
  user_type: 0,
  name: '',
  sex: null as number | null,
  birth: '',
  phone: '',
  email: '',
  address: '',
  position: '',
  workplace: ''
})

// 表单引用
const createFormRef = ref()
const editFormRef = ref()

// 表单验证规则
const createRules = {
  user_id: [
    { required: true, message: '请输入用户ID', trigger: 'blur' },
    { min: 1, max: 20, message: '用户ID长度在1到20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在6到50个字符', trigger: 'blur' }
  ],
  user_type: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const editRules = {
  password: [
    { min: 6, max: 50, message: '密码长度在6到50个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 加载用户列表
const loadUsers = async () => {
  loading.value = true
  
  try {
    const response = await getUsers(
      pagination.page,
      pagination.pageSize,
      searchForm.userType,
      searchForm.isActive,
      searchForm.search
    )
    
    if (response.data?.data) {
      users.value = response.data.data.users || []
      pagination.total = response.data.data.pagination?.total_count || 0
    }
  } catch (error) {
    handleError(error as Error, '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  loadUsers()
}

// 重置搜索
const resetSearch = () => {
  searchForm.search = ''
  searchForm.userType = ''
  searchForm.isActive = null
  handleSearch()
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.page = page
  loadUsers()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadUsers()
}

// 查看用户详情
const viewUser = (userId: string) => {
  router.push(`/admin/users/${userId}`)
}

// 编辑用户
const editUser = (user: any) => {
  Object.assign(editForm, {
    user_id: user.id,
    password: '',
    is_active: user.is_active,
    user_type: user.type,
    name: user.name || '',
    sex: user.sex,
    birth: user.birth || '',
    phone: user.phone || '',
    email: user.email || '',
    address: user.address || '',
    position: user.position || '',
    workplace: user.workplace || ''
  })
  showEditDialog.value = true
}

// 切换用户状态
const toggleUserStatus = async (user: any) => {
  const action = user.is_active ? '禁用' : '启用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 ${user.id} 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (user.is_active) {
      await deactivateUser(user.id)
    } else {
      await activateUser(user.id)
    }
    
    ElMessage.success(`用户${action}成功`)
    await loadUsers()
    
  } catch (error) {
    if (error !== 'cancel') {
      handleError(error as Error, `${action}用户失败`)
    }
  }
}

// 创建用户
const handleCreateUser = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    createLoading.value = true
    
    await createUser(createForm)
    ElMessage.success('用户创建成功')
    showCreateDialog.value = false
    await loadUsers()
    
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      handleError(error as Error, '创建用户失败')
    }
  } finally {
    createLoading.value = false
  }
}

// 更新用户
const handleUpdateUser = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    updateLoading.value = true
    
    const updateData = { ...editForm }
    if (!updateData.password) {
      delete updateData.password // 不更新密码
    }
    
    await updateUser(editForm.user_id, updateData)
    ElMessage.success('用户更新成功')
    showEditDialog.value = false
    await loadUsers()
    
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      handleError(error as Error, '更新用户失败')
    }
  } finally {
    updateLoading.value = false
  }
}

// 重置表单
const resetCreateForm = () => {
  Object.assign(createForm, {
    user_id: '',
    password: '',
    user_type: 0,
    name: '',
    sex: null,
    birth: '',
    phone: '',
    email: '',
    address: '',
    position: '',
    workplace: ''
  })
  createFormRef.value?.resetFields()
}

const resetEditForm = () => {
  editFormRef.value?.resetFields()
}

// 组件挂载时加载数据
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
  @apply space-y-6;
}
</style>