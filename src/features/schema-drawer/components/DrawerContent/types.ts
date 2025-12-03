import type {
  ContentType,
  EditorTheme,
  ElementAttributes,
  SchemaSnapshot,
  ToolbarButtonsConfig,
} from '@/shared/types'
import type { EditorThemeVars } from '../../styles/editor/editor-theme-vars'
import type { CodeMirrorEditorHandle } from '../editor/CodeMirrorEditor'

/**
 * 轻量通知类型
 */
export interface LightNotification {
  id: string
  text: string
}

/**
 * 工具栏操作回调
 */
export interface ToolbarActions {
  onFormat: () => void
  onEscape: () => void
  onUnescape: () => void
  onCompact: () => void
  onParse: () => void
  onSegmentChange: (value: string | number) => void
  onRenderPreview?: () => void
  onLocateError?: () => void
  onRepairJson?: () => void
  onEnterDiffMode?: () => void
  onExitDiffMode?: () => void
}

/**
 * 编辑器相关 props
 */
export interface EditorProps {
  editorRef: React.RefObject<CodeMirrorEditorHandle | null>
  editorValue: string
  editorTheme: EditorTheme
  enableAstTypeHints: boolean
  contentType: ContentType
  onChange: (value: string | undefined) => void
}

/**
 * 通知相关 props
 */
export interface NotificationProps {
  lightNotifications: LightNotification[]
}

/**
 * 基础内容 props（所有模式共享）
 */
export interface BaseContentProps {
  attributes: ElementAttributes
  contentType: ContentType
  canParse: boolean
  toolbarButtons: ToolbarButtonsConfig
  toolbarActions: ToolbarActions
  editorProps: EditorProps
  notificationProps: NotificationProps
}

/**
 * Diff 模式 props
 */
export interface DiffModeContentProps extends BaseContentProps {
  isFullScreenTransition: boolean
  isInRecordingMode: boolean
  snapshots: SchemaSnapshot[]
  originalValue: string
  repairOriginalValue: string
  pendingRepairedValue: string
  editorValue: string
  onApplyRepair: () => void
  onCancelRepair: () => void
}

/**
 * 录制模式 props
 */
export interface RecordingModeContentProps extends BaseContentProps {
  isRecording: boolean
  snapshots: SchemaSnapshot[]
  selectedSnapshotId: number | null
  previewEnabled: boolean
  onStopRecording: () => void
  onSelectSnapshot: (id: number) => void
  onEnterDiffMode: () => void
}

/**
 * 预览模式 props
 */
export interface PreviewModeContentProps extends BaseContentProps {
  isFullScreenTransition: boolean
  previewEnabled: boolean
  previewWidth: number
  isDragging: boolean
  previewContainerRef: React.RefObject<HTMLDivElement | null>
  previewPlaceholderRef: React.RefObject<HTMLDivElement | null>
  onResizeStart: (e: React.MouseEvent) => void
}

/**
 * 普通模式 props
 */
export interface NormalModeContentProps extends BaseContentProps {
  previewEnabled: boolean
}

/**
 * DrawerContent 总入口 props
 */
export interface DrawerContentProps {
  /** 当前模式 */
  isDiffMode: boolean
  isInRecordingMode: boolean
  previewEnabled: boolean
  /** 主题变量 */
  editorThemeVars: EditorThemeVars
  /** Diff 模式相关 */
  diffModeProps: Omit<DiffModeContentProps, keyof BaseContentProps>
  /** 录制模式相关 */
  recordingModeProps: Omit<RecordingModeContentProps, keyof BaseContentProps>
  /** 预览模式相关 */
  previewModeProps: Omit<PreviewModeContentProps, keyof BaseContentProps>
  /** 普通模式相关 */
  normalModeProps: Omit<NormalModeContentProps, keyof BaseContentProps>
  /** 基础 props */
  baseProps: BaseContentProps
}
