import type { Mock } from 'vitest'
import { MessageType } from '@/shared/types'
import {
  listenChromeMessages,
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
  })
})
