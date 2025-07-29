
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueCookies from 'vue-cookies'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'jose'
import { createPinia } from "pinia"
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import './style.css' // 或者其他 CSS 文件路径
//import "@/style.css"

// Create app instance
const app = createApp(App)
const pinia = createPinia()

// Configure Element Plus with optimizations
app.use(ElementPlus, {
  locale: zhCn,
  // Enable size configuration
  size: 'default',
  // Enable z-index configuration
  zIndex: 3000
})

// Configure router
app.use(router)

// Configure cookies
app.use(VueCookies, {
  expires: '7d',
  path: '/',
  secure: false,
  sameSite: 'Lax'
})

// Configure Pinia store
app.use(pinia)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err, info)
  
  // Import error handler dynamically to avoid circular dependencies
  import('./composables/useErrorHandler').then(({ useGlobalErrorHandler }) => {
    const errorHandler = useGlobalErrorHandler()
    errorHandler.handleError(err, `Vue Error: ${info}`)
  }).catch(console.error)
}

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  
  import('./composables/useErrorHandler').then(({ useGlobalErrorHandler }) => {
    const errorHandler = useGlobalErrorHandler()
    errorHandler.handleError(event.reason, 'Unhandled Promise Rejection')
  }).catch(console.error)
  
  // Prevent the default browser error handling
  event.preventDefault()
})

// Performance monitoring
app.config.performance = true

// Mount the app
app.mount('#app')
