import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    // تحسين حجم الملفات
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // ❌ يحذف console.log في الإنتاج تلقائياً
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // تقسيم الكود لتحميل أسرع
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          axios: ['axios'],
        },
      },
    },
    // ضغط الملفات
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
