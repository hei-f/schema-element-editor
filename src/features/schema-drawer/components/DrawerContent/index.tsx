import React from 'react'
import { ThemeProvider } from 'styled-components'
import { DrawerContentContainer } from '../../styles/layout/drawer.styles'
import {
  DiffModeContent,
  NormalModeContent,
  PreviewModeContent,
  RecordingModeContent,
} from './modes'
import type { DrawerContentProps } from './types'

/**
 * 抽屉内容入口组件
 * 根据不同模式分发到对应的子组件
 */
export const DrawerContent: React.FC<DrawerContentProps> = (props) => {
  const {
    isDiffMode,
    isInRecordingMode,
    previewEnabled,
    editorThemeVars,
    diffModeProps,
    recordingModeProps,
    previewModeProps,
    normalModeProps,
    baseProps,
  } = props

  /**
   * 根据模式渲染对应的内容组件
   */
  const renderContent = () => {
    if (isDiffMode) {
      return <DiffModeContent {...baseProps} {...diffModeProps} />
    }

    if (isInRecordingMode) {
      return <RecordingModeContent {...baseProps} {...recordingModeProps} />
    }

    if (previewEnabled) {
      return <PreviewModeContent {...baseProps} {...previewModeProps} />
    }

    return <NormalModeContent {...baseProps} {...normalModeProps} />
  }

  return (
    <DrawerContentContainer>
      <ThemeProvider theme={editorThemeVars}>{renderContent()}</ThemeProvider>
    </DrawerContentContainer>
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
