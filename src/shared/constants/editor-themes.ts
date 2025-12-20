import type { EditorTheme } from '@/shared/types'

/**
 * 编辑器主题常量
 */
export const EDITOR_THEMES = {
  SEE_DARK: 'seeDark' as EditorTheme,
  DARK: 'dark' as EditorTheme,
  LIGHT: 'light' as EditorTheme,
} as const

/**
 * 默认编辑器主题
 */
export const DEFAULT_EDITOR_THEME: EditorTheme = EDITOR_THEMES.SEE_DARK

/**
 * 编辑器主题定义接口
 */
export interface EditorThemeOption {
  value: EditorTheme
  label: string
  category: 'light' | 'dark'
}

/**
 * 可用的编辑器主题列表
 */
export const EDITOR_THEME_OPTIONS: readonly EditorThemeOption[] = [
  { value: EDITOR_THEMES.SEE_DARK, label: 'SEE Dark', category: 'dark' },
  { value: EDITOR_THEMES.LIGHT, label: 'Light', category: 'light' },
  { value: EDITOR_THEMES.DARK, label: 'Dark', category: 'dark' },
] as const
