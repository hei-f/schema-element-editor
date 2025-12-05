/**
 * RecordingPanel 组件单元测试
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RecordingPanel } from '../RecordingPanel'
import type { SchemaSnapshot } from '@/shared/types'

// Mock styled-components
// 注意：状态栏已提升到 DrawerContent，RecordingPanel 只包含版本列表和编辑器
vi.mock('../../../styles/recording/recording.styles', () => ({
  RecordingModeContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recording-mode-container">{children}</div>
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
  VersionNumber: ({ children, $isActive }: { children: React.ReactNode; $isActive?: boolean }) => (
    <span data-testid="version-number" data-is-active={$isActive}>
      {children}
    </span>
  ),
  VersionTimestamp: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="version-timestamp">{children}</span>
  ),
  RecordingEditorArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recording-editor-area">{children}</div>
  ),
}))

describe('RecordingPanel', () => {
  // 状态栏已提升到 DrawerContent，RecordingPanel 只包含版本列表和编辑器
  const defaultProps = {
    isRecording: false,
    snapshots: [] as SchemaSnapshot[],
    selectedSnapshotId: null,
    onSelectSnapshot: vi.fn(),
    children: <div data-testid="editor-content">编辑器内容</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('渲染测试', () => {
    it('应该正确渲染基本结构', () => {
      render(<RecordingPanel {...defaultProps} />)

      expect(screen.getByTestId('recording-mode-container')).toBeInTheDocument()
      expect(screen.getByTestId('recording-content-area')).toBeInTheDocument()
      expect(screen.getByTestId('panel-header')).toHaveTextContent('版本历史')
    })

    it('应该渲染子组件（编辑器内容）', () => {
      render(<RecordingPanel {...defaultProps} />)

      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('应该渲染工具栏内容', () => {
      render(<RecordingPanel {...defaultProps} />)

      expect(screen.getByTestId('toolbar-content')).toBeInTheDocument()
    })

    it('应该显示版本计数', () => {
      render(<RecordingPanel {...defaultProps} />)

      expect(screen.getByTestId('version-count')).toHaveTextContent('已记录 0 个版本')
    })
  })

  // 注意：录制状态栏测试已移至 RecordingStatusBar.test.tsx

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

    // 注意：版本计数测试已移至 RecordingStatusBar.test.tsx
  })

  describe('交互测试', () => {
    const mockSnapshots: SchemaSnapshot[] = [
      { id: 1, content: '{}', timestamp: 500 },
      { id: 2, content: '{"type": "paragraph"}', timestamp: 1500 },
    ]

    // 注意：停止按钮测试已移至 RecordingStatusBar.test.tsx

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

    // 注意：版本对比按钮测试已移至 RecordingStatusBar.test.tsx
  })

  // 注意：Tooltip 提示测试已移至 RecordingStatusBar.test.tsx
})
