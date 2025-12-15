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
import { EditorSelection, EditorState, StateField, StateEffect } from '@codemirror/state'
import {
  Decoration,
  DecorationSet,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder,
  WidgetType,
} from '@codemirror/view'
import type { EditorTheme } from '@/shared/types'
import type { Ref } from 'react'
import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  EditorWrapper,
  jsonDarkHighlight,
  jsonLightHighlight,
  SelectionStats,
} from '../../styles/editor/codemirror.styles'
import { seeDark, seeDarkHighlighting } from '../../styles/editor/schema-element-editor-dark-theme'
import { simpleDark } from '../../styles/editor/simple-dark-theme'
import { createAstCompletionSource } from '../../utils/ast-completion'

interface CodeMirrorEditorProps {
  /** 组件引用（React 19 支持直接作为 prop 传递） */
  ref?: Ref<CodeMirrorEditorHandle>
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
  /** 跳转到指定位置（行号从1开始） */
  goToPosition: (line: number, column: number) => void
  /** 显示错误提示 widget */
  showErrorWidget: (line: number, column: number, message: string) => void
  /** 隐藏错误提示 widget */
  hideErrorWidget: () => void
}

/** 错误提示 widget 的 effect */
const showErrorEffect = StateEffect.define<{ pos: number; message: string }>()
const hideErrorEffect = StateEffect.define<null>()

/** 错误提示 Widget 类 */
class ErrorTooltipWidget extends WidgetType {
  constructor(
    readonly message: string,
    readonly onClose: () => void
  ) {
    super()
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement('div')
    wrapper.className = 'cm-error-tooltip-widget'
    wrapper.style.cssText = `
      position: absolute;
      left: 0;
      margin-top: 8px;
      padding: 10px 14px;
      background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
      color: #e8e8e8;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.5;
      max-width: 450px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      border-left: 3px solid #f5222d;
      z-index: 100;
      cursor: pointer;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
    `

    // 错误标题
    const title = document.createElement('div')
    title.style.cssText = `
      color: #ff7875;
      font-weight: 500;
      margin-bottom: 6px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `
    title.textContent = '✕ JSON 语法错误'

    // 错误消息
    const content = document.createElement('div')
    content.style.cssText = `
      color: #d9d9d9;
      font-size: 12px;
    `
    content.textContent = this.message

    // 关闭提示
    const closeHint = document.createElement('div')
    closeHint.style.cssText = `
      margin-top: 8px;
      font-size: 10px;
      color: #8c8c8c;
      text-align: right;
    `
    closeHint.textContent = '点击关闭'

    wrapper.appendChild(title)
    wrapper.appendChild(content)
    wrapper.appendChild(closeHint)

    wrapper.addEventListener('click', (e) => {
      e.stopPropagation()
      this.onClose()
    })

    return wrapper
  }

  ignoreEvent(): boolean {
    return false
  }
}

/** 错误提示 StateField */
const createErrorTooltipField = (onClose: () => void) =>
  StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update(decorations, tr) {
      for (const effect of tr.effects) {
        if (effect.is(showErrorEffect)) {
          const widget = Decoration.widget({
            widget: new ErrorTooltipWidget(effect.value.message, onClose),
            side: 1,
          })
          return Decoration.set([widget.range(effect.value.pos)])
        }
        if (effect.is(hideErrorEffect)) {
          return Decoration.none
        }
      }
      // 内容变化时清除提示
      if (tr.docChanged) {
        return Decoration.none
      }
      return decorations.map(tr.changes)
    },
    provide: (field) => EditorView.decorations.from(field),
  })

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
 * React 19: ref 直接作为 prop 传递，无需 forwardRef
 * 使用 useImperativeHandle 暴露命令式 API
 */
export const CodeMirrorEditor = (props: CodeMirrorEditorProps) => {
  const {
    ref,
    defaultValue,
    onChange,
    height = '100%',
    theme = 'light',
    readOnly = false,
    placeholder: placeholderText = '',
    enableAstHints = false,
    isAstContent = () => false,
  } = props
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const enableAstHintsRef = useRef(enableAstHints)
  const isAstContentRef = useRef(isAstContent)
  /** 初始值 ref（仅用于首次创建编辑器，不触发重新创建） */
  const initialValueRef = useRef(defaultValue)
  /** 保存的内容 ref（在编辑器销毁前保存内容，用于重建时恢复） */
  const savedContentRef = useRef<string | null>(null)

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

  /** 隐藏错误提示的方法 */
  const hideErrorWidgetFn = () => {
    if (!viewRef.current) return
    viewRef.current.dispatch({
      effects: hideErrorEffect.of(null),
    })
  }

  /**
   * 在编辑器重建前保存内容
   * 当 theme/readOnly/placeholder 变化时，主 useEffect 会重新创建编辑器
   * 在重建前，这个 useEffect 的 cleanup 先执行，保存当前内容
   */
  useEffect(() => {
    return () => {
      if (viewRef.current) {
        const currentContent = viewRef.current.state.doc.toString()
        savedContentRef.current = currentContent
      }
    }
  }, [theme, readOnly, placeholderText])

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
      goToPosition: (line: number, column: number) => {
        if (!viewRef.current) return
        const view = viewRef.current
        const doc = view.state.doc

        // 确保行号在有效范围内
        const targetLine = Math.max(1, Math.min(line, doc.lines))
        const lineInfo = doc.line(targetLine)

        // 计算目标位置（确保列号不超出行长度）
        const targetColumn = Math.max(1, Math.min(column, lineInfo.length + 1))
        const pos = lineInfo.from + targetColumn - 1

        // 设置光标位置并滚动到可见区域
        view.dispatch({
          selection: EditorSelection.cursor(pos),
          scrollIntoView: true,
        })

        // 聚焦编辑器
        view.focus()
      },
      showErrorWidget: (line: number, column: number, message: string) => {
        if (!viewRef.current) return
        const view = viewRef.current
        const doc = view.state.doc

        // 确保行号在有效范围内
        const targetLine = Math.max(1, Math.min(line, doc.lines))
        const lineInfo = doc.line(targetLine)

        // 计算目标位置（在行末显示）
        const pos = lineInfo.to

        // 先跳转到错误位置
        const targetColumn = Math.max(1, Math.min(column, lineInfo.length + 1))
        const cursorPos = lineInfo.from + targetColumn - 1
        view.dispatch({
          selection: EditorSelection.cursor(cursorPos),
          scrollIntoView: true,
        })

        // 显示错误提示
        view.dispatch({
          effects: showErrorEffect.of({ pos, message }),
        })

        view.focus()
      },
      hideErrorWidget: hideErrorWidgetFn,
    }),
    []
  )

  useEffect(() => {
    if (!editorRef.current) return

    // 保存当前编辑器内容（优先使用 savedContent，然后是 viewRef，最后是初始值）
    const currentContent =
      savedContentRef.current ?? viewRef.current?.state.doc.toString() ?? initialValueRef.current

    // 根据主题选择语法高亮和基础主题
    const getThemeExtensions = () => {
      switch (theme) {
        case 'dark':
          return [simpleDark, syntaxHighlighting(jsonDarkHighlight)]
        case 'seeDark':
          return [seeDark, seeDarkHighlighting]
        case 'light':
        default:
          return [syntaxHighlighting(jsonLightHighlight)]
      }
    }

    // 创建编辑器状态
    const state = EditorState.create({
      doc: currentContent,
      extensions: [
        // 基础设置
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        // JSON语言支持
        json(),
        // JSON Linting（实时错误检查）
        linter(jsonParseLinter()),
        // 禁用 lint gutter 的 hover tooltip，使用自定义的错误提示 widget
        lintGutter({ hoverTime: Infinity }),
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
        // 错误提示 widget
        createErrorTooltipField(hideErrorWidgetFn),
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
    // 清空保存的内容，因为已经创建了新编辑器
    savedContentRef.current = null

    // 清理函数：仅负责销毁编辑器（内容保存已由专门的 useEffect 处理）
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [theme, readOnly, placeholderText])

  // 不再需要监听 value 的 useEffect！
  // 主题切换通过重新创建编辑器实现（在上面的 useEffect 中）

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
