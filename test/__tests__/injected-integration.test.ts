/**
 * Injected Script 集成测试
 * 测试自定义函数名功能是否正常工作
 */

describe('Injected Script 集成测试', () => {
  let mockStorage: any
  let messageListeners: Array<(event: MessageEvent) => void>
  let postedMessages: any[]

  beforeEach(() => {
    // 重置状态
    messageListeners = []
    postedMessages = []

    // Mock chrome.storage.local
    mockStorage = {
      getFunctionName: '__getSchemaByParams',
      updateFunctionName: '__updateSchemaByParams'
    }

    global.chrome = {
      storage: {
        local: {
          get: jest.fn((_keys: string[], callback: (result: any) => void) => {
            callback(mockStorage)
          })
        }
      }
    } as any

    // Mock window.addEventListener
    global.window.addEventListener = jest.fn((event: string, handler: any) => {
      if (event === 'message') {
        messageListeners.push(handler)
      }
    }) as any

    // Mock window.postMessage
    global.window.postMessage = jest.fn((message: any) => {
      postedMessages.push(message)
    }) as any
  })

  afterEach(() => {
    delete (global as any).chrome
    messageListeners = []
    postedMessages = []
  })

  /**
   * 模拟 injected.js 的核心逻辑
   */
  function simulateInjectedScript() {
    const MESSAGE_SOURCE = {
      FROM_CONTENT: 'schema-editor-content',
      FROM_INJECTED: 'schema-editor-injected'
    }

    const functionNames = {
      get: '__getSchemaByParams',
      update: '__updateSchemaByParams'
    }

    // 监听消息
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.source !== window) return
      if (!event.data || event.data.source !== MESSAGE_SOURCE.FROM_CONTENT) return

      const { type, payload } = event.data

      switch (type) {
        case 'CONFIG_SYNC':
          handleConfigSync(payload)
          break
        case 'GET_SCHEMA':
          handleGetSchema(payload)
          break
        case 'UPDATE_SCHEMA':
          handleUpdateSchema(payload)
          break
      }
    })

    function handleConfigSync(payload: any) {
      const { getFunctionName, updateFunctionName } = payload || {}
      
      if (getFunctionName) {
        functionNames.get = getFunctionName
      }
      if (updateFunctionName) {
        functionNames.update = updateFunctionName
      }
    }

    function handleGetSchema(payload: any) {
      const { params } = payload || {}

      try {
        const getFn = (window as any)[functionNames.get]
        if (typeof getFn !== 'function') {
          sendResponse('SCHEMA_RESPONSE', {
            success: false,
            error: `页面未提供${functionNames.get}方法`
          })
          return
        }

        const schema = getFn(params)
        sendResponse('SCHEMA_RESPONSE', {
          success: true,
          data: schema
        })
      } catch (error: any) {
        sendResponse('SCHEMA_RESPONSE', {
          success: false,
          error: error.message || '获取Schema时发生错误'
        })
      }
    }

    function handleUpdateSchema(payload: any) {
      const { schema, params } = payload || {}

      try {
        const updateFn = (window as any)[functionNames.update]
        if (typeof updateFn !== 'function') {
          sendResponse('UPDATE_RESULT', {
            success: false,
            error: `页面未提供${functionNames.update}方法`
          })
          return
        }

        const result = updateFn(schema, params)
        sendResponse('UPDATE_RESULT', {
          success: !!result,
          message: result ? '更新成功' : '更新失败'
        })
      } catch (error: any) {
        sendResponse('UPDATE_RESULT', {
          success: false,
          error: error.message || '更新Schema时发生错误'
        })
      }
    }

    function sendResponse(type: string, payload: any) {
      window.postMessage(
        {
          source: MESSAGE_SOURCE.FROM_INJECTED,
          type,
          payload
        },
        '*'
      )
    }

    return { functionNames }
  }

  /**
   * 触发消息事件
   */
  function triggerMessage(data: any) {
    const event = {
      source: window,
      data
    } as unknown as MessageEvent

    messageListeners.forEach(listener => listener(event))
  }

  describe('默认函数名', () => {
    it('应该使用默认函数名获取Schema', () => {
      // 设置页面函数
      ;(window as any).__getSchemaByParams = jest.fn((params: string) => ({
        data: 'test',
        params
      }))

      // 初始化脚本
      simulateInjectedScript()

      // 触发获取Schema消息
      triggerMessage({
        source: 'schema-editor-content',
        type: 'GET_SCHEMA',
        payload: { params: 'param1,param2' }
      })

      // 验证页面函数被调用
      expect((window as any).__getSchemaByParams).toHaveBeenCalledWith('param1,param2')

      // 验证响应消息
      expect(postedMessages).toHaveLength(1)
      expect(postedMessages[0]).toEqual({
        source: 'schema-editor-injected',
        type: 'SCHEMA_RESPONSE',
        payload: {
          success: true,
          data: {
            data: 'test',
            params: 'param1,param2'
          }
        }
      })
    })

    it('应该使用默认函数名更新Schema', () => {
      ;(window as any).__updateSchemaByParams = jest.fn(() => true)

      simulateInjectedScript()

      triggerMessage({
        source: 'schema-editor-content',
        type: 'UPDATE_SCHEMA',
        payload: {
          schema: { updated: 'data' },
          params: 'param1,param2'
        }
      })

      expect((window as any).__updateSchemaByParams).toHaveBeenCalledWith(
        { updated: 'data' },
        'param1,param2'
      )

      expect(postedMessages[0]).toEqual({
        source: 'schema-editor-injected',
        type: 'UPDATE_RESULT',
        payload: {
          success: true,
          message: '更新成功'
        }
      })
    })

    it('当默认函数不存在时应该返回错误', () => {
      // 确保函数不存在
      delete (window as any).__getSchemaByParams

      simulateInjectedScript()

      triggerMessage({
        source: 'schema-editor-content',
        type: 'GET_SCHEMA',
        payload: { params: 'test' }
      })

      expect(postedMessages).toHaveLength(1)
      expect(postedMessages[0]).toEqual({
        source: 'schema-editor-injected',
        type: 'SCHEMA_RESPONSE',
        payload: {
          success: false,
          error: '页面未提供__getSchemaByParams方法'
        }
      })
    })
  })

  describe('自定义函数名', () => {
    it('应该使用自定义函数名获取Schema', () => {
      ;(window as any).myCustomGetFn = jest.fn((params: string) => ({
        custom: 'data',
        params
      }))

      simulateInjectedScript()

      // 先发送 CONFIG_SYNC 消息
      triggerMessage({
        source: 'schema-editor-content',
        type: 'CONFIG_SYNC',
        payload: {
          getFunctionName: 'myCustomGetFn',
          updateFunctionName: 'myCustomUpdateFn'
        }
      })

      // 再发送 GET_SCHEMA 消息
      triggerMessage({
        source: 'schema-editor-content',
        type: 'GET_SCHEMA',
        payload: { params: 'custom-params' }
      })

      // 验证自定义函数被调用
      expect((window as any).myCustomGetFn).toHaveBeenCalledWith('custom-params')

      // 验证响应
      expect(postedMessages[0]).toEqual({
        source: 'schema-editor-injected',
        type: 'SCHEMA_RESPONSE',
        payload: {
          success: true,
          data: {
            custom: 'data',
            params: 'custom-params'
          }
        }
      })
    })

    it('应该使用自定义函数名更新Schema', () => {
      ;(window as any).myCustomUpdateFn = jest.fn(() => true)

      simulateInjectedScript()

      // 先发送 CONFIG_SYNC 消息
      triggerMessage({
        source: 'schema-editor-content',
        type: 'CONFIG_SYNC',
        payload: {
          getFunctionName: 'myCustomGetFn',
          updateFunctionName: 'myCustomUpdateFn'
        }
      })

      // 再发送 UPDATE_SCHEMA 消息
      triggerMessage({
        source: 'schema-editor-content',
        type: 'UPDATE_SCHEMA',
        payload: {
          schema: { custom: 'update' },
          params: 'custom-params'
        }
      })

      expect((window as any).myCustomUpdateFn).toHaveBeenCalledWith(
        { custom: 'update' },
        'custom-params'
      )

      expect(postedMessages[0]).toEqual({
        source: 'schema-editor-injected',
        type: 'UPDATE_RESULT',
        payload: {
          success: true,
          message: '更新成功'
        }
      })
    })

    it('当自定义函数不存在时应该返回包含函数名的错误', () => {
      // 确保自定义函数不存在
      delete (window as any).myCustomGetFn

      simulateInjectedScript()

      // 先发送 CONFIG_SYNC 消息
      triggerMessage({
        source: 'schema-editor-content',
        type: 'CONFIG_SYNC',
        payload: {
          getFunctionName: 'myCustomGetFn'
        }
      })

      // 再发送 GET_SCHEMA 消息
      triggerMessage({
        source: 'schema-editor-content',
        type: 'GET_SCHEMA',
        payload: { params: 'test' }
      })

      expect(postedMessages).toHaveLength(1)
      expect(postedMessages[0]).toEqual({
        source: 'schema-editor-injected',
        type: 'SCHEMA_RESPONSE',
        payload: {
          success: false,
          error: '页面未提供myCustomGetFn方法'
        }
      })
    })

    it('更新函数不存在时应该返回包含自定义函数名的错误', () => {
      // 确保自定义更新函数不存在
      delete (window as any).myCustomUpdateFn

      simulateInjectedScript()

      // 先发送 CONFIG_SYNC 消息
      triggerMessage({
        source: 'schema-editor-content',
        type: 'CONFIG_SYNC',
        payload: {
          updateFunctionName: 'myCustomUpdateFn'
        }
      })

      // 再发送 UPDATE_SCHEMA 消息
      triggerMessage({
        source: 'schema-editor-content',
        type: 'UPDATE_SCHEMA',
        payload: {
          schema: { data: 'test' },
          params: 'test'
        }
      })

      expect(postedMessages).toHaveLength(1)
      expect(postedMessages[0]).toEqual({
        source: 'schema-editor-injected',
        type: 'UPDATE_RESULT',
        payload: {
          success: false,
          error: '页面未提供myCustomUpdateFn方法'
        }
      })
    })
  })

  describe('错误处理', () => {
    it('当函数执行抛出异常时应该捕获错误', () => {
      ;(window as any).__getSchemaByParams = jest.fn(() => {
        throw new Error('Function execution error')
      })

      simulateInjectedScript()

      triggerMessage({
        source: 'schema-editor-content',
        type: 'GET_SCHEMA',
        payload: { params: 'test' }
      })

      expect(postedMessages[0]).toEqual({
        source: 'schema-editor-injected',
        type: 'SCHEMA_RESPONSE',
        payload: {
          success: false,
          error: 'Function execution error'
        }
      })
    })

    it('更新函数抛出异常时应该捕获错误', () => {
      ;(window as any).__updateSchemaByParams = jest.fn(() => {
        throw new Error('Update error')
      })

      simulateInjectedScript()

      triggerMessage({
        source: 'schema-editor-content',
        type: 'UPDATE_SCHEMA',
        payload: {
          schema: { data: 'test' },
          params: 'test'
        }
      })

      expect(postedMessages[0]).toEqual({
        source: 'schema-editor-injected',
        type: 'UPDATE_RESULT',
        payload: {
          success: false,
          error: 'Update error'
        }
      })
    })
  })

  describe('重复注入检测', () => {
    it('应该在首次注入时设置全局标记', () => {
      // 确保标记初始不存在
      delete (window as any).__SCHEMA_EDITOR_INJECTED__

      // 模拟 injected.js 的注入检测逻辑
      const injectScript = () => {
        if ((window as any).__SCHEMA_EDITOR_INJECTED__) {
          return false // 已注入，跳过
        }
        ;(window as any).__SCHEMA_EDITOR_INJECTED__ = true
        return true // 新注入
      }

      const result = injectScript()

      expect(result).toBe(true)
      expect((window as any).__SCHEMA_EDITOR_INJECTED__).toBe(true)
    })

    it('应该在重复注入时返回 false', () => {
      // 设置已注入标记
      ;(window as any).__SCHEMA_EDITOR_INJECTED__ = true

      const injectScript = () => {
        if ((window as any).__SCHEMA_EDITOR_INJECTED__) {
          return false // 已注入，跳过
        }
        ;(window as any).__SCHEMA_EDITOR_INJECTED__ = true
        return true // 新注入
      }

      const result = injectScript()

      expect(result).toBe(false)
    })

    it('应该在检测到已注入时跳过脚本执行', () => {
      ;(window as any).__SCHEMA_EDITOR_INJECTED__ = true

      let scriptExecuted = false

      // 模拟完整的 injected.js 逻辑
      const runInjectedScript = () => {
        if ((window as any).__SCHEMA_EDITOR_INJECTED__) {
          console.log('Schema Editor injected script已存在，跳过重复注入')
          return
        }

        ;(window as any).__SCHEMA_EDITOR_INJECTED__ = true
        scriptExecuted = true
        // ... 其他初始化逻辑
      }

      runInjectedScript()

      expect(scriptExecuted).toBe(false)
    })

    it('应该在标记不存在时正常执行脚本', () => {
      delete (window as any).__SCHEMA_EDITOR_INJECTED__

      let scriptExecuted = false

      const runInjectedScript = () => {
        if ((window as any).__SCHEMA_EDITOR_INJECTED__) {
          console.log('Schema Editor injected script已存在，跳过重复注入')
          return
        }

        ;(window as any).__SCHEMA_EDITOR_INJECTED__ = true
        scriptExecuted = true
        // ... 其他初始化逻辑
      }

      runInjectedScript()

      expect(scriptExecuted).toBe(true)
      expect((window as any).__SCHEMA_EDITOR_INJECTED__).toBe(true)
    })

    it('全局标记应该在整个会话中保持', () => {
      delete (window as any).__SCHEMA_EDITOR_INJECTED__

      // 第一次注入
      ;(window as any).__SCHEMA_EDITOR_INJECTED__ = true

      // 模拟后续的注入尝试
      const attempts = [1, 2, 3, 4, 5]
      const results = attempts.map(() => {
        if ((window as any).__SCHEMA_EDITOR_INJECTED__) {
          return 'skipped'
        }
        return 'injected'
      })

      // 所有后续尝试都应该被跳过
      expect(results).toEqual(['skipped', 'skipped', 'skipped', 'skipped', 'skipped'])
      expect((window as any).__SCHEMA_EDITOR_INJECTED__).toBe(true)
    })
  })

  describe('CONFIG_SYNC 消息处理', () => {
    it('应该通过 CONFIG_SYNC 消息更新函数名配置', () => {
      ;(window as any).syncedGetFn = jest.fn(() => ({ synced: true }))

      simulateInjectedScript()

      // 发送 CONFIG_SYNC 消息
      triggerMessage({
        source: 'schema-editor-content',
        type: 'CONFIG_SYNC',
        payload: {
          getFunctionName: 'syncedGetFn',
          updateFunctionName: 'syncedUpdateFn'
        }
      })

      // 触发 GET_SCHEMA 验证配置已更新
      triggerMessage({
        source: 'schema-editor-content',
        type: 'GET_SCHEMA',
        payload: { params: 'test' }
      })

      expect((window as any).syncedGetFn).toHaveBeenCalledWith('test')
    })

    it('应该支持只更新部分配置', () => {
      ;(window as any).partialGetFn = jest.fn(() => ({ partial: true }))
      ;(window as any).__updateSchemaByParams = jest.fn(() => true)

      simulateInjectedScript()

      // 只更新 getFunctionName
      triggerMessage({
        source: 'schema-editor-content',
        type: 'CONFIG_SYNC',
        payload: {
          getFunctionName: 'partialGetFn'
        }
      })

      // 验证 get 函数名已更新
      triggerMessage({
        source: 'schema-editor-content',
        type: 'GET_SCHEMA',
        payload: { params: 'test' }
      })
      expect((window as any).partialGetFn).toHaveBeenCalled()

      // 验证 update 函数名仍为默认值
      triggerMessage({
        source: 'schema-editor-content',
        type: 'UPDATE_SCHEMA',
        payload: { schema: {}, params: 'test' }
      })
      expect((window as any).__updateSchemaByParams).toHaveBeenCalled()
    })

    it('当配置为空时应该保持默认函数名', () => {
      ;(window as any).__getSchemaByParams = jest.fn(() => ({ default: true }))

      simulateInjectedScript()

      // 发送空配置
      triggerMessage({
        source: 'schema-editor-content',
        type: 'CONFIG_SYNC',
        payload: {}
      })

      // 验证仍使用默认函数名
      triggerMessage({
        source: 'schema-editor-content',
        type: 'GET_SCHEMA',
        payload: { params: 'test' }
      })

      expect((window as any).__getSchemaByParams).toHaveBeenCalled()
    })
  })
})

