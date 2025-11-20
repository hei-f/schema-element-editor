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
  build: {
    rollupOptions: {
      input: {
        // CRXJS会自动处理manifest中的入口
      },
      output: {
        // 优化代码分割策略，合并相关依赖以减少包体积和避免重复打包
        manualChunks: (id) => {
          // Monaco Editor单独打包
          if (id.includes('monaco-editor')) {
            return 'monaco'
          }
          // React生态系统（React + styled-components）
          if (id.includes('react') || id.includes('react-dom') || id.includes('styled-components')) {
            return 'react-vendor'
          }
          // antd组件库（排除@ant-design/md-editor，因其存在导出问题）
          if ((id.includes('antd') && !id.includes('@ant-design/md-editor')) || 
              (id.includes('@ant-design') && !id.includes('@ant-design/md-editor'))) {
            return 'antd-vendor'
          }
          // 图表库（cytoscape、dagre、d3等）
          if (id.includes('cytoscape') || id.includes('dagre') || id.includes('cose-bilkent') || 
              (id.includes('node_modules') && /[\\/]d3-/.test(id))) {
            return 'graph-vendor'
          }
          // Mermaid图表库相关
          if (id.includes('mermaid') || id.includes('Diagram')) {
            return 'mermaid-vendor'
          }
          // lodash及工具函数
          if (id.includes('lodash') || (id.includes('node_modules') && /[\\/]_base/.test(id))) {
            return 'utils-vendor'
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['monaco-editor']
  }
})

