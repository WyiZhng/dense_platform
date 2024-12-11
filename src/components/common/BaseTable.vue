<template>
  <div class="w-full">
    <el-table 
      v-bind="$attrs"
      :data="data" 
      class="w-full"
      :header-cell-style="{
        background: '#F9FAFB',
        color: '#374151',
        fontWeight: '600'
      }"
      :row-class-name="rowClassName"
    >
      <slot></slot>
    </el-table>
    
    <div v-if="showPagination" class="flex justify-end mt-4">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  total: {
    type: Number,
    default: 0
  }
})

const rowClassName = ({row, rowIndex}) => {
  return rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
}
</script> 