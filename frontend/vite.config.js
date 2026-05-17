import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Em produção (GitHub Pages), o site fica em /
  // VITE_BASE pode ser definido no workflow se precisar de subpath
  base: process.env.VITE_BASE || '/',

  server: {
    port: 3000,
    proxy: {
      // Em desenvolvimento, /api vai pro backend local
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
})
