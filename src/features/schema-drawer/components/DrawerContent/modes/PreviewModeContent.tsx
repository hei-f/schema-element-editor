import { ContentType } from '@/shared/types'
import React from 'react'
import { CodeMirrorEditor } from '../../editor/CodeMirrorEditor'
import {
  DragHintText,
  DragOverlay,
  DragWidthIndicator,
  FullScreenModeWrapper,
  PreviewEditArea,
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
 * 布局：预览区域占据左侧全高，编辑区域在右侧
 * 工具栏由父组件统一管理
 * 支持预览关闭过渡状态：保持布局结构，预览区域显示为灰色背景
 */
export const PreviewModeContent: React.FC<PreviewModeContentProps> = (props) => {
  const {
    contentType,
    editorProps,
    notificationProps,
    isFullScreenTransition,
    previewWidth,
    isDragging,
    previewContainerRef,
    previewPlaceholderRef,
    onResizeStart,
    isClosingTransition,
    isOpeningInitial,
    isOpeningTransition,
  } = props

  const { lightNotifications } = notificationProps
  const { editorRef, editorValue, editorTheme, enableAstTypeHints, onChange } = editorProps

  /** 是否显示拖动条：过渡期间（打开或关闭）不显示 */
  const showResizer = !isClosingTransition && !isOpeningTransition

  return (
    <FullScreenModeWrapper key="preview" $animate={isFullScreenTransition}>
      <PreviewModeContainer>
        {/* 预览区域和编辑区域并排，gap 16px */}
        <PreviewEditorRow ref={isClosingTransition ? undefined : previewContainerRef}>
          {/* 左侧预览占位区域，过渡时宽度动画，拖拽时实时响应 */}
          <PreviewPlaceholder
            ref={isClosingTransition ? undefined : previewPlaceholderRef}
            $width={previewWidth}
            $isClosing={isClosingTransition}
            $isOpening={isOpeningInitial}
            $isDragging={isDragging}
          />

          {/* 拖拽时的蒙层提示（过渡期间不显示） */}
          {!isClosingTransition && isDragging && (
            <DragOverlay $width={previewWidth}>
              <DragWidthIndicator>{Math.round(previewWidth)}%</DragWidthIndicator>
              <DragHintText>松开鼠标完成调整</DragHintText>
            </DragOverlay>
          )}

          {/* 可拖拽的分隔条（绝对定位在 gap 中间，过渡期间不显示） */}
          {showResizer && (
            <PreviewResizer
              $isDragging={isDragging}
              $previewWidth={previewWidth}
              onMouseDown={onResizeStart}
            />
          )}

          {/* 右侧编辑区域 */}
          <PreviewEditArea>
            {/* 编辑器容器，带圆角 */}
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
          </PreviewEditArea>
        </PreviewEditorRow>
      </PreviewModeContainer>
    </FullScreenModeWrapper>
  )
}
