import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import path from 'path'
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwind()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: { rollupOptions: { output: { manualChunks: { mui: ['@mui/material'], motion: ['framer-motion'], charts: ['recharts'] } } } },
})
