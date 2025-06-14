<template>
  <el-form :model="form" class="max-w-4xl mx-auto p-6 bg-white rounded-lg">
    <el-form-item label="上传图片:" class="mb-6">
      <div class="grid grid-cols-2 gap-4">
        <div v-for="uploadImage in uploadImages" class="relative group">
          <el-image 
            :src="uploadImage" 
            class="rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300"
            fit="cover"
            style="max-width: 300px"
            :preview-src-list=uploadImages
          ></el-image>
        </div>
      </div>
    </el-form-item>

    <el-form-item  label="检测结果:" class="mb-6">
      <div class="grid grid-cols-2 gap-4">
        <div v-for="resultImage in resultImages" class="relative group">
          <el-image 
            :src="resultImage"
            class="rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300"
            fit="cover" 
            style="max-width: 300px"
            :preview-src-list=resultImages
          ></el-image>
        </div>
      </div>
    </el-form-item>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <el-form-item label="医生" class="mb-0">
        <el-link type="primary" class="text-lg font-medium">
          <el-icon class="mr-2"><User /></el-icon>
          {{ form.doctor }}
        </el-link>
      </el-form-item>

      <el-form-item label="患者" class="mb-0">
        <el-link type="primary" class="text-lg font-medium">
          <el-icon class="mr-2"><User /></el-icon>
          {{ form.user }}
        </el-link>
      </el-form-item>
    </div>

    <el-form-item class="mb-6">
      <div class="flex items-center">
        <span class="mr-2">当前检测状态:</span>
        <el-tag 
          :type="color(form.current_status)"
          class="text-base px-4 py-1"
          effect="light"
        >
          {{ argsComputed(form.current_status) }}
        </el-tag>
      </div>
    </el-form-item>

    
        <el-form-item label="检测结果参考:" class="mb-6">
          <div class="bg-gray-50 p-6 rounded-lg space-y-6">
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">诊断说明</h3>
              
              <div class="space-y-3">
                <div class="p-3 bg-green-50 rounded-md">
                  <p class="font-medium text-green-700">类别 0（牙齿状态好）</p>
                  <p class="text-green-600">牙齿状况良好，没有发现龋齿或其他异常。</p>
                </div>

                <div class="p-3 bg-yellow-50 rounded-md">
                  <p class="font-medium text-yellow-700">类别 1-3（轻度龋齿）</p>
                  <p class="text-yellow-600">检测发现牙齿存在轻微龋齿，建议尽快采取早期治疗，以防止进一步发展。</p>
                </div>

                <div class="p-3 bg-red-50 rounded-md">
                  <p class="font-medium text-red-700">类别 4-6（严重龋齿）</p>
                  <p class="text-red-600">检测结果表明牙齿龋齿较为严重，可能已经侵入牙本质甚至牙髓，需要及时专业处理。</p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">建议治疗</h3>
              
              <div class="space-y-3">
                <div class="p-3 bg-green-50 rounded-md">
                  <p class="font-medium text-green-700">类别 0（牙齿健康）</p>
                  <ul class="list-disc list-inside text-green-600 space-y-1">
                    <li>请保持良好的口腔卫生习惯，每天早晚刷牙并使用牙线清洁牙缝</li>
                    <li>建议每半年进行一次牙科检查，确保牙齿健康</li>
                  </ul>
                </div>

                <div class="p-3 bg-yellow-50 rounded-md">
                  <p class="font-medium text-yellow-700">类别 1-3（轻度龋齿）</p>
                  <ul class="list-disc list-inside text-yellow-600 space-y-1">
                    <li>尽快补牙，防止龋齿进一步发展</li>
                    <li>加强日常清洁，使用含氟牙膏，饭后漱口</li>
                    <li>避免摄入过多糖分和碳酸饮料，尤其是睡前</li>
                  </ul>
                </div>

                <div class="p-3 bg-red-50 rounded-md">
                  <p class="font-medium text-red-700">类别 4-6（严重龋齿）</p>
                  <ul class="list-disc list-inside text-red-600 space-y-1">
                    <li>建议进行根管治疗或牙冠修复，防止牙齿损坏进一步加剧</li>
                    <li>若牙齿无法保留，建议拔除并及时进行种植牙或义齿修复</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <h3 class="text-lg font-medium text-gray-900">日常护理建议</h3>
              <ul class="list-disc list-inside text-gray-600 space-y-1">
                <li>每天早晚用正确的方法刷牙，确保每颗牙齿都被清洁到</li>
                <li>饭后漱口，避免食物残留刺激牙齿</li>
                <li>定期到专业牙医处进行检查，发现问题及时处理</li>
              </ul>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="医生评价" class="mb-6">
          <el-input
            v-model="form.diagnose"
            type="textarea"
            readonly
            class="w-full"
            :rows="4"
            resize="none"
          ></el-input>
        </el-form-item>
     
  

      <div v-if="commonStore.usertype == UserType.Doctor">
      <el-form class="space-y-4">
        <el-form-item label="诊断结果:">
          <el-input
            v-model="form.diagnose"
            type="textarea"
            :rows="4"
            placeholder="请输入诊断结果"
            class="w-full"
            resize="none"
          ></el-input>
        </el-form-item>
        
        <el-form-item class="flex justify-end space-x-4">
          
          <el-button 
            type="primary"
            @click="submitDiagnose()"
            class="flex items-center"
          >
            <el-icon class="mr-1"><Check /></el-icon>
            发布
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-text v-else class="text-gray-600 italic">以上评价由龋齿筛查算法生成仅供初步参考，医生正在检测您的报告中，请耐心等待后续通知！！</el-text>
  </el-form>
</template>


<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router';
import {computed, inject, ref} from "vue";
import {useCommonStore} from "@/store";
import {axiosInstance, getImageData, getImagesOfReport} from "@/api";
import type {VueCookies} from "vue-cookies";
import {ImageType, UserType} from "@/common";
import { ElMessage } from 'element-plus';
import type { UserResponse } from '@/store';
const comments = ref([{
  user:"abc",
  content:"hello world"
}])

type Comment = {
  user: string,
  content: string
}

type ReportDetailResponse = {
  id: number,
  user: string,
  doctor: string,
  submitTime: string,
  current_status: Status,
  diagnose: string,
  comments: Comment[]
}

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
const color = (status: Status) => {
  switch (status) {
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
const router = useRouter();
const routes = useRoute();
const id = routes.params.id as string;
const commonStore = useCommonStore();
const $cookies = inject<VueCookies>("$cookies");
router.beforeEach((to, from) => {
  console.log(from);
  console.log(to);
  const to_path_arr = to.path.split("/");
  const from_path_arr = from.path.split("/")
  if (to.path == "/history") return true;
  if (from_path_arr[1] === "history" && to_path_arr[1] === "history" && from_path_arr.length > 2) {

    return "/" + to_path_arr[to_path_arr.length - 1];
  }

  return true;
})

const form = ref<ReportDetailResponse>({
  comments: [], 
  current_status: Status.Completed, 
  diagnose: "", 
  doctor: "", 
  id: 0, 
  submitTime: "", 
  user: ""
});
const uploadImages = ref<string[]>([]);
const resultImages = ref<string[]>([]);
getImagesOfReport($cookies?.get("token"), id, ImageType.source).then(async (x) => 
    uploadImages.value = await Promise.all(x.data.images.map(async (x: string) => 
        URL.createObjectURL((await getImageData($cookies?.get("token"), x)).data))
    )
);

getImagesOfReport($cookies?.get("token"), id, ImageType.result).then(async (x) =>
    resultImages.value = await Promise.all(x.data.images.map(async (x: string) =>
        URL.createObjectURL((await getImageData($cookies?.get("token"), x)).data))
    )
);


axiosInstance.post("/report/detail", {
  token: $cookies?.get("token"),
  id: id,
}).then((resp) => {
  form.value = resp.data;
})

axiosInstance.post<UserResponse>("/user", {
  token: $cookies?.get("token"),
}).then((response) => {
  // 确保访问正确的响应结构
  const userData = response.data.user;
  
  // 更新用户类型状态
  commonStore.usertype = userData.type;
  
  // 可选：更新其他用户信息
  commonStore.username = userData.username;
}).catch((error) => {
  console.error("获取用户信息失败", error);
  // 错误处理逻辑
});

function submitDiagnose(){
  axiosInstance.post("/report/diagnose/submit",{
      token:$cookies?.get("token"),
      id:form.value.id,
      diagnose:form.value.diagnose
  })
  ElMessage({
        message: '评价提交成功',
        type: 'success',
        duration: 2000, // 显示3秒
        position: 'top-right' // 提示位置
      }as any);
}

</script>