/**
 * Schema Editor Host SDK - Core
 * 纯 JS 核心逻辑，无框架依赖
 */

/** 默认消息标识 */
const DEFAULT_SOURCE_CONFIG = {
  contentSource: 'schema-editor-content',
  hostSource: 'schema-editor-host',
} as const

/** 默认消息类型 */
const DEFAULT_MESSAGE_TYPES = {
  getSchema: 'GET_SCHEMA',
  updateSchema: 'UPDATE_SCHEMA',
  checkPreview: 'CHECK_PREVIEW',
  renderPreview: 'RENDER_PREVIEW',
  cleanupPreview: 'CLEANUP_PREVIEW',
} as const

/**
 * Schema 数据类型
 * 支持所有 JSON.parse 可返回的类型
 */
export type SchemaValue = Record<string, unknown> | unknown[] | string | number | boolean | null

/** postMessage 消息标识配置 */
export interface PostMessageSourceConfig {
  /** 插件端发送消息的 source 标识 */
  contentSource: string
  /** 宿主端响应消息的 source 标识 */
  hostSource: string
}

/** postMessage 消息类型配置 */
export interface PostMessageTypeConfig {
  getSchema: string
  updateSchema: string
  checkPreview: string
  renderPreview: string
  cleanupPreview: string
}

/**
 * Schema Editor 配置接口
 */
export interface SchemaEditorConfig {
  /**
   * 获取 Schema 数据
   * @param params - 元素参数（通常是 data-id 的值）
   * @returns Schema 数据（支持所有 JSON 类型）
   */
  getSchema: (params: string) => SchemaValue

  /**
   * 更新 Schema 数据
   * @param schema - 新的 Schema 数据（支持所有 JSON 类型）
   * @param params - 元素参数
   * @returns 是否更新成功
   */
  updateSchema: (schema: SchemaValue, params: string) => boolean

  /**
   * 渲染预览（可选）
   * @param schema - Schema 数据（支持所有 JSON 类型）
   * @param containerId - 预览容器 ID
   * @returns 清理函数（可选）
   */
  renderPreview?: (schema: SchemaValue, containerId: string) => (() => void) | void

  /** 消息标识配置（可选，有默认值） */
  sourceConfig?: Partial<PostMessageSourceConfig>

  /** 消息类型配置（可选，有默认值） */
  messageTypes?: Partial<PostMessageTypeConfig>
}

/** postMessage 请求数据结构 */
interface PostMessageRequest {
  source: string
  type: string
  payload?: Record<string, unknown>
  requestId: string
}

/**
 * 创建 Schema Editor 桥接器
 * 纯 JS 函数，返回清理函数
 *
 * @param config - Schema Editor 配置
 * @returns 清理函数，用于移除事件监听器
 *
 * @example
 * ```js
 * const cleanup = createSchemaEditorBridge({
 *   getSchema: (params) => dataStore[params],
 *   updateSchema: (schema, params) => {
 *     dataStore[params] = schema
 *     return true
 *   },
 * })
 *
 * // 需要清理时调用
 * cleanup()
 * ```
 */
export function createSchemaEditorBridge(config: SchemaEditorConfig): () => void {
  const { getSchema, updateSchema, renderPreview, sourceConfig, messageTypes } = config

  // 合并配置与默认值
  const mergedSourceConfig: PostMessageSourceConfig = {
    ...DEFAULT_SOURCE_CONFIG,
    ...sourceConfig,
  }

  const mergedMessageTypes: PostMessageTypeConfig = {
    ...DEFAULT_MESSAGE_TYPES,
    ...messageTypes,
  }

  // 存储最后一次 renderPreview 返回的清理函数
  let previewCleanupFn: (() => void) | null = null

  // 存储最新的配置引用（用于避免闭包陷阱，由框架包装器通过代理模式更新）
  const currentConfig = { getSchema, updateSchema, renderPreview }

  /**
   * 发送响应给插件
   * 自动检测是否在 iframe 中，如果是则发送给 top frame
   */
  const sendResponse = (requestId: string, result: Record<string, unknown>) => {
    const message = {
      source: mergedSourceConfig.hostSource,
      requestId,
      ...result,
    }

    // 如果在 iframe 中，响应需要发给 top frame（插件运行在 top frame）
    const isInIframe = window !== window.top
    const targetWindow = isInIframe ? window.parent : window

    targetWindow.postMessage(message, '*')
  }

  /**
   * 处理消息
   */
  const handleMessage = (event: MessageEvent<PostMessageRequest>) => {
    // 接受来自当前窗口或父窗口的消息（支持 iframe 场景）
    const isFromSelf = event.source === window
    const isFromParent = window !== window.top && event.source === window.parent
    if (!isFromSelf && !isFromParent) return

    // 只处理来自插件的消息
    if (!event.data || event.data.source !== mergedSourceConfig.contentSource) return

    const { type, payload, requestId } = event.data

    // 没有 requestId 的消息不处理（非请求-响应模式）
    if (!requestId) return

    const { getSchema, updateSchema, renderPreview } = currentConfig
    let result: Record<string, unknown>

    switch (type) {
      case mergedMessageTypes.getSchema: {
        const params = String(payload?.params ?? '')
        try {
          const data = getSchema(params)
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
        const schema = payload?.schema as SchemaValue
        const params = String(payload?.params ?? '')
        try {
          const success = updateSchema(schema, params)
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
        // 如果传入了 renderPreview，则预览功能可用
        result = { exists: typeof renderPreview === 'function' }
        break
      }

      case mergedMessageTypes.renderPreview: {
        if (typeof renderPreview !== 'function') {
          result = { success: false, error: '预览功能未配置' }
          break
        }

        const schema = payload?.schema as SchemaValue
        const containerId = String(payload?.containerId ?? '')

        try {
          // 先清理之前的预览
          if (previewCleanupFn) {
            previewCleanupFn()
            previewCleanupFn = null
          }

          // 渲染新预览，并存储清理函数
          const cleanup = renderPreview(schema, containerId)
          if (typeof cleanup === 'function') {
            previewCleanupFn = cleanup
          }

          result = { success: true }
        } catch (error) {
          result = {
            success: false,
            error: error instanceof Error ? error.message : '渲染预览失败',
          }
        }
        break
      }

      case mergedMessageTypes.cleanupPreview: {
        try {
          if (previewCleanupFn) {
            previewCleanupFn()
            previewCleanupFn = null
          }
          result = { success: true }
        } catch (error) {
          result = {
            success: false,
            error: error instanceof Error ? error.message : '清理预览失败',
          }
        }
        break
      }

      default:
        // 未知消息类型，不处理
        return
    }

    // 发送响应
    sendResponse(requestId, result)
  }

  // 注册事件监听器
  window.addEventListener('message', handleMessage)

  // 返回清理函数
  return () => {
    window.removeEventListener('message', handleMessage)

    // 清理预览
    if (previewCleanupFn) {
      previewCleanupFn()
      previewCleanupFn = null
    }
  }
}

/** 桥接器清理函数类型 */
export type SchemaEditorBridge = ReturnType<typeof createSchemaEditorBridge>
