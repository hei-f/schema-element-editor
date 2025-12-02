import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@features': resolve(__dirname, 'src/features'),
      '@core': resolve(__dirname, 'src/core'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 15000,
    include: [
      'src/**/__tests__/**/*.{ts,tsx}',
      'src/**/*.{spec,test}.{ts,tsx}',
      'test/**/*.{spec,test}.{ts,tsx}',
    ],
    exclude: ['node_modules', 'dist', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/shared/types/**',
        'src/**/*.stories.tsx',
        'src/core/background/**',
        'src/core/content/index.tsx',
        'src/core/content/core/monitor.ts',
        'src/features/options-page/index.tsx',
        'src/shared/utils/browser/monaco-loader.ts',
        'src/**/__tests__/**',
        // 排除样式文件
        'src/**/*.styles.ts',
        // 排除纯导出文件
        'src/**/index.ts',
        'src/**/index.tsx',
      ],
      thresholds: {
        global: {
          branches: 39,
          functions: 50,
          lines: 60,
          statements: 60,
        },
      },
    },
    // Mock 配置 - 只保留实际使用的依赖
    alias: {
      '\\.svg$': resolve(__dirname, 'test/__mocks__/fileMock.ts'),
      // CodeMirror 相关 - 编辑器使用
      '@lezer/highlight': resolve(__dirname, 'test/__mocks__/lezerMock.ts'),
      '@codemirror/language': resolve(__dirname, 'test/__mocks__/codemirrorLanguageMock.ts'),
      '@codemirror/lang-json': resolve(__dirname, 'test/__mocks__/codemirrorLangJsonMock.ts'),
      // 第三方库
      '@ant-design/agentic-ui': resolve(__dirname, 'test/__mocks__/mdEditorMock.ts'),
      'parse-json': resolve(__dirname, 'test/__mocks__/parse-json.ts'),
      jsonrepair: resolve(__dirname, 'test/__mocks__/jsonrepair.ts'),
    },
    // CSS 模块处理
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
})
