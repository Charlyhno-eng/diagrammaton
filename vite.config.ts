import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const gifServiceUrl = loadEnv(mode, '.', '').GIF_SERVICE_URL ?? 'http://127.0.0.1:8000'

  return {
    plugins: [react()],
    server: { proxy: { '/api/gif': { target: gifServiceUrl, changeOrigin: true } } },
  }
})
