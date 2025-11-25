import type { EditorTheme } from '@/shared/types'

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
  { value: 'schemaEditorDark', label: 'Schema Editor Dark', category: 'dark' },
  { value: 'light', label: 'Light', category: 'light' },
  { value: 'dark', label: 'Dark', category: 'dark' }
] as const

/**
 * 根据主题值获取主题选项
 */
export function getThemeOption(theme: EditorTheme): EditorThemeOption | undefined {
  return EDITOR_THEME_OPTIONS.find(option => option.value === theme)
}
