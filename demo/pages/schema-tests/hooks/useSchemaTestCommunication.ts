import { useState, useEffect, useCallback, useRef } from 'react'

/** 日志最大保留条数 */
const MAX_LOG_ENTRIES = 30

/** 通信模式类型 */
export type CommunicationMode = 'postMessage' | 'windowFunction'

/** postMessage 模式消息来源标识 */
const MESSAGE_SOURCE = {
  /** 插件端发送的消息 */
  CONTENT: 'schema-element-editor-content',
  /** 宿主端响应的消息 */
  HOST: 'schema-element-editor-host',
} as const

/** 日志条目 */
export interface LogEntry {
  type: 'info' | 'success' | 'warn' | 'error'
  message: string
  data?: any
  time: string
}

interface UseSchemaTestCommunicationOptions {
  /** 初始Schema数据存储 */
  initialSchemaStore: Record<string, any>
  /** 通信模式 */
  communicationMode: CommunicationMode
  /** 预览组件渲染函数 */
  renderPreviewComponent?: (containerId: string, schema: any) => boolean
  /** 清理预览组件函数 */
  cleanupPreviewComponent?: () => void
}

export const useSchemaTestCommunication = (options: UseSchemaTestCommunicationOptions) => {
  const { initialSchemaStore, communicationMode, renderPreviewComponent, cleanupPreviewComponent } =
    options

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [schemaData, setSchemaData] = useState<Record<string, any>>({})
  const schemaStoreRef = useRef({ ...initialSchemaStore })

  const addLog = useCallback((type: LogEntry['type'], logMessage: string, data?: any) => {
    const log: LogEntry = {
      type,
      message: logMessage,
      data,
      time: new Date().toLocaleTimeString(),
    }
    setLogs((prev) => [...prev.slice(-MAX_LOG_ENTRIES), log])
  }, [])

  /**
   * 处理 Schema 请求的核心逻辑（两种模式共用）
   */
  const handleRequest = useCallback(
    (type: string, payload: any): any => {
      let result: any

      switch (type) {
        case 'GET_SCHEMA': {
          const params = payload.params
          addLog('info', '🔍 收到 GET_SCHEMA 请求', { params })

          const schema = schemaStoreRef.current[params]

          if (schema !== undefined) {
            addLog('success', '✅ 返回 Schema 数据', schema)
            result = { success: true, data: schema }
          } else {
            const defaultSchema = {
              error: 'Schema not found',
              params: params,
              message: '未找到对应的Schema数据',
            }
            addLog('warn', '⚠️ 未找到Schema，返回默认值', defaultSchema)
            result = { success: true, data: defaultSchema }
          }
          break
        }

        case 'UPDATE_SCHEMA': {
          const { schema, params } = payload
          addLog('info', '💾 收到 UPDATE_SCHEMA 请求', { schema, params })

          try {
            if (schema === null || schema === undefined) {
              throw new Error('Schema 数据不能为空')
            }

            schemaStoreRef.current[params] = schema
            setSchemaData({ ...schemaStoreRef.current })

            addLog('success', '✅ Schema 更新成功', { params, newValue: schema })
            result = { success: true }
          } catch (error: any) {
            addLog('error', '❌ Schema 更新失败', { error: error.message })
            result = { success: false, error: error.message }
          }
          break
        }

        case 'CHECK_PREVIEW': {
          addLog('info', '🔍 收到 CHECK_PREVIEW 请求')
          result = { exists: !!renderPreviewComponent }
          addLog('success', `✅ 预览功能${renderPreviewComponent ? '可用' : '不可用'}`)
          break
        }

        case 'RENDER_PREVIEW': {
          const { schema, containerId } = payload
          addLog('info', '🎨 收到 RENDER_PREVIEW 请求', { schema, containerId })

          if (renderPreviewComponent) {
            const success = renderPreviewComponent(containerId, schema)
            result = { success }
          } else {
            addLog('warn', '⚠️ 预览功能未实现')
            result = { success: false }
          }
          break
        }

        case 'CLEANUP_PREVIEW': {
          addLog('info', '🧹 收到 CLEANUP_PREVIEW 请求')
          if (cleanupPreviewComponent) {
            cleanupPreviewComponent()
          }
          result = { success: true }
          break
        }

        default:
          addLog('warn', '⚠️ 未知的请求类型', { type })
          result = { success: false, error: `未知的请求类型: ${type}` }
      }

      return result
    },
    [addLog, renderPreviewComponent, cleanupPreviewComponent]
  )

  /**
   * 注册 postMessage 模式监听器
   */
  useEffect(() => {
    setSchemaData({ ...schemaStoreRef.current })

    if (communicationMode !== 'postMessage') return

    const handlePostMessage = (event: MessageEvent) => {
      // 只处理来自当前窗口的消息
      if (event.source !== window) return
      // 只处理来自插件的消息
      if (!event.data || event.data.source !== MESSAGE_SOURCE.CONTENT) return

      const { type, payload, requestId } = event.data
      const result = handleRequest(type, payload)

      // 发送响应（必须携带 requestId）
      window.postMessage(
        {
          source: MESSAGE_SOURCE.HOST,
          requestId,
          ...result,
        },
        '*'
      )
    }

    window.addEventListener('message', handlePostMessage)
    addLog('info', '🚀 postMessage 模式已启用', {
      receive: `source: ${MESSAGE_SOURCE.CONTENT}`,
      respond: `source: ${MESSAGE_SOURCE.HOST}`,
    })

    return () => {
      window.removeEventListener('message', handlePostMessage)
    }
  }, [communicationMode, handleRequest, addLog])

  /**
   * 注册 windowFunction 模式的全局函数
   */
  useEffect(() => {
    if (communicationMode !== 'windowFunction') {
      // 清理全局函数
      delete (window as any).__getContentById
      delete (window as any).__updateContentById
      delete (window as any).__getContentPreview
      return
    }

    // 注册全局函数
    ;(window as any).__getContentById = (params: string) => {
      addLog('info', '🔍 调用 __getContentById', { params })
      const schema = schemaStoreRef.current[params]
      if (schema !== undefined) {
        addLog('success', '✅ 返回 Schema 数据', schema)
        return schema
      }
      const defaultSchema = { error: 'Schema not found', params }
      addLog('warn', '⚠️ 未找到Schema，返回默认值', defaultSchema)
      return defaultSchema
    }
    ;(window as any).__updateContentById = (schema: any, params: string) => {
      addLog('info', '💾 调用 __updateContentById', { schema, params })
      try {
        if (schema === null || schema === undefined) {
          throw new Error('Schema 数据不能为空')
        }
        schemaStoreRef.current[params] = schema
        setSchemaData({ ...schemaStoreRef.current })
        addLog('success', '✅ Schema 更新成功', { params, newValue: schema })
        return true
      } catch (error: any) {
        addLog('error', '❌ Schema 更新失败', { error: error.message })
        return false
      }
    }
    ;(window as any).__getContentPreview = (data: any, containerId: string) => {
      addLog('info', '🎨 调用 __getContentPreview', { data, containerId })
      if (renderPreviewComponent) {
        renderPreviewComponent(containerId, data)
      }
      return () => {
        addLog('info', '🧹 预览清理函数被调用')
        if (cleanupPreviewComponent) {
          cleanupPreviewComponent()
        }
      }
    }

    addLog('info', '🚀 windowFunction 模式已启用', {
      functions: ['__getContentById', '__updateContentById', '__getContentPreview'],
    })

    return () => {
      delete (window as any).__getContentById
      delete (window as any).__updateContentById
      delete (window as any).__getContentPreview
    }
  }, [communicationMode, addLog, renderPreviewComponent, cleanupPreviewComponent])

  return {
    logs,
    schemaData,
    schemaStoreRef,
    addLog,
    clearLogs: () => setLogs([]),
  }
}
