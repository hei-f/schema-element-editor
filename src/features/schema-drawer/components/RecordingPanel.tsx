import type { SchemaSnapshot } from '@/shared/types'
import { DiffOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import React from 'react'
import {
  DiffButton,
  EmptyState,
  PanelHeader,
  RecordingContentArea,
  RecordingEditorArea,
  RecordingIndicator,
  RecordingModeContainer,
  RecordingPanelContainer,
  RecordingStatusBar,
  RecordingStatusLeft,
  StopRecordingButton,
  VersionCount,
  VersionInfo,
  VersionItem,
  VersionListContainer,
  VersionNumber,
  VersionTimestamp,
} from '../styles/recording.styles'

interface RecordingPanelProps {
  /** 是否正在录制 */
  isRecording: boolean
  /** 快照列表 */
  snapshots: SchemaSnapshot[]
  /** 当前选中的快照ID */
  selectedSnapshotId: number | null
  /** 停止录制回调 */
  onStopRecording: () => void
  /** 选择快照回调 */
  onSelectSnapshot: (id: number) => void
  /** 进入Diff模式回调 */
  onEnterDiffMode: () => void
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
 * 包含：状态栏、版本列表、编辑器区域
 */
export const RecordingPanel: React.FC<RecordingPanelProps> = (props) => {
  const {
    isRecording,
    snapshots,
    selectedSnapshotId,
    onStopRecording,
    onSelectSnapshot,
    onEnterDiffMode,
    children,
  } = props

  const canDiff = !isRecording && snapshots.length >= 2

  return (
    <RecordingModeContainer>
      {/* 状态栏 */}
      <RecordingStatusBar>
        <RecordingStatusLeft>
          <RecordingIndicator $isRecording={isRecording}>
            {isRecording ? '录制中' : '已停止'}
          </RecordingIndicator>
          <VersionCount>已记录 {snapshots.length} 个版本</VersionCount>
        </RecordingStatusLeft>

        <div style={{ display: 'flex', gap: 8 }}>
          {isRecording ? (
            <StopRecordingButton onClick={onStopRecording}>
              <PauseCircleOutlined />
              停止录制
            </StopRecordingButton>
          ) : (
            <Tooltip title={snapshots.length < 2 ? '需要至少2个版本才能进行对比' : '对比不同版本'}>
              <DiffButton $disabled={!canDiff} onClick={canDiff ? onEnterDiffMode : undefined}>
                <DiffOutlined />
                版本对比
              </DiffButton>
            </Tooltip>
          )}
        </div>
      </RecordingStatusBar>

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
                    <VersionNumber>版本 {index + 1}</VersionNumber>
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
