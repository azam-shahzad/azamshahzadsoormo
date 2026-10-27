import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    // three.js and React are about 235 kB gzipped.
    chunkSizeWarningLimit: 1200,
  },
})
