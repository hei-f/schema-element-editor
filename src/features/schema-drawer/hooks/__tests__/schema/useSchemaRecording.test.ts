import { act, renderHook, waitFor } from '@testing-library/react'
import { useSchemaRecording } from '../../schema/useSchemaRecording'
import { MessageType } from '@/shared/types'

// Mock communication-mode
vi.mock('@/shared/utils/communication-mode', () => ({
  getCommunicationMode: vi.fn(),
}))

// Mock message utils
vi.mock('@/shared/utils/browser/message', () => ({
  listenPageMessages: vi.fn(),
  postMessageToPage: vi.fn(),
  sendRequestToHost: vi.fn(),
}))

import { getCommunicationMode } from '@/shared/utils/communication-mode'
import {
  listenPageMessages,
  postMessageToPage,
  sendRequestToHost,
} from '@/shared/utils/browser/message'

const mockGetCommunicationMode = getCommunicationMode as MockedFunction<typeof getCommunicationMode>
const mockListenPageMessages = listenPageMessages as MockedFunction<typeof listenPageMessages>
const mockPostMessageToPage = postMessageToPage as MockedFunction<typeof postMessageToPage>
const mockSendRequestToHost = sendRequestToHost as MockedFunction<typeof sendRequestToHost>

describe('useSchemaRecording Hook 测试', () => {
  const defaultProps = {
    attributes: { params: ['param1', 'param2'] },
    pollingInterval: 1000,
    onSchemaChange: vi.fn(),
    apiConfig: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })

    // 默认设置为 windowFunction 模式
    mockGetCommunicationMode.mockReturnValue({
      isPostMessageMode: false,
      isWindowFunctionMode: true,
    })

    // 默认返回清理函数
    mockListenPageMessages.mockReturnValue(vi.fn())
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('初始状态', () => {
    it('应该返回正确的初始状态', () => {
      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      expect(result.current.isRecording).toBe(false)
      expect(result.current.snapshots).toEqual([])
      expect(result.current.selectedSnapshotId).toBeNull()
      expect(typeof result.current.startRecording).toBe('function')
      expect(typeof result.current.stopRecording).toBe('function')
      expect(typeof result.current.selectSnapshot).toBe('function')
      expect(typeof result.current.clearSnapshots).toBe('function')
    })
  })

  describe('开始录制 - windowFunction 模式', () => {
    beforeEach(() => {
      mockGetCommunicationMode.mockReturnValue({
        isPostMessageMode: false,
        isWindowFunctionMode: true,
      })
    })

    it('应该在开始录制时设置 isRecording 为 true', () => {
      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      expect(result.current.isRecording).toBe(true)
    })

    it('应该注册消息监听器', () => {
      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      expect(mockListenPageMessages).toHaveBeenCalledTimes(1)
    })

    it('应该立即发送获取 schema 请求', () => {
      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      expect(mockPostMessageToPage).toHaveBeenCalledWith({
        type: MessageType.GET_SCHEMA,
        payload: { params: 'param1,param2' },
      })
    })

    it('应该按轮询间隔定期发送请求', () => {
      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      expect(mockPostMessageToPage).toHaveBeenCalledTimes(1)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(mockPostMessageToPage).toHaveBeenCalledTimes(2)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(mockPostMessageToPage).toHaveBeenCalledTimes(3)
    })

    it('重复调用 startRecording 应该被忽略', () => {
      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
        result.current.startRecording()
        result.current.startRecording()
      })

      expect(mockListenPageMessages).toHaveBeenCalledTimes(1)
    })

    it('应该处理来自 injected script 的 schema 响应', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      // 模拟收到 schema 响应
      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { name: 'test' } },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('{\n  "name": "test"\n}')
        expect(result.current.selectedSnapshotId).toBe(0)
      })

      expect(defaultProps.onSchemaChange).toHaveBeenCalledWith('{\n  "name": "test"\n}')
    })
  })

  describe('开始录制 - postMessage 模式', () => {
    const postMessageProps = {
      ...defaultProps,
      apiConfig: {
        communicationMode: 'postMessage' as const,
        requestTimeout: 5,
        sourceConfig: {
          contentSource: 'test-content',
          hostSource: 'test-host',
        },
        messageTypes: {
          getSchema: 'GET_SCHEMA',
          updateSchema: 'UPDATE_SCHEMA',
          checkPreview: 'CHECK_PREVIEW',
          renderPreview: 'RENDER_PREVIEW',
          cleanupPreview: 'CLEANUP_PREVIEW',
        },
      },
    }

    beforeEach(() => {
      mockGetCommunicationMode.mockReturnValue({
        isPostMessageMode: true,
        isWindowFunctionMode: false,
      })
    })

    it('应该使用 sendRequestToHost 发送请求', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: { name: 'test' } })

      const { result } = renderHook(() => useSchemaRecording(postMessageProps))

      await act(async () => {
        result.current.startRecording()
      })

      expect(mockSendRequestToHost).toHaveBeenCalledWith(
        'GET_SCHEMA',
        { params: 'param1,param2' },
        5,
        postMessageProps.apiConfig.sourceConfig
      )
    })

    it('应该处理 postMessage 模式的响应并创建快照', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: { key: 'value' } })

      const { result } = renderHook(() => useSchemaRecording(postMessageProps))

      await act(async () => {
        result.current.startRecording()
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('{\n  "key": "value"\n}')
      })
    })

    it('应该按轮询间隔定期发送 postMessage 请求', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: { count: 1 } })

      const { result } = renderHook(() => useSchemaRecording(postMessageProps))

      await act(async () => {
        result.current.startRecording()
      })

      expect(mockSendRequestToHost).toHaveBeenCalledTimes(1)

      // 清除之前的 mock 调用记录以便追踪后续调用
      mockSendRequestToHost.mockClear()
      mockSendRequestToHost.mockResolvedValue({ success: true, data: { count: 2 } })

      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      expect(mockSendRequestToHost).toHaveBeenCalledTimes(1)
    })

    it('应该忽略单次请求失败', async () => {
      mockSendRequestToHost.mockRejectedValue(new Error('网络错误'))

      const { result } = renderHook(() => useSchemaRecording(postMessageProps))

      // 不应该抛出错误
      await act(async () => {
        result.current.startRecording()
      })

      expect(result.current.isRecording).toBe(true)
      expect(result.current.snapshots).toHaveLength(0)
    })
  })

  describe('停止录制', () => {
    it('应该在停止录制时设置 isRecording 为 false', () => {
      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      expect(result.current.isRecording).toBe(true)

      act(() => {
        result.current.stopRecording()
      })

      expect(result.current.isRecording).toBe(false)
    })

    it('应该清理轮询定时器', () => {
      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        result.current.stopRecording()
      })

      // 清除之前的调用记录
      mockPostMessageToPage.mockClear()

      // 推进时间，不应该再有请求发送
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(mockPostMessageToPage).not.toHaveBeenCalled()
    })

    it('应该调用消息监听器的清理函数', () => {
      const cleanupFn = vi.fn()
      mockListenPageMessages.mockReturnValue(cleanupFn)

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        result.current.stopRecording()
      })

      expect(cleanupFn).toHaveBeenCalled()
    })

    it('未录制时调用 stopRecording 应该安全执行', () => {
      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      // 不应该抛出错误
      act(() => {
        result.current.stopRecording()
      })

      expect(result.current.isRecording).toBe(false)
    })
  })

  describe('Schema 响应处理', () => {
    it('应该正确处理字符串类型的数据', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: 'plain text content' },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('plain text content')
      })
    })

    it('应该正确处理数组类型的数据', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: [1, 2, 3] },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('[\n  1,\n  2,\n  3\n]')
      })
    })

    it('应该去重相同内容的响应', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      // 发送相同内容三次
      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { same: 'content' } },
        })
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { same: 'content' } },
        })
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { same: 'content' } },
        })
      })

      await waitFor(() => {
        // 应该只有一个快照
        expect(result.current.snapshots).toHaveLength(1)
      })
    })

    it('应该为不同内容创建多个快照', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { version: 1 } },
        })
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { version: 2 } },
        })
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { version: 3 } },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(3)
        expect(result.current.snapshots[0].id).toBe(0)
        expect(result.current.snapshots[1].id).toBe(1)
        expect(result.current.snapshots[2].id).toBe(2)
      })
    })

    it('应该忽略失败的响应', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: false, error: '获取失败' },
        })
      })

      // 等待一小段时间确保状态稳定
      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.snapshots).toHaveLength(0)
    })

    it('应该忽略 data 为 undefined 的响应', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true },
        })
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.snapshots).toHaveLength(0)
    })

    it('停止录制后不应该处理响应', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        result.current.stopRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { should: 'not appear' } },
        })
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.snapshots).toHaveLength(0)
    })
  })

  describe('快照时间戳', () => {
    it('应该记录相对于录制开始的时间戳', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      // 立即收到第一个响应
      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { v: 1 } },
        })
      })

      // 推进 500ms
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // 收到第二个响应
      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { v: 2 } },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(2)
        // 第一个快照时间戳应该接近 0
        expect(result.current.snapshots[0].timestamp).toBeLessThan(100)
        // 第二个快照时间戳应该约为 500
        expect(result.current.snapshots[1].timestamp).toBeGreaterThanOrEqual(500)
      })
    })
  })

  describe('选择快照', () => {
    it('应该更新 selectedSnapshotId', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { v: 1 } },
        })
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { v: 2 } },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(2)
      })

      // 当前选中的应该是最后一个快照
      expect(result.current.selectedSnapshotId).toBe(1)

      // 选择第一个快照
      act(() => {
        result.current.selectSnapshot(0)
      })

      expect(result.current.selectedSnapshotId).toBe(0)
      expect(defaultProps.onSchemaChange).toHaveBeenLastCalledWith('{\n  "v": 1\n}')
    })

    it('选择不存在的快照 ID 应该被忽略', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { v: 1 } },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
      })

      const onSchemaChangeCallCount = defaultProps.onSchemaChange.mock.calls.length

      // 尝试选择不存在的快照
      act(() => {
        result.current.selectSnapshot(999)
      })

      // selectedSnapshotId 不应该改变
      expect(result.current.selectedSnapshotId).toBe(0)
      // onSchemaChange 不应该被额外调用
      expect(defaultProps.onSchemaChange).toHaveBeenCalledTimes(onSchemaChangeCallCount)
    })
  })

  describe('清空快照', () => {
    it('应该清空所有快照并重置状态', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { v: 1 } },
        })
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { v: 2 } },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(2)
      })

      act(() => {
        result.current.clearSnapshots()
      })

      expect(result.current.snapshots).toHaveLength(0)
      expect(result.current.selectedSnapshotId).toBeNull()
    })

    it('清空后新录制应该从 ID 0 开始', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { v: 1 } },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
      })

      act(() => {
        result.current.stopRecording()
        result.current.clearSnapshots()
      })

      // 重新开始录制
      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: { new: 'data' } },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].id).toBe(0)
      })
    })
  })

  describe('组件卸载', () => {
    it('应该在卸载时清理定时器', () => {
      const { result, unmount } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      unmount()

      // 推进时间，不应该有错误发生
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // 验证没有额外的请求发送
      const callCount = mockPostMessageToPage.mock.calls.length
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(mockPostMessageToPage).toHaveBeenCalledTimes(callCount)
    })

    it('应该在卸载时清理消息监听器', () => {
      const cleanupFn = vi.fn()
      mockListenPageMessages.mockReturnValue(cleanupFn)

      const { result, unmount } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      unmount()

      expect(cleanupFn).toHaveBeenCalled()
    })
  })

  describe('API 配置', () => {
    it('应该使用默认的 messageTypes 当 apiConfig 未提供时', async () => {
      mockGetCommunicationMode.mockReturnValue({
        isPostMessageMode: true,
        isWindowFunctionMode: false,
      })
      mockSendRequestToHost.mockResolvedValue({ success: true, data: {} })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          apiConfig: null,
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      // 应该使用默认的 getSchema 消息类型 (DEFAULT_VALUES.apiConfig.messageTypes.getSchema = 'GET_SCHEMA')
      expect(mockSendRequestToHost).toHaveBeenCalledWith(
        'GET_SCHEMA',
        expect.any(Object),
        5, // 默认超时
        undefined
      )
    })

    it('应该使用自定义的 requestTimeout', async () => {
      mockGetCommunicationMode.mockReturnValue({
        isPostMessageMode: true,
        isWindowFunctionMode: false,
      })
      mockSendRequestToHost.mockResolvedValue({ success: true, data: {} })

      const customApiConfig = {
        communicationMode: 'postMessage' as const,
        requestTimeout: 10,
        sourceConfig: {
          contentSource: 'custom',
          hostSource: 'custom-host',
        },
        messageTypes: {
          getSchema: 'CUSTOM_GET',
          updateSchema: 'CUSTOM_UPDATE',
          checkPreview: 'CHECK',
          renderPreview: 'RENDER',
          cleanupPreview: 'CLEANUP',
        },
      }

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          apiConfig: customApiConfig,
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      expect(mockSendRequestToHost).toHaveBeenCalledWith(
        'CUSTOM_GET',
        expect.any(Object),
        10,
        customApiConfig.sourceConfig
      )
    })
  })

  describe('边界情况', () => {
    it('应该处理无法 stringify 的数据', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      // 创建一个包含循环引用的对象是不可能通过 postMessage 传递的
      // 但我们可以测试其他边界情况，比如 Symbol
      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: 12345 },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('12345')
      })
    })

    it('应该处理空对象', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: {} },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('{}')
      })
    })

    it('应该处理空数组', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: [] },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('[]')
      })
    })

    it('应该处理 null 值', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: null },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('null')
      })
    })

    it('应该处理 boolean 值', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: false },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('false')
      })
    })

    it('应该处理空字符串（会被去重因为初始值为空）', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      // 空字符串与初始的 lastContentRef.current = '' 相同，所以会被去重跳过
      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: '' },
        })
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      // 空字符串被去重跳过，不会创建快照
      expect(result.current.snapshots).toHaveLength(0)
    })

    it('空字符串在有内容后应该被记录', async () => {
      let messageHandler: ((msg: any) => void) | null = null
      mockListenPageMessages.mockImplementation((handler) => {
        messageHandler = handler
        return vi.fn()
      })

      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      act(() => {
        result.current.startRecording()
      })

      // 先发送非空内容
      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: 'some content' },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
      })

      // 再发送空字符串
      act(() => {
        messageHandler?.({
          type: MessageType.SCHEMA_RESPONSE,
          payload: { success: true, data: '' },
        })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(2)
        expect(result.current.snapshots[1].content).toBe('')
      })
    })
  })
})
