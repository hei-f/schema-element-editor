import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import {
  cursorMatchingBracket,
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import { linter, lintGutter } from '@codemirror/lint'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorSelection, EditorState } from '@codemirror/state'
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder,
} from '@codemirror/view'
import type { EditorTheme } from '@/shared/types'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  EditorWrapper,
  jsonDarkHighlight,
  jsonLightHighlight,
  SelectionStats,
} from '../styles/codemirror.styles'
import { schemaEditorDark, schemaEditorDarkHighlighting } from '../styles/schema-editor-dark-theme'
import { simpleDark } from '../styles/simple-dark-theme'
import { createAstCompletionSource } from '../utils/ast-completion'

interface CodeMirrorEditorProps {
  /** 初始值 */
  defaultValue: string
  /** 内容变化回调 */
  onChange?: (value: string) => void
  height?: string
  theme?: EditorTheme
  readOnly?: boolean
  placeholder?: string
  /** 是否启用 AST 类型提示 */
  enableAstHints?: boolean
  /** 判断当前内容是否为 AST 类型 */
  isAstContent?: () => boolean
}

/**
 * 暴露给父组件的命令式 API
 */
export interface CodeMirrorEditorHandle {
  /** 获取当前值 */
  getValue: () => string
  /** 设置新值（用于外部更新：加载草稿、应用收藏等） */
  setValue: (value: string) => void
  /** 聚焦编辑器 */
  focus: () => void
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
  },
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
          view.dispatch(
            state.update({
              selection: EditorSelection.create([EditorSelection.range(word.from, word.to)]),
            })
          )
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
          view.dispatch(
            state.update({
              selection: EditorSelection.create(
                [...selection.ranges, EditorSelection.range(from, to)],
                selection.ranges.length
              ),
            })
          )
          return true
        }
      }
      return false
    },
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
          view.dispatch(
            state.update({
              selection: EditorSelection.create(ranges, 0),
            })
          )
          return true
        }
      }
      return false
    },
  },
  // Alt/Option + Click 在 EditorView 的 mousedown 事件中处理
]

/**
 * CodeMirror 6 编辑器组件
 * 使用 forwardRef + useImperativeHandle 暴露命令式 API
 * 避免使用 useEffect 监听 value 导致的循环问题
 */
export const CodeMirrorEditor = forwardRef<CodeMirrorEditorHandle, CodeMirrorEditorProps>(
  (
    {
      defaultValue,
      onChange,
      height = '100%',
      theme = 'light',
      readOnly = false,
      placeholder: placeholderText = '',
      enableAstHints = false,
      isAstContent = () => false,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)
    const onChangeRef = useRef(onChange)
    const enableAstHintsRef = useRef(enableAstHints)
    const isAstContentRef = useRef(isAstContent)

    // 选中文本统计状态
    const [selectionStats, setSelectionStats] = useState({
      lines: 0,
      chars: 0,
      selected: false,
    })

    // 更新 refs
    useEffect(() => {
      onChangeRef.current = onChange
    }, [onChange])

    useEffect(() => {
      enableAstHintsRef.current = enableAstHints
    }, [enableAstHints])

    useEffect(() => {
      isAstContentRef.current = isAstContent
    }, [isAstContent])

    // 暴露命令式 API
    useImperativeHandle(
      ref,
      () => ({
        getValue: () => {
          return viewRef.current?.state.doc.toString() || ''
        },
        setValue: (value: string) => {
          if (!viewRef.current) return
          const view = viewRef.current

          // 替换整个文档内容，并将光标移到开头
          view.dispatch({
            changes: {
              from: 0,
              to: view.state.doc.length,
              insert: value,
            },
            // 将光标重置到文档开头，避免 RangeError
            selection: EditorSelection.cursor(0),
          })
        },
        focus: () => {
          viewRef.current?.focus()
        },
      }),
      []
    )

    useEffect(() => {
      if (!editorRef.current) return

      // 根据主题选择语法高亮和基础主题
      const getThemeExtensions = () => {
        switch (theme) {
          case 'dark':
            return [simpleDark, syntaxHighlighting(jsonDarkHighlight)]
          case 'schemaEditorDark':
            return [schemaEditorDark, schemaEditorDarkHighlighting]
          case 'light':
          default:
            return [syntaxHighlighting(jsonLightHighlight)]
        }
      }

      // 创建编辑器状态
      const state = EditorState.create({
        doc: defaultValue,
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
          // 主题和语法高亮
          ...getThemeExtensions(),
          // 代码折叠
          foldGutter({
            openText: '▼',
            closedText: '▶',
          }),
          // 历史记录增强
          history(),
          // 缩进和括号
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          // AST 类型补全（智能补全）
          // 使用 override 提供自定义补全，但当条件不满足时返回 null 让默认补全生效
          autocompletion({
            override: [
              createAstCompletionSource(
                () => enableAstHintsRef.current,
                () => isAstContentRef.current()
              ),
            ],
            activateOnTyping: true,
            closeOnBlur: true,
            maxRenderedOptions: 20,
            // 设置更低的延迟以提高响应速度
            interactionDelay: 50,
            // 更快地显示补全
            updateSyncTime: 50,
          }),
          // 搜索和选择高亮
          highlightSelectionMatches(),
          // 缩进引导线
          indentationGuides,
          // 占位符
          placeholderText ? placeholder(placeholderText) : [],
          // 键盘快捷键
          keymap.of([
            // 自定义补全快捷键（解决系统快捷键冲突）
            {
              key: 'Ctrl-.',
              mac: 'Cmd-.',
              run: (view: EditorView) => {
                // 手动触发补全
                import('@codemirror/autocomplete').then(({ startCompletion }) => {
                  startCompletion(view)
                })
                return true
              },
            },
            // 备用快捷键
            {
              key: 'Alt-/',
              run: (view: EditorView) => {
                import('@codemirror/autocomplete').then(({ startCompletion }) => {
                  startCompletion(view)
                })
                return true
              },
            },
            ...defaultKeymap,
            ...historyKeymap, // 增强的历史记录快捷键
            ...foldKeymap,
            ...closeBracketsKeymap,
            ...searchKeymap,
            ...multiCursorKeymap, // 多光标编辑
            indentWithTab,
            // 添加括号跳转快捷键
            {
              key: 'Mod-Shift-\\',
              run: cursorMatchingBracket,
            },
          ]),
          // 行换行
          EditorView.lineWrapping,
          // 只读模式
          EditorView.editable.of(!readOnly),
          EditorState.readOnly.of(readOnly),
          // 变化监听
          EditorView.updateListener.of((update: any) => {
            if (update.docChanged) {
              const newValue = update.state.doc.toString()
              // 直接调用回调，不需要标记
              onChangeRef.current?.(newValue)
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
                  selected: true,
                })
              } else {
                setSelectionStats({
                  lines: 0,
                  chars: 0,
                  selected: false,
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
                  view.dispatch(
                    state.update({
                      selection: EditorSelection.create(
                        [...selection.ranges, EditorSelection.cursor(pos)],
                        selection.ranges.length
                      ),
                    })
                  )
                  return true
                }
              }
              return false
            },
          }),
        ],
      })

      // 创建编辑器视图
      const view = new EditorView({
        state,
        parent: editorRef.current,
      })

      viewRef.current = view

      // 清理函数
      return () => {
        view.destroy()
        viewRef.current = null
      }
    }, [theme, readOnly, placeholderText]) // 移除 defaultValue，只在初始挂载时使用

    // 不再需要监听 value 的 useEffect！

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

    // 判断是否为深色主题
    const isDarkTheme = theme !== 'light'

    return (
      <>
        <EditorWrapper ref={editorRef} $height={height} $isDark={isDarkTheme} />
        {selectionStats.selected && (
          <SelectionStats className={isDarkTheme ? 'dark' : ''}>
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
)

CodeMirrorEditor.displayName = 'CodeMirrorEditor'
