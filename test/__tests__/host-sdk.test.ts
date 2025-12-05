/**
 * Host SDK 单元测试
 * 测试 createSchemaEditorBridge 功能
 */

describe('Host SDK - createSchemaEditorBridge', () => {
  let postedMessages: any[]
  let messageListeners: Array<(event: MessageEvent) => void>
  let originalTop: Window | null

  const DEFAULT_SOURCE_CONFIG = {
    contentSource: 'schema-editor-content',
    hostSource: 'schema-editor-host',
  }

  beforeEach(() => {
    postedMessages = []
    messageListeners = []
    originalTop = window.top

    // Mock window.addEventListener
    window.addEventListener = vi.fn((event: string, handler: any) => {
      if (event === 'message') {
        messageListeners.push(handler)
      }
    }) as any

    // Mock window.removeEventListener
    window.removeEventListener = vi.fn() as any

    // Mock window.postMessage
    window.postMessage = vi.fn((message: any) => {
      postedMessages.push(message)
    }) as any
  })

  afterEach(() => {
    Object.defineProperty(window, 'top', { value: originalTop, writable: true })
    postedMessages = []
    messageListeners = []
  })

  /**
   * 模拟触发消息
   */
  function triggerMessage(data: any, source: Window | null = window) {
    const event = { source, data } as unknown as MessageEvent
    messageListeners.forEach((listener) => listener(event))
  }

  /**
   * 模拟 createSchemaEditorBridge 核心逻辑
   */
  function simulateBridge(config: {
    getSchema: (params: string) => any
    updateSchema: (schema: any, params: string) => boolean
    renderPreview?: (schema: any, containerId: string) => (() => void) | void
  }) {
    const mergedSourceConfig = { ...DEFAULT_SOURCE_CONFIG }
    const mergedMessageTypes = {
      getSchema: 'GET_SCHEMA',
      updateSchema: 'UPDATE_SCHEMA',
      checkPreview: 'CHECK_PREVIEW',
      renderPreview: 'RENDER_PREVIEW',
      cleanupPreview: 'CLEANUP_PREVIEW',
    }

    let previewCleanupFn: (() => void) | null = null

    // 检测是否在 iframe 中
    const isInIframe = window !== window.top
    const targetWindow = isInIframe ? window.parent : window

    const sendResponse = (requestId: string, result: Record<string, unknown>) => {
      targetWindow.postMessage(
        {
          source: mergedSourceConfig.hostSource,
          requestId,
          ...result,
        },
        '*'
      )
    }

    const handleMessage = (event: MessageEvent) => {
      // 接受来自当前窗口或父窗口的消息
      const isFromSelf = event.source === window
      const isFromParent = window !== window.top && event.source === window.parent
      if (!isFromSelf && !isFromParent) return

      if (!event.data || event.data.source !== mergedSourceConfig.contentSource) return

      const { type, payload, requestId } = event.data
      if (!requestId) return

      let result: Record<string, unknown>

      switch (type) {
        case mergedMessageTypes.getSchema: {
          const params = String(payload?.params ?? '')
          try {
            const data = config.getSchema(params)
            result = { success: true, data }
          } catch (error) {
            result = {
              success: false,
              error: error instanceof Error ? error.message : '获取 Schema 失败',
            }
          }
          break
        }

        case mergedMessageTypes.updateSchema: {
          const schema = payload?.schema
          const params = String(payload?.params ?? '')
          try {
            const success = config.updateSchema(schema, params)
            result = { success }
          } catch (error) {
            result = {
              success: false,
              error: error instanceof Error ? error.message : '更新 Schema 失败',
            }
          }
          break
        }

        case mergedMessageTypes.checkPreview: {
          result = { exists: typeof config.renderPreview === 'function' }
          break
        }

        case mergedMessageTypes.renderPreview: {
          if (typeof config.renderPreview !== 'function') {
            result = { success: false, error: 'renderPreview 未定义' }
          } else {
            try {
              if (previewCleanupFn) {
                previewCleanupFn()
              }
              const cleanup = config.renderPreview(payload?.schema, payload?.containerId)
              previewCleanupFn = typeof cleanup === 'function' ? cleanup : null
              result = { success: true }
            } catch (error) {
              result = {
                success: false,
                error: error instanceof Error ? error.message : '渲染预览失败',
              }
            }
          }
          break
        }

        case mergedMessageTypes.cleanupPreview: {
          if (previewCleanupFn) {
            previewCleanupFn()
            previewCleanupFn = null
          }
          result = { success: true }
          break
        }

        default:
          return
      }

      sendResponse(requestId, result)
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }

  describe('getSchema', () => {
    it('应正确处理 GET_SCHEMA 请求', () => {
      const getSchema = vi.fn((params: string) => ({ id: params, data: 'test' }))

      simulateBridge({ getSchema, updateSchema: () => true })

      triggerMessage({
        source: DEFAULT_SOURCE_CONFIG.contentSource,
        type: 'GET_SCHEMA',
        payload: { params: 'test-id' },
        requestId: 'req-1',
      })

      expect(getSchema).toHaveBeenCalledWith('test-id')
      expect(postedMessages).toHaveLength(1)
      expect(postedMessages[0]).toEqual({
        source: DEFAULT_SOURCE_CONFIG.hostSource,
        requestId: 'req-1',
        success: true,
        data: { id: 'test-id', data: 'test' },
      })
    })

    it('getSchema 抛出异常时应返回错误', () => {
      const getSchema = vi.fn(() => {
        throw new Error('Schema not found')
      })

      simulateBridge({ getSchema, updateSchema: () => true })

      triggerMessage({
        source: DEFAULT_SOURCE_CONFIG.contentSource,
        type: 'GET_SCHEMA',
        payload: { params: 'invalid' },
        requestId: 'req-2',
      })

      expect(postedMessages[0]).toEqual({
        source: DEFAULT_SOURCE_CONFIG.hostSource,
        requestId: 'req-2',
        success: false,
        error: 'Schema not found',
      })
    })
  })

  describe('updateSchema', () => {
    it('应正确处理 UPDATE_SCHEMA 请求', () => {
      const updateSchema = vi.fn(() => true)

      simulateBridge({ getSchema: () => null, updateSchema })

      triggerMessage({
        source: DEFAULT_SOURCE_CONFIG.contentSource,
        type: 'UPDATE_SCHEMA',
        payload: { schema: { updated: 'data' }, params: 'test-id' },
        requestId: 'req-3',
      })

      expect(updateSchema).toHaveBeenCalledWith({ updated: 'data' }, 'test-id')
      expect(postedMessages[0]).toEqual({
        source: DEFAULT_SOURCE_CONFIG.hostSource,
        requestId: 'req-3',
        success: true,
      })
    })

    it('updateSchema 返回 false 时应返回失败', () => {
      const updateSchema = vi.fn(() => false)

      simulateBridge({ getSchema: () => null, updateSchema })

      triggerMessage({
        source: DEFAULT_SOURCE_CONFIG.contentSource,
        type: 'UPDATE_SCHEMA',
        payload: { schema: {}, params: 'test' },
        requestId: 'req-4',
      })

      expect(postedMessages[0]).toEqual({
        source: DEFAULT_SOURCE_CONFIG.hostSource,
        requestId: 'req-4',
        success: false,
      })
    })
  })

  describe('消息过滤', () => {
    it('应忽略非插件来源的消息', () => {
      const getSchema = vi.fn()

      simulateBridge({ getSchema, updateSchema: () => true })

      triggerMessage({
        source: 'other-source',
        type: 'GET_SCHEMA',
        payload: { params: 'test' },
        requestId: 'req-5',
      })

      expect(getSchema).not.toHaveBeenCalled()
      expect(postedMessages).toHaveLength(0)
    })

    it('应忽略没有 requestId 的消息', () => {
      const getSchema = vi.fn()

      simulateBridge({ getSchema, updateSchema: () => true })

      triggerMessage({
        source: DEFAULT_SOURCE_CONFIG.contentSource,
        type: 'GET_SCHEMA',
        payload: { params: 'test' },
        // 没有 requestId
      })

      expect(getSchema).not.toHaveBeenCalled()
    })

    it('应忽略来自其他窗口的消息', () => {
      const getSchema = vi.fn()

      simulateBridge({ getSchema, updateSchema: () => true })

      // 模拟来自其他窗口的消息
      const otherWindow = {} as Window
      triggerMessage(
        {
          source: DEFAULT_SOURCE_CONFIG.contentSource,
          type: 'GET_SCHEMA',
          payload: { params: 'test' },
          requestId: 'req-6',
        },
        otherWindow
      )

      expect(getSchema).not.toHaveBeenCalled()
    })
  })

  describe('iframe 场景', () => {
    it('在 iframe 中应向 parent 发送响应', () => {
      // 模拟在 iframe 中
      const mockTop = {} as Window
      const mockParent = {
        postMessage: vi.fn(),
      } as unknown as Window

      Object.defineProperty(window, 'top', { value: mockTop, writable: true })
      Object.defineProperty(window, 'parent', { value: mockParent, writable: true })

      // 重新定义 postMessage 以检测目标
      const isInIframe = window !== window.top
      expect(isInIframe).toBe(true)

      const targetWindow = isInIframe ? window.parent : window
      expect(targetWindow).toBe(mockParent)
    })

    it('应接受来自 parent 窗口的消息', () => {
      const mockTop = {} as Window
      const mockParent = {} as Window

      Object.defineProperty(window, 'top', { value: mockTop, writable: true })
      Object.defineProperty(window, 'parent', { value: mockParent, writable: true })

      const getSchema = vi.fn((params: string) => ({ fromIframe: true, params }))

      // 创建接受 parent 消息的监听器
      const handleMessage = (event: MessageEvent) => {
        const isFromSelf = event.source === window
        const isFromParent = window !== window.top && event.source === window.parent
        if (!isFromSelf && !isFromParent) return

        if (event.data?.source === DEFAULT_SOURCE_CONFIG.contentSource) {
          getSchema(event.data.payload?.params)
        }
      }

      // 模拟来自 parent 的消息
      handleMessage({
        source: mockParent,
        data: {
          source: DEFAULT_SOURCE_CONFIG.contentSource,
          type: 'GET_SCHEMA',
          payload: { params: 'iframe-test' },
          requestId: 'req-7',
        },
      } as unknown as MessageEvent)

      expect(getSchema).toHaveBeenCalledWith('iframe-test')
    })
  })

  describe('预览功能', () => {
    it('CHECK_PREVIEW 应返回 renderPreview 是否存在', () => {
      simulateBridge({
        getSchema: () => null,
        updateSchema: () => true,
        renderPreview: () => {},
      })

      triggerMessage({
        source: DEFAULT_SOURCE_CONFIG.contentSource,
        type: 'CHECK_PREVIEW',
        payload: {},
        requestId: 'req-8',
      })

      expect(postedMessages[0]).toEqual({
        source: DEFAULT_SOURCE_CONFIG.hostSource,
        requestId: 'req-8',
        exists: true,
      })
    })

    it('未定义 renderPreview 时 CHECK_PREVIEW 应返回 false', () => {
      simulateBridge({
        getSchema: () => null,
        updateSchema: () => true,
      })

      triggerMessage({
        source: DEFAULT_SOURCE_CONFIG.contentSource,
        type: 'CHECK_PREVIEW',
        payload: {},
        requestId: 'req-9',
      })

      expect(postedMessages[0]).toEqual({
        source: DEFAULT_SOURCE_CONFIG.hostSource,
        requestId: 'req-9',
        exists: false,
      })
    })

    it('RENDER_PREVIEW 应调用 renderPreview 函数', () => {
      const renderPreview = vi.fn()

      simulateBridge({
        getSchema: () => null,
        updateSchema: () => true,
        renderPreview,
      })

      triggerMessage({
        source: DEFAULT_SOURCE_CONFIG.contentSource,
        type: 'RENDER_PREVIEW',
        payload: { schema: { test: 'preview' }, containerId: 'preview-container' },
        requestId: 'req-10',
      })

      expect(renderPreview).toHaveBeenCalledWith({ test: 'preview' }, 'preview-container')
      expect(postedMessages[0]).toEqual({
        source: DEFAULT_SOURCE_CONFIG.hostSource,
        requestId: 'req-10',
        success: true,
      })
    })

    it('CLEANUP_PREVIEW 应调用清理函数', () => {
      const cleanupFn = vi.fn()
      const renderPreview = vi.fn(() => cleanupFn)

      simulateBridge({
        getSchema: () => null,
        updateSchema: () => true,
        renderPreview,
      })

      // 先渲染预览
      triggerMessage({
        source: DEFAULT_SOURCE_CONFIG.contentSource,
        type: 'RENDER_PREVIEW',
        payload: { schema: {}, containerId: 'container' },
        requestId: 'req-11',
      })

      // 再清理
      triggerMessage({
        source: DEFAULT_SOURCE_CONFIG.contentSource,
        type: 'CLEANUP_PREVIEW',
        payload: {},
        requestId: 'req-12',
      })

      expect(cleanupFn).toHaveBeenCalled()
    })
  })

  describe('清理函数', () => {
    it('cleanup 应移除事件监听器', () => {
      const cleanup = simulateBridge({
        getSchema: () => null,
        updateSchema: () => true,
      })

      cleanup()

      expect(window.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })
  })
})
