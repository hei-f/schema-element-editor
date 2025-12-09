/**
 * Schema Element Editor Host SDK - Core
 * 纯 JS 核心逻辑，无框架依赖
 */

/** 默认消息标识 */
const DEFAULT_SOURCE_CONFIG = {
  contentSource: 'schema-element-editor-content',
  hostSource: 'schema-element-editor-host',
} as const

/** 默认消息类型 */
const DEFAULT_MESSAGE_TYPES = {
  getSchema: 'GET_SCHEMA',
  updateSchema: 'UPDATE_SCHEMA',
  checkPreview: 'CHECK_PREVIEW',
  renderPreview: 'RENDER_PREVIEW',
  cleanupPreview: 'CLEANUP_PREVIEW',
  // 录制模式相关
  startRecording: 'START_RECORDING',
  stopRecording: 'STOP_RECORDING',
  schemaPush: 'SCHEMA_PUSH',
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
  // 录制模式相关
  startRecording: string
  stopRecording: string
  schemaPush: string
}

/**
 * Schema Element Editor 配置接口
 */
export interface SchemaElementEditorConfig {
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
 * 录制相关方法
 */
export interface SchemaElementEditorRecording {
  /**
   * 推送 Schema 数据（SDK 内部判断是否在录制，未录制时静默忽略）
   * @param params - 元素参数（data-id 的值）
   * @param data - Schema 数据
   */
  push: (params: string, data: SchemaValue) => void
}

/**
 * Schema Element Editor 桥接器返回值
 */
export interface SchemaElementEditorBridge {
  /** 清理桥接器，移除事件监听 */
  cleanup: () => void

  /** 录制相关方法 */
  recording: SchemaElementEditorRecording
}

/**
 * 创建 Schema Element Editor 桥接器
 * 纯 JS 函数，返回桥接器对象
 *
 * @param config - Schema Element Editor 配置
 * @returns 桥接器对象，包含 cleanup 和 pushSchema 方法
 *
 * @example
 * ```js
 * // 最简用法：只需配置基本的 getSchema 和 updateSchema
 * const bridge = createSchemaElementEditorBridge({
 *   getSchema: (params) => dataStore[params],
 *   updateSchema: (schema, params) => {
 *     dataStore[params] = schema
 *     return true
 *   },
 * })
 *
 * // 数据变化时调用 pushSchema 推送数据（录制功能自动可用）
 * sseHandler.onData = (params, data) => {
 *   bridge.pushSchema(params, data)
 * }
 *
 * // 如需在录制开始/停止时执行额外逻辑，可配置回调（可选）
 * // onStartRecording: (params) => console.log('开始录制:', params),
 * // onStopRecording: (params) => console.log('停止录制:', params),
 * ```
 */
export function createSchemaElementEditorBridge(
  config: SchemaElementEditorConfig
): SchemaElementEditorBridge {
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

  // 正在录制的 params 集合（SDK 内部维护录制状态）
  const recordingParams = new Set<string>()

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
   * 主动推送 Schema 数据给插件（用于录制模式）
   * 只有当 params 正在被录制时才真正推送，否则静默忽略
   */
  const pushSchema = (params: string, data: SchemaValue) => {
    // 检查该 params 是否正在录制，不在则静默忽略
    if (!recordingParams.has(params)) {
      return
    }

    const message = {
      source: mergedSourceConfig.hostSource,
      type: mergedMessageTypes.schemaPush,
      payload: {
        success: true,
        data,
        params,
      },
    }

    // 如果在 iframe 中，推送需要发给 top frame（插件运行在 top frame）
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

      case mergedMessageTypes.startRecording: {
        const params = String(payload?.params ?? '')
        // 将 params 加入录制集合（SDK 内部管理录制状态）
        recordingParams.add(params)
        result = { success: true }
        break
      }

      case mergedMessageTypes.stopRecording: {
        const params = String(payload?.params ?? '')
        // 将 params 从录制集合移除
        recordingParams.delete(params)
        result = { success: true }
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

  // 返回桥接器对象
  return {
    cleanup: () => {
      window.removeEventListener('message', handleMessage)

      // 清理预览
      if (previewCleanupFn) {
        previewCleanupFn()
        previewCleanupFn = null
      }

      // 清理录制状态
      recordingParams.clear()
    },
    recording: {
      push: pushSchema,
    },
  }
}
