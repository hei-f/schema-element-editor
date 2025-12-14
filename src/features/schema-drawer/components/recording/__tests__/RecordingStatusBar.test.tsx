/**
 * RecordingStatusBar 组件单元测试
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RecordingStatusBar } from '../RecordingStatusBar'
import type { SchemaSnapshot } from '@/shared/types'

// Mock antd icons
vi.mock('@ant-design/icons', () => ({
  DiffOutlined: () => <span data-testid="diff-icon">Diff</span>,
  PauseCircleOutlined: () => <span data-testid="pause-icon">Pause</span>,
}))

// Mock antd Tooltip
vi.mock('antd', () => ({
  Tooltip: ({ children, title }: any) => (
    <div data-testid="tooltip" data-title={title}>
      {children}
    </div>
  ),
}))

// Mock styled components
vi.mock('../../../styles/recording/recording.styles', () => ({
  RecordingStatusBar: ({ children }: any) => (
    <div data-testid="recording-status-bar">{children}</div>
  ),
  RecordingStatusLeft: ({ children }: any) => (
    <div data-testid="recording-status-left">{children}</div>
  ),
  RecordingIndicator: ({ children, $isRecording }: any) => (
    <div data-testid="recording-indicator" data-is-recording={String($isRecording)}>
      {children}
    </div>
  ),
  VersionCount: ({ children }: any) => <div data-testid="version-count">{children}</div>,
  StopRecordingButton: ({ children, onClick }: any) => (
    <button data-testid="stop-recording-button" onClick={onClick}>
      {children}
    </button>
  ),
  DiffButton: ({ children, onClick, $disabled }: any) => (
    <button
      data-testid="diff-button"
      onClick={onClick}
      disabled={$disabled}
      data-disabled={String($disabled)}
    >
      {children}
    </button>
  ),
}))

describe('RecordingStatusBar', () => {
  const createProps = (overrides?: any) => ({
    isRecording: false,
    snapshots: [] as SchemaSnapshot[],
    onStopRecording: vi.fn(),
    onEnterDiffMode: vi.fn(),
    ...overrides,
  })

  describe('基本渲染', () => {
    it('应该正确渲染状态栏结构', () => {
      const props = createProps()
      render(<RecordingStatusBar {...props} />)

      expect(screen.getByTestId('recording-status-bar')).toBeInTheDocument()
      expect(screen.getByTestId('recording-status-left')).toBeInTheDocument()
      expect(screen.getByTestId('recording-indicator')).toBeInTheDocument()
      expect(screen.getByTestId('version-count')).toBeInTheDocument()
    })
  })

  describe('录制状态显示', () => {
    it('isRecording 为 true 时应该显示"录制中"', () => {
      const props = createProps({
        isRecording: true,
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.getByTestId('recording-indicator')).toHaveTextContent('录制中')
      expect(screen.getByTestId('recording-indicator')).toHaveAttribute('data-is-recording', 'true')
    })

    it('isRecording 为 false 时应该显示"已停止"', () => {
      const props = createProps({
        isRecording: false,
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.getByTestId('recording-indicator')).toHaveTextContent('已停止')
      expect(screen.getByTestId('recording-indicator')).toHaveAttribute(
        'data-is-recording',
        'false'
      )
    })
  })

  describe('版本计数显示', () => {
    it('应该显示快照数量为 0', () => {
      const props = createProps({
        snapshots: [],
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.getByTestId('version-count')).toHaveTextContent('已记录 0 个版本')
    })

    it('应该显示快照数量为 1', () => {
      const mockSnapshots: SchemaSnapshot[] = [{ id: 1, content: '{}', timestamp: 1000 }]

      const props = createProps({
        snapshots: mockSnapshots,
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.getByTestId('version-count')).toHaveTextContent('已记录 1 个版本')
    })

    it('应该显示快照数量为多个', () => {
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 1, content: '{}', timestamp: 1000 },
        { id: 2, content: '{"a": 1}', timestamp: 2000 },
        { id: 3, content: '{"a": 1, "b": 2}', timestamp: 3000 },
      ]

      const props = createProps({
        snapshots: mockSnapshots,
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.getByTestId('version-count')).toHaveTextContent('已记录 3 个版本')
    })
  })

  describe('停止录制按钮', () => {
    it('录制中时应该显示停止录制按钮', () => {
      const props = createProps({
        isRecording: true,
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.getByTestId('stop-recording-button')).toBeInTheDocument()
      expect(screen.getByTestId('stop-recording-button')).toHaveTextContent('停止录制')
      expect(screen.getByTestId('pause-icon')).toBeInTheDocument()
    })

    it('点击停止录制按钮应该调用 onStopRecording', () => {
      const onStopRecording = vi.fn()
      const props = createProps({
        isRecording: true,
        onStopRecording,
      })
      render(<RecordingStatusBar {...props} />)

      const stopBtn = screen.getByTestId('stop-recording-button')
      fireEvent.click(stopBtn)

      expect(onStopRecording).toHaveBeenCalledTimes(1)
    })

    it('停止录制后不应该显示停止录制按钮', () => {
      const props = createProps({
        isRecording: false,
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.queryByTestId('stop-recording-button')).not.toBeInTheDocument()
    })
  })

  describe('版本对比按钮', () => {
    it('停止录制后应该显示版本对比按钮', () => {
      const props = createProps({
        isRecording: false,
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.getByTestId('diff-button')).toBeInTheDocument()
      expect(screen.getByTestId('diff-button')).toHaveTextContent('版本对比')
      expect(screen.getByTestId('diff-icon')).toBeInTheDocument()
    })

    it('快照少于2个时版本对比按钮应该禁用', () => {
      const props = createProps({
        isRecording: false,
        snapshots: [{ id: 1, content: '{}', timestamp: 1000 }],
      })
      render(<RecordingStatusBar {...props} />)

      const diffBtn = screen.getByTestId('diff-button')
      expect(diffBtn).toHaveAttribute('data-disabled', 'true')
      expect(screen.getByTestId('tooltip')).toHaveAttribute(
        'data-title',
        '需要至少2个版本才能进行对比'
      )
    })

    it('快照为0个时版本对比按钮应该禁用', () => {
      const props = createProps({
        isRecording: false,
        snapshots: [],
      })
      render(<RecordingStatusBar {...props} />)

      const diffBtn = screen.getByTestId('diff-button')
      expect(diffBtn).toHaveAttribute('data-disabled', 'true')
    })

    it('快照至少2个时版本对比按钮应该启用', () => {
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 1, content: '{}', timestamp: 1000 },
        { id: 2, content: '{"a": 1}', timestamp: 2000 },
      ]

      const props = createProps({
        isRecording: false,
        snapshots: mockSnapshots,
      })
      render(<RecordingStatusBar {...props} />)

      const diffBtn = screen.getByTestId('diff-button')
      expect(diffBtn).toHaveAttribute('data-disabled', 'false')
      expect(screen.getByTestId('tooltip')).toHaveAttribute('data-title', '对比不同版本')
    })

    it('启用时点击版本对比按钮应该调用 onEnterDiffMode', () => {
      const onEnterDiffMode = vi.fn()
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 1, content: '{}', timestamp: 1000 },
        { id: 2, content: '{"a": 1}', timestamp: 2000 },
      ]

      const props = createProps({
        isRecording: false,
        snapshots: mockSnapshots,
        onEnterDiffMode,
      })
      render(<RecordingStatusBar {...props} />)

      const diffBtn = screen.getByTestId('diff-button')
      fireEvent.click(diffBtn)

      expect(onEnterDiffMode).toHaveBeenCalledTimes(1)
    })

    it('禁用时点击版本对比按钮不应该调用 onEnterDiffMode', () => {
      const onEnterDiffMode = vi.fn()
      const props = createProps({
        isRecording: false,
        snapshots: [{ id: 1, content: '{}', timestamp: 1000 }],
        onEnterDiffMode,
      })
      render(<RecordingStatusBar {...props} />)

      const diffBtn = screen.getByTestId('diff-button')
      fireEvent.click(diffBtn)

      expect(onEnterDiffMode).not.toHaveBeenCalled()
    })

    it('录制中时不应该显示版本对比按钮', () => {
      const props = createProps({
        isRecording: true,
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.queryByTestId('diff-button')).not.toBeInTheDocument()
    })
  })

  describe('组合场景', () => {
    it('录制中且有多个快照时应该显示正确的状态', () => {
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 1, content: '{}', timestamp: 1000 },
        { id: 2, content: '{"a": 1}', timestamp: 2000 },
      ]

      const props = createProps({
        isRecording: true,
        snapshots: mockSnapshots,
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.getByTestId('recording-indicator')).toHaveTextContent('录制中')
      expect(screen.getByTestId('version-count')).toHaveTextContent('已记录 2 个版本')
      expect(screen.getByTestId('stop-recording-button')).toBeInTheDocument()
      expect(screen.queryByTestId('diff-button')).not.toBeInTheDocument()
    })

    it('停止录制且有2个快照时应该可以进行版本对比', () => {
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 1, content: '{}', timestamp: 1000 },
        { id: 2, content: '{"a": 1}', timestamp: 2000 },
      ]

      const props = createProps({
        isRecording: false,
        snapshots: mockSnapshots,
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.getByTestId('recording-indicator')).toHaveTextContent('已停止')
      expect(screen.getByTestId('version-count')).toHaveTextContent('已记录 2 个版本')
      expect(screen.queryByTestId('stop-recording-button')).not.toBeInTheDocument()
      expect(screen.getByTestId('diff-button')).toHaveAttribute('data-disabled', 'false')
    })

    it('停止录制但快照不足时不应该可以进行版本对比', () => {
      const props = createProps({
        isRecording: false,
        snapshots: [{ id: 1, content: '{}', timestamp: 1000 }],
      })
      render(<RecordingStatusBar {...props} />)

      expect(screen.getByTestId('recording-indicator')).toHaveTextContent('已停止')
      expect(screen.getByTestId('version-count')).toHaveTextContent('已记录 1 个版本')
      expect(screen.getByTestId('diff-button')).toHaveAttribute('data-disabled', 'true')
    })
  })
})
