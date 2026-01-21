import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Increase file size limit for large FBX files
    fs: {
      strict: false
    }
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  }
})
