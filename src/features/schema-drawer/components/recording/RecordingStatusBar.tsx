import type { SchemaSnapshot } from '@/shared/types'
import { DiffOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import React from 'react'
import {
  DiffButton,
  RecordingIndicator,
  RecordingStatusBar as StyledRecordingStatusBar,
  RecordingStatusLeft,
  StopRecordingButton,
  VersionCount,
} from '../../styles/recording/recording.styles'

interface RecordingStatusBarProps {
  /** 是否正在录制 */
  isRecording: boolean
  /** 快照列表 */
  snapshots: SchemaSnapshot[]
  /** 停止录制回调 */
  onStopRecording: () => void
  /** 进入Diff模式回调 */
  onEnterDiffMode: () => void
}

/**
 * 录制状态栏组件
 * 显示录制状态、版本计数和操作按钮
 */
export const RecordingStatusBar: React.FC<RecordingStatusBarProps> = (props) => {
  const { isRecording, snapshots, onStopRecording, onEnterDiffMode } = props

  const canDiff = !isRecording && snapshots.length >= 2

  return (
    <StyledRecordingStatusBar>
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
    </StyledRecordingStatusBar>
  )
}
