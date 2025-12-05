import type { SchemaSnapshot } from '@/shared/types'
import React from 'react'
import {
  EmptyState,
  PanelHeader,
  RecordingPanelContainer,
  VersionInfo,
  VersionItem,
  VersionListContainer,
  VersionNumber,
  VersionTimestamp,
} from '../../styles/recording/recording.styles'

interface VersionHistoryPanelProps {
  /** 是否正在录制 */
  isRecording: boolean
  /** 快照列表 */
  snapshots: SchemaSnapshot[]
  /** 当前选中的快照ID */
  selectedSnapshotId: number | null
  /** 选择快照回调 */
  onSelectSnapshot: (id: number) => void
}

/**
 * 格式化时间戳（毫秒）
 */
function formatTimestamp(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  const seconds = (ms / 1000).toFixed(1)
  return `${seconds}s`
}

/**
 * 版本历史面板组件
 * 显示录制的快照列表，支持选择快照
 */
export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = (props) => {
  const { isRecording, snapshots, selectedSnapshotId, onSelectSnapshot } = props

  return (
    <RecordingPanelContainer>
      <PanelHeader>版本历史</PanelHeader>

      <VersionListContainer>
        {snapshots.length === 0 ? (
          <EmptyState>{isRecording ? '等待数据变化...' : '暂无录制数据'}</EmptyState>
        ) : (
          snapshots.map((snapshot, index) => (
            <VersionItem
              key={snapshot.id}
              $isActive={snapshot.id === selectedSnapshotId}
              onClick={() => onSelectSnapshot(snapshot.id)}
            >
              <VersionInfo>
                <VersionNumber $isActive={snapshot.id === selectedSnapshotId}>
                  版本 {index + 1}
                </VersionNumber>
                <VersionTimestamp>{formatTimestamp(snapshot.timestamp)}</VersionTimestamp>
              </VersionInfo>
            </VersionItem>
          ))
        )}
      </VersionListContainer>
    </RecordingPanelContainer>
  )
}
