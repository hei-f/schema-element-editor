import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags } from '@lezer/highlight'

/**
 * SEE Dark 主题
 * 专为 Schema Element Editor 定制的深色主题
 */
export const seeDark = EditorView.theme(
  {
    '&': {
      color: '#abb2bf',
      backgroundColor: '#282c34',
    },

    '.cm-content': {
      caretColor: '#528bff',
    },

    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#528bff',
    },

    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#404859',
    },

    '.cm-activeLine': {
      backgroundColor: '#2c313c',
    },

    '.cm-activeLineGutter': {
      backgroundColor: '#2c313c',
    },

    '.cm-gutters': {
      backgroundColor: '#282c34',
      color: '#495162',
      borderRight: '1px solid #3b4048',
    },

    '.cm-lineNumbers .cm-gutterElement': {
      minWidth: '3ch',
    },

    '.cm-lineNumbers .cm-gutterElement.cm-activeLineGutter': {
      color: '#737984',
    },

    '.cm-foldPlaceholder': {
      backgroundColor: '#3b4048',
      border: '1px solid #4b575f',
      color: '#abb2bf',
      borderRadius: '3px',
      padding: '0 6px',
    },

    // 括号匹配 - 蓝色框样式
    '.cm-matchingBracket': {
      backgroundColor: '#264f7880',
      outline: '1px solid #569cd6',
    },

    '.cm-nonmatchingBracket': {
      backgroundColor: '#f4858580',
      outline: '1px solid #f48585',
    },

    // 搜索高亮
    '.cm-searchMatch': {
      backgroundColor: '#42557b',
      outline: '1px solid #457dff',
    },

    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#42557b',
    },

    // 提示面板
    '.cm-tooltip': {
      backgroundColor: '#21252b',
      border: '1px solid #3b4048',
      borderRadius: '4px',
      color: '#abb2bf',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    },

    '.cm-tooltip.cm-tooltip-hover': {
      backgroundColor: '#21252b',
      border: '1px solid #3b4048',
    },

    // 补全面板
    '.cm-tooltip-autocomplete': {
      backgroundColor: '#21252b',
      border: '1px solid #3b4048',
    },

    '.cm-tooltip-autocomplete ul li': {
      color: '#abb2bf',
    },

    '.cm-tooltip-autocomplete ul li[aria-selected]': {
      backgroundColor: '#3E4451',
      color: '#ffffff',
    },

    '.cm-tooltip-autocomplete ul li[aria-selected] .cm-completionLabel': {
      color: '#ffffff',
    },

    '.cm-tooltip-autocomplete ul li[aria-selected] .cm-completionDetail': {
      color: 'rgba(255, 255, 255, 0.8)',
    },

    '.cm-completionLabel': {
      color: '#abb2bf',
    },

    '.cm-completionDetail': {
      color: '#5c6370',
    },

    '.cm-completionInfo': {
      backgroundColor: '#21252b',
      border: '1px solid #3b4048',
      color: '#abb2bf',
    },

    // Lint 样式
    '.cm-lintRange-error': {
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l3 -3 l3 3' stroke='%23e06c75' fill='none' stroke-width='1'/%3E%3C/svg%3E\")",
    },

    '.cm-lintRange-warning': {
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l3 -3 l3 3' stroke='%23e5c07b' fill='none' stroke-width='1'/%3E%3C/svg%3E\")",
    },

    '.cm-lint-marker-error': {
      color: '#e06c75',
    },

    '.cm-lint-marker-warning': {
      color: '#e5c07b',
    },

    '.cm-placeholder': {
      color: '#5c6370',
    },

    '.cm-indent-guide': {
      backgroundColor: '#3b4048',
    },

    '.cm-indent-guide.cm-activeIndentGuide': {
      backgroundColor: '#606368',
    },
  },
  { dark: true }
)

/**
 * SEE Dark 语法高亮
 * 专为 JSON 优化的语法高亮
 */
export const seeDarkHighlight = HighlightStyle.define([
  // JSON 属性名 - 红色
  { tag: tags.propertyName, color: '#e06c75', fontWeight: 'bold' },

  // 字符串 - 绿色
  { tag: tags.string, color: '#98c379' },

  // 数字 - 橙色
  { tag: tags.number, color: '#d19a66' },

  // 布尔值和 null - 橙色加粗
  { tag: tags.bool, color: '#d19a66', fontWeight: 'bold' },
  { tag: tags.null, color: '#d19a66', fontWeight: 'bold' },

  // 关键字 - 紫色
  { tag: tags.keyword, color: '#c678dd' },

  // 括号 - 不同类型不同颜色
  { tag: tags.squareBracket, color: '#E8BA36', fontWeight: 'bold' }, // [] 方括号 - 黄色
  { tag: tags.brace, color: '#54A857', fontWeight: 'bold' }, // {} 花括号 - 绿色
  { tag: tags.paren, color: '#359FF4', fontWeight: 'bold' }, // () 圆括号 - 蓝色
  // 分隔符 - 浅灰色
  { tag: tags.separator, color: '#abb2bf' },
  { tag: tags.punctuation, color: '#abb2bf' },

  // 注释 - 灰色斜体
  { tag: tags.comment, color: '#5c6370', fontStyle: 'italic' },
  { tag: tags.lineComment, color: '#5c6370', fontStyle: 'italic' },
  { tag: tags.blockComment, color: '#5c6370', fontStyle: 'italic' },

  // 函数 - 蓝色
  { tag: tags.function(tags.variableName), color: '#61afef' },
  { tag: tags.definition(tags.function(tags.variableName)), color: '#61afef' },

  // 类型 - 黄色
  { tag: tags.typeName, color: '#e5c07b' },
  { tag: tags.className, color: '#e5c07b' },

  // 变量 - 红色
  { tag: tags.variableName, color: '#e06c75' },

  // 本地变量 - 青绿色
  { tag: tags.local(tags.variableName), color: '#2dad7c' },

  // 常量 - 橙色
  { tag: tags.constant(tags.variableName), color: '#d19a66' },

  // 操作符 - 青色
  { tag: tags.operator, color: '#56b6c2' },

  // 转义字符 - 青色
  { tag: tags.escape, color: '#56b6c2' },

  // 正则表达式 - 青色
  { tag: tags.regexp, color: '#56b6c2' },
])

export const seeDarkHighlighting = syntaxHighlighting(seeDarkHighlight)
