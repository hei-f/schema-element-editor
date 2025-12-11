/**
 * 全屏模式常量 - 这些模式之间互斥
 * 用于 SchemaDrawer 组件管理 diff、preview 等全屏模式
 */
export const FULL_SCREEN_MODE = {
  NONE: 'none',
  DIFF: 'diff',
  PREVIEW: 'preview',
} as const

export type FullScreenMode = (typeof FULL_SCREEN_MODE)[keyof typeof FULL_SCREEN_MODE]

/**
 * 工具栏模式常量
 * 用于控制工具栏按钮的显示
 */
export const TOOLBAR_MODE = {
  NORMAL: 'normal',
  DIFF: 'diff',
  RECORDING: 'recording',
  PREVIEW: 'preview',
} as const

export type ToolbarMode = (typeof TOOLBAR_MODE)[keyof typeof TOOLBAR_MODE]
