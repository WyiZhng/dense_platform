// 临时测试文件，用于调试认证问题
import { login, getCurrentUser, axiosInstance } from '@/api'

export async function testAuth() {
  console.log('=== 认证测试开始 ===')
  
  // 检查当前token状态
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  console.log('当前token:', token ? `存在 (${token.substring(0, 20)}...)` : '不存在')
  
  if (token) {
    try {
      console.log('尝试获取用户信息...')
      const userInfo = await getCurrentUser()
      console.log('用户信息响应:', userInfo.data)
      return userInfo.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }
  
  return null
}

export async function testLogin(username: string, password: string) {
  console.log('=== 登录测试开始 ===')
  console.log('用户名:', username)
  
  try {
    const response = await login(username, password, false)
    console.log('登录响应:', response.data)
    
    // 检查token是否被正确存储
    const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    console.log('存储的token:', storedToken ? `存在 (${storedToken.substring(0, 20)}...)` : '不存在')
    
    return response.data
  } catch (error) {
    console.error('登录失败:', error)
    return null
  }
}

export async function testApiConnection() {
  console.log('=== API连接测试 ===')
  
  try {
    // 测试基础连接
    const response = await axiosInstance.get('health')
    console.log('健康检查响应:', response.data)
    return true
  } catch (error) {
    console.error('API连接失败:', error)
    return false
  }
}

// 导出到全局作用域以便在控制台使用
if (typeof window !== 'undefined') {
  (window as any).authDebug = {
    testAuth,
    testLogin,
    testApiConnection
  }
}