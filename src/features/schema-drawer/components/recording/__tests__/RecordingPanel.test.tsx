/**
 * RecordingPanel 组件单元测试
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RecordingPanel } from '../RecordingPanel'
import type { SchemaSnapshot } from '@/shared/types'

// Mock styled-components
vi.mock('../../../styles/recording/recording.styles', () => ({
  RecordingModeContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recording-mode-container">{children}</div>
  ),
  RecordingStatusBar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recording-status-bar">{children}</div>
  ),
  RecordingStatusLeft: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recording-status-left">{children}</div>
  ),
  RecordingIndicator: ({
    children,
    $isRecording,
  }: {
    children: React.ReactNode
    $isRecording: boolean
  }) => (
    <span data-testid="recording-indicator" data-is-recording={$isRecording}>
      {children}
    </span>
  ),
  VersionCount: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="version-count">{children}</span>
  ),
  StopRecordingButton: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick: () => void
  }) => (
    <button data-testid="stop-recording-btn" onClick={onClick}>
      {children}
    </button>
  ),
  DiffButton: ({
    children,
    onClick,
    $disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    $disabled: boolean
  }) => (
    <button data-testid="diff-btn" onClick={onClick} disabled={$disabled}>
      {children}
    </button>
  ),
  RecordingContentArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recording-content-area">{children}</div>
  ),
  RecordingPanelContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recording-panel-container">{children}</div>
  ),
  PanelHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="panel-header">{children}</div>
  ),
  VersionListContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="version-list-container">{children}</div>
  ),
  EmptyState: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="empty-state">{children}</div>
  ),
  VersionItem: ({
    children,
    onClick,
    $isActive,
  }: {
    children: React.ReactNode
    onClick: () => void
    $isActive: boolean
  }) => (
    <div data-testid="version-item" onClick={onClick} data-is-active={$isActive}>
      {children}
    </div>
  ),
  VersionInfo: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="version-info">{children}</div>
  ),
  VersionNumber: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="version-number">{children}</span>
  ),
  VersionTimestamp: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="version-timestamp">{children}</span>
  ),
  RecordingEditorArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recording-editor-area">{children}</div>
  ),
}))

// Mock antd components
vi.mock('antd', () => ({
  Tooltip: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="tooltip" data-title={title}>
      {children}
    </div>
  ),
}))

// Mock ant-design icons
vi.mock('@ant-design/icons', () => ({
  DiffOutlined: () => <span data-testid="diff-icon">DiffIcon</span>,
  PauseCircleOutlined: () => <span data-testid="pause-icon">PauseIcon</span>,
}))

describe('RecordingPanel', () => {
  const defaultProps = {
    isRecording: false,
    snapshots: [] as SchemaSnapshot[],
    selectedSnapshotId: null,
    onStopRecording: vi.fn(),
    onSelectSnapshot: vi.fn(),
    onEnterDiffMode: vi.fn(),
    children: <div data-testid="editor-content">编辑器内容</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('渲染测试', () => {
    it('应该正确渲染基本结构', () => {
      render(<RecordingPanel {...defaultProps} />)

      expect(screen.getByTestId('recording-mode-container')).toBeInTheDocument()
      expect(screen.getByTestId('recording-status-bar')).toBeInTheDocument()
      expect(screen.getByTestId('recording-content-area')).toBeInTheDocument()
      expect(screen.getByTestId('panel-header')).toHaveTextContent('版本历史')
    })

    it('应该渲染子组件（编辑器内容）', () => {
      render(<RecordingPanel {...defaultProps} />)

      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('应该显示版本计数', () => {
      render(<RecordingPanel {...defaultProps} />)

      expect(screen.getByTestId('version-count')).toHaveTextContent('已记录 0 个版本')
    })
  })

  describe('录制状态显示', () => {
    it('录制中应该显示"录制中"状态', () => {
      render(<RecordingPanel {...defaultProps} isRecording={true} />)

      const indicator = screen.getByTestId('recording-indicator')
      expect(indicator).toHaveTextContent('录制中')
      expect(indicator).toHaveAttribute('data-is-recording', 'true')
    })

    it('停止录制应该显示"已停止"状态', () => {
      render(<RecordingPanel {...defaultProps} isRecording={false} />)

      const indicator = screen.getByTestId('recording-indicator')
      expect(indicator).toHaveTextContent('已停止')
      expect(indicator).toHaveAttribute('data-is-recording', 'false')
    })

    it('录制中应该显示停止按钮', () => {
      render(<RecordingPanel {...defaultProps} isRecording={true} />)

      expect(screen.getByTestId('stop-recording-btn')).toBeInTheDocument()
      expect(screen.getByTestId('pause-icon')).toBeInTheDocument()
    })

    it('停止录制后应该显示版本对比按钮', () => {
      render(<RecordingPanel {...defaultProps} isRecording={false} />)

      expect(screen.getByTestId('diff-btn')).toBeInTheDocument()
      expect(screen.getByTestId('diff-icon')).toBeInTheDocument()
    })
  })

  describe('空状态显示', () => {
    it('录制中无数据时应该显示"等待数据变化..."', () => {
      render(<RecordingPanel {...defaultProps} isRecording={true} snapshots={[]} />)

      expect(screen.getByTestId('empty-state')).toHaveTextContent('等待数据变化...')
    })

    it('停止录制且无数据时应该显示"暂无录制数据"', () => {
      render(<RecordingPanel {...defaultProps} isRecording={false} snapshots={[]} />)

      expect(screen.getByTestId('empty-state')).toHaveTextContent('暂无录制数据')
    })
  })

  describe('快照列表显示', () => {
    const mockSnapshots: SchemaSnapshot[] = [
      { id: 1, content: '{}', timestamp: 500 },
      { id: 2, content: '{"type": "paragraph"}', timestamp: 1500 },
      { id: 3, content: '{"type": "code"}', timestamp: 65000 },
    ]

    it('应该显示所有快照', () => {
      render(<RecordingPanel {...defaultProps} snapshots={mockSnapshots} />)

      const versionItems = screen.getAllByTestId('version-item')
      expect(versionItems).toHaveLength(3)
    })

    it('应该显示正确的版本号', () => {
      render(<RecordingPanel {...defaultProps} snapshots={mockSnapshots} />)

      const versionNumbers = screen.getAllByTestId('version-number')
      expect(versionNumbers[0]).toHaveTextContent('版本 1')
      expect(versionNumbers[1]).toHaveTextContent('版本 2')
      expect(versionNumbers[2]).toHaveTextContent('版本 3')
    })

    it('应该格式化毫秒时间戳（小于1秒）', () => {
      render(<RecordingPanel {...defaultProps} snapshots={mockSnapshots} />)

      const timestamps = screen.getAllByTestId('version-timestamp')
      expect(timestamps[0]).toHaveTextContent('500ms')
    })

    it('应该格式化秒时间戳（大于等于1秒）', () => {
      render(<RecordingPanel {...defaultProps} snapshots={mockSnapshots} />)

      const timestamps = screen.getAllByTestId('version-timestamp')
      expect(timestamps[1]).toHaveTextContent('1.5s')
      expect(timestamps[2]).toHaveTextContent('65.0s')
    })

    it('应该高亮选中的快照', () => {
      render(<RecordingPanel {...defaultProps} snapshots={mockSnapshots} selectedSnapshotId={2} />)

      const versionItems = screen.getAllByTestId('version-item')
      expect(versionItems[0]).toHaveAttribute('data-is-active', 'false')
      expect(versionItems[1]).toHaveAttribute('data-is-active', 'true')
      expect(versionItems[2]).toHaveAttribute('data-is-active', 'false')
    })

    it('应该显示正确的版本计数', () => {
      render(<RecordingPanel {...defaultProps} snapshots={mockSnapshots} />)

      expect(screen.getByTestId('version-count')).toHaveTextContent('已记录 3 个版本')
    })
  })

  describe('交互测试', () => {
    const mockSnapshots: SchemaSnapshot[] = [
      { id: 1, content: '{}', timestamp: 500 },
      { id: 2, content: '{"type": "paragraph"}', timestamp: 1500 },
    ]

    it('点击停止按钮应该触发 onStopRecording', () => {
      const onStopRecording = vi.fn()
      render(
        <RecordingPanel {...defaultProps} isRecording={true} onStopRecording={onStopRecording} />
      )

      fireEvent.click(screen.getByTestId('stop-recording-btn'))

      expect(onStopRecording).toHaveBeenCalledTimes(1)
    })

    it('点击快照应该触发 onSelectSnapshot', () => {
      const onSelectSnapshot = vi.fn()
      render(
        <RecordingPanel
          {...defaultProps}
          snapshots={mockSnapshots}
          onSelectSnapshot={onSelectSnapshot}
        />
      )

      const versionItems = screen.getAllByTestId('version-item')
      fireEvent.click(versionItems[1])

      expect(onSelectSnapshot).toHaveBeenCalledWith(2)
    })

    it('点击版本对比按钮应该触发 onEnterDiffMode（当有足够快照时）', () => {
      const onEnterDiffMode = vi.fn()
      render(
        <RecordingPanel
          {...defaultProps}
          isRecording={false}
          snapshots={mockSnapshots}
          onEnterDiffMode={onEnterDiffMode}
        />
      )

      const diffBtn = screen.getByTestId('diff-btn')
      expect(diffBtn).not.toBeDisabled()

      fireEvent.click(diffBtn)

      expect(onEnterDiffMode).toHaveBeenCalledTimes(1)
    })

    it('快照不足2个时版本对比按钮应该禁用', () => {
      const onEnterDiffMode = vi.fn()
      render(
        <RecordingPanel
          {...defaultProps}
          isRecording={false}
          snapshots={[{ id: 1, content: '{}', timestamp: 500 }]}
          onEnterDiffMode={onEnterDiffMode}
        />
      )

      const diffBtn = screen.getByTestId('diff-btn')
      expect(diffBtn).toBeDisabled()

      fireEvent.click(diffBtn)

      expect(onEnterDiffMode).not.toHaveBeenCalled()
    })

    it('录制中时不应该显示版本对比按钮', () => {
      render(<RecordingPanel {...defaultProps} isRecording={true} snapshots={mockSnapshots} />)

      expect(screen.queryByTestId('diff-btn')).not.toBeInTheDocument()
      expect(screen.getByTestId('stop-recording-btn')).toBeInTheDocument()
    })
  })

  describe('Tooltip 提示', () => {
    it('快照不足时应该显示提示信息', () => {
      render(
        <RecordingPanel
          {...defaultProps}
          isRecording={false}
          snapshots={[{ id: 1, content: '{}', timestamp: 500 }]}
        />
      )

      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toHaveAttribute('data-title', '需要至少2个版本才能进行对比')
    })

    it('快照足够时应该显示正常提示', () => {
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 1, content: '{}', timestamp: 500 },
        { id: 2, content: '{"type": "paragraph"}', timestamp: 1500 },
      ]
      render(<RecordingPanel {...defaultProps} isRecording={false} snapshots={mockSnapshots} />)

      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toHaveAttribute('data-title', '对比不同版本')
    })
  })
})
