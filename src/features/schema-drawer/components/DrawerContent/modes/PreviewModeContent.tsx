import { ContentType } from '@/shared/types'
import React from 'react'
import { DrawerToolbar } from '../../toolbar/DrawerToolbar'
import { CodeMirrorEditor } from '../../editor/CodeMirrorEditor'
import {
  DragHintText,
  DragOverlay,
  DragWidthIndicator,
  FullScreenModeWrapper,
  PreviewEditorContainer,
  PreviewEditorRow,
  PreviewModeContainer,
  PreviewPlaceholder,
  PreviewResizer,
} from '../../../styles/layout/drawer.styles'
import { LightSuccessNotification } from '../../../styles/notifications/notifications.styles'
import type { PreviewModeContentProps } from '../types'

/**
 * 预览模式内容组件
 */
export const PreviewModeContent: React.FC<PreviewModeContentProps> = (props) => {
  const {
    attributes,
    contentType,
    canParse,
    toolbarButtons,
    toolbarActions,
    editorProps,
    notificationProps,
    isFullScreenTransition,
    previewEnabled,
    previewWidth,
    isDragging,
    previewContainerRef,
    previewPlaceholderRef,
    onResizeStart,
  } = props

  const { lightNotifications } = notificationProps
  const { editorRef, editorValue, editorTheme, enableAstTypeHints, onChange } = editorProps

  return (
    <FullScreenModeWrapper key="preview" $animate={isFullScreenTransition}>
      <PreviewModeContainer>
        {/* 工具栏横跨整个宽度 */}
        <DrawerToolbar
          attributes={attributes}
          contentType={contentType}
          canParse={canParse}
          toolbarButtons={toolbarButtons}
          previewEnabled={previewEnabled}
          showDiffButton={true}
          onFormat={toolbarActions.onFormat}
          onEscape={toolbarActions.onEscape}
          onUnescape={toolbarActions.onUnescape}
          onCompact={toolbarActions.onCompact}
          onParse={toolbarActions.onParse}
          onSegmentChange={toolbarActions.onSegmentChange}
          onRenderPreview={toolbarActions.onRenderPreview}
          onEnterDiffMode={toolbarActions.onEnterDiffMode}
          onLocateError={toolbarActions.onLocateError}
          onRepairJson={toolbarActions.onRepairJson}
        />

        {/* 预览区域和编辑器并排 */}
        <PreviewEditorRow ref={previewContainerRef}>
          {/* 左侧预览占位区域 */}
          <PreviewPlaceholder ref={previewPlaceholderRef} $width={previewWidth} />

          {/* 拖拽时的蒙层提示 */}
          {isDragging && (
            <DragOverlay $width={previewWidth}>
              <DragWidthIndicator>{Math.round(previewWidth)}%</DragWidthIndicator>
              <DragHintText>松开鼠标完成调整</DragHintText>
            </DragOverlay>
          )}

          {/* 可拖拽的分隔条 */}
          <PreviewResizer $isDragging={isDragging} onMouseDown={onResizeStart} />

          {/* 右侧编辑器（不包含工具栏） */}
          <PreviewEditorContainer>
            {lightNotifications.map((notification, index) => (
              <LightSuccessNotification
                key={notification.id}
                style={{ top: `${16 + index * 48}px` }}
              >
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
          </PreviewEditorContainer>
        </PreviewEditorRow>
      </PreviewModeContainer>
    </FullScreenModeWrapper>
  )
}
