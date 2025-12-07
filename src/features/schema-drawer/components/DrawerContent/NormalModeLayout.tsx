import React from 'react'
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
import type { ToolbarMode } from '../toolbar/DrawerToolbar'
import type { BaseContentProps, DiffModeContentProps, PreviewModeContentProps } from './types'
import type { EditorThemeVars } from '../../styles/editor/editor-theme-vars'
import { ContentType } from '@/shared/types'

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
      diffDisplayMode={diffModeProps.diffDisplayMode}
      onDiffDisplayModeChange={diffModeProps.onDiffDisplayModeChange}
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
          <DiffModeContent {...baseProps} {...diffModeProps} />
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
