<template>
  <div class="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
    <div class="flex items-start justify-between">
      <div class="space-y-4">
        <div class="flex items-center space-x-3">
          <div class="p-3 rounded-lg bg-gray-50">
            <slot name="icon"></slot>
          </div>
          <div>
            <h3 class="text-gray-500 font-medium">{{ title }}</h3>
            <div class="flex items-baseline space-x-2">
              <span class="text-2xl font-bold">{{ num }}</span>
              <span v-if="unit" class="text-gray-500">{{ unit }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="text-sm" :class="trend === 'up' ? 'text-green-500' : 'text-red-500'">
            {{ percent }}
          </span>
          <span class="text-sm text-gray-500">{{ subtitle }}</span>
        </div>
      </div>

      <!-- 趋势图 -->
      <div class="w-32">
        <LiteLineChart :option="options" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LiteLineChart from './LiteLineChart.vue'

interface Props {
  title: string
  num: number
  percent: string
  trend?: 'up' | 'down'
  unit?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'up',
  unit: '',
  subtitle: ''
})

const data = [1, 4, 2, 5, 3, 6, 4]
const options = ref({
  grid: {
    top: 4,
    right: 4,
    bottom: 4,
    left: 4
  },
  xAxis: {
    type: 'category',
    show: false,
    data
  },
  yAxis: {
    type: 'value',
    show: false
  },
  series: [
    {
      data,
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 2,
        color: props.trend === 'up' ? '#10B981' : '#EF4444'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: props.trend === 'up' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
          }, {
            offset: 1,
            color: 'rgba(255, 255, 255, 0)'
          }]
        }
      }
    }
  ]
})
</script>

<style scoped>
  @import "@/style.css";
</style>