import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import manifest from './src/manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest as any })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: ['monaco-editor']
  }
})

