<template>
    <el-upload
      class="avatar-uploader"
      :show-file-list="false"
      :action=" API_ADDRESS + '/api/image'"
      :headers="getHeaders()"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
    >
      <img v-if="imageUrl" :src="imageUrl" class="avatar"  alt=""/>
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>
  </template>
  
  <script lang="ts" setup>
  import { ref, inject } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import type { UploadProps } from 'element-plus'
  import type { VueCookies } from 'vue-cookies'
  import {API_ADDRESS} from "@/common";
  
  const imageUrl = ref('')
  const $cookies = inject<VueCookies>('$cookies')

  const emit = defineEmits<{
    (e: 'onSuccess', response: any): void
  }>()
  
  // 获取认证头
  const getHeaders = () => {
    // 使用与api.ts相同的token获取方式
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    console.log('Upload组件获取token:', token ? `${token.substring(0, 10)}...` : 'null')
    
    if (!token) {
      console.error('Upload组件: 没有找到token')
      return {}
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`
    }
    console.log('Upload组件认证头:', headers)
    return headers
  }
  
  const handleAvatarSuccess: UploadProps['onSuccess'] = (
    response,
    uploadFile
  ) => {
    console.log('头像上传成功响应:', response)
    imageUrl.value = URL.createObjectURL(uploadFile.raw!)
    emit("onSuccess",response)
  }
  
  const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
    console.log('准备上传头像文件:', rawFile.name, rawFile.size, rawFile.type)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(rawFile.type)) {
      ElMessage.error('头像图片格式不符合要求，请上传 jpg、png 或 webp 格式的图片')
      return false
    } else if (rawFile.size / 1024 / 1024 > 4) {
      ElMessage.error('头像图片大小不能大于4MB')
      return false
    }
    return true
  }
  </script>
  
  <style scoped>
  .avatar-uploader .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  </style>
  
  <style>
  .avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
  }
  
  .avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
  }
  
  .el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    text-align: center;
  }
  </style>
  