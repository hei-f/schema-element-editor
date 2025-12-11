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
import {
  RecordingContentArea,
  RecordingEditorArea,
  RecordingModeContainer,
} from '../../styles/recording/recording.styles'
import { CodeMirrorEditor } from '../editor/CodeMirrorEditor'
import { RecordingStatusBar } from '../recording/RecordingStatusBar'
import { VersionHistoryPanel } from '../recording/VersionHistoryPanel'
import { BuiltinPreview } from '../preview/BuiltinPreview'
import { DiffModeContent } from './modes'
import { ToolbarSection } from './shared/ToolbarSection'
import { useDiffContentTransform } from '../../hooks/diff/useDiffContentTransform'
import { TOOLBAR_MODE, type ToolbarMode } from '@/shared/constants/ui-modes'
import type {
  BaseContentProps,
  DiffModeContentProps,
  PreviewModeContentProps,
  RecordingModeContentProps,
} from './types'
import type { EditorThemeVars } from '../../styles/editor/editor-theme-vars'
import { ContentType } from '@/shared/types'

/**
 * 录制模式布局 Props
 * 处理：录制模式、录制模式下的预览模式、录制模式下的 Diff 模式
 */
interface RecordingModeLayoutProps {
  isDiffMode: boolean
  previewEnabled: boolean
  isClosingPreview: boolean
  editorThemeVars: EditorThemeVars
  diffModeProps: Omit<DiffModeContentProps, keyof BaseContentProps>
  recordingModeProps: Omit<RecordingModeContentProps, keyof BaseContentProps>
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
  if (isDiffMode) return TOOLBAR_MODE.DIFF
  if (previewEnabled || isClosingPreview) return TOOLBAR_MODE.PREVIEW
  return TOOLBAR_MODE.RECORDING
}

/**
 * 录制模式布局组件
 *
 * 负责渲染：
 * - 录制模式：录制状态栏 + 工具栏 + (版本历史 | 编辑器)
 * - 录制模式下的预览：预览区域 + 拖拽条 + (版本历史 | 编辑器)
 * - 录制模式下的 Diff：录制状态栏 + 工具栏 + Diff视图
 */
export const RecordingModeLayout: React.FC<RecordingModeLayoutProps> = (props) => {
  const {
    isDiffMode,
    previewEnabled,
    isClosingPreview,
    editorThemeVars,
    diffModeProps,
    recordingModeProps,
    previewModeProps,
    baseProps,
  } = props

  const toolbarMode = getToolbarMode(isDiffMode, previewEnabled, isClosingPreview)

  // 编辑器相关 props
  const { editorProps, notificationProps } = baseProps
  const { editorRef, editorValue, editorTheme, enableAstTypeHints, contentType, onChange } =
    editorProps
  const { lightNotifications } = notificationProps

  // 录制模式相关
  const { isRecording, snapshots, selectedSnapshotId, onSelectSnapshot } = recordingModeProps

  // Diff 模式内容转换
  const { diffLeftContent, diffRightContent, diffToolbarActions } = useDiffContentTransform({
    isDiffMode,
    originalLeftContent: diffModeProps.repairOriginalValue || diffModeProps.originalValue,
    originalRightContent: diffModeProps.pendingRepairedValue || diffModeProps.editorValue,
    transformBothSides: true,
  })

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
      isRecording={isRecording}
      showDiffButton={isDiffMode}
      isDiffMode={isDiffMode}
      diffToolbarActions={diffToolbarActions}
      hasPendingRepair={!!diffModeProps.pendingRepairedValue}
      onApplyRepair={diffModeProps.onApplyRepair}
      onCancelRepair={diffModeProps.onCancelRepair}
    />
  )

  /**
   * 渲染录制模式内容区域（版本历史面板 + 编辑器）
   */
  const renderRecordingContentArea = () => (
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
  )

  /**
   * 渲染模式切换区域（录制内容/Diff 内容）
   * 动画只影响这个区域，工具栏不受影响
   */
  const renderModeSwitchArea = () => (
    <ModeSwitchContainer>
      {/* 录制模式内容 - 非 Diff 时显示 */}
      <ModeContentWrapper $active={!isDiffMode}>
        <ContentAreaContainer>{renderRecordingContentArea()}</ContentAreaContainer>
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
   * 渲染录制模式完整布局（预览/默认）
   * 工具栏 + 模式切换区域，工具栏不参与动画
   */
  const renderRecordingModeContent = () => {
    // 预览模式：预览区域（左） + 拖拽条 + 录制内容（右）
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
              {/* 内置预览器模式：直接在占位区域内渲染 BuiltinPreview */}
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

            {/* 右侧：工具栏 + 模式切换区域（录制内容/Diff） */}
            <PreviewEditArea>
              {renderToolbar()}
              {renderModeSwitchArea()}
            </PreviewEditArea>
          </PreviewEditorRow>
        </PreviewModeContainer>
      )
    }

    // 默认模式：工具栏 + 模式切换区域
    return (
      <ContentAreaContainer>
        {renderToolbar()}
        {renderModeSwitchArea()}
      </ContentAreaContainer>
    )
  }

  return (
    <ThemeProvider theme={editorThemeVars}>
      <DrawerContentContainer>
        {/* 录制状态栏：Diff 模式和预览模式下隐藏 */}
        {!isDiffMode && !showPreviewArea && (
          <RecordingStatusBar
            isRecording={isRecording}
            snapshots={snapshots}
            onStopRecording={recordingModeProps.onStopRecording}
            onEnterDiffMode={recordingModeProps.onEnterDiffMode}
          />
        )}

        {/* 录制模式内容（预览/默认） */}
        {renderRecordingModeContent()}
      </DrawerContentContainer>
    </ThemeProvider>
  )
}
