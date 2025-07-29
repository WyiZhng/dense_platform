# 错误处理系统使用指南

## 概述

本系统提供了一套完整的错误处理和用户反馈机制，包括：

- 全局错误处理
- 表单验证增强
- 用户友好的错误通知
- 错误边界组件
- Toast 通知系统

## 核心组件

### 1. useErrorHandler 组合式函数

提供全局错误处理功能。

```typescript
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError, showSuccess, handleValidationErrors } = useErrorHandler()

// 处理一般错误
handleError(error, 'API Request')

// 处理验证错误
handleValidationErrors([
  { field: 'username', message: '用户名不能为空' }
])

// 显示成功消息
showSuccess('操作成功！')
```

### 2. useFormValidation 组合式函数

提供增强的表单验证功能。

```typescript
import { useFormValidation } from '@/composables/useFormValidation'

const { formData, formRules, validateForm, validators } = useFormValidation(
  { username: '', email: '' },
  {
    username: {
      rules: [
        validators.required('用户名不能为空'),
        validators.length(3, 20)
      ]
    },
    email: {
      rules: [validators.email()]
    }
  }
)
```

### 3. ErrorDisplay 组件

用于显示各种类型的错误信息。

```vue
<template>
  <!-- 内联错误 -->
  <ErrorDisplay
    type="inline"
    severity="error"
    title="验证失败"
    message="用户名或密码错误"
  />
  
  <!-- 卡片错误 -->
  <ErrorDisplay
    type="card"
    severity="warning"
    title="网络问题"
    message="网络连接不稳定"
    :show-details="true"
    :details="errorDetails"
  >
    <template #actions>
      <el-button @click="retry">重试</el-button>
    </template>
  </ErrorDisplay>
  
  <!-- 横幅错误 -->
  <ErrorDisplay
    type="banner"
    severity="info"
    message="系统维护通知"
  />
  
  <!-- 列表错误 -->
  <ErrorDisplay
    type="list"
    severity="error"
    :errors="['错误1', '错误2']"
  />
</template>
```

### 4. FormField 组件

增强的表单字段组件，集成验证功能。

```vue
<template>
  <FormField
    name="username"
    type="input"
    label="用户名"
    placeholder="请输入用户名"
    v-model="formData.username"
    :required="true"
    :errors="getFieldError('username')"
    help-text="用户名长度3-20个字符"
  />
</template>
```

### 5. ErrorBoundary 组件

捕获和处理组件错误。

```vue
<template>
  <ErrorBoundary @error="handleError">
    <YourComponent />
  </ErrorBoundary>
</template>
```

### 6. useToast 组合式函数

提供 Toast 通知功能。

```typescript
import { useGlobalToast } from '@/composables/useToast'

const toast = useGlobalToast()

// 显示不同类型的通知
toast.success('操作成功')
toast.error('操作失败')
toast.warning('请注意')
toast.info('信息提示')

// 加载状态通知
await toast.loading(
  apiCall(),
  {
    loading: '处理中...',
    success: '处理完成',
    error: '处理失败'
  }
)
```

## 使用场景

### 1. API 请求错误处理

```typescript
import { axiosInstance } from '@/api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError, showSuccess } = useErrorHandler()

const fetchData = async () => {
  try {
    const response = await axiosInstance.get('/api/data')
    showSuccess('数据加载成功')
    return response.data
  } catch (error) {
    // 错误会被 axios 拦截器自动处理
    // 也可以手动处理特定错误
    handleError(error, 'Data Fetch')
    throw error
  }
}
```

### 2. 表单验证

```vue
<template>
  <BaseForm
    :model="formData"
    :rules="formRules"
    :form-errors="formErrors"
    @submit="handleSubmit"
  >
    <FormField
      name="email"
      type="email"
      label="邮箱"
      v-model="formData.email"
      :errors="getFieldError('email')"
    />
  </BaseForm>
</template>

<script setup>
import { useFormValidation } from '@/composables/useFormValidation'

const { 
  formData, 
  formRules, 
  validateForm, 
  getFieldError,
  validators 
} = useFormValidation(
  { email: '' },
  {
    email: {
      rules: [
        validators.required(),
        validators.email()
      ]
    }
  }
)

const handleSubmit = async (valid, model) => {
  if (!valid) return
  
  try {
    await submitForm(model)
  } catch (error) {
    // 错误会被自动处理
  }
}
</script>
```

### 3. 组件错误边界

```vue
<template>
  <div class="app">
    <ErrorBoundary @error="handleGlobalError">
      <Router />
    </ErrorBoundary>
  </div>
</template>

<script setup>
import { useGlobalErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useGlobalErrorHandler()

const handleGlobalError = (error, instance, info) => {
  console.error('Global error:', error)
  handleError(error, `Component Error: ${info}`)
}
</script>
```

## 错误类型和处理

### 1. 网络错误
- 自动显示用户友好的错误消息
- 提供重试选项
- 记录错误历史

### 2. 验证错误
- 实时表单验证
- 字段级错误显示
- 表单级错误汇总

### 3. 认证错误
- 自动清除过期令牌
- 重定向到登录页面
- 显示相应提示

### 4. 服务器错误
- 显示通用错误消息
- 记录详细错误信息
- 提供联系支持选项

## 配置选项

### 1. 错误消息自定义

```typescript
// 在 useErrorHandler 中自定义错误消息
const errorMessages = {
  'CUSTOM_ERROR': '自定义错误消息',
  // ...
}
```

### 2. Toast 配置

```typescript
const toast = useGlobalToast()

// 自定义 Toast 选项
toast.showToast({
  type: 'success',
  message: '操作成功',
  duration: 5000,
  position: 'top-right'
})
```

### 3. 表单验证规则

```typescript
// 自定义验证器
const customValidator = validators.custom(
  (value) => value.includes('@'),
  '必须包含 @ 符号'
)
```

## 最佳实践

### 1. 错误处理层次
1. 组件级错误处理（ErrorBoundary）
2. API 级错误处理（axios 拦截器）
3. 表单级错误处理（表单验证）
4. 全局错误处理（全局错误处理器）

### 2. 用户体验
- 提供清晰的错误消息
- 避免技术术语
- 提供解决方案或下一步操作
- 适当的错误持续时间

### 3. 错误记录
- 记录错误上下文
- 包含用户操作信息
- 便于调试和分析

### 4. 响应式设计
- 移动端使用 ElMessage
- 桌面端使用 ElNotification
- 适配不同屏幕尺寸

## 示例代码

查看 `ErrorHandlingDemo.vue` 组件获取完整的使用示例。

## 故障排除

### 1. 错误不显示
- 检查是否正确导入组合式函数
- 确认错误处理器已初始化
- 检查控制台是否有错误

### 2. 表单验证不工作
- 确认表单规则配置正确
- 检查字段名称是否匹配
- 验证 FormField 组件配置

### 3. Toast 不显示
- 检查 Element Plus 是否正确安装
- 确认 z-index 配置
- 检查是否有 CSS 冲突

## 更新日志

### v1.0.0
- 初始版本发布
- 基础错误处理功能
- 表单验证增强
- Toast 通知系统
- 错误边界组件