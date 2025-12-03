import React from 'react'
import { RecordingPanel } from '../../recording/RecordingPanel'
import { DrawerToolbar } from '../../toolbar/DrawerToolbar'
import { EditorSection } from '../shared'
import type { RecordingModeContentProps } from '../types'

/**
 * 录制模式内容组件
 */
export const RecordingModeContent: React.FC<RecordingModeContentProps> = (props) => {
  const {
    attributes,
    contentType,
    canParse,
    toolbarButtons,
    toolbarActions,
    editorProps,
    notificationProps,
    isRecording,
    snapshots,
    selectedSnapshotId,
    previewEnabled,
    onStopRecording,
    onSelectSnapshot,
    onEnterDiffMode,
  } = props

  return (
    <RecordingPanel
      isRecording={isRecording}
      snapshots={snapshots}
      selectedSnapshotId={selectedSnapshotId}
      onStopRecording={onStopRecording}
      onSelectSnapshot={onSelectSnapshot}
      onEnterDiffMode={onEnterDiffMode}
    >
      <DrawerToolbar
        attributes={attributes}
        contentType={contentType}
        canParse={canParse}
        toolbarButtons={toolbarButtons}
        previewEnabled={previewEnabled}
        isRecording={isRecording}
        onFormat={toolbarActions.onFormat}
        onEscape={toolbarActions.onEscape}
        onUnescape={toolbarActions.onUnescape}
        onCompact={toolbarActions.onCompact}
        onParse={toolbarActions.onParse}
        onSegmentChange={toolbarActions.onSegmentChange}
        onRenderPreview={toolbarActions.onRenderPreview}
        onLocateError={toolbarActions.onLocateError}
        onRepairJson={toolbarActions.onRepairJson}
      />
      <EditorSection editorProps={editorProps} notificationProps={notificationProps} />
    </RecordingPanel>
  )
}
