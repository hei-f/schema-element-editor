import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../src'),
      '@shared': path.resolve(__dirname, '../../src/shared'),
      '@features': path.resolve(__dirname, '../../src/features'),
      '@core': path.resolve(__dirname, '../../src/core'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
})
