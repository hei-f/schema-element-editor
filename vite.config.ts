import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import manifest from './src/manifest.json'

/**
 * 发布模式开关
 * - true: 发布版本，移除所有 console，隐藏调试开关
 * - false: 开发版本，保留 console，显示调试开关
 * 发布前改为 true，发布后改回 false
 */
const IS_RELEASE_BUILD = false

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
      '@test': path.resolve(__dirname, './test'),
    },
  },
  define: {
    /** 注入发布模式标识到代码中 */
    __IS_RELEASE_BUILD__: JSON.stringify(IS_RELEASE_BUILD),
  },
  esbuild: {
    /** 发布模式移除所有 console 和 debugger */
    drop: IS_RELEASE_BUILD ? ['console', 'debugger'] : [],
  },
})
