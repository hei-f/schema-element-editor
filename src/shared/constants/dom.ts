/**
 * DOM 相关常量
 */

/** 扩展 UI 元素的属性名 */
export const UI_ELEMENT_ATTR = 'data-schema-element-editor-ui'

/** 扩展 UI 元素的选择器 */
export const UI_ELEMENT_SELECTOR = `[${UI_ELEMENT_ATTR}]`

/**
 * 高亮相关 CSS 类名
 */
export const HIGHLIGHT_CLASS = {
  /** 批量高亮容器 */
  ALL: 'schema-element-editor-highlight-all',
  /** 高亮标签 */
  LABEL: 'schema-element-editor-highlight-label',
  /** 悬停高亮框 */
  HOVER: 'schema-element-editor-highlight-hover',
} as const
