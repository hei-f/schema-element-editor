import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { bracketMatching, foldGutter, foldKeymap, indentOnInput } from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { EditorState, StateEffect, StateField } from '@codemirror/state'
import type { DecorationSet, ViewUpdate } from '@codemirror/view'
import { Decoration, EditorView, keymap, lineNumbers, WidgetType } from '@codemirror/view'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { schemaEditorDark, schemaEditorDarkHighlighting } from '../styles/schema-editor-dark-theme'
import { DiffEditorWrapper } from '../styles/recording.styles'

/** 占位行 Widget */
class PlaceholderWidget extends WidgetType {
  constructor(private isDark: boolean) {
    super()
  }

  toDOM(): HTMLElement {
    const div = document.createElement('div')
    div.className = 'cm-diff-placeholder'
    div.style.height = '19.2px'
    // 深色主题：稍微显眼的灰色斜条纹
    // 浅色主题：使用 #E0E0E0 略深一点的灰色
    div.style.background = this.isDark
      ? 'repeating-linear-gradient(-45deg, #404550, #404550 4px, #363b44 4px, #363b44 8px)'
      : 'repeating-linear-gradient(-45deg, #E0E0E0, #E0E0E0 4px, #ECECEC 4px, #ECECEC 8px)'
    div.style.borderBottom = this.isDark ? '1px solid #4a5058' : '1px solid #D0D0D0'
    div.style.boxSizing = 'border-box'
    return div
  }

  eq(other: PlaceholderWidget): boolean {
    return this.isDark === other.isDark
  }

  get estimatedHeight(): number {
    return 19.2
  }
}

/** 行背景类型 */
type LineBackgroundType = 'added' | 'removed' | 'modified' | 'unchanged'

/** 行内差异片段 */
export interface InlineDiffSegment {
  /** 起始位置（相对于行首） */
  from: number
  /** 结束位置（相对于行首） */
  to: number
  /** 类型：新增或删除 */
  type: 'added' | 'removed'
}

/** Diff 行信息 */
export interface DiffLineInfo {
  /** 在编辑器中的实际行号（0-indexed） */
  editorLine: number
  /** 背景类型 */
  type: LineBackgroundType
  /** 是否是占位行（应该插入 widget） */
  isPlaceholder: boolean
  /** 行内差异片段（用于字符级高亮） */
  inlineDiffs?: InlineDiffSegment[]
}

/** 设置 diff 装饰的 Effect */
const setDiffDecorations = StateEffect.define<{
  lines: DiffLineInfo[]
  isDark: boolean
}>()

/** 行背景装饰样式 */
const lineBackgroundTheme = EditorView.baseTheme({
  '&': {
    height: '100%',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '.cm-line-added': {
    backgroundColor: 'rgba(152, 195, 121, 0.15) !important',
  },
  '.cm-line-removed': {
    backgroundColor: 'rgba(224, 108, 117, 0.15) !important',
  },
  '.cm-line-modified': {
    backgroundColor: 'rgba(229, 192, 123, 0.15) !important',
  },
  '.cm-diff-placeholder': {
    display: 'block',
  },
  /* 行内差异高亮 - 更显眼的颜色 */
  '.cm-inline-added': {
    backgroundColor: 'rgba(80, 200, 100, 0.5)',
    borderRadius: '3px',
    padding: '1px 2px',
    border: '1px solid rgba(80, 200, 100, 0.6)',
    margin: '0 1px',
  },
  '.cm-inline-removed': {
    backgroundColor: 'rgba(240, 80, 80, 0.5)',
    borderRadius: '3px',
    padding: '1px 2px',
    border: '1px solid rgba(240, 80, 80, 0.6)',
    margin: '0 1px',
    textDecoration: 'line-through',
  },
})

/** Diff 装饰 StateField */
const diffDecorationsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorations, tr) {
    // 处理设置装饰的 effect
    for (const effect of tr.effects) {
      if (effect.is(setDiffDecorations)) {
        const { lines, isDark } = effect.value
        const builder: any[] = []

        for (const line of lines) {
          if (line.editorLine < 0 || line.editorLine >= tr.state.doc.lines) {
            continue
          }

          const docLine = tr.state.doc.line(line.editorLine + 1)
          const lineStart = docLine.from

          if (line.isPlaceholder) {
            // 插入占位行 widget
            builder.push(
              Decoration.widget({
                widget: new PlaceholderWidget(isDark),
                block: true,
                side: -1, // 在行之前
              }).range(lineStart)
            )
          } else {
            // 添加行背景
            const className = `cm-line-${line.type}`
            builder.push(
              Decoration.line({
                class: className,
              }).range(lineStart)
            )

            // 添加行内差异高亮
            if (line.inlineDiffs && line.inlineDiffs.length > 0) {
              for (const diff of line.inlineDiffs) {
                const from = lineStart + diff.from
                const to = lineStart + diff.to
                // 确保不超出行范围
                if (from >= lineStart && to <= docLine.to) {
                  builder.push(
                    Decoration.mark({
                      class: `cm-inline-${diff.type}`,
                    }).range(from, to)
                  )
                }
              }
            }
          }
        }

        // 按位置排序
        builder.sort((a, b) => a.from - b.from)

        return Decoration.set(builder)
      }
    }

    // 文档变化时，映射装饰位置
    if (tr.docChanged) {
      return decorations.map(tr.changes)
    }

    return decorations
  },
  provide: (f) => EditorView.decorations.from(f),
})

interface DiffEditorProps {
  /** 初始内容 */
  defaultValue: string
  /** 内容变化回调 */
  onChange?: (value: string) => void
  /** 水平滚动回调 */
  onHorizontalScroll?: (scrollLeft: number) => void
  /** 是否深色主题 */
  isDark?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** diff 行信息 */
  diffLines?: DiffLineInfo[]
}

export interface DiffEditorHandle {
  /** 获取当前内容 */
  getValue: () => string
  /** 设置内容 */
  setValue: (value: string) => void
  /** 更新 diff 装饰 */
  updateDecorations: (lines: DiffLineInfo[]) => void
  /** 设置水平滚动位置 */
  setScrollLeft: (scrollLeft: number) => void
}

/**
 * Diff 编辑器组件
 * 基于 CodeMirror，支持占位行装饰和行背景高亮
 */
export const DiffEditor = forwardRef<DiffEditorHandle, DiffEditorProps>((props, ref) => {
  const {
    defaultValue,
    onChange,
    onHorizontalScroll,
    isDark = true,
    readOnly = false,
    diffLines = [],
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const onHorizontalScrollRef = useRef(onHorizontalScroll)
  const isSyncingScrollRef = useRef(false)

  // 更新回调引用
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    onHorizontalScrollRef.current = onHorizontalScroll
  }, [onHorizontalScroll])

  // 暴露 API
  useImperativeHandle(
    ref,
    () => ({
      getValue: () => viewRef.current?.state.doc.toString() || '',
      setValue: (value: string) => {
        if (!viewRef.current) return
        const view = viewRef.current
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: value,
          },
        })
      },
      updateDecorations: (lines: DiffLineInfo[]) => {
        if (!viewRef.current) return
        viewRef.current.dispatch({
          effects: setDiffDecorations.of({ lines, isDark }),
        })
      },
      setScrollLeft: (scrollLeft: number) => {
        if (!viewRef.current) return
        isSyncingScrollRef.current = true
        viewRef.current.scrollDOM.scrollLeft = scrollLeft
        setTimeout(() => {
          isSyncingScrollRef.current = false
        }, 50)
      },
    }),
    [isDark]
  )

  // 创建编辑器
  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: defaultValue,
      extensions: [
        // 基础功能
        lineNumbers(),
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        highlightSelectionMatches(),

        // JSON 支持
        json(),

        // 代码折叠
        foldGutter({
          openText: '▼',
          closedText: '▶',
        }),

        // 自动补全
        autocompletion(),

        // 主题
        schemaEditorDark,
        schemaEditorDarkHighlighting,

        // Diff 装饰
        diffDecorationsField,
        lineBackgroundTheme,

        // 禁用换行，使用水平滚动
        // EditorView.lineWrapping,  // 不启用换行

        // 只读控制
        EditorView.editable.of(!readOnly),
        EditorState.readOnly.of(readOnly),

        // 键盘映射
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...closeBracketsKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),

        // 变化监听
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged) {
            onChangeRef.current?.(update.state.doc.toString())
          }
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    // 初始化装饰
    if (diffLines.length > 0) {
      view.dispatch({
        effects: setDiffDecorations.of({ lines: diffLines, isDark }),
      })
    }

    // 添加水平滚动监听
    const handleScroll = () => {
      if (isSyncingScrollRef.current) return
      const scrollLeft = view.scrollDOM.scrollLeft
      onHorizontalScrollRef.current?.(scrollLeft)
    }
    view.scrollDOM.addEventListener('scroll', handleScroll)

    return () => {
      view.scrollDOM.removeEventListener('scroll', handleScroll)
      view.destroy()
      viewRef.current = null
    }
  }, [isDark, readOnly]) // defaultValue 仅用于初始化

  // 更新 diff 装饰
  useEffect(() => {
    if (!viewRef.current || diffLines.length === 0) return

    viewRef.current.dispatch({
      effects: setDiffDecorations.of({ lines: diffLines, isDark }),
    })
  }, [diffLines, isDark])

  return <DiffEditorWrapper ref={containerRef} />
})

DiffEditor.displayName = 'DiffEditor'
