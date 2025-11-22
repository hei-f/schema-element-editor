/**
 * Schema Drawer Feature
 * 负责Schema编辑器抽屉的所有功能
 */

// 导出主组件
export { CodeMirrorEditor } from './components/CodeMirrorEditor'
export { DrawerToolbar } from './components/DrawerToolbar'
export { SchemaDrawer } from './components/SchemaDrawer'

// 导出Hooks
export { useContentDetection } from './hooks/useContentDetection'
export { useDraftManagement } from './hooks/useDraftManagement'
export { useFavoritesManagement } from './hooks/useFavoritesManagement'
export { useLightNotifications } from './hooks/useLightNotifications'
export { useSchemaSave } from './hooks/useSchemaSave'

// 导出服务
export { schemaTransformer } from './services/schema-transformer'
export type { TransformResult } from './services/schema-transformer'

// 导出样式（如果需要在外部使用）
export * from './styles/drawer.styles'
export * from './styles/editor.styles'
export * from './styles/notifications.styles'
export * from './styles/toolbar.styles'

