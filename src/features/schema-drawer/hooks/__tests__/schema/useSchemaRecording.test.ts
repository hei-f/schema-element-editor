import type { MockedFunction } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useSchemaRecording } from '../../schema/useSchemaRecording'

// Mock message utils
vi.mock('@/shared/utils/browser/message', () => ({
  sendRequestToHost: vi.fn(),
  listenHostPush: vi.fn(),
}))

// Mock logger
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { sendRequestToHost, listenHostPush } from '@/shared/utils/browser/message'

const mockSendRequestToHost = sendRequestToHost as MockedFunction<typeof sendRequestToHost>
const mockListenHostPush = listenHostPush as MockedFunction<typeof listenHostPush>

describe('useSchemaRecording Hook 测试', () => {
  const defaultProps = {
    attributes: { params: ['param1', 'param2'] },
    pollingInterval: 1000,
    onSchemaChange: vi.fn(),
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
        startRecording: 'START_RECORDING',
        stopRecording: 'STOP_RECORDING',
        schemaPush: 'SCHEMA_PUSH',
      },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })

    // 默认返回清理函数
    mockListenHostPush.mockReturnValue(vi.fn())
    // 默认返回成功响应
    mockSendRequestToHost.mockResolvedValue({ success: true, data: {} })
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

  describe('开始录制 - 轮询模式（默认）', () => {
    it('应该在开始录制时设置 isRecording 为 true', async () => {
      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      expect(result.current.isRecording).toBe(true)
    })

    it('应该使用 sendRequestToHost 发送请求', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: { name: 'test' } })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      expect(mockSendRequestToHost).toHaveBeenCalledWith(
        'GET_SCHEMA',
        { params: 'param1,param2' },
        5,
        defaultProps.apiConfig.sourceConfig
      )
    })

    it('应该处理轮询模式的响应并创建快照', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: { key: 'value' } })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('{\n  "key": "value"\n}')
      })
    })

    it('应该按轮询间隔定期发送请求', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: { count: 1 } })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

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

    it('重复调用 startRecording 应该被忽略', async () => {
      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
        result.current.startRecording()
        result.current.startRecording()
      })

      // 只应该发送一次请求
      expect(mockSendRequestToHost).toHaveBeenCalledTimes(1)
    })

    it('应该忽略单次请求失败', async () => {
      mockSendRequestToHost.mockRejectedValue(new Error('网络错误'))

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      // 不应该抛出错误
      await act(async () => {
        result.current.startRecording()
      })

      expect(result.current.isRecording).toBe(true)
      expect(result.current.snapshots).toHaveLength(0)
    })
  })

  describe('开始录制 - 事件驱动模式', () => {
    const eventDrivenProps = {
      ...defaultProps,
      dataFetchMode: 'eventDriven' as const,
    }

    it('应该注册宿主推送监听器', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useSchemaRecording(eventDrivenProps))

      await act(async () => {
        result.current.startRecording()
      })

      expect(mockListenHostPush).toHaveBeenCalledTimes(1)
      expect(mockListenHostPush).toHaveBeenCalledWith(
        'SCHEMA_PUSH',
        expect.any(Function),
        eventDrivenProps.apiConfig.sourceConfig
      )
    })

    it('应该发送开始录制指令给宿主', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useSchemaRecording(eventDrivenProps))

      await act(async () => {
        result.current.startRecording()
      })

      expect(mockSendRequestToHost).toHaveBeenCalledWith(
        'START_RECORDING',
        { params: 'param1,param2' },
        5,
        eventDrivenProps.apiConfig.sourceConfig
      )
    })

    it('应该处理宿主推送的数据并创建快照', async () => {
      let pushHandler: ((payload: any) => void) | null = null
      mockListenHostPush.mockImplementation((_, handler) => {
        pushHandler = handler
        return vi.fn()
      })
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() => useSchemaRecording(eventDrivenProps))

      await act(async () => {
        result.current.startRecording()
      })

      // 模拟宿主推送数据
      act(() => {
        pushHandler?.({ success: true, data: { name: 'test' } })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('{\n  "name": "test"\n}')
        expect(result.current.selectedSnapshotId).toBe(0)
      })

      expect(defaultProps.onSchemaChange).toHaveBeenCalledWith('{\n  "name": "test"\n}')
    })

    it('开始录制失败时应该清理监听器', async () => {
      const cleanupFn = vi.fn()
      mockListenHostPush.mockReturnValue(cleanupFn)
      mockSendRequestToHost.mockResolvedValue({ success: false, error: '宿主不支持录制' })

      const { result } = renderHook(() => useSchemaRecording(eventDrivenProps))

      await act(async () => {
        result.current.startRecording()
      })

      // 开始录制失败，监听器应该被清理
      expect(cleanupFn).toHaveBeenCalled()
      expect(result.current.isRecording).toBe(false)
    })
  })

  describe('停止录制', () => {
    it('应该在停止录制时设置 isRecording 为 false', async () => {
      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      expect(result.current.isRecording).toBe(true)

      await act(async () => {
        result.current.stopRecording()
      })

      expect(result.current.isRecording).toBe(false)
    })

    it('应该清理轮询定时器', async () => {
      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      await act(async () => {
        result.current.stopRecording()
      })

      // 清除之前的调用记录
      mockSendRequestToHost.mockClear()

      // 推进时间，不应该再有请求发送
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      expect(mockSendRequestToHost).not.toHaveBeenCalled()
    })

    it('事件驱动模式应该发送停止录制指令', async () => {
      const cleanupFn = vi.fn()
      mockListenHostPush.mockReturnValue(cleanupFn)
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      mockSendRequestToHost.mockClear()

      await act(async () => {
        result.current.stopRecording()
      })

      expect(mockSendRequestToHost).toHaveBeenCalledWith(
        'STOP_RECORDING',
        { params: 'param1,param2' },
        5,
        defaultProps.apiConfig.sourceConfig
      )
      expect(cleanupFn).toHaveBeenCalled()
    })

    it('未录制时调用 stopRecording 应该安全执行', async () => {
      const { result } = renderHook(() => useSchemaRecording(defaultProps))

      // 不应该抛出错误
      await act(async () => {
        result.current.stopRecording()
      })

      expect(result.current.isRecording).toBe(false)
    })
  })

  describe('Schema 响应处理', () => {
    it('应该正确处理字符串类型的数据', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: 'plain text content' })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('plain text content')
      })
    })

    it('应该正确处理数组类型的数据', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: [1, 2, 3] })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('[\n  1,\n  2,\n  3\n]')
      })
    })

    it('应该去重相同内容的响应', async () => {
      let pushHandler: ((payload: any) => void) | null = null
      mockListenHostPush.mockImplementation((_, handler) => {
        pushHandler = handler
        return vi.fn()
      })
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      // 发送相同内容三次
      act(() => {
        pushHandler?.({ success: true, data: { same: 'content' } })
      })

      act(() => {
        pushHandler?.({ success: true, data: { same: 'content' } })
      })

      act(() => {
        pushHandler?.({ success: true, data: { same: 'content' } })
      })

      await waitFor(() => {
        // 应该只有一个快照
        expect(result.current.snapshots).toHaveLength(1)
      })
    })

    it('应该为不同内容创建多个快照', async () => {
      let pushHandler: ((payload: any) => void) | null = null
      mockListenHostPush.mockImplementation((_, handler) => {
        pushHandler = handler
        return vi.fn()
      })
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      act(() => {
        pushHandler?.({ success: true, data: { version: 1 } })
      })

      act(() => {
        pushHandler?.({ success: true, data: { version: 2 } })
      })

      act(() => {
        pushHandler?.({ success: true, data: { version: 3 } })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(3)
        expect(result.current.snapshots[0].id).toBe(0)
        expect(result.current.snapshots[1].id).toBe(1)
        expect(result.current.snapshots[2].id).toBe(2)
      })
    })

    it('应该忽略失败的响应', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: false, error: '获取失败' })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      // 等待一小段时间确保状态稳定
      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.snapshots).toHaveLength(0)
    })

    it('应该忽略 data 为 undefined 的响应', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.snapshots).toHaveLength(0)
    })

    it('停止录制后不应该处理响应', async () => {
      let pushHandler: ((payload: any) => void) | null = null
      mockListenHostPush.mockImplementation((_, handler) => {
        pushHandler = handler
        return vi.fn()
      })
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      await act(async () => {
        result.current.stopRecording()
      })

      act(() => {
        pushHandler?.({ success: true, data: { should: 'not appear' } })
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.snapshots).toHaveLength(0)
    })
  })

  describe('快照时间戳', () => {
    it('应该记录相对于录制开始的时间戳', async () => {
      let pushHandler: ((payload: any) => void) | null = null
      mockListenHostPush.mockImplementation((_, handler) => {
        pushHandler = handler
        return vi.fn()
      })
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      // 立即收到第一个响应
      act(() => {
        pushHandler?.({ success: true, data: { v: 1 } })
      })

      // 推进 500ms
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // 收到第二个响应
      act(() => {
        pushHandler?.({ success: true, data: { v: 2 } })
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
      let pushHandler: ((payload: any) => void) | null = null
      mockListenHostPush.mockImplementation((_, handler) => {
        pushHandler = handler
        return vi.fn()
      })
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      act(() => {
        pushHandler?.({ success: true, data: { v: 1 } })
      })

      act(() => {
        pushHandler?.({ success: true, data: { v: 2 } })
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
      let pushHandler: ((payload: any) => void) | null = null
      mockListenHostPush.mockImplementation((_, handler) => {
        pushHandler = handler
        return vi.fn()
      })
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      act(() => {
        pushHandler?.({ success: true, data: { v: 1 } })
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
      let pushHandler: ((payload: any) => void) | null = null
      mockListenHostPush.mockImplementation((_, handler) => {
        pushHandler = handler
        return vi.fn()
      })
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      act(() => {
        pushHandler?.({ success: true, data: { v: 1 } })
      })

      act(() => {
        pushHandler?.({ success: true, data: { v: 2 } })
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
      let pushHandler: ((payload: any) => void) | null = null
      mockListenHostPush.mockImplementation((_, handler) => {
        pushHandler = handler
        return vi.fn()
      })
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      act(() => {
        pushHandler?.({ success: true, data: { v: 1 } })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
      })

      await act(async () => {
        result.current.stopRecording()
        result.current.clearSnapshots()
      })

      // 重新开始录制
      await act(async () => {
        result.current.startRecording()
      })

      act(() => {
        pushHandler?.({ success: true, data: { new: 'data' } })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].id).toBe(0)
      })
    })
  })

  describe('组件卸载', () => {
    it('应该在卸载时清理定时器', async () => {
      const { result, unmount } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      unmount()

      // 推进时间，不应该有错误发生
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })

      // 验证没有额外的请求发送
      const callCount = mockSendRequestToHost.mock.calls.length
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })
      expect(mockSendRequestToHost).toHaveBeenCalledTimes(callCount)
    })

    it('应该在卸载时清理宿主推送监听器', async () => {
      const cleanupFn = vi.fn()
      mockListenHostPush.mockReturnValue(cleanupFn)
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result, unmount } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      unmount()

      expect(cleanupFn).toHaveBeenCalled()
    })

    it('事件驱动模式卸载时应该发送停止录制指令', async () => {
      mockListenHostPush.mockReturnValue(vi.fn())
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result, unmount } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      mockSendRequestToHost.mockClear()

      unmount()

      // 卸载时应该发送停止录制指令
      await waitFor(() => {
        expect(mockSendRequestToHost).toHaveBeenCalledWith(
          'STOP_RECORDING',
          { params: 'param1,param2' },
          5,
          defaultProps.apiConfig.sourceConfig
        )
      })
    })
  })

  describe('API 配置', () => {
    it('应该使用默认的 messageTypes 当 apiConfig 未提供时', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: {} })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          apiConfig: undefined,
          dataFetchMode: 'polling',
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
          startRecording: 'START',
          stopRecording: 'STOP',
          schemaPush: 'PUSH',
        },
      }

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          apiConfig: customApiConfig,
          dataFetchMode: 'polling',
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

  describe('自动停止功能', () => {
    it('应该在指定时间无数据变化后自动停止录制', async () => {
      const onAutoStop = vi.fn()
      mockSendRequestToHost.mockResolvedValue({ success: true, data: { initial: 'data' } })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
          autoStopTimeout: 2, // 2秒无变化后自动停止
          onAutoStop,
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      // 等待第一个数据到达
      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
      })

      // 推进时间超过自动停止阈值（数据不变化）
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      await waitFor(() => {
        expect(result.current.isRecording).toBe(false)
        expect(onAutoStop).toHaveBeenCalled()
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理无法 stringify 的数据', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: 12345 })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('12345')
      })
    })

    it('应该处理空对象', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: {} })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('{}')
      })
    })

    it('应该处理空数组', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: [] })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
        // 等待 pollSchema 的 Promise 完成
        await vi.advanceTimersByTimeAsync(0)
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('[]')
      })
    })

    it('应该处理 null 值', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: null })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
        // 等待 pollSchema 的 Promise 完成
        await vi.advanceTimersByTimeAsync(0)
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('null')
      })
    })

    it('应该处理 boolean 值', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: false })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
        // 等待 pollSchema 的 Promise 完成
        await vi.advanceTimersByTimeAsync(0)
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
        expect(result.current.snapshots[0].content).toBe('false')
      })
    })

    it('应该处理空字符串（会被去重因为初始值为空）', async () => {
      mockSendRequestToHost.mockResolvedValue({ success: true, data: '' })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'polling',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      await act(async () => {
        vi.advanceTimersByTime(100)
      })

      // 空字符串被去重跳过，不会创建快照
      expect(result.current.snapshots).toHaveLength(0)
    })

    it('空字符串在有内容后应该被记录', async () => {
      let pushHandler: ((payload: any) => void) | null = null
      mockListenHostPush.mockImplementation((_, handler) => {
        pushHandler = handler
        return vi.fn()
      })
      mockSendRequestToHost.mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useSchemaRecording({
          ...defaultProps,
          dataFetchMode: 'eventDriven',
        })
      )

      await act(async () => {
        result.current.startRecording()
      })

      // 先发送非空内容
      act(() => {
        pushHandler?.({ success: true, data: 'some content' })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(1)
      })

      // 再发送空字符串
      act(() => {
        pushHandler?.({ success: true, data: '' })
      })

      await waitFor(() => {
        expect(result.current.snapshots).toHaveLength(2)
        expect(result.current.snapshots[1].content).toBe('')
      })
    })
  })
})
