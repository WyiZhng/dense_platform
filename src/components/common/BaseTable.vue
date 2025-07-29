<template>
  <div class="base-table-container">
    <LoadingOverlay :visible="loading" :text="loadingText" />
    
    <!-- Table Actions -->
    <div v-if="showActions" class="table-actions">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <slot name="actions-left">
            <el-input
              v-if="searchable"
              v-model="searchQuery"
              :placeholder="searchPlaceholder"
              :prefix-icon="Search"
              class="w-64"
              clearable
              @input="handleSearch"
            />
          </slot>
        </div>
        <div class="flex items-center space-x-2">
          <slot name="actions-right">
            <el-button
              v-if="refreshable"
              :icon="Refresh"
              @click="handleRefresh"
              :loading="refreshing"
            >
              刷新
            </el-button>
          </slot>
        </div>
      </div>
    </div>

    <!-- Table -->
    <el-table
      ref="tableRef"
      :data="filteredData"
      :class="[
        'enhanced-table',
        responsive && 'responsive-table',
        striped && 'striped-table'
      ]"
      :stripe="striped"
      :border="bordered"
      :size="size"
      :height="height"
      :max-height="maxHeight"
      :empty-text="emptyText"
      :header-cell-style="headerCellStyle"
      :row-class-name="rowClassName"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <slot></slot>
    </el-table>

    <!-- Pagination -->
    <div v-if="showPagination" class="table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        :background="true"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { TableInstance } from 'element-plus'
import LoadingOverlay from './LoadingOverlay.vue'

interface Props {
  data?: any[]
  loading?: boolean
  loadingText?: string
  responsive?: boolean
  striped?: boolean
  bordered?: boolean
  size?: 'large' | 'default' | 'small'
  height?: string | number
  maxHeight?: string | number
  emptyText?: string
  searchable?: boolean
  searchPlaceholder?: string
  refreshable?: boolean
  showActions?: boolean
  showPagination?: boolean
  pageSize?: number
  pageSizes?: number[]
  total?: number
  paginationLayout?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  loadingText: '加载中...',
  responsive: true,
  striped: true,
  bordered: false,
  size: 'default',
  emptyText: '暂无数据',
  searchable: false,
  searchPlaceholder: '请输入搜索关键词',
  refreshable: false,
  showActions: false,
  showPagination: true,
  pageSize: 10,
  pageSizes: () => [10, 20, 30, 50],
  total: 0,
  paginationLayout: 'total, sizes, prev, pager, next'
})

const emit = defineEmits<{
  search: [query: string]
  refresh: []
  selectionChange: [selection: any[]]
  sortChange: [sort: { column: any; prop: string; order: string }]
  sizeChange: [size: number]
  currentChange: [current: number]
}>()

const tableRef = ref<TableInstance>()
const searchQuery = ref('')
const refreshing = ref(false)
const currentPage = ref(1)
const pageSize = ref(props.pageSize)

// Header cell style
const headerCellStyle = {
  background: '#F9FAFB',
  color: '#374151',
  fontWeight: '600'
}

// Row class name for striping
const rowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  return rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
}

// Filtered data based on search
const filteredData = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.data
  }
  
  return props.data.filter(item => {
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
})

const handleSearch = (query: string) => {
  emit('search', query)
}

const handleRefresh = async () => {
  refreshing.value = true
  emit('refresh')
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const handleSelectionChange = (selection: any[]) => {
  emit('selectionChange', selection)
}

const handleSortChange = (sort: { column: any; prop: string; order: string }) => {
  emit('sortChange', sort)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  emit('sizeChange', size)
}

const handleCurrentChange = (current: number) => {
  currentPage.value = current
  emit('currentChange', current)
}

// Expose table methods
defineExpose({
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) => 
    tableRef.value?.toggleRowSelection(row, selected || false),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  toggleRowExpansion: (row: any, expanded?: boolean) => 
    tableRef.value?.toggleRowExpansion(row, expanded),
  setCurrentRow: (row: any) => tableRef.value?.setCurrentRow(row),
  clearSort: () => tableRef.value?.clearSort(),
  clearFilter: (columnKeys?: string[]) => tableRef.value?.clearFilter(columnKeys),
  doLayout: () => tableRef.value?.doLayout(),
  sort: (prop: string, order: string) => tableRef.value?.sort(prop, order)
})
</script>

<style scoped>
.base-table-container {
  @apply relative bg-white rounded-lg;
}

.table-actions {
  @apply p-4 border-b border-gray-100;
}

.enhanced-table {
  @apply w-full;
}

.enhanced-table :deep(.el-table__header) {
  @apply bg-gray-50;
}

.enhanced-table :deep(.el-table__header th) {
  @apply text-gray-700 font-semibold;
}

.enhanced-table :deep(.el-table__row:hover) {
  @apply bg-blue-50;
}

.striped-table :deep(.el-table--striped .el-table__row--striped td) {
  @apply bg-gray-50;
}

.table-pagination {
  @apply flex justify-center py-4 border-t border-gray-100;
}

/* Responsive styles */
.responsive-table {
  @apply overflow-x-auto;
}

@media (max-width: 768px) {
  .table-actions {
    @apply p-3;
  }
  
  .table-actions .flex {
    @apply flex-col space-y-3 space-x-0;
  }
  
  .table-actions .w-64 {
    @apply w-full;
  }
  
  .enhanced-table :deep(.el-table__header th) {
    @apply text-sm px-2;
  }
  
  .enhanced-table :deep(.el-table__body td) {
    @apply text-sm px-2;
  }
  
  .table-pagination :deep(.el-pagination) {
    @apply text-sm;
  }
}

@media (max-width: 480px) {
  .table-actions {
    @apply p-2;
  }
  
  .enhanced-table :deep(.el-table__header th) {
    @apply text-xs px-1;
  }
  
  .enhanced-table :deep(.el-table__body td) {
    @apply text-xs px-1;
  }
  
  .table-pagination :deep(.el-pagination .el-pager li) {
    @apply min-w-8 h-8 text-xs;
  }
}
</style> 