import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      // SDK 别名 - 开发时直接引用源码（workspace 包）
      '@schema-element-editor/host-sdk': path.resolve(
        __dirname,
        '../packages/schema-element-editor-sdk/src'
      ),
      // 项目别名
      '@': path.resolve(__dirname, '../src'),
      '@shared': path.resolve(__dirname, '../src/shared'),
      '@features': path.resolve(__dirname, '../src/features'),
      '@core': path.resolve(__dirname, '../src/core'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
})
