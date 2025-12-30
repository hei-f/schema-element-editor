/**
 * Schema Element Editor Host SDK - React
 * React hooks 包装
 */

import { useEffect, useRef, useMemo, useCallback } from 'react'
import { createSchemaElementEditorBridge } from './bridge'
import type {
  SchemaElementEditorConfig,
  SchemaElementEditorBridge,
  SchemaElementEditorRecording,
  SchemaValue,
} from './types'

// 注意：类型从主入口 (@schema-element-editor/host-sdk) 导出
// 如需类型，请从主入口导入：import type { ... } from '@schema-element-editor/host-sdk'

/** React 版本的 Schema Element Editor 配置 */
export interface ReactSchemaElementEditorConfig extends SchemaElementEditorConfig {
  /**
   * 是否启用桥接（默认 true）
   * 设为 false 时不创建桥接器，不监听消息
   */
  enabled?: boolean
}

/** React hooks 返回值 */
export interface UseSchemaElementEditorReturn {
  /** 录制相关方法 */
  recording: SchemaElementEditorRecording
}

/**
 * Schema Element Editor 插件接入 hooks（React）
 * 用于在宿主页面接入 Schema Element Editor 插件，通过 postMessage 接收插件请求并返回响应
 *
 * @param config - Schema Element Editor 配置
 * @returns 桥接器方法，包含 recording
 *
 * @example
 * ```tsx
 * import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'
 *
 * function App() {
 *   const { recording } = useSchemaElementEditor({
 *     getSchema: (params) => dataStore[params],
 *     updateSchema: (schema, params) => {
 *       dataStore[params] = schema
 *       return true
 *     },
 *   })
 *
 *   // 数据变化时推送数据（SDK 内部管理录制状态，未录制时静默忽略）
 *   sseHandler.onData = (params, data) => recording.push(params, data)
 *
 *   // 检查是否正在录制
 *   if (recording.isActive('chat-1')) { ... }
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function useSchemaElementEditor(
  config: ReactSchemaElementEditorConfig
): UseSchemaElementEditorReturn {
  const {
    getSchema,
    updateSchema,
    renderPreview,
    sourceConfig,
    messageTypes,
    enabled,
    sdkId,
    level,
    methodLevels,
  } = config

  // 使用 ref 存储最新的配置，避免闭包陷阱
  const configRef = useRef({ getSchema, updateSchema, renderPreview })

  // 存储桥接器实例
  const bridgeRef = useRef<SchemaElementEditorBridge | null>(null)

  // 更新配置 ref（在 effect 中更新以避免渲染期间修改 ref）
  useEffect(() => {
    configRef.current = { getSchema, updateSchema, renderPreview }
  }, [getSchema, updateSchema, renderPreview])

  useEffect(() => {
    // enabled 明确为 false 时不创建桥接
    if (enabled === false) {
      return
    }

    // 创建代理配置，始终使用最新的 ref 值（避免频繁重建 bridge）
    const proxyConfig: SchemaElementEditorConfig = {
      // 外层检查确保初始时函数存在才创建代理
      // 内层使用可选链安全访问，配合类型断言确保类型正确
      getSchema: configRef.current.getSchema
        ? (params) => configRef.current.getSchema?.(params) as SchemaValue
        : undefined,
      updateSchema: configRef.current.updateSchema
        ? (schema, params) => configRef.current.updateSchema?.(schema, params) as boolean
        : undefined,
      // renderPreview 需要特殊处理：
      // - undefined: 不传递（不参与竞争）
      // - null: 传递 null（参与竞争但阻止预览）
      // - function: 创建代理函数
      renderPreview:
        configRef.current.renderPreview === null
          ? null
          : configRef.current.renderPreview
            ? (schema, containerId) => configRef.current.renderPreview?.(schema, containerId)
            : undefined,
      sourceConfig,
      messageTypes,
      sdkId,
      level,
      methodLevels,
    }

    const bridge = createSchemaElementEditorBridge(proxyConfig)
    bridgeRef.current = bridge

    return () => {
      bridge.cleanup()
      bridgeRef.current = null
    }
  }, [enabled, configRef, sourceConfig, messageTypes, sdkId, level, methodLevels])

  // 返回稳定的 recording 方法
  const push = useCallback((params: string, data: SchemaValue) => {
    bridgeRef.current?.recording.push(params, data)
  }, [])

  // 组合成稳定的 recording 对象
  const recording = useMemo<SchemaElementEditorRecording>(() => ({ push }), [push])

  return { recording }
}
