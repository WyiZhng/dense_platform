<template>
  <div class="history-list">
    <!-- 搜索和筛选区域 -->
    <div v-if="filterVisible" class="filter-section">
      <div class="flex items-center space-x-4">
        <!-- 搜索框 -->
        <div class="flex-1 max-w-md">
          <el-input
            v-model="search"
            placeholder="搜索报告号或医生"
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon class="text-gray-400"><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 日期选择器 -->
        <el-date-picker
          v-model="dataRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="w-80"
        />

        <!-- 刷新按钮 -->
        <el-button 
          type="primary" 
          :icon="Refresh" 
          @click="refresh"
          class="!flex items-center"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="mt-4">
      <el-table 
        :data="filteredReports" 
        class="custom-table"
        :header-cell-style="{
          background: '#F8FAFC',
          color: '#334155',
          fontWeight: '600'
        }"
      >
        <el-table-column prop="id" label="报告号" min-width="120">
          <template #default="{ row }">
            <span class="font-medium text-gray-700">#{{ row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="doctor" label="负责医生" min-width="150">
          <template #default="{ row }">
            <div class="flex items-center space-x-2">
              <el-avatar :size="24" class="bg-blue-100 text-blue-600">
                {{ row.doctor.charAt(0) }}
              </el-avatar>
              <span>{{ row.doctor }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="submitTime" label="提交时间" min-width="180">
          <template #default="{ row }">
            <div class="flex items-center space-x-2 text-gray-600">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(row.submitTime) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.current_status)"
              effect="light"
              class="status-tag"
            >
              {{ getStatusText(row.current_status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <div class="flex items-center space-x-2">
              <el-button
                type="primary"
                text
                @click="handleOpen(scope.$index, scope.row)"
              >
                <el-icon><View /></el-icon>
                查看报告
              </el-button>

              <el-button
                v-if="store.usertype === UserType.Doctor"
                type="success"
                text
              >
                <el-icon><Edit /></el-icon>
                操作报告
              </el-button>

              <el-popconfirm
                title="确定要删除这份报告吗？"
                @confirm="handleDelete(scope.$index, scope.row)"
              >
                <template #reference>
                  <el-button
                    type="danger"
                    text
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    
      <!-- 分页器 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="reports.length"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
      
    </div>
  </div>
</template>

<script lang="ts" setup>
import {Refresh, Search, Calendar, View, Edit, Delete} from "@element-plus/icons-vue";
import {deleteReport, getReports} from "@/api";
import {computed, inject, ref, watch, onMounted} from "vue";
import {type VueCookies} from "vue-cookies";
import {useCommonStore, useHistoryStore} from "@/store";
import {useRouter} from "vue-router";
import {UserType} from "@/common";
import {ElMessage} from "element-plus";

enum Status {
  Checking = 0,
  Completed = 1,
  Abnormality = 2,
  Error = 3,
}

type Report = {
  id: number,
  doctor: string,
  submitTime: string,
  current_status: Status,
}

const argsComputed = (status: Status) => {
  return computed(() => {
    switch (status) {
      case Status.Completed:
        return "检测完成";
      case Status.Abnormality:
        return "状态异常";
      case Status.Error:
        return "检测错误"
      case Status.Checking:
        return "检测中"
    }
  })
}
type Props = {
    filterVisible:boolean
}

const reports = ref<Report[]>([]);
const search = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const store = useCommonStore();
const router = useRouter();
const $cookies = inject<VueCookies>("$cookies");
const dataRange = ref<string[]>([]);
const props = withDefaults(defineProps<Props>(),{
    filterVisible:()=>true,
})

// 在组件挂载时调用refresh
onMounted(() => {
  console.log('HistoryList组件已挂载，开始获取报告数据');
  refresh();
});

// 路由守卫
router.beforeEach((to, from) => {
  if (to.path == '/user/history' && from.path == '/user/check') {
    console.log('从检测页面返回历史页面，刷新数据');
    refresh()
  }
})
const color = (scope: Report) => {
  switch (scope.current_status) {
    case Status.Checking:
      return "primary";
    case Status.Completed:
      return "success";
    case Status.Abnormality:
      return "warning";
    case Status.Error:
      return "danger";
  }
}


function handleOpen(index: number, row: Report) {
  router.push(`/user/history/${row.id.toString()}`);
}

function handleDelete(index: number, row: Report) {
  deleteReport(row.id.toString()).then((x) => {
    if (x.data.code === 0) {
      ElMessage.success('报告删除成功');
      reports.value = reports.value.filter((report) => report.id !== row.id);
    } else {
      ElMessage.error(x.data.message || '删除报告失败');
    }
  }).catch(error => {
    console.error('删除报告请求失败:', error);
    ElMessage.error('删除报告失败，请稍后重试');
  });
}

const filteredReports = computed(() => {
  const filtered = reports.value.filter(report => {
        const searchExp = report.id.toString().includes(search.value) || report.doctor.includes(search.value);
        const dateExp = dataRange.value.length == 0 || Date.parse(dataRange.value[0]) <= Date.parse(report.submitTime) && Date.parse(report.submitTime) < Date.parse(dataRange.value[1]);
    return searchExp && dateExp;    
  }
  );
  return filtered.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
});

function handleSearch() {
  currentPage.value = 1;
}

function refresh() {
  // 检查认证状态
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  console.log('检查认证状态，token存在:', !!token);
  
  if (token) {
    console.log('开始调用getReports API...');
    getReports().then(x => {
      console.log('获取报告响应:', x.data);
      if (x.data.code === 0) {
        reports.value = x.data.reports || x.data.data || [];
        console.log('成功获取报告数据，数量:', reports.value.length);
      } else {
        console.error('获取报告失败:', x.data.message);
        ElMessage.error(x.data.message || '获取报告失败');
      }
    }).catch(error => {
      console.error('获取报告请求失败:', error);
      ElMessage.error('获取报告失败，请稍后重试');
    });
  } else {
    console.warn('用户未登录，无法获取报告数据');
    ElMessage.warning('请先登录');
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取状态类型
const getStatusType = (status: Status) => {
  const types = {
    [Status.Checking]: 'info',
    [Status.Completed]: 'success',
    [Status.Abnormality]: 'warning',
    [Status.Error]: 'danger'
  }
  return types[status]
}

// 获取状态文本
const getStatusText = (status: Status) => {
  const texts = {
    [Status.Checking]: '检测中',
    [Status.Completed]: '检测完成',
    [Status.Abnormality]: '状态异常',
    [Status.Error]: '检测错误'
  }
  return texts[status]
}
</script>

<style scoped>
.history-list {
  @apply bg-white rounded-lg;
}

.filter-section {
  @apply p-4 bg-gray-50 rounded-lg border border-gray-100;
}

.custom-table {
  @apply border border-gray-100 rounded-lg overflow-hidden;
}

:deep(.el-table) {
  --el-table-border-color: theme('colors.gray.100');
  --el-table-header-bg-color: theme('colors.gray.50');
}

:deep(.el-table__row) {
  @apply hover:bg-blue-50 transition-colors;
}

.status-tag {
  @apply !flex items-center justify-center w-20;
}

:deep(.el-button) {
  @apply !flex items-center;
}

:deep(.el-button .el-icon) {
  @apply mr-1;
}

:deep(.el-pagination) {
  @apply !flex items-center justify-end;
}
</style>
