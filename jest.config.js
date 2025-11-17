/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.{spec,test}.{ts,tsx}'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.svg$': '<rootDir>/test/__mocks__/fileMock.ts',
    '^monaco-editor$': '<rootDir>/test/__mocks__/fileMock.ts',
    '^monaco-editor/(.*)$': '<rootDir>/test/__mocks__/fileMock.ts',
    '^@monaco-editor/react$': '<rootDir>/test/__mocks__/monacoMock.ts',
    '\\?worker$': '<rootDir>/test/__mocks__/fileMock.ts',
    '^@/utils/monaco-loader$': '<rootDir>/test/__mocks__/monacoLoaderMock.ts',
    '^@ant-design/md-editor$': '<rootDir>/test/__mocks__/mdEditorMock.ts'
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/**/*.stories.tsx',
    '!src/background/**', // 排除background (Chrome Service Worker环境难以测试)
    '!src/content/index.tsx', // 排除content入口 (需要完整DOM环境)
    '!src/content/monitor.ts', // 排除monitor (需要完整浏览器环境)
    '!src/options/index.tsx', // 排除options入口
    '!src/utils/monaco-loader.ts' // 排除monaco-loader (需要worker环境)
  ],
  coverageThreshold: {
    global: {
      branches: 39,
      functions: 50,
      lines: 60,
      statements: 60
    }
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.test.json'
    }]
  }
}

