/**
 * Schema Element Editor Host SDK
 * 用于在宿主页面接入 Schema Element Editor 插件
 *
 * @example
 * ```ts
 * // React（默认）
 * import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'
 *
 * // Vue
 * import { useSchemaElementEditor } from '@schema-element-editor/host-sdk/vue'
 *
 * // 纯 JS（框架无关）
 * import { createSchemaElementEditorBridge } from '@schema-element-editor/host-sdk/core'
 * ```
 */

// 默认导出 React 版本
export { useSchemaElementEditor } from './react'

// 也导出纯 JS 版本的函数
export { createSchemaElementEditorBridge } from './core'

// 导出类型（直接从 types 导出，避免重复）
export type {
  SchemaValue,
  PostMessageSourceConfig,
  PostMessageTypeConfig,
  MethodLevelConfig,
  SchemaElementEditorConfig,
  SchemaElementEditorBridge,
  SchemaElementEditorRecording,
} from './types'
