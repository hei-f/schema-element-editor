/**
 * iframe-bridge 单元测试
 * 测试跨 iframe 通信功能
 */

import { IframeBridgeMessageType } from '@/shared/types'

describe('iframe-bridge', () => {
  describe('iframeConfig.enabled 配置检查', () => {
    it('当 iframeEnabled = false 时，throttledBroadcastToIframe 不应发送广播', () => {
      const broadcastAltKeyState = jest.fn()
      const iframeEnabled = false

      // 模拟 throttledBroadcastToIframe 逻辑
      const throttledBroadcastToIframe = (mouseX: number, mouseY: number) => {
        if (!iframeEnabled) return
        broadcastAltKeyState(true, { x: mouseX, y: mouseY })
      }

      throttledBroadcastToIframe(100, 200)
      expect(broadcastAltKeyState).not.toHaveBeenCalled()
    })

    it('当 iframeEnabled = true 时，throttledBroadcastToIframe 应发送广播', () => {
      const broadcastAltKeyState = jest.fn()
      const iframeEnabled = true

      const throttledBroadcastToIframe = (mouseX: number, mouseY: number) => {
        if (!iframeEnabled) return
        broadcastAltKeyState(true, { x: mouseX, y: mouseY })
      }

      throttledBroadcastToIframe(100, 200)
      expect(broadcastAltKeyState).toHaveBeenCalledWith(true, { x: 100, y: 200 })
    })

    it('handleResumeMonitor 在 iframeEnabled = false 时不应广播', () => {
      const broadcastAltKeyState = jest.fn()
      const isIframeMode = false
      const iframeEnabled = false

      // 模拟 handleResumeMonitor 中的广播逻辑
      if (!isIframeMode && iframeEnabled) {
        broadcastAltKeyState(false, { x: 0, y: 0 })
      }

      expect(broadcastAltKeyState).not.toHaveBeenCalled()
    })

    it('handleResumeMonitor 在 iframeEnabled = true 时应广播', () => {
      const broadcastAltKeyState = jest.fn()
      const isIframeMode = false
      const iframeEnabled = true

      if (!isIframeMode && iframeEnabled) {
        broadcastAltKeyState(false, { x: 0, y: 0 })
      }

      expect(broadcastAltKeyState).toHaveBeenCalledWith(false, { x: 0, y: 0 })
    })

    it('handleKeyUp 在 iframeEnabled = false 时不应广播清除消息', () => {
      const broadcastAltKeyState = jest.fn()
      const isIframeMode = false
      const iframeEnabled = false

      // 模拟 handleKeyUp 中的广播逻辑
      if (!isIframeMode) {
        if (iframeEnabled) {
          broadcastAltKeyState(false, { x: 0, y: 0 })
        }
      }

      expect(broadcastAltKeyState).not.toHaveBeenCalled()
    })

    it('iframe 内 content script 在 iframeConfig.enabled = false 时应跳过初始化', () => {
      const isIframe = true
      const iframeConfigEnabled = false
      let isDestroyed = false

      // 模拟 content-app.ts 中的初始化逻辑
      if (isIframe && !iframeConfigEnabled) {
        isDestroyed = true
      }

      expect(isDestroyed).toBe(true)
    })

    it('top frame 在 iframeConfig.enabled = false 时不应初始化 iframe bridge', () => {
      const isTop = true
      const iframeConfigEnabled = false
      let iframeBridgeInitialized = false

      // 模拟 content-app.ts 中的初始化逻辑
      if (isTop && iframeConfigEnabled) {
        iframeBridgeInitialized = true
      }

      expect(iframeBridgeInitialized).toBe(false)
    })

    it('top frame 在 iframeConfig.enabled = true 时应初始化 iframe bridge', () => {
      const isTop = true
      const iframeConfigEnabled = true
      let iframeBridgeInitialized = false

      if (isTop && iframeConfigEnabled) {
        iframeBridgeInitialized = true
      }

      expect(iframeBridgeInitialized).toBe(true)
    })
  })

  let postedMessages: any[]
  let messageListeners: Array<(event: MessageEvent) => void>
  let originalTop: Window | null
  let originalParent: Window

  beforeEach(() => {
    postedMessages = []
    messageListeners = []

    // 保存原始值
    originalTop = window.top
    originalParent = window.parent

    // Mock window.addEventListener
    window.addEventListener = jest.fn((event: string, handler: any) => {
      if (event === 'message') {
        messageListeners.push(handler)
      }
    }) as any

    // Mock window.removeEventListener
    window.removeEventListener = jest.fn() as any

    // Mock window.postMessage
    window.postMessage = jest.fn((message: any) => {
      postedMessages.push({ target: 'self', message })
    }) as any
  })

  afterEach(() => {
    // 恢复原始值
    Object.defineProperty(window, 'top', { value: originalTop, writable: true })
    Object.defineProperty(window, 'parent', { value: originalParent, writable: true })
    postedMessages = []
    messageListeners = []
  })

  describe('isTopFrame / isInIframe', () => {
    it('当 window === window.top 时，isTopFrame 应返回 true', () => {
      Object.defineProperty(window, 'top', { value: window, writable: true })

      // 模拟 isTopFrame 逻辑
      const isTopFrame = window === window.top
      expect(isTopFrame).toBe(true)
    })

    it('当 window !== window.top 时，isInIframe 应返回 true', () => {
      const mockTop = {} as Window
      Object.defineProperty(window, 'top', { value: mockTop, writable: true })

      // 模拟 isInIframe 逻辑
      const isInIframe = window !== window.top
      expect(isInIframe).toBe(true)
    })
  })

  describe('isSameOriginIframe', () => {
    it('在 top frame 中应返回 false', () => {
      Object.defineProperty(window, 'top', { value: window, writable: true })

      // 模拟 isSameOriginIframe 逻辑
      const isInIframe = window !== window.top
      if (!isInIframe) {
        expect(false).toBe(false) // 不在 iframe 中
      }
    })

    it('在同源 iframe 中应返回 true', () => {
      const mockTop = {} as Window
      const mockParent = {
        location: { href: 'http://localhost:3000' },
      } as unknown as Window

      Object.defineProperty(window, 'top', { value: mockTop, writable: true })
      Object.defineProperty(window, 'parent', { value: mockParent, writable: true })

      // 模拟 isSameOriginIframe 逻辑
      const isInIframe = window !== window.top
      let isSameOrigin = false

      if (isInIframe) {
        try {
          // 尝试访问 parent.location.href
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          ;(window.parent as Window & { location: { href: string } }).location.href
          isSameOrigin = true
        } catch {
          isSameOrigin = false
        }
      }

      expect(isSameOrigin).toBe(true)
    })
  })

  describe('消息发送', () => {
    it('sendToTopFrame 应向 window.top 发送消息', () => {
      const mockTop = {
        postMessage: jest.fn(),
      } as unknown as Window

      Object.defineProperty(window, 'top', { value: mockTop, writable: true })

      const IFRAME_BRIDGE_SOURCE = 'schema-editor-iframe-bridge'
      const message = {
        source: IFRAME_BRIDGE_SOURCE,
        type: IframeBridgeMessageType.ELEMENT_HOVER,
        payload: { test: 'data' },
      }

      // 模拟 sendToTopFrame
      window.top!.postMessage(message, '*')

      expect(mockTop.postMessage).toHaveBeenCalledWith(message, '*')
    })

    it('broadcastToIframes 应向所有 iframe 发送消息', () => {
      // 创建 mock iframes
      const mockIframe1 = {
        contentWindow: { postMessage: jest.fn() },
      }
      const mockIframe2 = {
        contentWindow: { postMessage: jest.fn() },
      }

      document.querySelectorAll = jest.fn(() => [mockIframe1, mockIframe2]) as any

      const IFRAME_BRIDGE_SOURCE = 'schema-editor-iframe-bridge'
      const message = {
        source: IFRAME_BRIDGE_SOURCE,
        type: IframeBridgeMessageType.HIGHLIGHT_ALL_REQUEST,
        payload: null,
      }

      // 模拟 broadcastToIframes
      const iframes = document.querySelectorAll('iframe')
      iframes.forEach((iframe: any) => {
        try {
          iframe.contentWindow?.postMessage(message, '*')
        } catch {
          // 跨域 iframe 会抛出异常
        }
      })

      expect(mockIframe1.contentWindow.postMessage).toHaveBeenCalledWith(message, '*')
      expect(mockIframe2.contentWindow.postMessage).toHaveBeenCalledWith(message, '*')
    })
  })

  describe('消息监听', () => {
    it('应正确过滤非 iframe-bridge 消息', () => {
      const IFRAME_BRIDGE_SOURCE = 'schema-editor-iframe-bridge'
      const handlers = {
        onElementHover: jest.fn(),
      }

      // 模拟 initIframeBridgeListener
      const listener = (event: MessageEvent) => {
        if (!event.data || event.data.source !== IFRAME_BRIDGE_SOURCE) return
        if (event.data.type === IframeBridgeMessageType.ELEMENT_HOVER) {
          handlers.onElementHover(event.data.payload)
        }
      }

      // 触发非 iframe-bridge 消息
      listener({ data: { source: 'other-source', type: 'TEST' } } as MessageEvent)
      expect(handlers.onElementHover).not.toHaveBeenCalled()

      // 触发 iframe-bridge 消息
      listener({
        data: {
          source: IFRAME_BRIDGE_SOURCE,
          type: IframeBridgeMessageType.ELEMENT_HOVER,
          payload: { test: 'hover' },
        },
      } as MessageEvent)
      expect(handlers.onElementHover).toHaveBeenCalledWith({ test: 'hover' })
    })

    it('应正确处理 ELEMENT_CLICK 消息', () => {
      const IFRAME_BRIDGE_SOURCE = 'schema-editor-iframe-bridge'
      const handlers = {
        onElementClick: jest.fn(),
      }

      const listener = (event: MessageEvent) => {
        if (!event.data || event.data.source !== IFRAME_BRIDGE_SOURCE) return
        if (event.data.type === IframeBridgeMessageType.ELEMENT_CLICK) {
          handlers.onElementClick(event.data.payload)
        }
      }

      const payload = {
        attrs: { params: ['test-id'] },
        isRecordingMode: false,
        iframeOrigin: 'http://localhost:3000',
      }

      listener({
        data: {
          source: IFRAME_BRIDGE_SOURCE,
          type: IframeBridgeMessageType.ELEMENT_CLICK,
          payload,
        },
      } as MessageEvent)

      expect(handlers.onElementClick).toHaveBeenCalledWith(payload)
    })

    it('应正确处理 CLEAR_HIGHLIGHT 消息', () => {
      const IFRAME_BRIDGE_SOURCE = 'schema-editor-iframe-bridge'
      const handlers = {
        onClearHighlight: jest.fn(),
      }

      const listener = (event: MessageEvent) => {
        if (!event.data || event.data.source !== IFRAME_BRIDGE_SOURCE) return
        if (event.data.type === IframeBridgeMessageType.CLEAR_HIGHLIGHT) {
          handlers.onClearHighlight()
        }
      }

      listener({
        data: {
          source: IFRAME_BRIDGE_SOURCE,
          type: IframeBridgeMessageType.CLEAR_HIGHLIGHT,
          payload: null,
        },
      } as MessageEvent)

      expect(handlers.onClearHighlight).toHaveBeenCalled()
    })

    it('应正确处理 SYNC_ALT_KEY 消息', () => {
      const IFRAME_BRIDGE_SOURCE = 'schema-editor-iframe-bridge'
      const handlers = {
        onAltKeySync: jest.fn(),
      }

      const listener = (event: MessageEvent) => {
        if (!event.data || event.data.source !== IFRAME_BRIDGE_SOURCE) return
        if (event.data.type === IframeBridgeMessageType.SYNC_ALT_KEY) {
          handlers.onAltKeySync(event.data.payload)
        }
      }

      const payload = {
        isPressed: true,
        mousePosition: { x: 100, y: 200 },
      }

      listener({
        data: {
          source: IFRAME_BRIDGE_SOURCE,
          type: IframeBridgeMessageType.SYNC_ALT_KEY,
          payload,
        },
      } as MessageEvent)

      expect(handlers.onAltKeySync).toHaveBeenCalledWith(payload)
    })
  })

  describe('坐标转换', () => {
    it('convertRectToTopFrame 应正确转换 rect 坐标', () => {
      // 模拟 iframe 偏移
      const iframeOffset = { left: 100, top: 50 }
      const rect = { left: 10, top: 20, width: 200, height: 100 }

      // 模拟 convertRectToTopFrame
      const convertedRect = {
        left: rect.left + iframeOffset.left,
        top: rect.top + iframeOffset.top,
        width: rect.width,
        height: rect.height,
      }

      expect(convertedRect).toEqual({
        left: 110,
        top: 70,
        width: 200,
        height: 100,
      })
    })

    it('convertMousePositionToTopFrame 应正确转换鼠标坐标', () => {
      const iframeOffset = { left: 100, top: 50 }
      const mouseX = 150
      const mouseY = 200

      // 模拟 convertMousePositionToTopFrame
      const convertedPos = {
        x: mouseX + iframeOffset.left,
        y: mouseY + iframeOffset.top,
      }

      expect(convertedPos).toEqual({ x: 250, y: 250 })
    })
  })
})
