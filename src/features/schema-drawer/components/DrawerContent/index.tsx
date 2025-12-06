import { ContentType } from '@/shared/types'
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
  PreviewEditorContainer,
  PreviewEditorRow,
  PreviewModeContainer,
  PreviewPlaceholder,
  PreviewResizer,
} from '../../styles/layout/drawer.styles'
import { EditorContainer } from '../../styles/editor/editor.styles'
import { LightSuccessNotification } from '../../styles/notifications/notifications.styles'
import {
  RecordingContentArea,
  RecordingEditorArea,
  RecordingModeContainer,
} from '../../styles/recording/recording.styles'
import { DrawerToolbar, type ToolbarMode } from '../toolbar/DrawerToolbar'
import { RecordingStatusBar } from '../recording/RecordingStatusBar'
import { VersionHistoryPanel } from '../recording/VersionHistoryPanel'
import { CodeMirrorEditor } from '../editor/CodeMirrorEditor'
import { DiffModeContent } from './modes'
import type { DrawerContentProps } from './types'

/**
 * 计算当前工具栏模式（纯函数）
 */
function getToolbarMode(
  isDiffMode: boolean,
  isInRecordingMode: boolean,
  previewEnabled: boolean,
  isClosingPreview: boolean
): ToolbarMode {
  if (isDiffMode) return 'diff'
  if (isInRecordingMode) return 'recording'
  if (previewEnabled || isClosingPreview) return 'preview'
  return 'normal'
}

/**
 * 抽屉内容入口组件
 *
 * 核心设计：编辑器始终是同一个实例，不同模式只是改变周围的布局组件
 * - 默认模式：工具栏 + 编辑器
 * - 预览模式：工具栏 + (预览区域 | 编辑器)
 * - 录制模式：录制状态栏 + 工具栏 + (版本历史 | 编辑器)
 * - Diff 模式：工具栏 + Diff视图（专门的组件，不是编辑器）
 */
export const DrawerContent: React.FC<DrawerContentProps> = (props) => {
  const {
    isDiffMode,
    isInRecordingMode,
    previewEnabled,
    isClosingPreview,
    editorThemeVars,
    diffModeProps,
    recordingModeProps,
    previewModeProps,
    baseProps,
  } = props

  const toolbarMode = getToolbarMode(
    isDiffMode,
    isInRecordingMode,
    previewEnabled,
    isClosingPreview
  )

  // 编辑器相关 props（所有非 Diff 模式共享同一个编辑器实例）
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
  } = previewModeProps

  // 录制模式相关
  const { isRecording, snapshots, selectedSnapshotId, onSelectSnapshot } = recordingModeProps

  /** 是否显示预览区域（预览模式或预览关闭过渡中） */
  const showPreviewArea = (previewEnabled || isClosingPreview) && !isInRecordingMode && !isDiffMode
  /** 是否显示录制模式布局（非 Diff 的录制模式） */
  const showRecordingLayout = isInRecordingMode && !isDiffMode
  /** 是否显示拖动条 */
  const showResizer = showPreviewArea && !isClosingTransition && !isOpeningTransition

  /**
   * 渲染编辑器（同一个实例）
   * 包含轻量通知和 CodeMirrorEditor
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
    <DrawerToolbar
      mode={toolbarMode}
      attributes={baseProps.attributes}
      contentType={baseProps.contentType}
      canParse={baseProps.canParse}
      toolbarButtons={baseProps.toolbarButtons}
      previewEnabled={previewEnabled}
      isRecording={isRecording}
      showDiffButton={!isInRecordingMode || isDiffMode}
      isDiffMode={isDiffMode}
      diffDisplayMode={diffModeProps.diffDisplayMode}
      onDiffDisplayModeChange={diffModeProps.onDiffDisplayModeChange}
      onFormat={baseProps.toolbarActions.onFormat}
      onEscape={baseProps.toolbarActions.onEscape}
      onUnescape={baseProps.toolbarActions.onUnescape}
      onCompact={baseProps.toolbarActions.onCompact}
      onParse={baseProps.toolbarActions.onParse}
      onSegmentChange={baseProps.toolbarActions.onSegmentChange}
      onRenderPreview={baseProps.toolbarActions.onRenderPreview}
      onEnterDiffMode={baseProps.toolbarActions.onEnterDiffMode}
      onExitDiffMode={baseProps.toolbarActions.onExitDiffMode}
      onLocateError={baseProps.toolbarActions.onLocateError}
      onRepairJson={baseProps.toolbarActions.onRepairJson}
      hasPendingRepair={!!diffModeProps.pendingRepairedValue}
      onApplyRepair={diffModeProps.onApplyRepair}
      onCancelRepair={diffModeProps.onCancelRepair}
      onCopyParam={baseProps.toolbarActions.onCopyParam}
    />
  )

  /**
   * 渲染编辑器模式内容（预览/录制/默认）
   * 工具栏已移至外部统一渲染，不参与模式切换动画
   * 预览模式有特殊布局，其他模式共享相同结构
   */
  const renderEditorModeContent = () => {
    // 预览模式 - 特殊布局：左侧预览(全高) + 右侧编辑器
    if (showPreviewArea) {
      return (
        <PreviewModeContainer>
          <PreviewEditorRow ref={isClosingTransition ? undefined : previewContainerRef}>
            {/* 左侧预览占位区域（全高） */}
            <PreviewPlaceholder
              ref={isClosingTransition ? undefined : previewPlaceholderRef}
              $width={previewWidth}
              $isClosing={isClosingTransition}
              $isOpening={isOpeningInitial}
              $isDragging={isDragging}
            />

            {/* 拖拽时的蒙层提示 */}
            {!isClosingTransition && isDragging && (
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

            {/* 右侧编辑区域 */}
            <PreviewEditArea>
              <PreviewEditorContainer>{renderEditor()}</PreviewEditorContainer>
            </PreviewEditArea>
          </PreviewEditorRow>
        </PreviewModeContainer>
      )
    }

    // 录制模式 - (版本历史 | 编辑器)，录制状态栏已移至外部处理
    if (showRecordingLayout) {
      return (
        <ContentAreaContainer>
          <RecordingModeContainer>
            <RecordingContentArea>
              <VersionHistoryPanel
                isRecording={isRecording}
                snapshots={snapshots}
                selectedSnapshotId={selectedSnapshotId}
                onSelectSnapshot={onSelectSnapshot}
              />
              <RecordingEditorArea>
                <EditorContainer>{renderEditor()}</EditorContainer>
              </RecordingEditorArea>
            </RecordingContentArea>
          </RecordingModeContainer>
        </ContentAreaContainer>
      )
    }

    // 默认模式 - 编辑器
    return (
      <ContentAreaContainer>
        <EditorContainer>{renderEditor()}</EditorContainer>
      </ContentAreaContainer>
    )
  }

  return (
    <ThemeProvider theme={editorThemeVars}>
      <DrawerContentContainer>
        {/* 录制模式下：录制状态栏在工具栏之上 */}
        {showRecordingLayout && (
          <RecordingStatusBar
            isRecording={isRecording}
            snapshots={snapshots}
            onStopRecording={recordingModeProps.onStopRecording}
            onEnterDiffMode={recordingModeProps.onEnterDiffMode}
          />
        )}

        {/* 工具栏：固定在顶部，不参与模式切换动画 */}
        {renderToolbar()}

        {/* 模式切换容器：限制绝对定位元素不溢出到 padding 区域 */}
        <ModeSwitchContainer>
          {/* 编辑器模式内容（默认/预览/录制）- 非 Diff 时显示 */}
          <ModeContentWrapper $active={!isDiffMode}>{renderEditorModeContent()}</ModeContentWrapper>

          {/* Diff 模式内容 - 始终在 DOM 中，Diff 模式时显示 */}
          <ModeContentWrapper $active={isDiffMode}>
            <ContentAreaContainer>
              <DiffModeContent {...baseProps} {...diffModeProps} />
            </ContentAreaContainer>
          </ModeContentWrapper>
        </ModeSwitchContainer>
      </DrawerContentContainer>
    </ThemeProvider>
  )
}

// 导出类型
export type {
  DrawerContentProps,
  BaseContentProps,
  ToolbarActions,
  EditorProps,
  NotificationProps,
  DiffModeContentProps,
  RecordingModeContentProps,
  PreviewModeContentProps,
  NormalModeContentProps,
} from './types'
