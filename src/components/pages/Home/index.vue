<template>
  <div class="flex flex-col h-full">
    <!-- 数据统计卡片区域 -->
    <div class="grid grid-cols-3 w-full gap-4 mb-4">
      <DataCard :num="25" percent="25%" title="总用户数量" subtitle="活跃用户增长">
        <User class="text-blue-500 text-xl"></User>
      </DataCard>
      <DataCard :num="158" percent="15%" title="本月检测量" subtitle="检测数量增长">
        <Edit class="text-green-500 text-xl"></Edit>
      </DataCard>
      <DataCard :num="92" percent="30%" title="诊断准确率" subtitle="较上月提升">
        <i class="el-icon-data-analysis text-purple-500 text-xl"></i>
      </DataCard>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-rows-3 grid-cols-3 gap-4 flex-1">
      <!-- 历史记录列表 -->
      <el-card class="h-full col-start-1 col-span-2 row-start-1 row-span-3 overflow-hidden">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg">检测历史记录</h3>
            <el-button type="primary" size="small">查看全部</el-button>
          </div>
        </template>
        <HistoryList :filter-visible="false"></HistoryList>
      </el-card>

      <!-- 功能介绍卡片 -->
      <VideoCard 
        class="transform hover:scale-105 transition-transform duration-300"
        title="智能检测 ⏱️"
        content="只需上传您的牙齿照片，AI系统秒级完成分析，准确识别口腔健康问题。">
        <video class="h-40 w-full object-cover rounded-lg" 
               src="@/assets/data.mp4" 
               autoplay muted loop></video>
      </VideoCard>

      <VideoCard 
        class="transform hover:scale-105 transition-transform duration-300"
        title="专业报告 📋"
        content="生成全面的口腔健康报告，包含详细的问题分析和个性化建议。">
        <video class="h-40 w-full object-cover rounded-lg" 
               src="@/assets/信息2.mp4" 
               autoplay muted loop></video>
      </VideoCard>

      <VideoCard 
        class="transform hover:scale-105 transition-transform duration-300"
        title="专家咨询 👨‍⚕️"
        content="连接专业牙医资源，提供在线问诊服务，为您的口腔健康保驾护航。">
        <video class="h-40 w-full object-cover rounded-lg" 
               src="@/assets/分析.mp4" 
               autoplay muted loop></video>
      </VideoCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from '../../icon/logo.vue';
import {Edit, User} from "@element-plus/icons-vue";
import DataCard from "@/components/pages/Home/parts/DataCard.vue";
import VideoCard from "@/components/pages/Home/parts/VideoCard.vue";
import LiteLineChart from "@/components/pages/Home/parts/LiteLineChart.vue";
import HistoryList from "@/components/pages/CariesHistory/parts/HistoryList.vue";
</script>

<style scoped>
.el-card {
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.el-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
