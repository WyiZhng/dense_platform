<template>
  <div class="mt-24 admin-roles">
    <!-- 页面标题和操作 -->
    <div class="mt-26 flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">角色管理</h1>
        <p class="text-gray-600 mt-1">管理系统角色和权限</p>
      </div>
      <div class="flex gap-2">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon class="mr-2">
            <Plus />
          </el-icon>
          新建角色
        </el-button>
      </div>
    </div>

    <!-- 角色列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BaseCard v-for="role in roles" :key="role.name" class="role-card" hoverable>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <el-icon class="text-blue-600">
                  <UserFilled />
                </el-icon>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ role.display_name || role.name }}</h3>
                <p class="text-sm text-gray-500">{{ role.name }}</p>
              </div>
            </div>
            <el-dropdown @command="(command) => handleRoleAction(command, role)">
              <el-button size="small" circle>
                <el-icon>
                  <MoreFilled />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="permissions">权限管理</el-dropdown-item>
                  <el-dropdown-item command="users">查看用户</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>

        <div class="space-y-4">
          <!-- 角色描述 -->
          <p class="text-sm text-gray-700">
            {{ role.description || '暂无描述' }}
          </p>

          <!-- 权限统计 -->
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">权限数量</span>
            <el-tag size="small">{{ role.permissions?.length || 0 }}</el-tag>
          </div>

          <!-- 用户统计 -->
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">用户数量</span>
            <el-tag size="small" type="success">{{ role.user_count || 0 }}</el-tag>
          </div>

          <!-- 创建时间 -->
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">创建时间</span>
            <span class="text-xs text-gray-500">{{ formatDate(role.created_at) }}</span>
          </div>

          <!-- 权限预览 -->
          <div v-if="role.permissions && role.permissions.length > 0">
            <p class="text-sm text-gray-600 mb-2">主要权限:</p>
            <div class="flex flex-wrap gap-1">
              <el-tag v-for="permission in role.permissions.slice(0, 3)" :key="permission.id" size="small" type="info">
                {{ permission.resource }}:{{ permission.action }}
              </el-tag>
              <el-tag v-if="role.permissions.length > 3" size="small" type="info">
                +{{ role.permissions.length - 3 }}
              </el-tag>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- 空状态 -->
    <div v-if="roles.length === 0 && !loading" class="text-center py-12">
      <el-icon size="64" class="text-gray-300 mb-4">
        <UserFilled />
      </el-icon>
      <p class="text-gray-500 mb-4">暂无角色</p>
      <el-button type="primary" @click="showCreateDialog = true">
        创建第一个角色
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-12">
      <el-icon size="32" class="animate-spin text-blue-500">
        <Loading />
      </el-icon>
    </div>

    <!-- 创建角色对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建新角色" width="600px" @close="resetCreateForm">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入角色名称（英文）" />
        </el-form-item>

        <el-form-item label="显示名称" prop="display_name">
          <el-input v-model="createForm.display_name" placeholder="请输入显示名称（中文）" />
        </el-form-item>

        <el-form-item label="角色描述" prop="description">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>

        <el-form-item label="权限配置" prop="permissions">
          <div class="w-full">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="group in permissionGroups" :key="group.name" class="border rounded p-3">
                <h4 class="font-medium text-gray-900 mb-2">{{ group.display_name }}</h4>
                <div class="space-y-2">
                  <el-checkbox v-for="permission in group.permissions"
                    :key="`${permission.resource}:${permission.action}`" v-model="createForm.permissions"
                    :label="`${permission.resource}:${permission.action}`" class="w-full">
                    {{ permission.display_name }}
                  </el-checkbox>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateRole" :loading="createLoading">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑角色" width="600px" @close="resetEditForm">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.name" disabled />
        </el-form-item>

        <el-form-item label="显示名称" prop="display_name">
          <el-input v-model="editForm.display_name" placeholder="请输入显示名称（中文）" />
        </el-form-item>

        <el-form-item label="角色描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>

        <el-form-item label="权限配置" prop="permissions">
          <div class="w-full">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="group in permissionGroups" :key="group.name" class="border rounded p-3">
                <h4 class="font-medium text-gray-900 mb-2">{{ group.display_name }}</h4>
                <div class="space-y-2">
                  <el-checkbox v-for="permission in group.permissions"
                    :key="`${permission.resource}:${permission.action}`" v-model="editForm.permissions"
                    :label="`${permission.resource}:${permission.action}`" class="w-full">
                    {{ permission.display_name }}
                  </el-checkbox>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateRole" :loading="updateLoading">
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
import { Plus, UserFilled, MoreFilled, Loading } from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole
} from '@/api'
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'

const router = useRouter()
const { handleError } = useGlobalErrorHandler()

// 响应式数据
const loading = ref(false)
const createLoading = ref(false)
const updateLoading = ref(false)
const roles = ref<any[]>([])
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const currentRole = ref<any>(null)

// 权限组配置
const permissionGroups = [
  {
    name: 'user',
    display_name: '用户管理',
    permissions: [
      { resource: 'user', action: 'read', display_name: '查看用户' },
      { resource: 'user', action: 'write', display_name: '编辑用户' },
      { resource: 'user', action: 'delete', display_name: '删除用户' }
    ]
  },
  {
    name: 'report',
    display_name: '报告管理',
    permissions: [
      { resource: 'report', action: 'read', display_name: '查看报告' },
      { resource: 'report', action: 'write', display_name: '编辑报告' },
      { resource: 'report', action: 'manage', display_name: '管理报告' }
    ]
  },
  {
    name: 'admin',
    display_name: '系统管理',
    permissions: [
      { resource: 'admin', action: 'system', display_name: '系统管理' },
      { resource: 'admin', action: 'users', display_name: '用户管理' },
      { resource: 'admin', action: 'audit', display_name: '审计日志' }
    ]
  },
  {
    name: 'doctor',
    display_name: '医生功能',
    permissions: [
      { resource: 'doctor', action: 'diagnose', display_name: '诊断权限' },
      { resource: 'doctor', action: 'review', display_name: '审核权限' },
      { resource: 'doctor', action: 'collaborate', display_name: '协作权限' }
    ]
  }
]

// 创建表单
const createForm = reactive({
  name: '',
  display_name: '',
  description: '',
  permissions: [] as string[]
})

// 编辑表单
const editForm = reactive({
  name: '',
  display_name: '',
  description: '',
  permissions: [] as string[]
})

// 表单引用
const createFormRef = ref()
const editFormRef = ref()

// 表单验证规则
const createRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '角色名称只能包含字母、数字和下划线，且以字母或下划线开头', trigger: 'blur' }
  ],
  display_name: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ]
}

const editRules = {
  display_name: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 角色操作
const handleRoleAction = async (command: string, role: any) => {
  switch (command) {
    case 'edit':
      editRole(role)
      break
    case 'permissions':
      managePermissions(role)
      break
    case 'users':
      viewRoleUsers(role)
      break
    case 'delete':
      await deleteRoleConfirm(role)
      break
  }
}

// 编辑角色
const editRole = (role: any) => {
  currentRole.value = role
  Object.assign(editForm, {
    name: role.name,
    display_name: role.display_name || role.name,
    description: role.description || '',
    permissions: role.permissions?.map((p: any) => `${p.resource}:${p.action}`) || []
  })
  showEditDialog.value = true
}

// 管理权限
const managePermissions = (role: any) => {
  router.push(`/admin/roles/${role.name}/permissions`)
}

// 查看角色用户
const viewRoleUsers = (role: any) => {
  router.push(`/admin/users?role=${role.name}`)
}

// 删除角色确认
const deleteRoleConfirm = async (role: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.display_name || role.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteRole(role.name)
    ElMessage.success('角色删除成功')
    await loadRoles()

  } catch (error) {
    if (error !== 'cancel') {
      handleError(error as Error, '删除角色失败')
    }
  }
}

// 创建角色
const handleCreateRole = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    createLoading.value = true

    const roleData = {
      ...createForm,
      permissions: createForm.permissions // 直接传递字符串数组
    }

    await createRole(roleData)
    ElMessage.success('角色创建成功')
    showCreateDialog.value = false
    await loadRoles()

  } catch (error) {
    if (error !== false) {
      handleError(error as Error, '创建角色失败')
    }
  } finally {
    createLoading.value = false
  }
}

// 更新角色
const handleUpdateRole = async () => {
  if (!editFormRef.value || !currentRole.value) return

  try {
    await editFormRef.value.validate()
    updateLoading.value = true

    const roleData = {
      ...editForm,
      permissions: editForm.permissions // 直接传递字符串数组
    }

    await updateRole(currentRole.value.name, roleData)
    ElMessage.success('角色更新成功')
    showEditDialog.value = false
    await loadRoles()

  } catch (error) {
    if (error !== false) {
      handleError(error as Error, '更新角色失败')
    }
  } finally {
    updateLoading.value = false
  }
}

// 重置表单
const resetCreateForm = () => {
  Object.assign(createForm, {
    name: '',
    display_name: '',
    description: '',
    permissions: []
  })
  createFormRef.value?.resetFields()
}

const resetEditForm = () => {
  editFormRef.value?.resetFields()
  currentRole.value = null
}

// 加载角色列表
const loadRoles = async () => {
  loading.value = true

  try {
    const response = await getAllRoles()

    if (response.data?.data) {
      roles.value = response.data.data || []
    }
  } catch (error) {
    handleError(error as Error, '加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.admin-roles {
  @apply space-y-6;
}

.role-card {
  @apply transition-all duration-300;
}

.role-card:hover {
  @apply transform -translate-y-1;
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
</style>