import { EditorView } from '@codemirror/view'

/**
 * 简单的深色主题
 * 提供基础的深色背景和文本颜色
 */
export const simpleDark = EditorView.theme({
  '&': {
    color: '#d4d4d4',
    backgroundColor: '#1e1e1e'
  },
  
  '.cm-content': {
    caretColor: '#aeafad'
  },
  
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#aeafad'
  },
  
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#264f78'
  },
  
  '.cm-activeLine': {
    backgroundColor: '#282828'
  },
  
  '.cm-activeLineGutter': {
    backgroundColor: '#282828'
  },
  
  '.cm-gutters': {
    backgroundColor: '#1e1e1e',
    color: '#858585',
    borderRight: '1px solid #2d2d2d'
  },
  
  '.cm-lineNumbers .cm-gutterElement': {
    minWidth: '3ch'
  },
  
  '.cm-foldPlaceholder': {
    backgroundColor: '#2d2d2d',
    border: '1px solid #3c3c3c',
    color: '#999',
    borderRadius: '3px',
    padding: '0 6px'
  },
  
  '.cm-matchingBracket': {
    backgroundColor: '#264f7880',
    outline: '1px solid #569cd6'
  },
  
  '.cm-nonmatchingBracket': {
    backgroundColor: '#f4858580',
    outline: '1px solid #f48585'
  },
  
  '.cm-tooltip': {
    backgroundColor: '#252526',
    border: '1px solid #454545',
    borderRadius: '4px',
    color: '#cccccc'
  },
  
  '.cm-tooltip.cm-tooltip-hover': {
    backgroundColor: '#1e1e1e',
    border: '1px solid #454545'
  },
  
  '.cm-lintRange-error': {
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'6\' height=\'3\'%3E%3Cpath d=\'m0 3 l3 -3 l3 3\' stroke=\'%23f48771\' fill=\'none\' stroke-width=\'1\'/%3E%3C/svg%3E")'
  },
  
  '.cm-lintRange-warning': {
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'6\' height=\'3\'%3E%3Cpath d=\'m0 3 l3 -3 l3 3\' stroke=\'%23cca700\' fill=\'none\' stroke-width=\'1\'/%3E%3C/svg%3E")'
  },
  
  '.cm-lint-marker-error': {
    color: '#f48771'
  },
  
  '.cm-lint-marker-warning': {
    color: '#cca700'
  },
  
  '.cm-placeholder': {
    color: '#666'
  },
  
  '.cm-indent-guide': {
    backgroundColor: '#2d2d2d'
  },
  
  // 补全面板样式
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#252526',
    border: '1px solid #454545'
  },
  
  '.cm-tooltip-autocomplete ul li': {
    color: '#cccccc'
  },
  
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: '#094771',
    color: '#ffffff'
  },
  
  '.cm-tooltip-autocomplete ul li[aria-selected] .cm-completionLabel': {
    color: '#ffffff'
  },
  
  '.cm-tooltip-autocomplete ul li[aria-selected] .cm-completionDetail': {
    color: 'rgba(255, 255, 255, 0.8)'
  },
  
  '.cm-completionLabel': {
    color: '#cccccc'
  },
  
  '.cm-completionDetail': {
    color: '#999999'
  },
  
  '.cm-completionInfo': {
    backgroundColor: '#1e1e1e',
    border: '1px solid #454545',
    color: '#cccccc'
  }
}, { dark: true })

