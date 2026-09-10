import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Local dev: API calls fall through to the Express backend
      // when VITE_API_URL is not set (see src/lib/api.js).
      '/api': 'http://localhost:3001'
    }
  }
})
