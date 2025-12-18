import type { EditorTheme } from '@/shared/types'

/**
 * 编辑器右键菜单配置
 */
export interface EditorContextMenuConfig {
  /** 是否启用右键菜单 */
  enabled: boolean
}

/**
 * 右键菜单操作类型
 */
export enum ContextMenuAction {
  QUICK_EDIT = 'quickEdit',
}

/**
 * 选区范围信息
 */
export interface SelectionRange {
  /** 起始位置 */
  from: number
  /** 结束位置 */
  to: number
  /** 选中的文本 */
  text: string
}

/**
 * 菜单位置
 */
export interface MenuPosition {
  x: number
  y: number
}

/**
 * 编辑器右键菜单组件属性
 */
export interface EditorContextMenuProps {
  /** 是否可见 */
  visible: boolean
  /** 菜单位置 */
  position: MenuPosition
  /** 配置 */
  config: EditorContextMenuConfig
  /** 是否有选中内容 */
  hasSelection: boolean
  /** 主题色 */
  themeColor: string
  /** 编辑器主题 */
  editorTheme: EditorTheme
  /** 选择菜单项回调 */
  onSelect: (action: ContextMenuAction) => void
  /** 关闭菜单回调 */
  onClose: () => void
}

/**
 * 快速编辑弹窗组件属性
 */
export interface QuickEditModalProps {
  /** 是否可见 */
  visible: boolean
  /** 编辑内容 */
  content: string
  /** 编辑器主题 */
  editorTheme: EditorTheme
  /** 主题色 */
  themeColor: string
  /** 保存回调 */
  onSave: (content: string) => void
  /** 关闭回调 */
  onClose: () => void
}
