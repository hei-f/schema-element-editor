import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock build-time constants - 测试环境下设置为开发模式
// 注：__IS_RELEASE_BUILD__ 类型已在 src/vite-env.d.ts 中声明
;(globalThis as any).__IS_RELEASE_BUILD__ = false

// Mock Chrome API
global.chrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
    onInstalled: {
      addListener: vi.fn(),
    },
    onStartup: {
      addListener: vi.fn(),
    },
  },
  storage: {
    local: {
      get: vi.fn((_keys: any) => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
      remove: vi.fn(() => Promise.resolve()),
    },
  },
  tabs: {
    sendMessage: vi.fn(() => Promise.resolve()),
    query: vi.fn(() => Promise.resolve([])),
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
    },
    setTitle: vi.fn(() => Promise.resolve()),
    setIcon: vi.fn(() => Promise.resolve()),
  },
} as any

// Mock window.postMessage
global.postMessage = vi.fn()

// Suppress console errors in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}

// Mock window.matchMedia (required by Ant Design)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver (used by ScrollableParams)
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  constructor(callback: IntersectionObserverCallback) {
    // 立即调用回调以模拟初始状态
    setTimeout(() => {
      callback([], this)
    }, 0)
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

global.IntersectionObserver = MockIntersectionObserver

// Mock ResizeObserver (used by ScrollableParams)
class MockResizeObserver implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

global.ResizeObserver = MockResizeObserver
