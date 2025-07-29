<template>
  <el-upload
      v-model:file-list="fileList"
      :action="API_ADDRESS +  '/api/image' "
      :headers="getHeaders()"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>

  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue'
import { Plus } from '@element-plus/icons-vue'

import type { UploadProps, UploadUserFile } from 'element-plus'
import type { VueCookies } from 'vue-cookies'
import Upload from "@/components/pages/Profile/parts/Upload.vue";
import {API_ADDRESS} from "@/common";

const $cookies = inject<VueCookies>('$cookies')

const fileList = ref<UploadUserFile[]>([])

const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const emit = defineEmits<{
  (e: 'onSuccess', response: any): void
}>()

// 获取认证头
const getHeaders = () => {
  // 优先使用localStorage/sessionStorage，然后尝试cookies
  let token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  
  // 如果localStorage/sessionStorage中没有，尝试从cookies获取
  if (!token) {
    token = $cookies?.get('token')
  }
  
  console.log('Uploads组件获取token:', token ? `${token.substring(0, 10)}...` : 'null')
  
  if (!token) {
    console.error('Uploads组件: 没有找到token，请先登录')
    return {}
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`
  }
  console.log('Uploads组件认证头:', headers)
  return headers
}

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

const handleSuccess:UploadProps['onSuccess'] = (response,uploadFile) => {
    emit('onSuccess', response)
}
</script>