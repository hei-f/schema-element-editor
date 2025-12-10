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
