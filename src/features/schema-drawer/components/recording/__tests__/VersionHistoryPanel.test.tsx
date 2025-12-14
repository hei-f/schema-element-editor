/**
 * VersionHistoryPanel 组件单元测试
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VersionHistoryPanel } from '../VersionHistoryPanel'
import type { SchemaSnapshot } from '@/shared/types'

// Mock styled components
vi.mock('../../../styles/recording/recording.styles', () => ({
  RecordingPanelContainer: ({ children }: any) => (
    <div data-testid="recording-panel-container">{children}</div>
  ),
  PanelHeader: ({ children }: any) => <div data-testid="panel-header">{children}</div>,
  VersionListContainer: ({ children }: any) => (
    <div data-testid="version-list-container">{children}</div>
  ),
  EmptyState: ({ children }: any) => <div data-testid="empty-state">{children}</div>,
  VersionItem: ({ children, onClick, $isActive }: any) => (
    <div
      data-testid="version-item"
      onClick={onClick}
      data-is-active={String($isActive)}
      role="button"
    >
      {children}
    </div>
  ),
  VersionInfo: ({ children }: any) => <div data-testid="version-info">{children}</div>,
  VersionNumber: ({ children, $isActive }: any) => (
    <div data-testid="version-number" data-is-active={String($isActive)}>
      {children}
    </div>
  ),
  VersionTimestamp: ({ children }: any) => <div data-testid="version-timestamp">{children}</div>,
}))

describe('VersionHistoryPanel', () => {
  const createProps = (overrides?: any) => ({
    isRecording: false,
    snapshots: [] as SchemaSnapshot[],
    selectedSnapshotId: null,
    onSelectSnapshot: vi.fn(),
    ...overrides,
  })

  describe('基本渲染', () => {
    it('应该正确渲染面板结构', () => {
      const props = createProps()
      render(<VersionHistoryPanel {...props} />)

      expect(screen.getByTestId('recording-panel-container')).toBeInTheDocument()
      expect(screen.getByTestId('panel-header')).toBeInTheDocument()
      expect(screen.getByTestId('panel-header')).toHaveTextContent('版本历史')
      expect(screen.getByTestId('version-list-container')).toBeInTheDocument()
    })
  })

  describe('空状态显示', () => {
    it('录制中且无快照时应该显示"等待数据变化..."', () => {
      const props = createProps({
        isRecording: true,
        snapshots: [],
      })
      render(<VersionHistoryPanel {...props} />)

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByTestId('empty-state')).toHaveTextContent('等待数据变化...')
    })

    it('停止录制且无快照时应该显示"暂无录制数据"', () => {
      const props = createProps({
        isRecording: false,
        snapshots: [],
      })
      render(<VersionHistoryPanel {...props} />)

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByTestId('empty-state')).toHaveTextContent('暂无录制数据')
    })
  })

  describe('快照列表显示', () => {
    const mockSnapshots: SchemaSnapshot[] = [
      { id: 1, content: '{}', timestamp: 500 },
      { id: 2, content: '{"a": 1}', timestamp: 1500 },
      { id: 3, content: '{"a": 1, "b": 2}', timestamp: 65000 },
    ]

    it('应该渲染所有快照', () => {
      const props = createProps({
        snapshots: mockSnapshots,
      })
      render(<VersionHistoryPanel {...props} />)

      const versionItems = screen.getAllByTestId('version-item')
      expect(versionItems).toHaveLength(3)
    })

    it('应该显示正确的版本号', () => {
      const props = createProps({
        snapshots: mockSnapshots,
      })
      render(<VersionHistoryPanel {...props} />)

      const versionNumbers = screen.getAllByTestId('version-number')
      expect(versionNumbers[0]).toHaveTextContent('版本 1')
      expect(versionNumbers[1]).toHaveTextContent('版本 2')
      expect(versionNumbers[2]).toHaveTextContent('版本 3')
    })

    it('应该格式化毫秒时间戳（小于1秒）', () => {
      const props = createProps({
        snapshots: mockSnapshots,
      })
      render(<VersionHistoryPanel {...props} />)

      const timestamps = screen.getAllByTestId('version-timestamp')
      expect(timestamps[0]).toHaveTextContent('500ms')
    })

    it('应该格式化秒时间戳（大于等于1秒）', () => {
      const props = createProps({
        snapshots: mockSnapshots,
      })
      render(<VersionHistoryPanel {...props} />)

      const timestamps = screen.getAllByTestId('version-timestamp')
      expect(timestamps[1]).toHaveTextContent('1.5s')
      expect(timestamps[2]).toHaveTextContent('65.0s')
    })

    it('应该渲染单个快照', () => {
      const props = createProps({
        snapshots: [mockSnapshots[0]],
      })
      render(<VersionHistoryPanel {...props} />)

      const versionItems = screen.getAllByTestId('version-item')
      expect(versionItems).toHaveLength(1)
      expect(screen.getByTestId('version-number')).toHaveTextContent('版本 1')
    })
  })

  describe('快照选中状态', () => {
    const mockSnapshots: SchemaSnapshot[] = [
      { id: 1, content: '{}', timestamp: 1000 },
      { id: 2, content: '{"a": 1}', timestamp: 2000 },
      { id: 3, content: '{"a": 1, "b": 2}', timestamp: 3000 },
    ]

    it('selectedSnapshotId 为 null 时所有快照都不应该被选中', () => {
      const props = createProps({
        snapshots: mockSnapshots,
        selectedSnapshotId: null,
      })
      render(<VersionHistoryPanel {...props} />)

      const versionItems = screen.getAllByTestId('version-item')
      versionItems.forEach((item) => {
        expect(item).toHaveAttribute('data-is-active', 'false')
      })
    })

    it('应该高亮选中的快照', () => {
      const props = createProps({
        snapshots: mockSnapshots,
        selectedSnapshotId: 2,
      })
      render(<VersionHistoryPanel {...props} />)

      const versionItems = screen.getAllByTestId('version-item')
      expect(versionItems[0]).toHaveAttribute('data-is-active', 'false')
      expect(versionItems[1]).toHaveAttribute('data-is-active', 'true')
      expect(versionItems[2]).toHaveAttribute('data-is-active', 'false')

      const versionNumbers = screen.getAllByTestId('version-number')
      expect(versionNumbers[0]).toHaveAttribute('data-is-active', 'false')
      expect(versionNumbers[1]).toHaveAttribute('data-is-active', 'true')
      expect(versionNumbers[2]).toHaveAttribute('data-is-active', 'false')
    })

    it('应该能够选中第一个快照', () => {
      const props = createProps({
        snapshots: mockSnapshots,
        selectedSnapshotId: 1,
      })
      render(<VersionHistoryPanel {...props} />)

      const versionItems = screen.getAllByTestId('version-item')
      expect(versionItems[0]).toHaveAttribute('data-is-active', 'true')
    })

    it('应该能够选中最后一个快照', () => {
      const props = createProps({
        snapshots: mockSnapshots,
        selectedSnapshotId: 3,
      })
      render(<VersionHistoryPanel {...props} />)

      const versionItems = screen.getAllByTestId('version-item')
      expect(versionItems[2]).toHaveAttribute('data-is-active', 'true')
    })
  })

  describe('快照选择交互', () => {
    const mockSnapshots: SchemaSnapshot[] = [
      { id: 1, content: '{}', timestamp: 1000 },
      { id: 2, content: '{"a": 1}', timestamp: 2000 },
    ]

    it('点击快照应该调用 onSelectSnapshot 并传递正确的 id', () => {
      const onSelectSnapshot = vi.fn()
      const props = createProps({
        snapshots: mockSnapshots,
        onSelectSnapshot,
      })
      render(<VersionHistoryPanel {...props} />)

      const versionItems = screen.getAllByTestId('version-item')
      fireEvent.click(versionItems[0])

      expect(onSelectSnapshot).toHaveBeenCalledWith(1)
      expect(onSelectSnapshot).toHaveBeenCalledTimes(1)
    })

    it('点击不同的快照应该传递不同的 id', () => {
      const onSelectSnapshot = vi.fn()
      const props = createProps({
        snapshots: mockSnapshots,
        onSelectSnapshot,
      })
      render(<VersionHistoryPanel {...props} />)

      const versionItems = screen.getAllByTestId('version-item')
      fireEvent.click(versionItems[1])

      expect(onSelectSnapshot).toHaveBeenCalledWith(2)
    })

    it('多次点击应该多次调用 onSelectSnapshot', () => {
      const onSelectSnapshot = vi.fn()
      const props = createProps({
        snapshots: mockSnapshots,
        onSelectSnapshot,
      })
      render(<VersionHistoryPanel {...props} />)

      const versionItems = screen.getAllByTestId('version-item')
      fireEvent.click(versionItems[0])
      fireEvent.click(versionItems[1])
      fireEvent.click(versionItems[0])

      expect(onSelectSnapshot).toHaveBeenCalledTimes(3)
      expect(onSelectSnapshot).toHaveBeenNthCalledWith(1, 1)
      expect(onSelectSnapshot).toHaveBeenNthCalledWith(2, 2)
      expect(onSelectSnapshot).toHaveBeenNthCalledWith(3, 1)
    })
  })

  describe('录制状态与快照组合', () => {
    it('录制中且有快照时应该显示快照列表', () => {
      const mockSnapshots: SchemaSnapshot[] = [{ id: 1, content: '{}', timestamp: 1000 }]

      const props = createProps({
        isRecording: true,
        snapshots: mockSnapshots,
      })
      render(<VersionHistoryPanel {...props} />)

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
      expect(screen.getByTestId('version-item')).toBeInTheDocument()
    })

    it('停止录制且有快照时应该显示快照列表', () => {
      const mockSnapshots: SchemaSnapshot[] = [{ id: 1, content: '{}', timestamp: 1000 }]

      const props = createProps({
        isRecording: false,
        snapshots: mockSnapshots,
      })
      render(<VersionHistoryPanel {...props} />)

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
      expect(screen.getByTestId('version-item')).toBeInTheDocument()
    })
  })

  describe('时间戳格式化边界测试', () => {
    it('应该正确格式化 0ms', () => {
      const props = createProps({
        snapshots: [{ id: 1, content: '{}', timestamp: 0 }],
      })
      render(<VersionHistoryPanel {...props} />)

      expect(screen.getByTestId('version-timestamp')).toHaveTextContent('0ms')
    })

    it('应该正确格式化 999ms', () => {
      const props = createProps({
        snapshots: [{ id: 1, content: '{}', timestamp: 999 }],
      })
      render(<VersionHistoryPanel {...props} />)

      expect(screen.getByTestId('version-timestamp')).toHaveTextContent('999ms')
    })

    it('应该正确格式化 1000ms (1.0s)', () => {
      const props = createProps({
        snapshots: [{ id: 1, content: '{}', timestamp: 1000 }],
      })
      render(<VersionHistoryPanel {...props} />)

      expect(screen.getByTestId('version-timestamp')).toHaveTextContent('1.0s')
    })

    it('应该正确格式化大时间戳', () => {
      const props = createProps({
        snapshots: [{ id: 1, content: '{}', timestamp: 123456 }],
      })
      render(<VersionHistoryPanel {...props} />)

      expect(screen.getByTestId('version-timestamp')).toHaveTextContent('123.5s')
    })
  })
})
