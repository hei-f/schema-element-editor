import React from 'react'
import { DrawerToolbar, type DiffToolbarActions } from '../../toolbar/DrawerToolbar'
import type { ToolbarMode } from '@/shared/constants/ui-modes'
import type { BaseContentProps } from '../types'

interface ToolbarSectionProps {
  mode: ToolbarMode
  baseProps: BaseContentProps
  previewEnabled: boolean
  isRecording: boolean
  showDiffButton: boolean
  isDiffMode: boolean
  /** Diff 模式专用工具栏回调 */
  diffToolbarActions?: DiffToolbarActions
  hasPendingRepair: boolean
  onApplyRepair: () => void
  onCancelRepair: () => void
}

/**
 * 工具栏区域组件
 * 所有模式共享
 */
export const ToolbarSection: React.FC<ToolbarSectionProps> = (props) => {
  const {
    mode,
    baseProps,
    previewEnabled,
    isRecording,
    showDiffButton,
    isDiffMode,
    diffToolbarActions,
    hasPendingRepair,
    onApplyRepair,
    onCancelRepair,
  } = props

  return (
    <DrawerToolbar
      mode={mode}
      attributes={baseProps.attributes}
      contentType={baseProps.contentType}
      canParse={baseProps.canParse}
      toolbarButtons={baseProps.toolbarButtons}
      previewEnabled={previewEnabled}
      isRecording={isRecording}
      showDiffButton={showDiffButton}
      isDiffMode={isDiffMode}
      diffToolbarActions={diffToolbarActions}
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
      hasPendingRepair={hasPendingRepair}
      onApplyRepair={onApplyRepair}
      onCancelRepair={onCancelRepair}
      onCopyParam={baseProps.toolbarActions.onCopyParam}
    />
  )
}
