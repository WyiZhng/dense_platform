<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: any
}>()

const chartRef = ref()
let chart: echarts.ECharts | null = null

onMounted(() => {
  chart = echarts.init(chartRef.value)
  updateChart()
})

watch(() => props.data, updateChart, { deep: true })

function updateChart() {
  if (!chart) return
  
  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: 20,
      right: 30,
      bottom: 30,
      left: 40
    },
    xAxis: {
      type: 'category',
      data: props.data.xAxis,
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: props.data.series[0].data,
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 3,
        color: '#3B82F6'
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
            color: 'rgba(59, 130, 246, 0.2)'
          }, {
            offset: 1,
            color: 'rgba(59, 130, 246, 0)'
          }]
        }
      }
    }]
  })
}
</script> 