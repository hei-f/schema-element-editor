/**
 * Schema Editor Host SDK
 * 用于在宿主页面接入 Schema Editor 插件
 *
 * @example
 * ```ts
 * // React（默认）
 * import { useSchemaEditor } from 'use-schema-editor'
 *
 * // Vue
 * import { useSchemaEditor } from 'use-schema-editor/vue'
 *
 * // 纯 JS（框架无关）
 * import { createSchemaEditorBridge } from 'use-schema-editor/core'
 * ```
 */

// 默认导出 React 版本（向后兼容）
export { useSchemaEditor } from './react'

// 导出纯 JS 版本
export { createSchemaEditorBridge } from './core'

// 重新导出类型
export type {
  SchemaEditorConfig,
  SchemaValue,
  PostMessageSourceConfig,
  PostMessageTypeConfig,
} from './core'
