import type { EditorTheme } from '@/shared/types'

/**
 * 编辑器主题常量
 */
export const EDITOR_THEMES = {
  SEE_DARK: 'seeDark' as EditorTheme,
  DARK: 'dark' as EditorTheme,
  LIGHT: 'light' as EditorTheme,
  /** @deprecated 使用 SEE_DARK 代替，保留用于兼容旧配置 */
  SCHEMA_EDITOR_DARK: 'schemaEditorDark' as EditorTheme,
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

/**
 * 根据主题值获取主题选项
 */
export function getThemeOption(theme: EditorTheme): EditorThemeOption | undefined {
  return EDITOR_THEME_OPTIONS.find((option) => option.value === theme)
}
