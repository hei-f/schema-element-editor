import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { getCommunicationMode } from '@/shared/utils/communication-mode'
import type {
  ApiConfig,
  ElementAttributes,
  SchemaResponsePayload,
  SchemaSnapshot,
} from '@/shared/types'
import { MessageType } from '@/shared/types'
import {
  listenPageMessages,
  postMessageToPage,
  sendRequestToHost,
} from '@/shared/utils/browser/message'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLatest } from '@/shared/hooks/useLatest'

interface UseSchemaRecordingOptions {
  /** 元素属性（用于获取schema的params） */
  attributes: ElementAttributes
  /** 轮询间隔（毫秒） */
  pollingInterval: number
  /** 当获取到新schema时的回调 */
  onSchemaChange?: (content: string) => void
  /** API 配置 */
  apiConfig?: ApiConfig | null
  /** 自动停止超时时间（秒），null 表示禁用 */
  autoStopTimeout?: number | null
  /** 自动停止时的回调 */
  onAutoStop?: () => void
}

interface UseSchemaRecordingReturn {
  /** 是否正在录制 */
  isRecording: boolean
  /** 录制的快照列表 */
  snapshots: SchemaSnapshot[]
  /** 当前选中的快照ID */
  selectedSnapshotId: number | null
  /** 开始录制 */
  startRecording: () => void
  /** 停止录制 */
  stopRecording: () => void
  /** 选择快照 */
  selectSnapshot: (id: number) => void
  /** 清空快照 */
  clearSnapshots: () => void
}

/**
 * Schema录制Hook
 * 用于轮询获取schema并记录变更
 */
export function useSchemaRecording(props: UseSchemaRecordingOptions): UseSchemaRecordingReturn {
  const { attributes, pollingInterval, onSchemaChange, apiConfig, autoStopTimeout, onAutoStop } =
    props

  // 使用 useLatest 稳定回调引用，避免外部传入的函数引用变化导致内部回调重建
  const onSchemaChangeRef = useLatest(onSchemaChange)
  const onAutoStopRef = useLatest(onAutoStop)

  const [isRecording, setIsRecording] = useState(false)
  const [snapshots, setSnapshots] = useState<SchemaSnapshot[]>([])
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null)

  /** 录制开始时间 */
  const recordingStartTimeRef = useRef<number>(0)
  /** 上一次的schema内容（用于去重） */
  const lastContentRef = useRef<string>('')
  /** 快照ID计数器 */
  const snapshotIdRef = useRef<number>(0)
  /** 轮询定时器 */
  const pollingTimerRef = useRef<number | null>(null)
  /** 消息监听清理函数 */
  const messageCleanupRef = useRef<(() => void) | null>(null)
  /** 录制状态ref（避免闭包问题） */
  const isRecordingRef = useRef(false)
  /** 上次数据变化时间（用于自动停止） */
  const lastChangeTimeRef = useRef<number>(0)
  /** 自动停止定时器 */
  const autoStopTimerRef = useRef<number | null>(null)

  /** 通信模式 */
  const { isPostMessageMode } = getCommunicationMode(apiConfig ?? undefined)

  /**
   * 处理schema响应
   */
  const handleSchemaResponse = useCallback(
    (payload: { success: boolean; data?: any; error?: string }) => {
      // 只在录制中时处理响应
      if (!isRecordingRef.current) {
        return
      }

      if (!payload.success || payload.data === undefined) {
        return
      }

      // 将数据转换为可显示的字符串
      // 字符串保留原始格式（保留换行以便逐行diff）
      // 对象/数组使用 stringify 格式化
      let content: string
      if (typeof payload.data === 'string') {
        // 字符串：直接使用，保留换行符
        content = payload.data
      } else {
        // 对象/数组/其他：stringify 格式化
        try {
          content = JSON.stringify(payload.data, null, 2)
        } catch {
          content = String(payload.data)
        }
      }

      // 去重：与上一次内容相同则跳过
      if (content === lastContentRef.current) {
        return
      }

      lastContentRef.current = content
      // 记录数据变化时间（用于自动停止检测）
      lastChangeTimeRef.current = Date.now()

      // 计算相对时间
      const timestamp = Date.now() - recordingStartTimeRef.current

      // 创建新快照
      const newSnapshot: SchemaSnapshot = {
        id: snapshotIdRef.current++,
        content,
        timestamp,
      }

      setSnapshots((prev) => [...prev, newSnapshot])
      setSelectedSnapshotId(newSnapshot.id)

      // 通知外部schema变化
      onSchemaChangeRef.current?.(content)
    },
    [onSchemaChangeRef]
  )

  /**
   * 发送获取schema请求（postMessage 直连模式）
   */
  const requestSchemaPostMessage = useCallback(async () => {
    const params = attributes.params.join(',')
    try {
      const messageType =
        apiConfig?.messageTypes?.getSchema ?? DEFAULT_VALUES.apiConfig.messageTypes.getSchema
      const response = await sendRequestToHost<SchemaResponsePayload>(
        messageType,
        { params },
        apiConfig?.requestTimeout ?? DEFAULT_VALUES.apiConfig.requestTimeout,
        apiConfig?.sourceConfig
      )
      handleSchemaResponse({
        success: response.success !== false,
        data: response.data,
        error: response.error,
      })
    } catch {
      // 忽略单次请求失败
    }
  }, [attributes.params, apiConfig, handleSchemaResponse])

  /**
   * 发送获取schema请求（windowFunction 模式）
   */
  const requestSchemaWindowFunction = useCallback(() => {
    const params = attributes.params.join(',')
    postMessageToPage({
      type: MessageType.GET_SCHEMA,
      payload: { params },
    })
  }, [attributes.params])

  /**
   * 内部停止录制函数（供自动停止使用）
   */
  const stopRecordingInternal = useCallback(
    (isAutoStop: boolean = false) => {
      // 清理定时器（无论状态如何都执行清理）
      if (pollingTimerRef.current !== null) {
        clearInterval(pollingTimerRef.current)
        pollingTimerRef.current = null
      }

      // 清理自动停止定时器
      if (autoStopTimerRef.current !== null) {
        clearInterval(autoStopTimerRef.current)
        autoStopTimerRef.current = null
      }

      // 清理消息监听
      if (messageCleanupRef.current) {
        messageCleanupRef.current()
        messageCleanupRef.current = null
      }

      isRecordingRef.current = false
      setIsRecording(false)

      // 如果是自动停止，触发回调
      if (isAutoStop) {
        onAutoStopRef.current?.()
      }
    },
    [onAutoStopRef]
  )

  //TODO-youling:CR check point
  /**
   * 开始录制
   */
  const startRecording = useCallback(() => {
    // 使用ref判断避免闭包问题
    if (isRecordingRef.current) return

    // 重置状态
    setSnapshots([])
    setSelectedSnapshotId(null)
    lastContentRef.current = ''
    snapshotIdRef.current = 0
    recordingStartTimeRef.current = Date.now()
    lastChangeTimeRef.current = Date.now()

    if (isPostMessageMode) {
      // postMessage 直连模式：直接轮询
      requestSchemaPostMessage()

      pollingTimerRef.current = window.setInterval(() => {
        requestSchemaPostMessage()
      }, pollingInterval)
    } else {
      // windowFunction 模式：通过 injected.js
      messageCleanupRef.current = listenPageMessages((msg) => {
        if (msg.type === MessageType.SCHEMA_RESPONSE) {
          handleSchemaResponse(msg.payload)
        }
      })

      requestSchemaWindowFunction()

      pollingTimerRef.current = window.setInterval(() => {
        requestSchemaWindowFunction()
      }, pollingInterval)
    }

    // 启动自动停止检测（如果配置了超时时间）
    if (autoStopTimeout != null && autoStopTimeout > 0) {
      const timeoutMs = autoStopTimeout * 1000
      // 每秒检测一次是否超时
      autoStopTimerRef.current = window.setInterval(() => {
        const timeSinceLastChange = Date.now() - lastChangeTimeRef.current
        if (timeSinceLastChange >= timeoutMs) {
          stopRecordingInternal(true)
        }
      }, 1000)
    }

    isRecordingRef.current = true
    setIsRecording(true)
  }, [
    pollingInterval,
    isPostMessageMode,
    requestSchemaPostMessage,
    requestSchemaWindowFunction,
    handleSchemaResponse,
    autoStopTimeout,
    stopRecordingInternal,
  ])

  /**
   * 停止录制（手动停止）
   */
  const stopRecording = useCallback(() => {
    stopRecordingInternal(false)
  }, [stopRecordingInternal])

  /**
   * 选择快照
   */
  const selectSnapshot = useCallback(
    (id: number) => {
      const snapshot = snapshots.find((s) => s.id === id)
      if (snapshot) {
        setSelectedSnapshotId(id)
        onSchemaChangeRef.current?.(snapshot.content)
      }
    },
    [snapshots, onSchemaChangeRef]
  )

  /**
   * 清空快照
   */
  const clearSnapshots = useCallback(() => {
    setSnapshots([])
    setSelectedSnapshotId(null)
    lastContentRef.current = ''
    snapshotIdRef.current = 0
    isRecordingRef.current = false
  }, [])

  /**
   * 组件卸载时清理
   */
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current !== null) {
        clearInterval(pollingTimerRef.current)
      }
      if (autoStopTimerRef.current !== null) {
        clearInterval(autoStopTimerRef.current)
      }
      if (messageCleanupRef.current) {
        messageCleanupRef.current()
      }
    }
  }, [])

  return {
    isRecording,
    snapshots,
    selectedSnapshotId,
    startRecording,
    stopRecording,
    selectSnapshot,
    clearSnapshots,
  }
}
