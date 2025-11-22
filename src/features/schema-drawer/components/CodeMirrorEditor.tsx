import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { cursorMatchingBracket, defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting } from '@codemirror/language'
import { linter, lintGutter } from '@codemirror/lint'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorSelection, EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, highlightActiveLine, highlightActiveLineGutter, hoverTooltip, keymap, lineNumbers, placeholder, tooltips } from '@codemirror/view'
import React, { useEffect, useRef, useState } from 'react'
import {
  EditorWrapper,
  jsonDarkHighlight,
  jsonLightHighlight,
  SelectionStats
} from '../styles/codemirror.styles'

interface CodeMirrorEditorProps {
  value: string
  onChange?: (value: string) => void
  height?: string
  theme?: 'light' | 'dark'
  readOnly?: boolean
  placeholder?: string
}

/**
 * 缩进引导线扩展
 * 在编辑器中显示垂直的缩进引导线
 */
const indentationGuides = EditorView.baseTheme({
  '.cm-indent-guide': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '1px',
    backgroundColor: '#ddd',
    pointerEvents: 'none',
  },
  '.dark .cm-indent-guide': {
    backgroundColor: '#444',
  }
})

/**
 * JSON Hover Tooltip
 * 鼠标悬停时显示 JSON 节点信息
 */
const jsonHoverTooltip = hoverTooltip((view, pos) => {
  const { state } = view
  
  // 获取当前位置的文本
  const line = state.doc.lineAt(pos)
  const textBefore = state.doc.sliceString(line.from, pos)
  const textAfter = state.doc.sliceString(pos, line.to)
  
  // 简单的值类型检测
  let tooltipText = ''
  
  // 检测数字
  const numberMatch = (textBefore + textAfter).match(/(-?\d+\.?\d*)/)
  if (numberMatch) {
    tooltipText = `数字: ${numberMatch[1]}`
  }
  
  // 检测字符串
  const stringMatch = textAfter.match(/^[^"]*"([^"]*)"/)
  if (stringMatch) {
    const str = stringMatch[1]
    tooltipText = `字符串 (${str.length} 字符)`
  }
  
  // 检测布尔值
  if (/\btrue\b/.test(textBefore + textAfter)) {
    tooltipText = '布尔值: true'
  } else if (/\bfalse\b/.test(textBefore + textAfter)) {
    tooltipText = '布尔值: false'
  }
  
  // 检测 null
  if (/\bnull\b/.test(textBefore + textAfter)) {
    tooltipText = '空值: null'
  }
  
  if (!tooltipText) return null
  
  return {
    pos,
    above: true,
    create() {
      const dom = document.createElement('div')
      dom.className = 'cm-tooltip-hover'
      dom.textContent = tooltipText
      return { dom }
    }
  }
})

/**
 * 多光标编辑键绑定
 */
const multiCursorKeymap = [
  // Ctrl/Cmd + D: 选择下一个相同文本
  {
    key: 'Mod-d',
    run: (view: EditorView) => {
      const { state } = view
      const { selection } = state
      const primary = selection.main
      
      if (primary.empty) {
        // 如果没有选中,选中当前单词
        const word = state.wordAt(primary.head)
        if (word) {
          view.dispatch(state.update({
            selection: EditorSelection.create([EditorSelection.range(word.from, word.to)])
          }))
          return true
        }
      } else {
        // 如果已选中,查找下一个相同文本
        const selectedText = state.sliceDoc(primary.from, primary.to)
        const searchFrom = primary.to
        const rest = state.sliceDoc(searchFrom)
        const nextIndex = rest.indexOf(selectedText)
        
        if (nextIndex >= 0) {
          const from = searchFrom + nextIndex
          const to = from + selectedText.length
          view.dispatch(state.update({
            selection: EditorSelection.create([
              ...selection.ranges,
              EditorSelection.range(from, to)
            ], selection.ranges.length)
          }))
          return true
        }
      }
      return false
    }
  },
  // Ctrl/Cmd + Shift + L: 选择所有相同文本
  {
    key: 'Mod-Shift-l',
    run: (view: EditorView) => {
      const { state } = view
      const { selection } = state
      const primary = selection.main
      
      if (!primary.empty) {
        const selectedText = state.sliceDoc(primary.from, primary.to)
        const ranges = []
        const text = state.doc.toString()
        let index = 0
        
        while ((index = text.indexOf(selectedText, index)) >= 0) {
          ranges.push(EditorSelection.range(index, index + selectedText.length))
          index += selectedText.length
        }
        
        if (ranges.length > 0) {
          view.dispatch(state.update({
            selection: EditorSelection.create(ranges, 0)
          }))
          return true
        }
      }
      return false
    }
  },
  // Alt/Option + Click 在 EditorView 的 mousedown 事件中处理
]

/**
 * CodeMirror 6 编辑器组件
 * 专门为Shadow DOM优化,支持代码折叠
 */
export const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  value,
  onChange,
  height = '100%',
  theme = 'light',
  readOnly = false,
  placeholder: placeholderText = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  
  // 选中文本统计状态
  const [selectionStats, setSelectionStats] = useState({
    lines: 0,
    chars: 0,
    selected: false
  })

  useEffect(() => {
    if (!editorRef.current) return

    // 创建编辑器状态
    const state = EditorState.create({
      doc: value,
      extensions: [
        // 基础设置
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        // JSON语言支持
        json(),
        // JSON Linting（实时错误检查）
        linter(jsonParseLinter()),
        lintGutter(),
        // 自定义语法高亮
        syntaxHighlighting(theme === 'dark' ? jsonDarkHighlight : jsonLightHighlight),
        // 代码折叠
        foldGutter({
          openText: '▼',
          closedText: '▶'
        }),
        // 历史记录增强
        history(),
        // 缩进和括号
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        // 搜索和选择高亮
        highlightSelectionMatches(),
        // 缩进引导线
        indentationGuides,
        // Tooltip 悬停提示
        jsonHoverTooltip,
        tooltips({ position: 'absolute' }),
        // 占位符
        placeholderText ? placeholder(placeholderText) : [],
        // 键盘快捷键
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,  // 增强的历史记录快捷键
          ...foldKeymap,
          ...closeBracketsKeymap,
          ...searchKeymap,
          ...multiCursorKeymap,  // 多光标编辑
          indentWithTab,
          // 添加括号跳转快捷键
          {
            key: 'Mod-Shift-\\',
            run: cursorMatchingBracket
          }
        ]),
        // 行换行
        EditorView.lineWrapping,
        // 只读模式
        EditorView.editable.of(!readOnly),
        EditorState.readOnly.of(readOnly),
        // 主题
        ...(theme === 'dark' ? [oneDark] : []),
        // 变化监听
        EditorView.updateListener.of((update: any) => {
          if (update.docChanged && onChange) {
            const newValue = update.state.doc.toString()
            onChange(newValue)
          }
          
          // 更新选中文本统计
          if (update.selectionSet) {
            const { selection } = update.state
            const primary = selection.main
            
            if (!primary.empty) {
              const selectedText = update.state.sliceDoc(primary.from, primary.to)
              const lines = selectedText.split('\n').length
              setSelectionStats({
                lines,
                chars: selectedText.length,
                selected: true
              })
            } else {
              setSelectionStats({
                lines: 0,
                chars: 0,
                selected: false
              })
            }
          }
        }),
        // Alt + Click 多光标支持
        EditorView.domEventHandlers({
          mousedown: (event, view) => {
            if (event.altKey || event.metaKey) {
              event.preventDefault()
              const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
              if (pos !== null) {
                const { state } = view
                const { selection } = state
                view.dispatch(state.update({
                  selection: EditorSelection.create([
                    ...selection.ranges,
                    EditorSelection.cursor(pos)
                  ], selection.ranges.length)
                }))
                return true
              }
            }
            return false
          }
        })
      ]
    })

    // 创建编辑器视图
    const view = new EditorView({
      state,
      parent: editorRef.current
    })

    viewRef.current = view

    // 清理函数
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [theme, readOnly, placeholderText]) // 主题、只读状态或占位符变化时重新创建

  // 处理外部value变化
  useEffect(() => {
    if (!viewRef.current) return
    
    const currentValue = viewRef.current.state.doc.toString()
    if (value !== currentValue) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value
        }
      })
    }
  }, [value])

  // 处理主题变化
  useEffect(() => {
    if (!viewRef.current) return
    
    // 主题切换通过重新创建编辑器实现（在上面的 useEffect 中）
  }, [theme])

  // 处理只读状态变化
  useEffect(() => {
    if (!viewRef.current) return
    
    // 只读状态切换通过重新创建编辑器实现（在上面的 useEffect 中）
  }, [readOnly])

  return (
    <>
      <EditorWrapper ref={editorRef} $height={height} />
      {selectionStats.selected && (
        <SelectionStats className={theme === 'dark' ? 'dark' : ''}>
          <div className="stat-item">
            <span className="label">选中:</span>
            <span className="value">{selectionStats.chars} 字符</span>
          </div>
          <div className="stat-item">
            <span className="label">行数:</span>
            <span className="value">{selectionStats.lines} 行</span>
          </div>
        </SelectionStats>
      )}
    </>
  )
}

