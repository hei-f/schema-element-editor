import React, { useState, useCallback, useMemo, useLayoutEffect, useRef } from 'react'
import { ThemeProvider } from 'styled-components'
import {
  ContentAreaContainer,
  DragHintText,
  DragOverlay,
  DragWidthIndicator,
  DrawerContentContainer,
  ModeContentWrapper,
  ModeSwitchContainer,
  PreviewEditArea,
  PreviewEditorRow,
  PreviewModeContainer,
  PreviewPlaceholder,
  PreviewResizer,
} from '../../styles/layout/drawer.styles'
import { EditorContainer } from '../../styles/editor/editor.styles'
import { LightSuccessNotification } from '../../styles/notifications/notifications.styles'
import { CodeMirrorEditor } from '../editor/CodeMirrorEditor'
import { DiffModeContent } from './modes'
import { ToolbarSection } from './shared/ToolbarSection'
import { BuiltinPreview } from '../preview/BuiltinPreview'
import type { ToolbarMode, DiffContentType } from '../toolbar/DrawerToolbar'
import type { BaseContentProps, DiffModeContentProps, PreviewModeContentProps } from './types'
import type { EditorThemeVars } from '../../styles/editor/editor-theme-vars'
import { ContentType } from '@/shared/types'
import { schemaTransformer } from '../../services/schema-transformer'

/**
 * 普通模式布局 Props
 * 处理：默认模式、预览模式、Diff 模式
 */
interface NormalModeLayoutProps {
  isDiffMode: boolean
  previewEnabled: boolean
  isClosingPreview: boolean
  editorThemeVars: EditorThemeVars
  diffModeProps: Omit<DiffModeContentProps, keyof BaseContentProps>
  previewModeProps: Omit<PreviewModeContentProps, keyof BaseContentProps>
  baseProps: BaseContentProps
}

/**
 * 计算工具栏模式
 */
function getToolbarMode(
  isDiffMode: boolean,
  previewEnabled: boolean,
  isClosingPreview: boolean
): ToolbarMode {
  if (isDiffMode) return 'diff'
  if (previewEnabled || isClosingPreview) return 'preview'
  return 'normal'
}

/**
 * 对内容应用格式化
 */
function formatContent(content: string): string {
  try {
    const parsed = JSON.parse(content)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return content
  }
}

/**
 * 对内容应用转义
 */
function escapeContent(content: string): string {
  return JSON.stringify(content)
}

/**
 * 对内容应用去转义
 */
function unescapeContent(content: string): string {
  try {
    const result = JSON.parse(content)
    if (typeof result === 'string') {
      return result
    }
    return content
  } catch {
    return content
  }
}

/**
 * 对内容应用压缩
 */
function compactContent(content: string): string {
  try {
    const parsed = JSON.parse(content)
    return JSON.stringify(parsed)
  } catch {
    return content
  }
}

/**
 * 对内容应用解析（反序列化）
 */
function parseContent(content: string): string {
  const result = schemaTransformer.parseNestedJson(content)
  if (result.success && result.data) {
    try {
      return JSON.stringify(JSON.parse(result.data), null, 2)
    } catch {
      return result.data
    }
  }
  return content
}

/**
 * 普通模式布局组件
 *
 * 负责渲染：
 * - 默认模式：工具栏 + 编辑器
 * - 预览模式：工具栏 + (预览区域 | 编辑器)
 * - Diff 模式：工具栏 + Diff视图
 */
export const NormalModeLayout: React.FC<NormalModeLayoutProps> = (props) => {
  const {
    isDiffMode,
    previewEnabled,
    isClosingPreview,
    editorThemeVars,
    diffModeProps,
    previewModeProps,
    baseProps,
  } = props

  const toolbarMode = getToolbarMode(isDiffMode, previewEnabled, isClosingPreview)

  // Diff 模式下的内容状态（左右两侧都用 state 存储）
  const [diffContentType, setDiffContentType] = useState<DiffContentType>('rawstring')
  const [diffLeftContent, setDiffLeftContent] = useState<string>('')
  const [diffRightContent, setDiffRightContent] = useState<string>('')

  // 进入 Diff 模式时初始化（直接赋值，不做转换）
  // 使用 useLayoutEffect 确保在渲染前同步完成状态初始化
  const prevIsDiffModeRef = useRef(false)
  useLayoutEffect(() => {
    // 只在从非 Diff 进入 Diff 时初始化
    if (isDiffMode && !prevIsDiffModeRef.current) {
      // 左侧：原始数据
      const leftContent = diffModeProps.repairOriginalValue || diffModeProps.originalValue
      // 右侧：当前编辑内容
      const rightContent = diffModeProps.pendingRepairedValue || diffModeProps.editorValue
      // 使用外部 contentType 初始化（包括 other 类型）
      let currentType: DiffContentType = 'rawstring'
      if (baseProps.contentType === ContentType.Ast) {
        currentType = 'ast'
      } else if (baseProps.contentType === ContentType.Other) {
        currentType = 'other'
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect -- 模式切换时同步初始化状态是合理的用例
      setDiffContentType(currentType)
      setDiffLeftContent(leftContent)
      setDiffRightContent(rightContent)
    }
    prevIsDiffModeRef.current = isDiffMode
  }, [
    isDiffMode,
    diffModeProps.repairOriginalValue,
    diffModeProps.originalValue,
    diffModeProps.pendingRepairedValue,
    diffModeProps.editorValue,
    baseProps.contentType,
  ])

  // Diff 模式 AST/RawString 切换（只操作右侧，基于当前内容转换）
  const handleDiffSegmentChange = useCallback((value: DiffContentType) => {
    setDiffContentType(value)
    // 基于当前右侧内容直接转换
    setDiffRightContent((prev) => {
      if (value === 'ast') {
        // RawString → AST
        const result = schemaTransformer.convertToAST(prev)
        return result.success && result.data ? result.data : prev
      } else if (value === 'rawstring') {
        // AST → RawString（convertToMarkdown 返回的 data 已经是序列化后的字符串）
        const result = schemaTransformer.convertToMarkdown(prev)
        return result.success && result.data ? result.data : prev
      }
      return prev
    })
  }, [])

  // Diff 模式格式化（只操作右侧）
  const handleDiffFormat = useCallback(() => {
    setDiffRightContent((prev) => formatContent(prev))
  }, [])

  // Diff 模式转义（只操作右侧）
  const handleDiffEscape = useCallback(() => {
    setDiffRightContent((prev) => escapeContent(prev))
  }, [])

  // Diff 模式去转义（只操作右侧）
  const handleDiffUnescape = useCallback(() => {
    setDiffRightContent((prev) => unescapeContent(prev))
  }, [])

  // Diff 模式压缩（只操作右侧）
  const handleDiffCompact = useCallback(() => {
    setDiffRightContent((prev) => compactContent(prev))
  }, [])

  // Diff 模式解析（只操作右侧）
  const handleDiffParse = useCallback(() => {
    setDiffRightContent((prev) => parseContent(prev))
  }, [])

  // 检查右侧 Diff 内容是否可解析
  const diffCanParse = useMemo(() => {
    try {
      JSON.parse(diffRightContent)
      return true
    } catch {
      return false
    }
  }, [diffRightContent])

  // Diff 模式工具栏回调
  const diffToolbarActions = useMemo(
    () => ({
      onDiffSegmentChange: handleDiffSegmentChange,
      onDiffFormat: handleDiffFormat,
      onDiffEscape: handleDiffEscape,
      onDiffUnescape: handleDiffUnescape,
      onDiffCompact: handleDiffCompact,
      onDiffParse: handleDiffParse,
      diffContentType,
      diffCanParse,
    }),
    [
      handleDiffSegmentChange,
      handleDiffFormat,
      handleDiffEscape,
      handleDiffUnescape,
      handleDiffCompact,
      handleDiffParse,
      diffContentType,
      diffCanParse,
    ]
  )

  // 编辑器相关 props
  const { editorProps, notificationProps } = baseProps
  const { editorRef, editorValue, editorTheme, enableAstTypeHints, contentType, onChange } =
    editorProps
  const { lightNotifications } = notificationProps

  // 预览模式相关
  const {
    previewWidth,
    isDragging,
    previewContainerRef,
    previewPlaceholderRef,
    onResizeStart,
    isClosingTransition,
    isOpeningInitial,
    isOpeningTransition,
    useBuiltinPreview,
  } = previewModeProps

  /** 是否显示预览区域（预览模式或预览关闭过渡中） */
  const showPreviewArea = (previewEnabled || isClosingPreview) && !isDiffMode
  /** 是否显示拖动条 */
  const showResizer = showPreviewArea && !isClosingTransition && !isOpeningTransition

  /**
   * 渲染编辑器
   */
  const renderEditor = () => (
    <>
      {lightNotifications.map((notification, index) => (
        <LightSuccessNotification key={notification.id} style={{ top: `${16 + index * 48}px` }}>
          ✓ {notification.text}
        </LightSuccessNotification>
      ))}
      <CodeMirrorEditor
        ref={editorRef}
        height="100%"
        defaultValue={editorValue}
        onChange={onChange}
        theme={editorTheme}
        placeholder="在此输入 JSON Schema..."
        enableAstHints={enableAstTypeHints}
        isAstContent={() => contentType === ContentType.Ast}
      />
    </>
  )

  /**
   * 渲染工具栏
   */
  const renderToolbar = () => (
    <ToolbarSection
      mode={toolbarMode}
      baseProps={baseProps}
      previewEnabled={previewEnabled}
      isRecording={false}
      showDiffButton={true}
      isDiffMode={isDiffMode}
      diffToolbarActions={diffToolbarActions}
      hasPendingRepair={!!diffModeProps.pendingRepairedValue}
      onApplyRepair={diffModeProps.onApplyRepair}
      onCancelRepair={diffModeProps.onCancelRepair}
    />
  )

  /**
   * 渲染模式切换区域（编辑器/Diff 内容）
   * 动画只影响这个区域，工具栏不受影响
   */
  const renderModeSwitchArea = () => (
    <ModeSwitchContainer>
      {/* 编辑器内容 - 非 Diff 时显示 */}
      <ModeContentWrapper $active={!isDiffMode}>
        <ContentAreaContainer>
          <EditorContainer>{renderEditor()}</EditorContainer>
        </ContentAreaContainer>
      </ModeContentWrapper>

      {/* Diff 内容 - Diff 时显示 */}
      <ModeContentWrapper $active={isDiffMode}>
        <ContentAreaContainer>
          <DiffModeContent
            {...baseProps}
            {...diffModeProps}
            diffLeftContent={diffLeftContent}
            diffRightContent={diffRightContent}
            diffToolbarActions={diffToolbarActions}
          />
        </ContentAreaContainer>
      </ModeContentWrapper>
    </ModeSwitchContainer>
  )

  /**
   * 渲染编辑器模式内容（预览/默认）
   * 工具栏 + 模式切换区域，工具栏不参与动画
   */
  const renderEditorModeContent = () => {
    // 预览模式：工具栏和编辑器同宽
    if (showPreviewArea) {
      return (
        <PreviewModeContainer>
          <PreviewEditorRow ref={isClosingTransition ? undefined : previewContainerRef}>
            {/* 左侧预览占位区域（全高） */}
            <PreviewPlaceholder
              ref={isClosingTransition || useBuiltinPreview ? undefined : previewPlaceholderRef}
              $width={previewWidth}
              $isClosing={isClosingTransition}
              $isOpening={isOpeningInitial}
              $isDragging={isDragging}
            >
              {/* 内置预览器模式：直接在占位区域内渲染 MarkdownEditor */}
              {useBuiltinPreview && !isClosingTransition && !isOpeningInitial && (
                <BuiltinPreview editorValue={editorValue} contentType={contentType} />
              )}
            </PreviewPlaceholder>

            {/* 拖拽时的蒙层提示（内置预览时不显示） */}
            {!isClosingTransition && isDragging && !useBuiltinPreview && (
              <DragOverlay $width={previewWidth}>
                <DragWidthIndicator>{Math.round(previewWidth)}%</DragWidthIndicator>
                <DragHintText>松开鼠标完成调整</DragHintText>
              </DragOverlay>
            )}

            {/* 可拖拽的分隔条 */}
            {showResizer && (
              <PreviewResizer
                $isDragging={isDragging}
                $previewWidth={previewWidth}
                onMouseDown={onResizeStart}
              />
            )}

            {/* 右侧：工具栏 + 模式切换区域 */}
            <PreviewEditArea>
              {renderToolbar()}
              {renderModeSwitchArea()}
            </PreviewEditArea>
          </PreviewEditorRow>
        </PreviewModeContainer>
      )
    }

    // 默认模式：工具栏全宽
    return (
      <ContentAreaContainer>
        {renderToolbar()}
        {renderModeSwitchArea()}
      </ContentAreaContainer>
    )
  }

  return (
    <ThemeProvider theme={editorThemeVars}>
      <DrawerContentContainer>{renderEditorModeContent()}</DrawerContentContainer>
    </ThemeProvider>
  )
}
