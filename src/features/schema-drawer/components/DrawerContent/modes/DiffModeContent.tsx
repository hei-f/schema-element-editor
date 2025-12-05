import React from 'react'
import { SchemaDiffView, type DiffDisplayMode } from '../../editor/SchemaDiffView'
import { FullScreenModeWrapper } from '../../../styles/layout/drawer.styles'
import type { DiffModeContentProps } from '../types'

/**
 * Diff 模式内容组件
 * 工具栏由父组件统一管理，此组件仅渲染 Diff 视图
 */
export const DiffModeContent: React.FC<DiffModeContentProps> = (props) => {
  const {
    isFullScreenTransition,
    isInRecordingMode,
    snapshots,
    originalValue,
    repairOriginalValue,
    pendingRepairedValue,
    editorValue,
    editorProps,
    diffDisplayMode,
  } = props

  return (
    <FullScreenModeWrapper key="diff" $animate={isFullScreenTransition}>
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
        displayMode={diffDisplayMode as DiffDisplayMode}
        theme={editorProps.editorTheme}
      />
    </FullScreenModeWrapper>
  )
}
