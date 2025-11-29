import '@testing-library/jest-dom'

// Mock Chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    getURL: jest.fn((path: string) => `chrome-extension://test-id/${path}`),
    onInstalled: {
      addListener: jest.fn(),
    },
    onStartup: {
      addListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn((_keys: any) => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
    },
  },
  tabs: {
    sendMessage: jest.fn(() => Promise.resolve()),
    query: jest.fn(() => Promise.resolve([])),
  },
  action: {
    onClicked: {
      addListener: jest.fn(),
    },
    setTitle: jest.fn(() => Promise.resolve()),
    setIcon: jest.fn(() => Promise.resolve()),
  },
} as any

// Mock window.postMessage
global.postMessage = jest.fn()

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}

// Mock window.matchMedia (required by Ant Design)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
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
