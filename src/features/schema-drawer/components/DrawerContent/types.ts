import type {
  ContentType,
  EditorTheme,
  ElementAttributes,
  SchemaSnapshot,
  ToolbarButtonsConfig,
} from '@/shared/types'
import type { EditorThemeVars } from '../../styles/editor/editor-theme-vars'
import type { CodeMirrorEditorHandle } from '../editor/CodeMirrorEditor'
import type { DiffToolbarActions } from '../toolbar/DrawerToolbar'

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
  onCopyParam?: (value: string, index: number) => void
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
  /** Diff 视图左侧转换后的内容 */
  diffLeftContent?: string
  /** Diff 视图右侧转换后的内容 */
  diffRightContent?: string
  /** Diff 模式专用工具栏回调 */
  diffToolbarActions?: DiffToolbarActions
  onApplyRepair: () => void
  onCancelRepair: () => void
  /** 是否隐藏工具栏（由父组件统一管理时使用） */
  hideToolbar?: boolean
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
  /** 是否隐藏工具栏（由父组件统一管理时使用） */
  hideToolbar?: boolean
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
  /** 预览关闭过渡状态：保持布局结构，隐藏预览内容 */
  isClosingTransition: boolean
  /** 预览打开初始状态：预览区域宽度为 0，用于触发 CSS transition */
  isOpeningInitial: boolean
  /** 预览打开过渡中：整个动画期间，用于控制拖动条隐藏 */
  isOpeningTransition: boolean
  /** 是否隐藏工具栏（由父组件统一管理时使用） */
  hideToolbar?: boolean
  /** 是否使用内置预览器（宿主没有预览函数时的 fallback） */
  useBuiltinPreview?: boolean
}

/**
 * 普通模式 props
 */
export interface NormalModeContentProps extends BaseContentProps {
  previewEnabled: boolean
  /** 是否隐藏工具栏（由父组件统一管理时使用） */
  hideToolbar?: boolean
}

/**
 * DrawerContent 总入口 props
 */
export interface DrawerContentProps {
  /** 当前模式 */
  isDiffMode: boolean
  isInRecordingMode: boolean
  previewEnabled: boolean
  /** 预览关闭过渡状态 */
  isClosingPreview: boolean
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
