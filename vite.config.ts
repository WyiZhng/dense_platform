import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // Enable template compilation optimizations
      template: {
        compilerOptions: {
          // Enable hoisting for better performance
          hoistStatic: true,
          // Enable caching for inline component props
          cacheHandlers: true
        }
      }
    }),
    // Only include dev tools in development
    process.env.NODE_ENV === 'development' && vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // Build optimizations
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Enable code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunk for third-party libraries
          vendor: ['vue', 'vue-router', 'pinia'],
          // Element Plus chunk
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          // Utilities chunk
          utils: ['axios', 'crypto-js', 'jose', 'vue-cookies'],
          // Charts chunk (if used)
          charts: ['echarts']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging (can be disabled in production)
    sourcemap: process.env.NODE_ENV === 'development'
  },

  // Development server optimizations
  server: {
    // Enable file system caching
    fs: {
      cachedChecks: true
    }
  },

  // Dependency optimization
  optimizeDeps: {
    // Pre-bundle these dependencies
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@element-plus/icons-vue',
      'axios'
    ],
    // Exclude these from pre-bundling if they cause issues
    exclude: []
  },

  // CSS optimizations
  css: {
    // PostCSS will use postcss.config.js automatically
    postcss: './postcss.config.js'
  }
})
