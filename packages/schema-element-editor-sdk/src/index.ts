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

// 导出纯 JS 版本
export { createSchemaElementEditorBridge } from './core'

// 重新导出类型
export type {
  SchemaElementEditorConfig,
  SchemaElementEditorBridge,
  SchemaValue,
  PostMessageSourceConfig,
  PostMessageTypeConfig,
} from './core'
