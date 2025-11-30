import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import manifest from './src/manifest.json'

export default defineConfig({
  // Chrome扩展需要使用相对路径，不能使用绝对路径
  base: './',
  plugins: [react(), crx({ manifest: manifest as any })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@core': path.resolve(__dirname, './src/core'),
    },
  },
})
