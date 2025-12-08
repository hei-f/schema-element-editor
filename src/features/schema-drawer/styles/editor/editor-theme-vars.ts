import { EDITOR_THEMES } from '@/shared/constants/editor-themes'
import type { EditorTheme } from '@/shared/types'

/**
 * 编辑器主题样式变量接口
 * 用于 styled-components 的 ThemeProvider
 */
export interface EditorThemeVars {
  /** 是否为深色主题 */
  isDark: boolean

  /** 工具栏背景 */
  toolbarBackground: string
  /** 工具栏边框 */
  toolbarBorder: string

  /** 面板背景 */
  panelBackground: string
  /** 面板边框 */
  panelBorder: string

  /** 头部背景 */
  headerBackground: string
  /** 头部文字颜色 */
  headerTextColor: string

  /** 主要文字颜色 */
  textPrimary: string
  /** 次要文字颜色 */
  textSecondary: string
  /** 三级文字颜色 */
  textTertiary: string

  /** 滚动条轨道背景 */
  scrollbarTrack: string
  /** 滚动条滑块背景 */
  scrollbarThumb: string
  /** 滚动条滑块悬停背景 */
  scrollbarThumbHover: string

  /** 列表项悬停背景 */
  listItemHoverBackground: string
  /** 列表项激活背景 */
  listItemActiveBackground: string
  /** 列表项激活边框 */
  listItemActiveBorder: string

  /** Diff 添加行背景色 */
  diffAddedBackground: string
  /** Diff 删除行背景色 */
  diffRemovedBackground: string
  /** Diff 修改行背景色 */
  diffModifiedBackground: string

  /** Diff 行内添加高亮 */
  diffInlineAddedBackground: string
  /** Diff 行内添加边框 */
  diffInlineAddedBorder: string
  /** Diff 行内删除高亮 */
  diffInlineRemovedBackground: string
  /** Diff 行内删除边框 */
  diffInlineRemovedBorder: string

  /** 占位行背景渐变色1 */
  placeholderStripe1: string
  /** 占位行背景渐变色2 */
  placeholderStripe2: string
  /** 占位行边框 */
  placeholderBorder: string
}

/**
 * 深色主题变量
 * 采用柔和的深灰色调，介于深色和中灰之间
 */
const darkThemeVars: EditorThemeVars = {
  isDark: true,

  // 工具栏：柔和的深灰色
  toolbarBackground: '#3a3d41',
  toolbarBorder: '#4a4d52',

  // 面板：略深一点形成层次
  panelBackground: '#2d3035',
  panelBorder: '#4a4d52',

  // 头部：与工具栏协调
  headerBackground: '#343840',
  headerTextColor: '#d4d4d4',

  textPrimary: '#e8e8e8',
  textSecondary: '#a0a4a8',
  textTertiary: '#787c80',

  scrollbarTrack: '#2d3035',
  scrollbarThumb: '#5a5e64',
  scrollbarThumbHover: '#6a6e74',

  listItemHoverBackground: 'rgba(255, 255, 255, 0.06)',
  listItemActiveBackground: 'rgba(55, 148, 255, 0.18)',
  listItemActiveBorder: 'rgba(55, 148, 255, 0.45)',

  diffAddedBackground: 'rgba(152, 195, 121, 0.15)',
  diffRemovedBackground: 'rgba(224, 108, 117, 0.15)',
  diffModifiedBackground: 'rgba(229, 192, 123, 0.15)',

  diffInlineAddedBackground: 'rgba(80, 200, 100, 0.5)',
  diffInlineAddedBorder: 'rgba(80, 200, 100, 0.6)',
  diffInlineRemovedBackground: 'rgba(240, 80, 80, 0.5)',
  diffInlineRemovedBorder: 'rgba(240, 80, 80, 0.6)',

  placeholderStripe1: '#484c52',
  placeholderStripe2: '#3a3e44',
  placeholderBorder: '#5a5e64',
}

/**
 * 浅色主题变量
 */
const lightThemeVars: EditorThemeVars = {
  isDark: false,

  toolbarBackground: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  toolbarBorder: '#dee2e6',

  panelBackground: '#f8f9fa',
  panelBorder: '#dee2e6',

  headerBackground: '#e9ecef',
  headerTextColor: '#495057',

  textPrimary: '#212529',
  textSecondary: '#6c757d',
  textTertiary: '#adb5bd',

  scrollbarTrack: '#f1f3f4',
  scrollbarThumb: '#c1c8ce',
  scrollbarThumbHover: '#a8b0b8',

  listItemHoverBackground: 'rgba(0, 0, 0, 0.04)',
  listItemActiveBackground: 'rgba(24, 144, 255, 0.1)',
  listItemActiveBorder: 'rgba(24, 144, 255, 0.3)',

  // 浅色主题下透明度稍高，确保对比度足够
  diffAddedBackground: 'rgba(152, 195, 121, 0.25)',
  diffRemovedBackground: 'rgba(224, 108, 117, 0.25)',
  diffModifiedBackground: 'rgba(229, 192, 123, 0.25)',

  diffInlineAddedBackground: 'rgba(80, 200, 100, 0.4)',
  diffInlineAddedBorder: 'rgba(80, 200, 100, 0.5)',
  diffInlineRemovedBackground: 'rgba(240, 80, 80, 0.4)',
  diffInlineRemovedBorder: 'rgba(240, 80, 80, 0.5)',

  placeholderStripe1: '#E0E0E0',
  placeholderStripe2: '#ECECEC',
  placeholderBorder: '#D0D0D0',
}

/**
 * 根据编辑器主题获取对应的样式变量
 * seeDark 和 dark 使用深色样式
 * light 使用浅色样式
 */
export function getEditorThemeVars(theme: EditorTheme): EditorThemeVars {
  switch (theme) {
    case EDITOR_THEMES.LIGHT:
      return lightThemeVars
    case EDITOR_THEMES.DARK:
    case EDITOR_THEMES.SEE_DARK:
    case EDITOR_THEMES.SCHEMA_EDITOR_DARK: // 兼容旧配置
    default:
      return darkThemeVars
  }
}

/**
 * 判断主题是否为深色
 */
export function isEditorThemeDark(theme: EditorTheme): boolean {
  return theme !== EDITOR_THEMES.LIGHT
}
