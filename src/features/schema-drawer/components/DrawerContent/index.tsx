import React from 'react'
import { NormalModeLayout } from './NormalModeLayout'
import { RecordingModeLayout } from './RecordingModeLayout'
import type { DrawerContentProps } from './types'

/**
 * 抽屉内容入口组件
 *
 * 根据是否为录制模式分流到不同的布局组件：
 * - 普通模式布局：处理默认/预览/Diff 模式
 * - 录制模式布局：处理录制模式及录制模式下的 Diff
 *
 * 这种分离设计的原因：
 * 1. 录制模式通过独立快捷键打开，不会与普通模式相互切换
 * 2. 两种模式的布局结构和职责不同
 * 3. 分离后每个组件的复杂度降低，更易于维护
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
    themeColor,
    hoverColor,
    activeColor,
  } = props

  // 录制模式：使用录制模式专用布局
  if (isInRecordingMode) {
    return (
      <RecordingModeLayout
        isDiffMode={isDiffMode}
        previewEnabled={previewEnabled}
        isClosingPreview={isClosingPreview}
        editorThemeVars={editorThemeVars}
        diffModeProps={diffModeProps}
        recordingModeProps={recordingModeProps}
        previewModeProps={previewModeProps}
        baseProps={baseProps}
        themeColor={themeColor}
        hoverColor={hoverColor}
        activeColor={activeColor}
      />
    )
  }

  // 普通模式：使用普通模式布局（默认/预览/Diff）
  return (
    <NormalModeLayout
      isDiffMode={isDiffMode}
      previewEnabled={previewEnabled}
      isClosingPreview={isClosingPreview}
      editorThemeVars={editorThemeVars}
      diffModeProps={diffModeProps}
      previewModeProps={previewModeProps}
      baseProps={baseProps}
      themeColor={themeColor}
      hoverColor={hoverColor}
      activeColor={activeColor}
    />
  )
}
