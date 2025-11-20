import { MessageType } from '@/types'
import { postMessageToPage, sendMessageToBackground } from '../browser/message'

describe('Message工具测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendMessageToBackground', () => {
    it('应该发送消息到background', async () => {
      const message = {
        type: MessageType.GET_SCHEMA,
        payload: { params: 'test-param' }
      }

      ;(chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({ success: true })

      await sendMessageToBackground(message)

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message)
    })

    it('应该发送不同类型的消息', async () => {
      const messages = [
        { type: MessageType.GET_SCHEMA, payload: { params: 'param1' } },
        { type: MessageType.UPDATE_SCHEMA, payload: { schema: {}, params: 'param2' } },
        { type: MessageType.TOGGLE_ACTIVE, payload: { active: true } }
      ]

      ;(chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({ success: true })

      for (const msg of messages) {
        await sendMessageToBackground(msg)
      }

      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(3)
    })

    it('应该返回响应数据', async () => {
      const message = {
        type: MessageType.GET_SCHEMA,
        payload: { params: 'test' }
      }
      const mockResponse = { data: { key: 'value' } }

      ;(chrome.runtime.sendMessage as jest.Mock).mockResolvedValue(mockResponse)

      const result = await sendMessageToBackground(message)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('postMessageToPage', () => {
    it('应该发送消息到页面', () => {
      const message = {
        type: MessageType.GET_SCHEMA,
        payload: { params: 'test-param' }
      }

      postMessageToPage(message)

      expect(window.postMessage).toHaveBeenCalledWith(
        {
          source: 'schema-editor-content',
          ...message
        },
        '*'
      )
    })

    it('应该包含正确的source标识', () => {
      const message = {
        type: MessageType.UPDATE_SCHEMA,
        payload: { schema: { key: 'value' }, params: 'param1' }
      }

      postMessageToPage(message)

      const call = (window.postMessage as jest.Mock).mock.calls[0]
      expect(call[0]).toHaveProperty('source', 'schema-editor-content')
      expect(call[1]).toBe('*')
    })

    it('应该发送不同类型的消息', () => {
      const messages = [
        { type: MessageType.GET_SCHEMA, payload: { params: 'p1' } },
        { type: MessageType.UPDATE_SCHEMA, payload: { schema: {}, params: 'p2' } },
        { type: MessageType.SCHEMA_RESPONSE, payload: { success: true, data: {} } }
      ]

      messages.forEach(msg => {
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
              obj: { key: 'value' }
            }
          }
        },
        params: 'complex,nested,params'
      }

      postMessageToPage({
        type: MessageType.UPDATE_SCHEMA,
        payload: complexPayload
      })

      const call = (window.postMessage as jest.Mock).mock.calls[0]
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
        payload: { params: 'test' }
      }

      postMessageToPage(message)

      const call = (window.postMessage as jest.Mock).mock.calls[0]
      expect(call[0].payload).toHaveProperty('params')
    })

    it('UPDATE_SCHEMA消息应该包含schema和params', () => {
      const message = {
        type: MessageType.UPDATE_SCHEMA,
        payload: {
          schema: { key: 'value' },
          params: 'param1'
        }
      }

      postMessageToPage(message)

      const call = (window.postMessage as jest.Mock).mock.calls[0]
      expect(call[0].payload).toHaveProperty('schema')
      expect(call[0].payload).toHaveProperty('params')
    })

    it('SCHEMA_RESPONSE消息应该包含success和data', () => {
      const message = {
        type: MessageType.SCHEMA_RESPONSE,
        payload: {
          success: true,
          data: { result: 'test' }
        }
      }

      postMessageToPage(message)

      const call = (window.postMessage as jest.Mock).mock.calls[0]
      expect(call[0].payload).toHaveProperty('success')
      expect(call[0].payload).toHaveProperty('data')
    })
  })

  describe('错误场景', () => {
    it('应该处理sendMessageToBackground失败', async () => {
      ;(chrome.runtime.sendMessage as jest.Mock).mockRejectedValue(new Error('SendMessage failed'))

      await expect(sendMessageToBackground({
        type: MessageType.TOGGLE_ACTIVE,
        payload: { active: true }
      })).rejects.toThrow('SendMessage failed')
    })
  })

  describe('性能测试', () => {
    it('应该能快速发送多条消息', () => {
      for (let i = 0; i < 100; i++) {
        postMessageToPage({
          type: MessageType.GET_SCHEMA,
          payload: { params: `param${i}` }
        })
      }
      
      // 验证所有消息都被发送
      expect(window.postMessage).toHaveBeenCalledTimes(100)
    })
  })

  describe('边界情况测试', () => {
    it('应该处理非常长的params字符串', async () => {
      const longParams = 'a'.repeat(10000)
      ;(chrome.runtime.sendMessage as jest.Mock).mockResolvedValue({ success: true })

      await sendMessageToBackground({
        type: MessageType.GET_SCHEMA,
        payload: { params: longParams }
      })

      expect(chrome.runtime.sendMessage).toHaveBeenCalled()
    })

    it('应该处理大型schema对象', () => {
      const largeSchema = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          values: [1, 2, 3, 4, 5]
        }))
      }

      postMessageToPage({
        type: MessageType.UPDATE_SCHEMA,
        payload: { schema: largeSchema, params: 'test' }
      })

      expect(window.postMessage).toHaveBeenCalled()
    })

    it('应该处理包含特殊字符的payload', () => {
      const specialPayload = {
        params: '<script>alert("xss")</script>',
        schema: { key: '\'"\n\r\t' }
      }

      postMessageToPage({
        type: MessageType.UPDATE_SCHEMA,
        payload: specialPayload
      })

      const call = (window.postMessage as jest.Mock).mock.calls[0]
      expect(call[0].payload).toEqual(specialPayload)
    })

    it('应该处理Unicode字符', () => {
      const unicodePayload = {
        params: '参数名称,🎉,👍,测试'
      }

      postMessageToPage({
        type: MessageType.GET_SCHEMA,
        payload: unicodePayload
      })

      expect(window.postMessage).toHaveBeenCalled()
    })

    it('应该处理null payload', () => {
      postMessageToPage({
        type: MessageType.SCHEMA_RESPONSE,
        payload: null as any
      })

      expect(window.postMessage).toHaveBeenCalled()
    })

    it('应该处理undefined payload', () => {
      postMessageToPage({
        type: MessageType.TOGGLE_ACTIVE
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
        MessageType.ACTIVE_STATE_CHANGED
      ]

      allTypes.forEach(type => {
        postMessageToPage({
          type,
          payload: {}
        })
      })

      expect(window.postMessage).toHaveBeenCalledTimes(allTypes.length)
    })
  })
})

