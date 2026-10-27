import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset URLs, so the build works under any sub-path (e.g. a GitHub Pages project site).
  base: './',
  build: {
    target: 'es2022',
    // three.js and React are about 235 kB gzipped.
    chunkSizeWarningLimit: 1200,
  },
})
