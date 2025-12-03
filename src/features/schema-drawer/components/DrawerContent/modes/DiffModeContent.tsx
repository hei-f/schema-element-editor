import React, { useState } from 'react'
import { DrawerToolbar } from '../../toolbar/DrawerToolbar'
import { SchemaDiffView, type DiffDisplayMode } from '../../editor/SchemaDiffView'
import { FullScreenModeWrapper } from '../../../styles/layout/drawer.styles'
import type { DiffModeContentProps } from '../types'

/**
 * Diff 模式内容组件
 */
export const DiffModeContent: React.FC<DiffModeContentProps> = (props) => {
  const {
    attributes,
    contentType,
    canParse,
    toolbarButtons,
    toolbarActions,
    isFullScreenTransition,
    isInRecordingMode,
    snapshots,
    originalValue,
    repairOriginalValue,
    pendingRepairedValue,
    editorValue,
    editorProps,
    onApplyRepair,
    onCancelRepair,
  } = props

  /** Diff 显示模式（内部状态） */
  const [diffDisplayMode, setDiffDisplayMode] = useState<DiffDisplayMode>('raw')

  return (
    <FullScreenModeWrapper key="diff" $animate={isFullScreenTransition}>
      <DrawerToolbar
        attributes={attributes}
        contentType={contentType}
        canParse={canParse}
        toolbarButtons={toolbarButtons}
        isDiffMode={true}
        diffDisplayMode={diffDisplayMode}
        onDiffDisplayModeChange={setDiffDisplayMode}
        onFormat={toolbarActions.onFormat}
        onEscape={toolbarActions.onEscape}
        onUnescape={toolbarActions.onUnescape}
        onCompact={toolbarActions.onCompact}
        onParse={toolbarActions.onParse}
        onSegmentChange={toolbarActions.onSegmentChange}
        onExitDiffMode={toolbarActions.onExitDiffMode}
        hasPendingRepair={!!pendingRepairedValue}
        onApplyRepair={onApplyRepair}
        onCancelRepair={onCancelRepair}
      />
      <SchemaDiffView
        snapshots={
          isInRecordingMode
            ? snapshots
            : [
                {
                  id: 1,
                  content: repairOriginalValue || originalValue,
                  timestamp: 0,
                },
                {
                  id: 2,
                  content: pendingRepairedValue || editorValue,
                  timestamp: 1,
                },
              ]
        }
        displayMode={diffDisplayMode}
        theme={editorProps.editorTheme}
      />
    </FullScreenModeWrapper>
  )
}
