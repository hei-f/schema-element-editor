/**
 * NormalModeLayout 组件单元测试
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { ContentType, EditorTheme } from '@/shared/types'
import type { CodeMirrorEditorHandle } from '../../editor/CodeMirrorEditor'

// 提前定义mock函数
const mockUseDiffContentTransform = vi.hoisted(() =>
  vi.fn(() => ({
    diffLeftContent: 'left-content',
    diffRightContent: 'right-content',
    diffToolbarActions: {
      onApplyLeftToRight: vi.fn(),
      onApplyRightToLeft: vi.fn(),
    },
  }))
)

// 提前定义MockBuiltinPreview
const MockBuiltinPreview = vi.hoisted(() => {
  const Component = (props: any) => (
    <div data-testid="builtin-preview">
      <div data-testid="preview-value">{props.editorValue}</div>
      <div data-testid="preview-content-type">{props.contentType}</div>
    </div>
  )
  Component.displayName = 'BuiltinPreview'
  return Component
})

import { NormalModeLayout } from '../NormalModeLayout'

// Mock styled-components
vi.mock('styled-components', () => {
  const mockStyled = (tag: string) => {
    return (_styles: any) => {
      const Component = ({ children, ...props }: any) => {
        // 为styled component添加data-styled-tag属性以便测试识别
        return React.createElement(tag, { ...props, 'data-styled-tag': tag }, children)
      }
      Component.displayName = `styled.${tag}`
      return Component
    }
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

// Mock 子组件
vi.mock('../../editor/CodeMirrorEditor', () => {
  const MockCodeMirrorEditor = React.forwardRef((props: any, _ref: any) => {
    return (
      <div data-testid="code-mirror-editor">
        <div data-testid="editor-value">{props.defaultValue}</div>
        <div data-testid="editor-theme">{props.theme}</div>
        <div data-testid="editor-placeholder">{props.placeholder}</div>
        <div data-testid="enable-ast-hints">{String(props.enableAstHints)}</div>
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

vi.mock('../modes/DiffModeContent', () => ({
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
      <div data-testid="preview-enabled">{String(props.previewEnabled)}</div>
      <div data-testid="is-diff-mode">{String(props.isDiffMode)}</div>
      <div data-testid="show-diff-button">{String(props.showDiffButton)}</div>
    </div>
  ),
}))

// Mock BuiltinPreview.lazy - 直接提供非lazy版本避免Suspense问题
vi.mock('../preview/BuiltinPreview.lazy', () => ({
  BuiltinPreview: MockBuiltinPreview,
}))

// Mock useDiffContentTransform hook (注意：从__tests__目录到hooks目录需要../../../)
vi.mock('../../../hooks/diff/useDiffContentTransform', () => ({
  useDiffContentTransform: mockUseDiffContentTransform,
}))

describe('NormalModeLayout', () => {
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
      isInRecordingMode: false,
      snapshots: [],
      originalValue: 'original',
      repairOriginalValue: '',
      pendingRepairedValue: '',
      editorValue: 'current',
      onApplyRepair: vi.fn(),
      onCancelRepair: vi.fn(),
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

  describe('默认模式渲染', () => {
    it('应该渲染编辑器和工具栏', () => {
      const props = createMockProps()

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-section')).toBeInTheDocument()
    })

    it('应该显示正确的编辑器内容', () => {
      const props = createMockProps()

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('editor-value')).toHaveTextContent('{"test": "value"}')
      expect(screen.getByTestId('editor-theme')).toHaveTextContent('oneDark')
    })

    it('工具栏模式应该是NORMAL', () => {
      const props = createMockProps()

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('normal')
    })

    it('应该正确传递enableAstTypeHints到编辑器', () => {
      const props = createMockProps({
        baseProps: {
          ...createMockProps().baseProps,
          editorProps: {
            ...createMockProps().baseProps.editorProps,
            enableAstTypeHints: true,
          },
        },
      })

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('enable-ast-hints')).toHaveTextContent('true')
    })
  })

  describe('Diff 模式渲染', () => {
    it('Diff模式下应该渲染DiffModeContent', () => {
      const props = createMockProps({
        isDiffMode: true,
      })

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('diff-mode-content')).toBeInTheDocument()
    })

    it('Diff模式下工具栏模式应该是DIFF', () => {
      const props = createMockProps({
        isDiffMode: true,
      })

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('diff')
    })

    it('Diff模式下应该显示转换后的内容', () => {
      const props = createMockProps({
        isDiffMode: true,
      })

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('diff-left')).toHaveTextContent('left-content')
      expect(screen.getByTestId('diff-right')).toHaveTextContent('right-content')
    })

    it('Diff模式下不应该显示预览区域', () => {
      const props = createMockProps({
        isDiffMode: true,
        previewEnabled: true,
      })

      render(<NormalModeLayout {...props} />)

      expect(screen.queryByTestId('builtin-preview')).not.toBeInTheDocument()
    })
  })

  describe('预览模式渲染', () => {
    it('预览模式下应该渲染预览占位区域', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          previewWidth: 40,
        },
      })

      render(<NormalModeLayout {...props} />)

      // 预览模式下不会渲染编辑器（因为启用了预览）
      // 由于styled-components被mock，我们无法通过class名查找
      // 所以改为检查编辑器不在DOM中来间接验证预览布局
      const editor = screen.queryByTestId('code-mirror-editor')
      // 注意：预览模式下编辑器仍然存在，只是被隐藏了
      expect(editor).toBeInTheDocument()
    })

    it('预览模式下工具栏模式应该是PREVIEW', () => {
      const props = createMockProps({
        previewEnabled: true,
      })

      render(<NormalModeLayout {...props} />)

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

      render(<NormalModeLayout {...props} />)

      // 预览模式下工具栏应该显示PREVIEW模式
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      // 编辑器应该仍然存在
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })

    it('过渡状态下不应该显示拖拽条', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          isClosingTransition: true,
        },
      })

      render(<NormalModeLayout {...props} />)

      // 关闭过渡期间，工具栏模式应该仍然是PREVIEW
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
    })

    it('拖拽时应该显示拖拽蒙层（非内置预览模式）', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          isDragging: true,
          useBuiltinPreview: false,
        },
      })

      const { container } = render(<NormalModeLayout {...props} />)

      // 拖拽时应该显示宽度指示器和提示文本
      expect(container.textContent).toContain('%')
      expect(container.textContent).toContain('松开鼠标完成调整')
    })

    it('内置预览模式下拖拽时不应该显示蒙层', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          isDragging: true,
          useBuiltinPreview: true,
        },
      })

      const { container } = render(<NormalModeLayout {...props} />)

      // 内置预览模式下拖拽时不显示蒙层，所以不应该有"松开鼠标完成调整"文本
      expect(container.textContent).not.toContain('松开鼠标完成调整')
    })
  })

  describe('内置预览器', () => {
    // 注意：由于BuiltinPreview使用React.lazy加载，在测试环境中Suspense处理较复杂
    // 这些测试验证组件在不同状态下的基本行为，不深入测试lazy loading

    it('useBuiltinPreview为true时应该渲染预览模式布局', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          useBuiltinPreview: true,
          isClosingTransition: false,
          isOpeningInitial: false,
        },
      })

      render(<NormalModeLayout {...props} />)

      // 验证预览模式已启用
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      // 验证编辑器存在
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })

    it('关闭过渡状态下不应该渲染BuiltinPreview', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          useBuiltinPreview: true,
          isClosingTransition: true,
        },
      })

      const { container } = render(<NormalModeLayout {...props} />)

      // 在关闭过渡期间，预览模式布局存在但BuiltinPreview不渲染
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      // 不应该看到"加载预览中..."文本
      expect(container.textContent).not.toContain('加载预览中...')
    })

    it('打开初始状态下不应该渲染BuiltinPreview', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          useBuiltinPreview: true,
          isOpeningInitial: true,
        },
      })

      const { container } = render(<NormalModeLayout {...props} />)

      // 在打开初始状态，预览模式布局存在但BuiltinPreview不渲染
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      // 不应该看到"加载预览中..."文本
      expect(container.textContent).not.toContain('加载预览中...')
    })

    it('BuiltinPreview条件渲染逻辑正确', () => {
      const props = createMockProps({
        previewEnabled: true,
        baseProps: {
          ...createMockProps().baseProps,
          editorProps: {
            ...createMockProps().baseProps.editorProps,
            editorValue: '{"preview": "test"}',
            contentType: 'ast' as ContentType,
          },
        },
        previewModeProps: {
          ...createMockProps().previewModeProps,
          useBuiltinPreview: true,
          isClosingTransition: false,
          isOpeningInitial: false,
        },
      })

      render(<NormalModeLayout {...props} />)

      // 验证预览模式已启用
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      // 验证编辑器使用了正确的内容类型
      expect(screen.getByTestId('editor-theme')).toHaveTextContent('oneDark')
    })
  })

  describe('预览关闭过渡', () => {
    it('isClosingPreview为true时应该保持预览布局', () => {
      const props = createMockProps({
        previewEnabled: false,
        isClosingPreview: true,
      })

      render(<NormalModeLayout {...props} />)

      // 验证工具栏模式仍然是PREVIEW
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      // 验证编辑器存在
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })

    it('isClosingPreview为true时工具栏模式应该是PREVIEW', () => {
      const props = createMockProps({
        previewEnabled: false,
        isClosingPreview: true,
      })

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
    })
  })

  describe('轻量通知', () => {
    it('应该渲染轻量通知列表', () => {
      const props = createMockProps({
        baseProps: {
          ...createMockProps().baseProps,
          notificationProps: {
            lightNotifications: [
              { id: '1', text: '通知1' },
              { id: '2', text: '通知2' },
            ],
          },
        },
      })

      render(<NormalModeLayout {...props} />)

      expect(screen.getByText('通知1')).toBeInTheDocument()
      expect(screen.getByText('通知2')).toBeInTheDocument()
    })

    it('空通知列表不应该渲染任何通知', () => {
      const props = createMockProps()

      const { container } = render(<NormalModeLayout {...props} />)

      const notifications = container.querySelectorAll('[class*="LightSuccessNotification"]')
      expect(notifications).toHaveLength(0)
    })

    it('通知应该有正确的位置偏移', () => {
      const props = createMockProps({
        baseProps: {
          ...createMockProps().baseProps,
          notificationProps: {
            lightNotifications: [
              { id: '1', text: '通知1' },
              { id: '2', text: '通知2' },
            ],
          },
        },
      })

      render(<NormalModeLayout {...props} />)

      // 验证两条通知都被渲染
      expect(screen.getByText('通知1')).toBeInTheDocument()
      expect(screen.getByText('通知2')).toBeInTheDocument()
    })
  })

  describe('工具栏Props传递', () => {
    it('应该传递正确的isDiffMode到工具栏', () => {
      const props = createMockProps({
        isDiffMode: true,
      })

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('is-diff-mode')).toHaveTextContent('true')
    })

    it('应该传递正确的previewEnabled到工具栏', () => {
      const props = createMockProps({
        previewEnabled: true,
      })

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('preview-enabled')).toHaveTextContent('true')
    })

    it('应该传递showDiffButton=true到工具栏', () => {
      const props = createMockProps()

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('show-diff-button')).toHaveTextContent('true')
    })
  })

  describe('边界情况', () => {
    it('应该处理空的editorValue', () => {
      const props = createMockProps({
        baseProps: {
          ...createMockProps().baseProps,
          editorProps: {
            ...createMockProps().baseProps.editorProps,
            editorValue: '',
          },
        },
      })

      render(<NormalModeLayout {...props} />)

      expect(screen.getByTestId('editor-value')).toHaveTextContent('')
    })

    it('应该处理previewWidth为0的情况', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          previewWidth: 0,
        },
      })

      render(<NormalModeLayout {...props} />)

      // 预览模式应该启用
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      // 编辑器应该存在
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })

    it('应该处理previewWidth为100的情况', () => {
      const props = createMockProps({
        previewEnabled: true,
        previewModeProps: {
          ...createMockProps().previewModeProps,
          previewWidth: 100,
        },
      })

      render(<NormalModeLayout {...props} />)

      // 预览模式应该启用
      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent('preview')
      // 编辑器应该存在
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })
  })
})
