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
      '@test': resolve(__dirname, 'test'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 30000,
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
        // 测试文件
        'src/**/__tests__/**',
        // 类型定义文件
        'src/**/*.d.ts',
        'src/shared/types/**',
        'src/features/schema-drawer/types/**',
        // 依赖浏览器环境的模块（Chrome API、Shadow DOM、iframe 等）
        'src/core/background/**',
        'src/core/content/**',
        'src/content/**',
        'src/shared/components/ContentApp.tsx',
        'src/shared/components/IframeHighlightOverlay/**',
        'src/shared/utils/iframe-bridge.ts',
        // 入口文件（仅导出/挂载）
        'src/features/options-page/index.tsx',
        'src/features/schema-drawer/index.tsx',
        'src/features/favorites/index.tsx',
        // 纯样式文件（styled-components 定义，无逻辑）
        'src/**/*.styles.ts',
        'src/**/styles.ts',
        // 大型容器组件（逻辑已在 hooks 中测试，组件仅做组合）
        'src/features/schema-drawer/components/SchemaDrawer.tsx',
        'src/features/schema-drawer/components/editor/SchemaDiffView.tsx',
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
