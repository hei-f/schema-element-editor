/**
 * Schema Drawer Feature
 * 负责Schema编辑器抽屉的所有功能
 */

// 导出主组件
export { CodeMirrorEditor } from './components/editor/CodeMirrorEditor'
export { DrawerToolbar } from './components/toolbar/DrawerToolbar'
export { SchemaDrawer } from './components/SchemaDrawer'
export { RecordingPanel } from './components/recording/RecordingPanel'
export { SchemaDiffView } from './components/editor/SchemaDiffView'

// 导出Hooks
export { useContentDetection } from './hooks/schema/useContentDetection'
export { useDraftManagement } from './hooks/storage/useDraftManagement'
export { useFavoritesManagement } from './hooks/storage/useFavoritesManagement'
export { useLightNotifications } from './hooks/ui/useLightNotifications'
export { useSchemaSave } from './hooks/schema/useSchemaSave'
export { useSchemaRecording } from './hooks/schema/useSchemaRecording'

// 导出服务
export { schemaTransformer } from './services/schema-transformer'
export type { TransformResult } from './services/schema-transformer'
