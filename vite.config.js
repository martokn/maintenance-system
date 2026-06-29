import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/fuel/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost',
        rewrite: (path) => path.replace(/^\/api/, '/fuel/php-backend/api')
      }
    }
  }
})