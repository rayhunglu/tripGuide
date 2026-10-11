import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Dev only: forward API calls to the Express server (`npm run server`).
  server: { proxy: { '/api': 'http://localhost:3001' } },
})
