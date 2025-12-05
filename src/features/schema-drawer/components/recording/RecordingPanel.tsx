import type { SchemaSnapshot } from '@/shared/types'
import React from 'react'
import {
  EmptyState,
  PanelHeader,
  RecordingContentArea,
  RecordingEditorArea,
  RecordingModeContainer,
  RecordingPanelContainer,
  VersionInfo,
  VersionItem,
  VersionListContainer,
  VersionNumber,
  VersionTimestamp,
} from '../../styles/recording/recording.styles'

interface RecordingPanelProps {
  /** 是否正在录制 */
  isRecording: boolean
  /** 快照列表 */
  snapshots: SchemaSnapshot[]
  /** 当前选中的快照ID */
  selectedSnapshotId: number | null
  /** 选择快照回调 */
  onSelectSnapshot: (id: number) => void
  /** 编辑器内容（children） */
  children: React.ReactNode
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
 * 录制面板组件
 * 包含：版本列表 + 编辑器区域
 * 状态栏已提升到 DrawerContent 层级统一管理
 */
export const RecordingPanel: React.FC<RecordingPanelProps> = (props) => {
  const { isRecording, snapshots, selectedSnapshotId, onSelectSnapshot, children } = props

  return (
    <RecordingModeContainer>
      {/* 内容区域：左侧面板 + 右侧编辑器 */}
      <RecordingContentArea>
        {/* 左侧录制面板 */}
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

        {/* 右侧编辑器区域 */}
        <RecordingEditorArea>{children}</RecordingEditorArea>
      </RecordingContentArea>
    </RecordingModeContainer>
  )
}
