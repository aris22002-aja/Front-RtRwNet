import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://rt-rw-net.aris-22002-priyanto.workers.dev',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
