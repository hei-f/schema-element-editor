import type { Mock } from 'vitest'
import { MessageType } from '@/shared/types'
import {
  listenChromeMessages,
  listenPageMessages,
  postMessageToPage,
  sendMessageToBackground,
  sendMessageToContent,
  sendRequestToHost,
  initHostMessageListener,
  MESSAGE_SOURCE,
} from '../browser/message'

describe('Message工具测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendMessageToBackground', () => {
    it('应该发送消息到background', async () => {
      const message = {
        type: MessageType.GET_SCHEMA,
        payload: { params: 'test-param' },
      }

      ;(chrome.runtime.sendMessage as Mock).mockResolvedValue({ success: true })

      await sendMessageToBackground(message)

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message)
    })

    it('应该发送不同类型的消息', async () => {
      const messages = [
        { type: MessageType.GET_SCHEMA, payload: { params: 'param1' } },
        { type: MessageType.UPDATE_SCHEMA, payload: { schema: {}, params: 'param2' } },
        { type: MessageType.TOGGLE_ACTIVE, payload: { active: true } },
      ]

      ;(chrome.runtime.sendMessage as Mock).mockResolvedValue({ success: true })

      for (const msg of messages) {
        await sendMessageToBackground(msg)
      }

      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(3)
    })

    it('应该返回响应数据', async () => {
      const message = {
        type: MessageType.GET_SCHEMA,
        payload: { params: 'test' },
      }
      const mockResponse = { data: { key: 'value' } }

      ;(chrome.runtime.sendMessage as Mock).mockResolvedValue(mockResponse)

      const result = await sendMessageToBackground(message)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('postMessageToPage', () => {
    it('应该发送消息到页面', () => {
      const message = {
        type: MessageType.GET_SCHEMA,
        payload: { params: 'test-param' },
      }

      postMessageToPage(message)

      expect(window.postMessage).toHaveBeenCalledWith(
        {
          source: 'schema-editor-content',
          ...message,
        },
        '*'
      )
    })

    it('应该包含正确的source标识', () => {
      const message = {
        type: MessageType.UPDATE_SCHEMA,
        payload: { schema: { key: 'value' }, params: 'param1' },
      }

      postMessageToPage(message)

      const call = (window.postMessage as Mock).mock.calls[0]
      expect(call[0]).toHaveProperty('source', 'schema-editor-content')
      expect(call[1]).toBe('*')
    })

    it('应该发送不同类型的消息', () => {
      const messages = [
        { type: MessageType.GET_SCHEMA, payload: { params: 'p1' } },
        { type: MessageType.UPDATE_SCHEMA, payload: { schema: {}, params: 'p2' } },
        { type: MessageType.SCHEMA_RESPONSE, payload: { success: true, data: {} } },
      ]

      messages.forEach((msg) => {
        postMessageToPage(msg)
      })

      expect(window.postMessage).toHaveBeenCalledTimes(3)
    })

    it('应该处理复杂的payload', () => {
      const complexPayload = {
        schema: {
          nested: {
            deep: {
              value: [1, 2, 3],
              obj: { key: 'value' },
            },
          },
        },
        params: 'complex,nested,params',
      }

      postMessageToPage({
        type: MessageType.UPDATE_SCHEMA,
        payload: complexPayload,
      })

      const call = (window.postMessage as Mock).mock.calls[0]
      expect(call[0].payload).toEqual(complexPayload)
    })
  })

  describe('MessageType枚举', () => {
    it('应该包含所有必要的消息类型', () => {
      expect(MessageType.GET_SCHEMA).toBeDefined()
      expect(MessageType.UPDATE_SCHEMA).toBeDefined()
      expect(MessageType.SCHEMA_RESPONSE).toBeDefined()
      expect(MessageType.UPDATE_RESULT).toBeDefined()
      expect(MessageType.TOGGLE_ACTIVE).toBeDefined()
    })

    it('消息类型应该是唯一的', () => {
      const types = Object.values(MessageType)
      const uniqueTypes = new Set(types)

      expect(uniqueTypes.size).toBe(types.length)
    })
  })

  describe('消息格式验证', () => {
    it('GET_SCHEMA消息应该包含params', () => {
      const message = {
        type: MessageType.GET_SCHEMA,
        payload: { params: 'test' },
      }

      postMessageToPage(message)

      const call = (window.postMessage as Mock).mock.calls[0]
      expect(call[0].payload).toHaveProperty('params')
    })

    it('UPDATE_SCHEMA消息应该包含schema和params', () => {
      const message = {
        type: MessageType.UPDATE_SCHEMA,
        payload: {
          schema: { key: 'value' },
          params: 'param1',
        },
      }

      postMessageToPage(message)

      const call = (window.postMessage as Mock).mock.calls[0]
      expect(call[0].payload).toHaveProperty('schema')
      expect(call[0].payload).toHaveProperty('params')
    })

    it('SCHEMA_RESPONSE消息应该包含success和data', () => {
      const message = {
        type: MessageType.SCHEMA_RESPONSE,
        payload: {
          success: true,
          data: { result: 'test' },
        },
      }

      postMessageToPage(message)

      const call = (window.postMessage as Mock).mock.calls[0]
      expect(call[0].payload).toHaveProperty('success')
      expect(call[0].payload).toHaveProperty('data')
    })
  })

  describe('sendMessageToContent', () => {
    it('应该发送消息到content script', async () => {
      const tabId = 123
      const message = {
        type: MessageType.GET_SCHEMA,
        payload: { params: 'test-param' },
      }

      ;(chrome.tabs.sendMessage as Mock).mockResolvedValue({ success: true })

      await sendMessageToContent(tabId, message)

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, message)
    })

    it('应该返回响应数据', async () => {
      const tabId = 456
      const message = {
        type: MessageType.UPDATE_SCHEMA,
        payload: { schema: {}, params: 'test' },
      }
      const mockResponse = { data: { key: 'value' } }

      ;(chrome.tabs.sendMessage as Mock).mockResolvedValue(mockResponse)

      const result = await sendMessageToContent(tabId, message)

      expect(result).toEqual(mockResponse)
    })

    it('应该处理发送失败', async () => {
      const tabId = 789
      const message = {
        type: MessageType.GET_SCHEMA,
        payload: { params: 'test' },
      }

      ;(chrome.tabs.sendMessage as Mock).mockRejectedValue(new Error('Tab not found'))

      await expect(sendMessageToContent(tabId, message)).rejects.toThrow('Tab not found')
    })
  })

  describe('listenChromeMessages', () => {
    it('应该监听同步消息', () => {
      const handler = vi.fn()
      const message = { type: MessageType.GET_SCHEMA, payload: {} }
      const sender = {} as chrome.runtime.MessageSender

      listenChromeMessages(handler)

      // 获取注册的监听器
      const listener = (chrome.runtime.onMessage.addListener as Mock).mock.calls[0][0]
      const sendResponse = vi.fn()

      const result = listener(message, sender, sendResponse)

      expect(handler).toHaveBeenCalledWith(message, sender, sendResponse)
      expect(result).toBe(false)
    })

    it('应该监听异步消息', () => {
      const handler = vi.fn().mockResolvedValue(undefined)
      const message = { type: MessageType.UPDATE_SCHEMA, payload: {} }
      const sender = {} as chrome.runtime.MessageSender

      listenChromeMessages(handler)

      const listener = (chrome.runtime.onMessage.addListener as Mock).mock.calls[0][0]
      const sendResponse = vi.fn()

      const result = listener(message, sender, sendResponse)

      expect(handler).toHaveBeenCalledWith(message, sender, sendResponse)
      expect(result).toBe(true) // 异步消息应该返回true保持通道开启
    })

    it('应该处理返回 true 的 handler（需要异步响应）', () => {
      const handler = vi.fn().mockReturnValue(true)
      const message = { type: MessageType.GET_SCHEMA, payload: {} }
      const sender = {} as chrome.runtime.MessageSender

      listenChromeMessages(handler)

      const listener = (chrome.runtime.onMessage.addListener as Mock).mock.calls[0][0]
      const sendResponse = vi.fn()

      const result = listener(message, sender, sendResponse)

      expect(handler).toHaveBeenCalledWith(message, sender, sendResponse)
      expect(result).toBe(true) // 返回true保持通道开启
    })
  })

  describe('listenPageMessages', () => {
    it('应该监听来自页面的消息', () => {
      const handler = vi.fn()
      const cleanup = listenPageMessages(handler)

      const event = new MessageEvent('message', {
        data: {
          source: 'schema-editor-injected',
          type: MessageType.GET_SCHEMA,
          payload: {},
        },
        source: window,
      })

      window.dispatchEvent(event)

      expect(handler).toHaveBeenCalledWith({
        source: 'schema-editor-injected',
        type: MessageType.GET_SCHEMA,
        payload: {},
      })

      cleanup()
    })

    it('应该忽略非当前窗口的消息', () => {
      const handler = vi.fn()
      const cleanup = listenPageMessages(handler)

      const event = new MessageEvent('message', {
        data: {
          source: 'schema-editor-injected',
          type: MessageType.GET_SCHEMA,
          payload: {},
        },
        source: {} as Window,
      })

      window.dispatchEvent(event)

      expect(handler).not.toHaveBeenCalled()

      cleanup()
    })

    it('应该忽略非injected script的消息', () => {
      const handler = vi.fn()
      const cleanup = listenPageMessages(handler)

      const event = new MessageEvent('message', {
        data: {
          source: 'other-source',
          type: MessageType.GET_SCHEMA,
          payload: {},
        },
        source: window,
      })

      window.dispatchEvent(event)

      expect(handler).not.toHaveBeenCalled()

      cleanup()
    })

    it('应该正确清理监听器', () => {
      const handler = vi.fn()
      const cleanup = listenPageMessages(handler)

      cleanup()

      const event = new MessageEvent('message', {
        data: {
          source: 'schema-editor-injected',
          type: MessageType.GET_SCHEMA,
          payload: {},
        },
        source: window,
      })

      window.dispatchEvent(event)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('sendRequestToHost', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该发送请求并等待响应', async () => {
      const type = 'GET_DATA'
      const payload = { key: 'value' }

      const requestPromise = sendRequestToHost(type, payload, 5)

      // 验证 postMessage 被调用
      expect(window.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          source: MESSAGE_SOURCE.FROM_CONTENT,
          type,
          payload,
          requestId: expect.stringMatching(/^req-\d+-\d+$/),
        }),
        '*'
      )

      // 获取 requestId
      const callArgs = (window.postMessage as Mock).mock.calls[0][0]
      const requestId = callArgs.requestId

      // 模拟宿主响应
      const cleanup = initHostMessageListener()
      const responseEvent = new MessageEvent('message', {
        data: {
          source: MESSAGE_SOURCE.FROM_HOST,
          requestId,
          data: { result: 'success' },
        },
        source: window,
      })
      window.dispatchEvent(responseEvent)

      const result = await requestPromise
      expect(result.data).toEqual({ result: 'success' })

      cleanup()
    })

    it('请求超时时应该 reject', async () => {
      const type = 'GET_DATA'
      const payload = { key: 'value' }

      const requestPromise = sendRequestToHost(type, payload, 1)

      // 快进超过超时时间
      vi.advanceTimersByTime(1100)

      await expect(requestPromise).rejects.toThrow('请求超时（1秒）')
    })

    it('应该支持自定义 source 配置', () => {
      const type = 'GET_DATA'
      const payload = { key: 'value' }
      const sourceConfig = {
        contentSource: 'custom-content-source',
        hostSource: 'custom-host-source',
      }

      sendRequestToHost(type, payload, 5, sourceConfig)

      expect(window.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'custom-content-source',
        }),
        '*'
      )
    })
  })

  describe('initHostMessageListener', () => {
    it('应该监听宿主响应消息', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      const cleanup = initHostMessageListener()

      // 验证 addEventListener 被调用
      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function))

      cleanup()
      addEventListenerSpy.mockRestore()
    })

    it('应该支持自定义 hostSource 配置', () => {
      const sourceConfig = {
        contentSource: 'custom-content',
        hostSource: 'custom-host',
      }

      const cleanup = initHostMessageListener(sourceConfig)

      cleanup()
    })

    it('应该忽略非当前窗口的消息', () => {
      const cleanup = initHostMessageListener()

      const event = new MessageEvent('message', {
        data: {
          source: MESSAGE_SOURCE.FROM_HOST,
          requestId: 'test-id',
        },
        source: {} as Window,
      })

      window.dispatchEvent(event)

      cleanup()
    })

    it('应该忽略非宿主来源的消息', () => {
      const cleanup = initHostMessageListener()

      const event = new MessageEvent('message', {
        data: {
          source: 'other-source',
          requestId: 'test-id',
        },
        source: window,
      })

      window.dispatchEvent(event)

      cleanup()
    })

    it('cleanup 应该清理待处理请求', () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })

      const cleanup = initHostMessageListener()

      // 发送一个请求
      sendRequestToHost('TEST', {}, 5)

      // 调用 cleanup
      cleanup()

      vi.useRealTimers()
    })
  })

  describe('错误场景', () => {
    it('应该处理sendMessageToBackground失败', async () => {
      ;(chrome.runtime.sendMessage as Mock).mockRejectedValue(new Error('SendMessage failed'))

      await expect(
        sendMessageToBackground({
          type: MessageType.TOGGLE_ACTIVE,
          payload: { active: true },
        })
      ).rejects.toThrow('SendMessage failed')
    })
  })

  describe('性能测试', () => {
    it('应该能快速发送多条消息', () => {
      for (let i = 0; i < 100; i++) {
        postMessageToPage({
          type: MessageType.GET_SCHEMA,
          payload: { params: `param${i}` },
        })
      }

      // 验证所有消息都被发送
      expect(window.postMessage).toHaveBeenCalledTimes(100)
    })
  })

  describe('边界情况测试', () => {
    it('应该处理非常长的params字符串', async () => {
      const longParams = 'a'.repeat(10000)
      ;(chrome.runtime.sendMessage as Mock).mockResolvedValue({ success: true })

      await sendMessageToBackground({
        type: MessageType.GET_SCHEMA,
        payload: { params: longParams },
      })

      expect(chrome.runtime.sendMessage).toHaveBeenCalled()
    })

    it('应该处理大型schema对象', () => {
      const largeSchema = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          values: [1, 2, 3, 4, 5],
        })),
      }

      postMessageToPage({
        type: MessageType.UPDATE_SCHEMA,
        payload: { schema: largeSchema, params: 'test' },
      })

      expect(window.postMessage).toHaveBeenCalled()
    })

    it('应该处理包含特殊字符的payload', () => {
      const specialPayload = {
        params: '<script>alert("xss")</script>',
        schema: { key: '\'"\n\r\t' },
      }

      postMessageToPage({
        type: MessageType.UPDATE_SCHEMA,
        payload: specialPayload,
      })

      const call = (window.postMessage as Mock).mock.calls[0]
      expect(call[0].payload).toEqual(specialPayload)
    })

    it('应该处理Unicode字符', () => {
      const unicodePayload = {
        params: '参数名称,🎉,👍,测试',
      }

      postMessageToPage({
        type: MessageType.GET_SCHEMA,
        payload: unicodePayload,
      })

      expect(window.postMessage).toHaveBeenCalled()
    })

    it('应该处理null payload', () => {
      postMessageToPage({
        type: MessageType.SCHEMA_RESPONSE,
        payload: null as any,
      })

      expect(window.postMessage).toHaveBeenCalled()
    })

    it('应该处理undefined payload', () => {
      postMessageToPage({
        type: MessageType.TOGGLE_ACTIVE,
      } as any)

      expect(window.postMessage).toHaveBeenCalled()
    })
  })

  describe('消息类型完整性测试', () => {
    it('应该支持所有定义的MessageType', () => {
      const allTypes = [
        MessageType.TOGGLE_ACTIVE,
        MessageType.GET_SCHEMA,
        MessageType.UPDATE_SCHEMA,
        MessageType.SCHEMA_RESPONSE,
        MessageType.UPDATE_RESULT,
        MessageType.ELEMENT_CLICKED,
        MessageType.ACTIVE_STATE_CHANGED,
      ]

      allTypes.forEach((type) => {
        postMessageToPage({
          type,
          payload: {},
        })
      })

      expect(window.postMessage).toHaveBeenCalledTimes(allTypes.length)
    })
  })
})
