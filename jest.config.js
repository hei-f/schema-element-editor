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
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.svg$': '<rootDir>/test/__mocks__/fileMock.ts',
    '^monaco-editor$': '<rootDir>/test/__mocks__/fileMock.ts',
    '^monaco-editor/(.*)$': '<rootDir>/test/__mocks__/fileMock.ts',
    '^@monaco-editor/react$': '<rootDir>/test/__mocks__/monacoMock.ts',
    '\\?worker$': '<rootDir>/test/__mocks__/fileMock.ts',
    '^@/utils/monaco-loader$': '<rootDir>/test/__mocks__/monacoLoaderMock.ts',
    '^@shared/utils/monaco-loader$': '<rootDir>/test/__mocks__/monacoLoaderMock.ts',
    '^@ant-design/md-editor$': '<rootDir>/test/__mocks__/mdEditorMock.ts',
    '^@lezer/highlight$': '<rootDir>/test/__mocks__/lezerMock.ts',
    '^@codemirror/language$': '<rootDir>/test/__mocks__/codemirrorLanguageMock.ts',
    '^@codemirror/lang-json$': '<rootDir>/test/__mocks__/codemirrorLangJsonMock.ts'
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/shared/types/**',
    '!src/**/*.stories.tsx',
    '!src/core/background/**',
    '!src/core/content/index.tsx',
    '!src/core/content/core/monitor.ts',
    '!src/features/options-page/index.tsx',
    '!src/shared/utils/browser/monaco-loader.ts'
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

