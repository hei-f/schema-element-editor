import React from 'react'
import { RecordingPanel } from '../../recording/RecordingPanel'
import { EditorSection } from '../shared'
import type { RecordingModeContentProps } from '../types'

/**
 * 录制模式内容组件
 * 状态栏和工具栏由父组件统一管理，此组件渲染版本列表面板和编辑器
 */
export const RecordingModeContent: React.FC<RecordingModeContentProps> = (props) => {
  const {
    editorProps,
    notificationProps,
    isRecording,
    snapshots,
    selectedSnapshotId,
    onSelectSnapshot,
  } = props

  return (
    <RecordingPanel
      isRecording={isRecording}
      snapshots={snapshots}
      selectedSnapshotId={selectedSnapshotId}
      onSelectSnapshot={onSelectSnapshot}
    >
      <EditorSection editorProps={editorProps} notificationProps={notificationProps} />
    </RecordingPanel>
  )
}
