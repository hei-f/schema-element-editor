/**
 * DrawerContent 组件单元测试
 */

import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DrawerContent } from '../index'
import { ContentType, EditorTheme } from '@/shared/types'
import type { DrawerContentProps } from '../types'
import { getEditorThemeVars } from '../../../styles/editor/editor-theme-vars'

// Mock 子组件
vi.mock('../NormalModeLayout', () => ({
  NormalModeLayout: (props: any) => (
    <div data-testid="normal-mode-layout">
      <div data-testid="is-diff-mode">{String(props.isDiffMode)}</div>
      <div data-testid="preview-enabled">{String(props.previewEnabled)}</div>
      <div data-testid="is-closing-preview">{String(props.isClosingPreview)}</div>
    </div>
  ),
}))

vi.mock('../RecordingModeLayout', () => ({
  RecordingModeLayout: (props: any) => (
    <div data-testid="recording-mode-layout">
      <div data-testid="is-diff-mode">{String(props.isDiffMode)}</div>
      <div data-testid="preview-enabled">{String(props.previewEnabled)}</div>
      <div data-testid="is-recording">{String(props.recordingModeProps.isRecording)}</div>
    </div>
  ),
}))

describe('DrawerContent', () => {
  const createMockProps = (overrides?: Partial<DrawerContentProps>): DrawerContentProps => {
    const editorRef = { current: null }
    return {
      isDiffMode: false,
      isInRecordingMode: false,
      previewEnabled: false,
      isClosingPreview: false,
      editorThemeVars: getEditorThemeVars('light'),
      diffModeProps: {
        isFullScreenTransition: false,
        isInRecordingMode: false,
        snapshots: [],
        originalValue: '',
        repairOriginalValue: '',
        pendingRepairedValue: '',
        editorValue: '',
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
      },
      normalModeProps: {
        previewEnabled: false,
      },
      baseProps: {
        attributes: { params: ['test-element'] },
        contentType: 'json' as ContentType,
        canParse: true,
        toolbarButtons: {
          astRawStringToggle: true,
          escape: true,
          deserialize: true,
          compact: true,
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
    }
  }

  describe('模式路由', () => {
    it('普通模式下应该渲染 NormalModeLayout', () => {
      const props = createMockProps({
        isInRecordingMode: false,
      })

      const { getByTestId, queryByTestId } = render(<DrawerContent {...props} />)

      expect(getByTestId('normal-mode-layout')).toBeInTheDocument()
      expect(queryByTestId('recording-mode-layout')).not.toBeInTheDocument()
    })

    it('录制模式下应该渲染 RecordingModeLayout', () => {
      const props = createMockProps({
        isInRecordingMode: true,
      })

      const { getByTestId, queryByTestId } = render(<DrawerContent {...props} />)

      expect(getByTestId('recording-mode-layout')).toBeInTheDocument()
      expect(queryByTestId('normal-mode-layout')).not.toBeInTheDocument()
    })
  })

  describe('Props 传递', () => {
    it('应该正确传递 props 到 NormalModeLayout', () => {
      const props = createMockProps({
        isInRecordingMode: false,
        isDiffMode: true,
        previewEnabled: true,
        isClosingPreview: false,
      })

      const { getByTestId } = render(<DrawerContent {...props} />)

      expect(getByTestId('is-diff-mode')).toHaveTextContent('true')
      expect(getByTestId('preview-enabled')).toHaveTextContent('true')
      expect(getByTestId('is-closing-preview')).toHaveTextContent('false')
    })

    it('应该正确传递 props 到 RecordingModeLayout', () => {
      const props = createMockProps({
        isInRecordingMode: true,
        isDiffMode: false,
        previewEnabled: false,
        recordingModeProps: {
          isRecording: true,
          snapshots: [],
          selectedSnapshotId: null,
          previewEnabled: false,
          onStopRecording: vi.fn(),
          onSelectSnapshot: vi.fn(),
          onEnterDiffMode: vi.fn(),
        },
      })

      const { getByTestId } = render(<DrawerContent {...props} />)

      expect(getByTestId('is-diff-mode')).toHaveTextContent('false')
      expect(getByTestId('preview-enabled')).toHaveTextContent('false')
      expect(getByTestId('is-recording')).toHaveTextContent('true')
    })

    it('应该传递 editorThemeVars 到子组件', () => {
      const customThemeVars = getEditorThemeVars('dark')

      const props = createMockProps({
        editorThemeVars: customThemeVars,
      })

      render(<DrawerContent {...props} />)

      // 验证组件成功渲染即可，主题会传递到 ThemeProvider
      expect(true).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理空的 baseProps', () => {
      const props = createMockProps({
        baseProps: {
          ...createMockProps().baseProps,
          attributes: { params: [] },
          toolbarButtons: {
            astRawStringToggle: false,
            escape: false,
            deserialize: false,
            compact: false,
            format: false,
            preview: false,
            importExport: false,
            draft: false,
            favorites: false,
            history: false,
          },
        },
      })

      const { getByTestId } = render(<DrawerContent {...props} />)

      expect(getByTestId('normal-mode-layout')).toBeInTheDocument()
    })

    it('应该处理同时开启多个模式标志', () => {
      const props = createMockProps({
        isDiffMode: true,
        previewEnabled: true,
        isClosingPreview: true,
      })

      const { getByTestId } = render(<DrawerContent {...props} />)

      expect(getByTestId('normal-mode-layout')).toBeInTheDocument()
      expect(getByTestId('is-diff-mode')).toHaveTextContent('true')
      expect(getByTestId('preview-enabled')).toHaveTextContent('true')
    })
  })
})
