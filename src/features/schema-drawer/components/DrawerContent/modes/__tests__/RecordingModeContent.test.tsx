/**
 * RecordingModeContent 组件单元测试
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RecordingModeContent } from '../RecordingModeContent'
import { ContentType } from '@/shared/types'
import type { RecordingModeContentProps, BaseContentProps } from '../../types'
import type { SchemaSnapshot } from '@/shared/types'

// Mock RecordingPanel 组件
vi.mock('../../../recording/RecordingPanel', () => ({
  RecordingPanel: ({
    isRecording,
    snapshots,
    selectedSnapshotId,
    onSelectSnapshot,
    children,
  }: any) => (
    <div data-testid="recording-panel">
      <div data-testid="is-recording">{String(isRecording)}</div>
      <div data-testid="snapshots-count">{snapshots.length}</div>
      <div data-testid="selected-snapshot-id">{selectedSnapshotId ?? 'none'}</div>
      <button data-testid="select-snapshot-btn" onClick={() => onSelectSnapshot(1)}>
        Select Snapshot
      </button>
      <div data-testid="panel-children">{children}</div>
    </div>
  ),
}))

// Mock EditorSection 组件
vi.mock('../../shared', () => ({
  EditorSection: ({ editorProps, notificationProps }: any) => (
    <div data-testid="editor-section">
      <div data-testid="editor-value">{editorProps.editorValue}</div>
      <div data-testid="notifications-count">{notificationProps.lightNotifications.length}</div>
    </div>
  ),
}))

describe('RecordingModeContent', () => {
  const createBaseProps = (): BaseContentProps => ({
    attributes: { params: [] },
    contentType: ContentType.Other,
    canParse: true,
    toolbarButtons: {
      astRawStringToggle: false,
      escape: true,
      deserialize: true,
      serialize: true,
      format: true,
      preview: false,
      importExport: false,
      draft: false,
      favorites: false,
      history: false,
    },
    toolbarActions: {
      onFormat: vi.fn(),
      onEscape: vi.fn(),
      onUnescape: vi.fn(),
      onCompact: vi.fn(),
      onParse: vi.fn(),
      onSegmentChange: vi.fn(),
    },
    editorProps: {
      editorRef: { current: null },
      editorValue: '{"test": "value"}',
      editorTheme: 'light',
      enableAstTypeHints: false,
      contentType: ContentType.Other,
      onChange: vi.fn(),
    },
    notificationProps: {
      lightNotifications: [],
    },
  })

  const createMockProps = (
    overrides?: Partial<RecordingModeContentProps>
  ): RecordingModeContentProps => ({
    ...createBaseProps(),
    isRecording: false,
    snapshots: [],
    selectedSnapshotId: null,
    previewEnabled: false,
    onStopRecording: vi.fn(),
    onSelectSnapshot: vi.fn(),
    onEnterDiffMode: vi.fn(),
    ...overrides,
  })

  describe('基本渲染', () => {
    it('应该正确渲染 RecordingPanel', () => {
      const props = createMockProps()
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('recording-panel')).toBeInTheDocument()
    })

    it('应该将 EditorSection 作为子组件渲染在 RecordingPanel 中', () => {
      const props = createMockProps()
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('panel-children')).toContainElement(
        screen.getByTestId('editor-section')
      )
    })
  })

  describe('录制状态传递', () => {
    it('isRecording 为 true 时应该传递给 RecordingPanel', () => {
      const props = createMockProps({
        isRecording: true,
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('is-recording')).toHaveTextContent('true')
    })

    it('isRecording 为 false 时应该传递给 RecordingPanel', () => {
      const props = createMockProps({
        isRecording: false,
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('is-recording')).toHaveTextContent('false')
    })
  })

  describe('快照数据传递', () => {
    it('应该传递空快照数组', () => {
      const props = createMockProps({
        snapshots: [],
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('0')
    })

    it('应该传递包含多个快照的数组', () => {
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 1, content: '{"v1": 1}', timestamp: 1000 },
        { id: 2, content: '{"v2": 2}', timestamp: 2000 },
        { id: 3, content: '{"v3": 3}', timestamp: 3000 },
      ]

      const props = createMockProps({
        snapshots: mockSnapshots,
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('3')
    })

    it('应该传递单个快照', () => {
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 1, content: '{"single": "snapshot"}', timestamp: 1000 },
      ]

      const props = createMockProps({
        snapshots: mockSnapshots,
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('1')
    })
  })

  describe('选中快照传递', () => {
    it('selectedSnapshotId 为 null 时应该传递给 RecordingPanel', () => {
      const props = createMockProps({
        selectedSnapshotId: null,
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('selected-snapshot-id')).toHaveTextContent('none')
    })

    it('selectedSnapshotId 为数字时应该传递给 RecordingPanel', () => {
      const props = createMockProps({
        selectedSnapshotId: 2,
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('selected-snapshot-id')).toHaveTextContent('2')
    })

    it('应该传递 onSelectSnapshot 回调', () => {
      const onSelectSnapshot = vi.fn()
      const props = createMockProps({
        onSelectSnapshot,
      })
      render(<RecordingModeContent {...props} />)

      const selectBtn = screen.getByTestId('select-snapshot-btn')
      selectBtn.click()

      expect(onSelectSnapshot).toHaveBeenCalledWith(1)
    })
  })

  describe('编辑器 props 传递', () => {
    it('应该传递 editorProps 给 EditorSection', () => {
      const props = createMockProps({
        editorProps: {
          editorRef: { current: null },
          editorValue: '{"editor": "data"}',
          editorTheme: 'dark',
          enableAstTypeHints: true,
          contentType: ContentType.Ast,
          onChange: vi.fn(),
        },
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('editor-value')).toHaveTextContent('{"editor": "data"}')
    })

    it('应该传递 notificationProps 给 EditorSection', () => {
      const props = createMockProps({
        notificationProps: {
          lightNotifications: [
            { id: '1', text: 'Notification 1' },
            { id: '2', text: 'Notification 2' },
          ],
        },
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('2')
    })
  })

  describe('录制模式场景', () => {
    it('录制中且有快照时应该正确显示', () => {
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 1, content: '{"recording": "active"}', timestamp: 1000 },
      ]

      const props = createMockProps({
        isRecording: true,
        snapshots: mockSnapshots,
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('is-recording')).toHaveTextContent('true')
      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('1')
    })

    it('停止录制且有快照时应该正确显示', () => {
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 1, content: '{"v1": 1}', timestamp: 1000 },
        { id: 2, content: '{"v2": 2}', timestamp: 2000 },
      ]

      const props = createMockProps({
        isRecording: false,
        snapshots: mockSnapshots,
        selectedSnapshotId: 1,
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('is-recording')).toHaveTextContent('false')
      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('2')
      expect(screen.getByTestId('selected-snapshot-id')).toHaveTextContent('1')
    })

    it('录制开始但还没有快照时应该正确显示', () => {
      const props = createMockProps({
        isRecording: true,
        snapshots: [],
      })
      render(<RecordingModeContent {...props} />)

      expect(screen.getByTestId('is-recording')).toHaveTextContent('true')
      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('0')
    })
  })

  describe('组件结构验证', () => {
    it('应该是纯组合组件，RecordingPanel 包含 EditorSection', () => {
      const props = createMockProps()
      const { container } = render(<RecordingModeContent {...props} />)

      const recordingPanel = container.querySelector('[data-testid="recording-panel"]')
      expect(recordingPanel).toBeInTheDocument()
      expect(recordingPanel?.querySelector('[data-testid="editor-section"]')).toBeInTheDocument()
    })
  })

  describe('工具栏和状态栏提示', () => {
    it('hideToolbar 属性应该可以传递（由父组件管理）', () => {
      const props = createMockProps({
        hideToolbar: true,
      })

      // RecordingModeContent 不直接处理工具栏，只是透传属性
      expect(() => render(<RecordingModeContent {...props} />)).not.toThrow()
    })
  })
})
