import type { ApiConfig, CommunicationMode, ElementAttributes, SchemaSnapshot } from '@/shared/types'
import { MessageType } from '@/shared/types'
import { listenPageMessages, postMessageToPage, sendRequestToHost } from '@/shared/utils/browser/message'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseSchemaRecordingOptions {
  /** 元素属性（用于获取schema的params） */
  attributes: ElementAttributes
  /** 轮询间隔（毫秒） */
  pollingInterval: number
  /** 当获取到新schema时的回调 */
  onSchemaChange?: (content: string) => void
  /** API 配置 */
  apiConfig?: ApiConfig | null
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
  const { attributes, pollingInterval, onSchemaChange, apiConfig } = props
  
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

  /**
   * 获取通信模式
   */
  const getCommunicationMode = useCallback((): CommunicationMode => {
    return apiConfig?.communicationMode ?? 'postMessage'
  }, [apiConfig])

  /**
   * 处理schema响应
   */
  const handleSchemaResponse = useCallback((payload: { success: boolean; data?: any; error?: string }) => {
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
    
    // 计算相对时间
    const timestamp = Date.now() - recordingStartTimeRef.current
    
    // 创建新快照
    const newSnapshot: SchemaSnapshot = {
      id: snapshotIdRef.current++,
      content,
      timestamp
    }
    
    setSnapshots(prev => [...prev, newSnapshot])
    setSelectedSnapshotId(newSnapshot.id)
    
    // 通知外部schema变化
    onSchemaChange?.(content)
  }, [onSchemaChange])

  /**
   * 发送获取schema请求（postMessage 直连模式）
   */
  const requestSchemaPostMessage = useCallback(async () => {
    const params = attributes.params.join(',')
    try {
      const messageType = apiConfig?.messageTypes?.getSchema ?? 'GET_SCHEMA'
      const response = await sendRequestToHost<{ success: boolean; data?: any; error?: string }>(
        messageType,
        { params },
        apiConfig?.requestTimeout ?? 5,
        apiConfig?.sourceConfig
      )
      handleSchemaResponse({
        success: response.success !== false,
        data: response.data,
        error: response.error
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
      payload: { params }
    })
  }, [attributes.params])

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
    
    const mode = getCommunicationMode()
    
    if (mode === 'postMessage') {
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
    
    isRecordingRef.current = true
    setIsRecording(true)
  }, [pollingInterval, getCommunicationMode, requestSchemaPostMessage, requestSchemaWindowFunction, handleSchemaResponse])

  /**
   * 停止录制
   */
  const stopRecording = useCallback(() => {
    // 清理定时器（无论状态如何都执行清理）
    if (pollingTimerRef.current !== null) {
      clearInterval(pollingTimerRef.current)
      pollingTimerRef.current = null
    }
    
    // 清理消息监听
    if (messageCleanupRef.current) {
      messageCleanupRef.current()
      messageCleanupRef.current = null
    }
    
    isRecordingRef.current = false
    setIsRecording(false)
  }, [])

  /**
   * 选择快照
   */
  const selectSnapshot = useCallback((id: number) => {
    const snapshot = snapshots.find(s => s.id === id)
    if (snapshot) {
      setSelectedSnapshotId(id)
      onSchemaChange?.(snapshot.content)
    }
  }, [snapshots, onSchemaChange])

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
    clearSnapshots
  }
}

