/**
 * Schema Element Editor Host SDK - Bridge
 * 纯 JS 核心逻辑，无框架依赖
 */

import { DEFAULT_SOURCE_CONFIG, DEFAULT_MESSAGE_TYPES } from './constants'
import { SdkCoordinator } from './coordinator'
import type {
  SchemaValue,
  PostMessageSourceConfig,
  PostMessageTypeConfig,
  PostMessageRequest,
  SchemaElementEditorConfig,
  SchemaElementEditorBridge,
} from './types'

/**
 * 方法名常量
 */
const METHOD_NAMES = {
  GET_SCHEMA: 'getSchema',
  UPDATE_SCHEMA: 'updateSchema',
  CHECK_PREVIEW: 'checkPreview',
  RENDER_PREVIEW: 'renderPreview',
  CLEANUP_PREVIEW: 'cleanupPreview',
  START_RECORDING: 'startRecording',
  STOP_RECORDING: 'stopRecording',
} as const

/**
 * 判断是否应该跳过失败的响应
 * 当存在同级SDK竞争者时，失败的响应会被跳过，让其他SDK有机会响应
 *
 * @param method - 方法名
 * @param result - 执行结果
 * @returns true表示跳过响应，false表示发送响应
 */
function shouldSkipFailedResponse(method: string, result: Record<string, unknown>): boolean {
  switch (method) {
    case METHOD_NAMES.GET_SCHEMA:
      // getSchema: 成功但数据为undefined时跳过响应
      return result.success === true && result.data === undefined

    case METHOD_NAMES.UPDATE_SCHEMA:
      // updateSchema: 失败时跳过响应
      return result.success === false

    case METHOD_NAMES.RENDER_PREVIEW:
    case METHOD_NAMES.CLEANUP_PREVIEW:
      // preview相关: 失败时跳过响应
      return result.success === false

    case METHOD_NAMES.CHECK_PREVIEW:
    case METHOD_NAMES.START_RECORDING:
    case METHOD_NAMES.STOP_RECORDING:
      // 这些方法总是需要响应（即使失败）
      return false

    default:
      // 未知方法默认发送响应
      return false
  }
}

/**
 * 创建 Schema Element Editor 桥接器
 * 纯 JS 函数，返回桥接器对象
 *
 * @param config - Schema Element Editor 配置
 * @returns 桥接器对象，包含 cleanup 和 recording 方法
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
 * // 只提供预览功能，让其他 SDK 处理数据管理
 * const bridge = createSchemaElementEditorBridge({
 *   level: 100,
 *   renderPreview: (schema, containerId) => {
 *     renderMyCustomPreview(schema, containerId)
 *   },
 * })
 *
 * // 数据变化时调用 recording.push 推送数据（录制功能自动可用）
 * sseHandler.onData = (params, data) => {
 *   bridge.recording.push(params, data)
 * }
 * ```
 */
export function createSchemaElementEditorBridge(
  config: SchemaElementEditorConfig
): SchemaElementEditorBridge {
  const {
    getSchema,
    updateSchema,
    renderPreview,
    sourceConfig,
    messageTypes,
    sdkId,
    level,
    methodLevels,
  } = config

  // 合并配置与默认值
  const mergedSourceConfig: PostMessageSourceConfig = {
    ...DEFAULT_SOURCE_CONFIG,
    ...sourceConfig,
  }

  const mergedMessageTypes: PostMessageTypeConfig = {
    ...DEFAULT_MESSAGE_TYPES,
    ...messageTypes,
  }

  // 检测当前 SDK 实现了哪些方法
  const implementedMethods: string[] = []
  if (typeof getSchema === 'function') implementedMethods.push(METHOD_NAMES.GET_SCHEMA)
  if (typeof updateSchema === 'function') implementedMethods.push(METHOD_NAMES.UPDATE_SCHEMA)
  // renderPreview 支持三种值：undefined（不关心）、null（阻止）、function（实现）
  // null 和 function 都会参与优先级竞争
  if (renderPreview !== undefined) {
    implementedMethods.push(
      METHOD_NAMES.CHECK_PREVIEW,
      METHOD_NAMES.RENDER_PREVIEW,
      METHOD_NAMES.CLEANUP_PREVIEW
    )
  }
  // 录制相关方法总是可用
  implementedMethods.push(METHOD_NAMES.START_RECORDING, METHOD_NAMES.STOP_RECORDING)

  // 创建 SDK 协调器
  const coordinator = new SdkCoordinator({
    sdkId,
    messageSource: mergedSourceConfig.contentSource,
    level,
    methodLevels,
    implementedMethods,
  })

  // 初始化协调器
  coordinator.init()

  // 存储最后一次 renderPreview 返回的清理函数
  let previewCleanupFn: (() => void) | null = null

  // 正在录制的 params 集合（SDK 内部维护录制状态）
  const recordingParams = new Set<string>()

  // 存储最新的配置引用（用于避免闭包陷阱，由框架包装器通过代理模式更新）
  const currentConfig = { getSchema, updateSchema, renderPreview }

  /**
   * 消息类型到方法名的映射
   * 使用 Record 对象替代 if-else 链，提升性能和可维护性
   */
  const methodTypeToName: Record<string, string> = {
    [mergedMessageTypes.getSchema]: METHOD_NAMES.GET_SCHEMA,
    [mergedMessageTypes.updateSchema]: METHOD_NAMES.UPDATE_SCHEMA,
    [mergedMessageTypes.checkPreview]: METHOD_NAMES.CHECK_PREVIEW,
    [mergedMessageTypes.renderPreview]: METHOD_NAMES.RENDER_PREVIEW,
    [mergedMessageTypes.cleanupPreview]: METHOD_NAMES.CLEANUP_PREVIEW,
    [mergedMessageTypes.startRecording]: METHOD_NAMES.START_RECORDING,
    [mergedMessageTypes.stopRecording]: METHOD_NAMES.STOP_RECORDING,
  }

  /**
   * 获取消息类型对应的方法名
   */
  const getMethodNameByType = (type: string): string | null => {
    return methodTypeToName[type] ?? null
  }

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
    // 使用 window.top 支持多层 iframe 嵌套
    const targetWindow = window.top ?? window

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
    // 使用 window.top 支持多层 iframe 嵌套
    const targetWindow = window.top ?? window

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

    // 获取方法名
    const methodName = getMethodNameByType(type)
    if (!methodName) return // 未知消息类型

    // 检查是否应该由当前 SDK 响应该类型的请求
    // coordinator.shouldRespond 会同时检查：
    // 1. 当前 SDK 是否实现了该方法
    // 2. 是否有更高优先级的 SDK 实现了该方法
    if (!coordinator.shouldRespond(methodName)) {
      return
    }

    const { getSchema, updateSchema, renderPreview } = currentConfig
    let result: Record<string, unknown>

    switch (type) {
      case mergedMessageTypes.getSchema: {
        if (typeof getSchema !== 'function') {
          // 理论上不会到达这里（coordinator.shouldRespond 已过滤）
          return
        }
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
        if (typeof updateSchema !== 'function') {
          return
        }
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
        // renderPreview === null 表示明确阻止预览，返回 exists: false
        // renderPreview === function 表示提供预览，返回 exists: true
        const exists = typeof renderPreview === 'function'
        result = { exists }
        break
      }

      case mergedMessageTypes.renderPreview: {
        if (typeof renderPreview !== 'function') {
          // renderPreview 为 null 或 undefined 时返回失败
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

    // 判断是否应该发送响应
    const hasSameLevelSdks = coordinator.hasSameLevelCompetitors(methodName)
    if (hasSameLevelSdks && shouldSkipFailedResponse(methodName, result)) {
      // 有同级SDK且当前执行失败/无数据，跳过响应让其他SDK有机会响应
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
      // 销毁协调器
      coordinator.destroy()

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
