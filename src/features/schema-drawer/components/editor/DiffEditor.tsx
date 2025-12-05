import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import type { Range } from '@codemirror/state'
import { EditorState, StateEffect, StateField } from '@codemirror/state'
import type { DecorationSet, ViewUpdate } from '@codemirror/view'
import { Decoration, EditorView, keymap, lineNumbers, WidgetType } from '@codemirror/view'
import { DEFAULT_EDITOR_THEME, EDITOR_THEMES } from '@/shared/constants/editor-themes'
import type { EditorTheme } from '@/shared/types'
import type { Ref } from 'react'
import { useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { jsonDarkHighlight, jsonLightHighlight } from '../../styles/editor/codemirror.styles'
import { getEditorThemeVars } from '../../styles/editor/editor-theme-vars'
import { DiffEditorWrapper } from '../../styles/recording/recording.styles'
import {
  schemaEditorDark,
  schemaEditorDarkHighlighting,
} from '../../styles/editor/schema-editor-dark-theme'
import { simpleDark } from '../../styles/editor/simple-dark-theme'

/** 占位行 Widget */
class PlaceholderWidget extends WidgetType {
  constructor(
    private stripe1: string,
    private stripe2: string,
    private borderColor: string
  ) {
    super()
  }

  toDOM(): HTMLElement {
    const div = document.createElement('div')
    div.className = 'cm-diff-placeholder'
    div.style.height = '19.2px'
    div.style.background = `repeating-linear-gradient(-45deg, ${this.stripe1}, ${this.stripe1} 4px, ${this.stripe2} 4px, ${this.stripe2} 8px)`
    div.style.borderBottom = `1px solid ${this.borderColor}`
    div.style.boxSizing = 'border-box'
    return div
  }

  eq(other: PlaceholderWidget): boolean {
    return (
      this.stripe1 === other.stripe1 &&
      this.stripe2 === other.stripe2 &&
      this.borderColor === other.borderColor
    )
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

/** Diff 装饰配置 */
interface DiffDecorationConfig {
  lines: DiffLineInfo[]
  placeholderStripe1: string
  placeholderStripe2: string
  placeholderBorder: string
}

/** 设置 diff 装饰的 Effect */
const setDiffDecorations = StateEffect.define<DiffDecorationConfig>()

/** 创建行背景装饰样式（根据主题动态生成） */
function createLineBackgroundTheme(vars: ReturnType<typeof getEditorThemeVars>) {
  return EditorView.theme({
    '&': {
      height: '100%',
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
    '.cm-line-added': {
      backgroundColor: `${vars.diffAddedBackground} !important`,
    },
    '.cm-line-removed': {
      backgroundColor: `${vars.diffRemovedBackground} !important`,
    },
    '.cm-line-modified': {
      backgroundColor: `${vars.diffModifiedBackground} !important`,
    },
    '.cm-diff-placeholder': {
      display: 'block',
    },
    /* 行内差异高亮 */
    '.cm-inline-added': {
      backgroundColor: vars.diffInlineAddedBackground,
      borderRadius: '3px',
      padding: '1px 2px',
      border: `1px solid ${vars.diffInlineAddedBorder}`,
      margin: '0 1px',
    },
    '.cm-inline-removed': {
      backgroundColor: vars.diffInlineRemovedBackground,
      borderRadius: '3px',
      padding: '1px 2px',
      border: `1px solid ${vars.diffInlineRemovedBorder}`,
      margin: '0 1px',
      textDecoration: 'line-through',
    },
  })
}

/** Diff 装饰 StateField */
const diffDecorationsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorations, tr) {
    // 处理设置装饰的 effect
    for (const effect of tr.effects) {
      if (effect.is(setDiffDecorations)) {
        const { lines, placeholderStripe1, placeholderStripe2, placeholderBorder } = effect.value
        const builder: Range<Decoration>[] = []
        const docLines = tr.state.doc.lines
        const lastLine = tr.state.doc.line(docLines)
        const docEnd = lastLine.to

        // 统计超出文档行数的尾部占位行数量
        let tailPlaceholderCount = 0

        for (const line of lines) {
          if (line.editorLine < 0) {
            continue
          }

          // 超出文档行数的占位行，累计到尾部
          if (line.editorLine >= docLines) {
            if (line.isPlaceholder) {
              tailPlaceholderCount++
            }
            continue
          }

          const docLine = tr.state.doc.line(line.editorLine + 1)
          const lineStart = docLine.from

          if (line.isPlaceholder) {
            // 插入占位行 widget
            builder.push(
              Decoration.widget({
                widget: new PlaceholderWidget(
                  placeholderStripe1,
                  placeholderStripe2,
                  placeholderBorder
                ),
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

        // 在文档末尾追加尾部占位行
        for (let i = 0; i < tailPlaceholderCount; i++) {
          builder.push(
            Decoration.widget({
              widget: new PlaceholderWidget(
                placeholderStripe1,
                placeholderStripe2,
                placeholderBorder
              ),
              block: true,
              side: 1, // 在位置之后
            }).range(docEnd)
          )
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
  /** 组件引用（React 19 支持直接作为 prop 传递） */
  ref?: Ref<DiffEditorHandle>
  /** 初始内容 */
  defaultValue: string
  /** 内容变化回调 */
  onChange?: (value: string) => void
  /** 水平滚动回调 */
  onHorizontalScroll?: (scrollLeft: number) => void
  /** 编辑器主题 */
  theme?: EditorTheme
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
 * React 19: ref 直接作为 prop 传递，无需 forwardRef
 * 基于 CodeMirror，支持占位行装饰和行背景高亮
 */
export const DiffEditor = (props: DiffEditorProps) => {
  const {
    ref,
    defaultValue,
    onChange,
    onHorizontalScroll,
    theme = DEFAULT_EDITOR_THEME,
    readOnly = false,
    diffLines = [],
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const onHorizontalScrollRef = useRef(onHorizontalScroll)
  const isSyncingScrollRef = useRef(false)
  /** 初始值 ref（仅用于首次创建编辑器，不触发重新创建） */
  const initialValueRef = useRef(defaultValue)
  /** 初始 diffLines ref（仅用于首次创建编辑器） */
  const initialDiffLinesRef = useRef(diffLines)

  // 获取主题变量
  const themeVars = useMemo(() => getEditorThemeVars(theme), [theme])

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
          effects: setDiffDecorations.of({
            lines,
            placeholderStripe1: themeVars.placeholderStripe1,
            placeholderStripe2: themeVars.placeholderStripe2,
            placeholderBorder: themeVars.placeholderBorder,
          }),
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
    [themeVars]
  )

  // 根据主题选择语法高亮和基础主题
  const getThemeExtensions = useMemo(() => {
    switch (theme) {
      case EDITOR_THEMES.DARK:
        return [simpleDark, syntaxHighlighting(jsonDarkHighlight)]
      case EDITOR_THEMES.SCHEMA_EDITOR_DARK:
        return [schemaEditorDark, schemaEditorDarkHighlighting]
      case EDITOR_THEMES.LIGHT:
      default:
        return [syntaxHighlighting(jsonLightHighlight)]
    }
  }, [theme])

  // 创建编辑器
  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: initialValueRef.current,
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

        // 主题和语法高亮
        ...getThemeExtensions,

        // Diff 装饰
        diffDecorationsField,
        createLineBackgroundTheme(themeVars),

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

    // 初始化装饰（使用 ref 中的初始值）
    if (initialDiffLinesRef.current.length > 0) {
      view.dispatch({
        effects: setDiffDecorations.of({
          lines: initialDiffLinesRef.current,
          placeholderStripe1: themeVars.placeholderStripe1,
          placeholderStripe2: themeVars.placeholderStripe2,
          placeholderBorder: themeVars.placeholderBorder,
        }),
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
  }, [theme, themeVars, getThemeExtensions, readOnly])

  // 更新 diff 装饰
  useEffect(() => {
    if (!viewRef.current || diffLines.length === 0) return

    viewRef.current.dispatch({
      effects: setDiffDecorations.of({
        lines: diffLines,
        placeholderStripe1: themeVars.placeholderStripe1,
        placeholderStripe2: themeVars.placeholderStripe2,
        placeholderBorder: themeVars.placeholderBorder,
      }),
    })
  }, [diffLines, themeVars])

  return <DiffEditorWrapper ref={containerRef} />
}
