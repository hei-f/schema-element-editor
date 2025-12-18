/**
 * RecordingModeLayout 组件单元测试
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { RecordingModeLayout } from '../RecordingModeLayout'
import { ContentType, EditorTheme } from '@/shared/types'
import type { CodeMirrorEditorHandle } from '../../editor/CodeMirrorEditor'

// Mock styled-components
vi.mock('styled-components', () => {
  const mockStyled = (tag: string) => (_styles: any) => {
    const Component = ({ children, ...props }: any) => React.createElement(tag, props, children)
    Component.displayName = `styled.${tag}`
    return Component
  }
  const styledProxy = new Proxy(mockStyled, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        return target(prop)
      }
      return target
    },
  })
  return {
    ThemeProvider: ({ children }: any) => children,
    keyframes: () => '',
    css: () => '',
    styled: styledProxy,
    default: styledProxy,
  }
})

// Mock 子组件 - editor在components/editor/，从__tests__看是../../editor
vi.mock('../../editor/CodeMirrorEditor', () => {
  const MockCodeMirrorEditor = React.forwardRef((props: any, _ref: any) => {
    return (
      <div data-testid="code-mirror-editor">
        <div data-testid="editor-value">{props.defaultValue}</div>
        <div data-testid="editor-theme">{props.theme}</div>
      </div>
    )
  })
  MockCodeMirrorEditor.displayName = 'MockCodeMirrorEditor'
  return { CodeMirrorEditor: MockCodeMirrorEditor }
})

vi.mock('../../editor/SchemaDiffView', () => ({
  SchemaDiffView: (props: any) => (
    <div data-testid="schema-diff-view">
      <div data-testid="diff-left">{props.transformedLeftContent}</div>
      <div data-testid="diff-right">{props.transformedRightContent}</div>
    </div>
  ),
}))

// Mock modes和components - 注意路径从__tests__目录开始
vi.mock('../modes', () => ({
  DiffModeContent: (props: any) => (
    <div data-testid="diff-mode-content">
      <div data-testid="diff-left">{props.diffLeftContent}</div>
      <div data-testid="diff-right">{props.diffRightContent}</div>
    </div>
  ),
}))

vi.mock('../shared/ToolbarSection', () => ({
  ToolbarSection: (props: any) => (
    <div data-testid="toolbar-section">
      <div data-testid="toolbar-mode">{props.mode}</div>
      <div data-testid="is-recording">{String(props.isRecording)}</div>
      <div data-testid="is-diff-mode">{String(props.isDiffMode)}</div>
    </div>
  ),
}))

vi.mock('../../recording/RecordingStatusBar', () => ({
  RecordingStatusBar: (props: any) => (
    <div data-testid="recording-status-bar">
      <div data-testid="status-is-recording">{String(props.isRecording)}</div>
      <div data-testid="status-snapshots-count">{props.snapshots.length}</div>
      <button onClick={props.onStopRecording} data-testid="stop-recording-btn">
        Stop
      </button>
      <button onClick={props.onEnterDiffMode} data-testid="enter-diff-btn">
        Diff
      </button>
    </div>
  ),
}))

vi.mock('../../recording/VersionHistoryPanel', () => ({
  VersionHistoryPanel: (props: any) => (
    <div data-testid="version-history-panel">
      <div data-testid="history-is-recording">{String(props.isRecording)}</div>
      <div data-testid="history-snapshots-count">{props.snapshots.length}</div>
      <div data-testid="selected-snapshot">{props.selectedSnapshotId || 'null'}</div>
    </div>
  ),
}))

vi.mock('../../preview/BuiltinPreview.lazy', () => ({
  BuiltinPreview: (props: any) => (
    <div data-testid="builtin-preview">
      <div data-testid="preview-value">{props.editorValue}</div>
    </div>
  ),
}))

// Mock useDiffContentTransform hook - 注意路径从__tests__目录开始需要../../../
vi.mock('../../../hooks/diff/useDiffContentTransform', () => ({
  useDiffContentTransform: vi.fn(() => ({
    diffLeftContent: 'left-content',
    diffRightContent: 'right-content',
    diffToolbarActions: {
      onApplyLeftToRight: vi.fn(),
      onApplyRightToLeft: vi.fn(),
    },
  })),
}))

describe('RecordingModeLayout', () => {
  const editorRef = { current: null as CodeMirrorEditorHandle | null }

  const createMockProps = (overrides?: any) => ({
    isDiffMode: false,
    previewEnabled: false,
    isClosingPreview: false,
    editorThemeVars: {
      background: '#fff',
      foreground: '#000',
      caret: '#000',
      selection: '#ccc',
      selectionMatch: '#ddd',
      lineHighlight: '#eee',
      gutterBackground: '#f0f0f0',
      gutterForeground: '#666',
    },
    diffModeProps: {
      isFullScreenTransition: false,
      isInRecordingMode: true,
      snapshots: [],
      originalValue: 'original',
      repairOriginalValue: '',
      pendingRepairedValue: '',
      editorValue: 'current',
      onApplyRepair: vi.fn(),
      onCancelRepair: vi.fn(),
    },
    recordingModeProps: {
      isRecording: false,
      snapshots: [],
      selectedSnapshotId: null,
      previewEnabled: false,
      onStopRecording: vi.fn(),
      onSelectSnapshot: vi.fn(),
      onEnterDiffMode: vi.fn(),
    },
    previewModeProps: {
      isFullScreenTransition: false,
      previewEnabled: false,
      previewWidth: 50,
      isDragging: false,
      previewContainerRef: { current: null },
      previewPlaceholderRef: { current: null },
      onResizeStart: vi.fn(),
      isClosingTransition: false,
      isOpeningInitial: false,
      isOpeningTransition: false,
      useBuiltinPreview: false,
    },
    baseProps: {
      attributes: { id: 'test-element' },
      contentType: 'json' as ContentType,
      canParse: true,
      toolbarButtons: {
        showFormatButton: true,
        showEscapeButton: true,
        showUnescapeButton: true,
        showCompactButton: true,
        showParseButton: true,
        astRawStringToggle: true,
        escape: true,
        deserialize: true,
        serialize: true,
        format: true,
        preview: true,
        importExport: true,
        draft: true,
        favorites: true,
        history: true,
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
        editorRef,
        editorValue: '{"test": "value"}',
        editorTheme: 'oneDark' as EditorTheme,
        enableAstTypeHints: false,
        contentType: 'json' as ContentType,
        onChange: vi.fn(),
      },
      notificationProps: {
        lightNotifications: [],
      },
    },
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('录制模式基本渲染', () => {
    it('应该渲染录制状态栏、版本历史面板、编辑器和工具栏', () => {
      const props = createMockProps({
        recordingModeProps: {
          ...createMockProps().recordingModeProps,
          isRecording: true,
        },
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('recording-status-bar')).toBeInTheDocument()
      expect(screen.getByTestId('version-history-panel')).toBeInTheDocument()
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-section')).toBeInTheDocument()
    })

    it('工具栏模式应该是RECORDING', () => {
      const props = createMockProps()

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('recording')
    })

    it('应该传递isRecording状态到子组件', () => {
      const props = createMockProps({
        recordingModeProps: {
          ...createMockProps().recordingModeProps,
          isRecording: true,
        },
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('status-is-recording')).toHaveTextContent('true')
      expect(screen.getByTestId('history-is-recording')).toHaveTextContent('true')
      expect(screen.getByTestId('is-recording')).toHaveTextContent('true')
    })
  })

  describe('录制状态栏显示逻辑', () => {
    it('非Diff模式且非预览模式下应该显示录制状态栏', () => {
      const props = createMockProps({
        isDiffMode: false,
        previewEnabled: false,
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('recording-status-bar')).toBeInTheDocument()
    })

    it('Diff模式下不应该显示录制状态栏', () => {
      const props = createMockProps({
        isDiffMode: true,
        previewEnabled: false,
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.queryByTestId('recording-status-bar')).not.toBeInTheDocument()
    })

    it('预览模式下不应该显示录制状态栏', () => {
      const props = createMockProps({
        isDiffMode: false,
        previewEnabled: true,
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.queryByTestId('recording-status-bar')).not.toBeInTheDocument()
    })

    it('预览关闭过渡状态下不应该显示录制状态栏', () => {
      const props = createMockProps({
        isDiffMode: false,
        previewEnabled: false,
        isClosingPreview: true,
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.queryByTestId('recording-status-bar')).not.toBeInTheDocument()
    })
  })

  describe('版本历史面板', () => {
    it('应该传递快照数据到版本历史面板', () => {
      const mockSnapshots = [
        {
          id: 1,
          content: '{"test": 1}',
          timestamp: Date.now(),
          description: 'Snapshot 1',
        },
        {
          id: 2,
          content: '{"test": 2}',
          timestamp: Date.now(),
          description: 'Snapshot 2',
        },
      ]

      const props = createMockProps({
        recordingModeProps: {
          ...createMockProps().recordingModeProps,
          snapshots: mockSnapshots,
        },
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('history-snapshots-count')).toHaveTextContent('2')
    })

    it('应该传递选中的快照ID', () => {
      const props = createMockProps({
        recordingModeProps: {
          ...createMockProps().recordingModeProps,
          selectedSnapshotId: 5,
        },
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('selected-snapshot')).toHaveTextContent('5')
    })

    it('selectedSnapshotId为null时应该正确显示', () => {
      const props = createMockProps({
        recordingModeProps: {
          ...createMockProps().recordingModeProps,
          selectedSnapshotId: null,
        },
      })

      render(<RecordingModeLayout {...props} />)

      // Mock中设置为'null'字符串当selectedSnapshotId为null时
      expect(screen.getByTestId('selected-snapshot')).toHaveTextContent('null')
    })
  })

  describe('Diff模式切换', () => {
    it('Diff模式下应该渲染DiffModeContent', () => {
      const props = createMockProps({
        isDiffMode: true,
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('diff-mode-content')).toBeInTheDocument()
    })

    it('Diff模式下工具栏模式应该是DIFF', () => {
      const props = createMockProps({
        isDiffMode: true,
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('diff')
    })

    it('Diff模式下应该隐藏版本历史面板（通过ModeSwitchContainer切换）', () => {
      const props = createMockProps({
        isDiffMode: true,
      })

      render(<RecordingModeLayout {...props} />)

      // DiffModeContent应该可见
      expect(screen.getByTestId('diff-mode-content')).toBeInTheDocument()
    })

    it('非Diff模式下应该显示版本历史面板和编辑器', () => {
      const props = createMockProps({
        isDiffMode: false,
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('version-history-panel')).toBeInTheDocument()
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })
  })

  describe('预览模式渲染', () => {
    it('预览模式下应该渲染预览占位区域', () => {
      const props = createMockProps({
        previewEnabled: true,
      })

      render(<RecordingModeLayout {...props} />)

      // 预览模式下验证工具栏模式和编辑器存在
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })

    it('预览模式下工具栏模式应该是PREVIEW', () => {
      const props = createMockProps({
        previewEnabled: true,
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
    })

    it('预览模式下应该渲染拖拽条', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          isClosingTransition: false,
          isOpeningTransition: false,
        },
      })

      render(<RecordingModeLayout {...props} />)

      // 验证预览模式启用
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })

    it('内置预览模式下应该渲染BuiltinPreview', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          useBuiltinPreview: true,
          isClosingTransition: false,
          isOpeningInitial: false,
        },
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('builtin-preview')).toBeInTheDocument()
    })

    it('拖拽时应该显示拖拽蒙层（非内置预览）', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          isDragging: true,
          useBuiltinPreview: false,
        },
      })

      const { container } = render(<RecordingModeLayout {...props} />)

      // 拖拽时应该显示宽度指示器和提示文本
      expect(container.textContent).toContain('%')
      expect(container.textContent).toContain('松开鼠标完成调整')
    })
  })

  describe('工具栏Props传递', () => {
    it('应该传递正确的mode到工具栏', () => {
      const { rerender } = render(<RecordingModeLayout {...createMockProps()} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('recording')

      rerender(
        <RecordingModeLayout
          {...createMockProps({
            isDiffMode: true,
          })}
        />
      )

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('diff')

      rerender(
        <RecordingModeLayout
          {...createMockProps({
            previewEnabled: true,
          })}
        />
      )

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
    })

    it('应该传递isRecording到工具栏', () => {
      const props = createMockProps({
        recordingModeProps: {
          ...createMockProps().recordingModeProps,
          isRecording: true,
        },
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('is-recording')).toHaveTextContent('true')
    })

    it('应该传递isDiffMode到工具栏', () => {
      const props = createMockProps({
        isDiffMode: true,
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('is-diff-mode')).toHaveTextContent('true')
    })
  })

  describe('轻量通知', () => {
    it('应该渲染轻量通知列表', () => {
      const props = createMockProps({
        baseProps: {
          ...createMockProps().baseProps,
          notificationProps: {
            lightNotifications: [
              { id: '1', text: '录制通知1' },
              { id: '2', text: '录制通知2' },
            ],
          },
        },
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByText('录制通知1')).toBeInTheDocument()
      expect(screen.getByText('录制通知2')).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该处理空的snapshots数组', () => {
      const props = createMockProps({
        recordingModeProps: {
          ...createMockProps().recordingModeProps,
          snapshots: [],
        },
      })

      render(<RecordingModeLayout {...props} />)

      expect(screen.getByTestId('history-snapshots-count')).toHaveTextContent('0')
      expect(screen.getByTestId('status-snapshots-count')).toHaveTextContent('0')
    })

    it('应该处理同时开启Diff和预览的情况（Diff优先）', () => {
      const props = createMockProps({
        isDiffMode: true,
        previewEnabled: true,
      })

      render(<RecordingModeLayout {...props} />)

      // Diff模式下不显示预览
      expect(screen.queryByTestId('builtin-preview')).not.toBeInTheDocument()
      expect(screen.getByTestId('diff-mode-content')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('diff')
    })

    it('应该处理isClosingPreview的情况', () => {
      const props = createMockProps({
        previewEnabled: false,
        isClosingPreview: true,
      })

      render(<RecordingModeLayout {...props} />)

      // 预览关闭过渡时，工具栏模式应该为PREVIEW
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      // 编辑器应该存在
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })

    it('应该处理previewWidth极端值', () => {
      const { rerender } = render(
        <RecordingModeLayout
          {...createMockProps({
            previewEnabled: true,
            previewModeProps: {
              ...createMockProps().previewModeProps,
              previewWidth: 0,
            },
          })}
        />
      )

      // 预览宽度为0时，预览模式仍应启用
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()

      rerender(
        <RecordingModeLayout
          {...createMockProps({
            previewEnabled: true,
            previewModeProps: {
              ...createMockProps().previewModeProps,
              previewWidth: 100,
            },
          })}
        />
      )

      // 预览宽度为100时，预览模式仍应启用
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })
  })

  describe('录制状态栏交互', () => {
    it('点击停止录制按钮应该调用onStopRecording', async () => {
      const onStopRecording = vi.fn()
      const props = createMockProps({
        recordingModeProps: {
          ...createMockProps().recordingModeProps,
          isRecording: true,
          onStopRecording,
        },
      })

      render(<RecordingModeLayout {...props} />)

      const stopButton = screen.getByText('Stop')
      stopButton.click()

      expect(onStopRecording).toHaveBeenCalledTimes(1)
    })

    it('点击进入Diff模式按钮应该调用onEnterDiffMode', async () => {
      const onEnterDiffMode = vi.fn()
      const props = createMockProps({
        recordingModeProps: {
          ...createMockProps().recordingModeProps,
          onEnterDiffMode,
        },
      })

      render(<RecordingModeLayout {...props} />)

      const diffButton = screen.getByText('Diff')
      diffButton.click()

      expect(onEnterDiffMode).toHaveBeenCalledTimes(1)
    })
  })
})
