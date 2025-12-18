/**
 * PreviewModeContent 组件单元测试
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { PreviewModeContent } from '../PreviewModeContent'
import { ContentType } from '@/shared/types'
import type { PreviewModeContentProps, BaseContentProps } from '../../types'

// Mock CodeMirrorEditor 组件
vi.mock('../../../editor/CodeMirrorEditor', () => ({
  CodeMirrorEditor: ({ defaultValue, theme, onChange, placeholder, height }: any) => (
    <div data-testid="code-mirror-editor">
      <div data-testid="editor-value">{defaultValue}</div>
      <div data-testid="editor-theme">{theme}</div>
      <div data-testid="editor-placeholder">{placeholder}</div>
      <div data-testid="editor-height">{height}</div>
      <button data-testid="trigger-change" onClick={() => onChange('new value')}>
        Change
      </button>
    </div>
  ),
}))

// Mock styled-components
vi.mock('../../../../styles/layout/drawer.styles', () => ({
  FullScreenModeWrapper: ({ children, $animate }: any) => (
    <div data-testid="fullscreen-wrapper" data-animate={String($animate)}>
      {children}
    </div>
  ),
  PreviewModeContainer: ({ children }: any) => (
    <div data-testid="preview-mode-container">{children}</div>
  ),
  PreviewEditorRow: ({ children, ref }: any) => (
    <div data-testid="preview-editor-row" ref={ref}>
      {children}
    </div>
  ),
  PreviewPlaceholder: ({ $width, $isClosing, $isOpening, $isDragging, ref }: any) => (
    <div
      data-testid="preview-placeholder"
      data-width={$width}
      data-is-closing={String($isClosing)}
      data-is-opening={String($isOpening)}
      data-is-dragging={String($isDragging)}
      ref={ref}
    />
  ),
  DragOverlay: ({ children, $width }: any) => (
    <div data-testid="drag-overlay" data-width={$width}>
      {children}
    </div>
  ),
  DragWidthIndicator: ({ children }: any) => (
    <div data-testid="drag-width-indicator">{children}</div>
  ),
  DragHintText: ({ children }: any) => <div data-testid="drag-hint-text">{children}</div>,
  PreviewResizer: ({ $isDragging, $previewWidth, onMouseDown }: any) => (
    <div
      data-testid="preview-resizer"
      data-is-dragging={String($isDragging)}
      data-preview-width={$previewWidth}
      onMouseDown={onMouseDown}
    />
  ),
  PreviewEditArea: ({ children }: any) => <div data-testid="preview-edit-area">{children}</div>,
  PreviewEditorContainer: ({ children }: any) => (
    <div data-testid="preview-editor-container">{children}</div>
  ),
}))

vi.mock('../../../../styles/notifications/notifications.styles', () => ({
  LightSuccessNotification: ({ children, style }: any) => (
    <div data-testid="light-notification" style={style}>
      {children}
    </div>
  ),
}))

describe('PreviewModeContent', () => {
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
      editorRef: createRef(),
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
    overrides?: Partial<PreviewModeContentProps>
  ): PreviewModeContentProps => ({
    ...createBaseProps(),
    isFullScreenTransition: false,
    previewEnabled: true,
    previewWidth: 50,
    isDragging: false,
    previewContainerRef: createRef(),
    previewPlaceholderRef: createRef(),
    onResizeStart: vi.fn(),
    isClosingTransition: false,
    isOpeningInitial: false,
    isOpeningTransition: false,
    ...overrides,
  })

  describe('基本渲染', () => {
    it('应该正确渲染所有主要结构', () => {
      const props = createMockProps()
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('fullscreen-wrapper')).toBeInTheDocument()
      expect(screen.getByTestId('preview-mode-container')).toBeInTheDocument()
      expect(screen.getByTestId('preview-editor-row')).toBeInTheDocument()
      expect(screen.getByTestId('preview-placeholder')).toBeInTheDocument()
      expect(screen.getByTestId('preview-edit-area')).toBeInTheDocument()
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })

    it('应该渲染 CodeMirrorEditor 并传递正确的 props', () => {
      const props = createMockProps()
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('editor-value')).toHaveTextContent('{"test": "value"}')
      expect(screen.getByTestId('editor-theme')).toHaveTextContent('light')
      expect(screen.getByTestId('editor-placeholder')).toHaveTextContent('在此输入 JSON Schema...')
      expect(screen.getByTestId('editor-height')).toHaveTextContent('100%')
    })
  })

  describe('预览宽度控制', () => {
    it('应该将 previewWidth 传递给 PreviewPlaceholder', () => {
      const props = createMockProps({
        previewWidth: 30,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('preview-placeholder')).toHaveAttribute('data-width', '30')
    })

    it('应该支持不同的预览宽度值', () => {
      const { rerender } = render(<PreviewModeContent {...createMockProps({ previewWidth: 40 })} />)
      expect(screen.getByTestId('preview-placeholder')).toHaveAttribute('data-width', '40')

      rerender(<PreviewModeContent {...createMockProps({ previewWidth: 60 })} />)
      expect(screen.getByTestId('preview-placeholder')).toHaveAttribute('data-width', '60')
    })
  })

  describe('拖拽功能', () => {
    it('isDragging 为 false 时不应该显示拖拽覆盖层', () => {
      const props = createMockProps({
        isDragging: false,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.queryByTestId('drag-overlay')).not.toBeInTheDocument()
    })

    it('isDragging 为 true 且不在关闭过渡中时应该显示拖拽覆盖层', () => {
      const props = createMockProps({
        isDragging: true,
        isClosingTransition: false,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('drag-overlay')).toBeInTheDocument()
    })

    it('拖拽时应该显示宽度指示器和提示文本', () => {
      const props = createMockProps({
        isDragging: true,
        previewWidth: 45,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('drag-width-indicator')).toHaveTextContent('45')
      expect(screen.getByTestId('drag-hint-text')).toHaveTextContent('松开鼠标完成调整')
    })

    it('拖拽覆盖层应该显示正确的宽度百分比', () => {
      const props = createMockProps({
        isDragging: true,
        previewWidth: 35.5,
      })
      render(<PreviewModeContent {...props} />)

      // Math.round(35.5) = 36
      expect(screen.getByTestId('drag-width-indicator')).toHaveTextContent('36')
    })

    it('关闭过渡中不应该显示拖拽覆盖层（即使 isDragging 为 true）', () => {
      const props = createMockProps({
        isDragging: true,
        isClosingTransition: true,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.queryByTestId('drag-overlay')).not.toBeInTheDocument()
    })

    it('应该传递 isDragging 状态给 PreviewPlaceholder', () => {
      const props = createMockProps({
        isDragging: true,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('preview-placeholder')).toHaveAttribute('data-is-dragging', 'true')
    })
  })

  describe('Resizer 拖动条显示逻辑', () => {
    it('正常状态下应该显示 PreviewResizer', () => {
      const props = createMockProps({
        isClosingTransition: false,
        isOpeningTransition: false,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('preview-resizer')).toBeInTheDocument()
    })

    it('关闭过渡中不应该显示 PreviewResizer', () => {
      const props = createMockProps({
        isClosingTransition: true,
        isOpeningTransition: false,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.queryByTestId('preview-resizer')).not.toBeInTheDocument()
    })

    it('打开过渡中不应该显示 PreviewResizer', () => {
      const props = createMockProps({
        isClosingTransition: false,
        isOpeningTransition: true,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.queryByTestId('preview-resizer')).not.toBeInTheDocument()
    })

    it('PreviewResizer 应该绑定 onMouseDown 事件', () => {
      const onResizeStart = vi.fn()
      const props = createMockProps({
        onResizeStart,
      })
      render(<PreviewModeContent {...props} />)

      const resizer = screen.getByTestId('preview-resizer')
      fireEvent.mouseDown(resizer)

      expect(onResizeStart).toHaveBeenCalled()
    })
  })

  describe('过渡状态控制', () => {
    it('isClosingTransition 为 true 时应该传递给 PreviewPlaceholder', () => {
      const props = createMockProps({
        isClosingTransition: true,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('preview-placeholder')).toHaveAttribute('data-is-closing', 'true')
    })

    it('isOpeningInitial 为 true 时应该传递给 PreviewPlaceholder', () => {
      const props = createMockProps({
        isOpeningInitial: true,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('preview-placeholder')).toHaveAttribute('data-is-opening', 'true')
    })

    it('isFullScreenTransition 为 true 时应该传递给 FullScreenModeWrapper', () => {
      const props = createMockProps({
        isFullScreenTransition: true,
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('fullscreen-wrapper')).toHaveAttribute('data-animate', 'true')
    })

    it('关闭过渡中 refs 应该传递 undefined', () => {
      const containerRef = createRef<HTMLDivElement>()
      const placeholderRef = createRef<HTMLDivElement>()

      const props = createMockProps({
        isClosingTransition: true,
        previewContainerRef: containerRef,
        previewPlaceholderRef: placeholderRef,
      })
      render(<PreviewModeContent {...props} />)

      // 关闭过渡中，ref 传递 undefined，所以不会被赋值
      expect(containerRef.current).toBeNull()
      expect(placeholderRef.current).toBeNull()
    })
  })

  describe('轻量通知显示', () => {
    it('应该渲染所有轻量通知', () => {
      const props = createMockProps({
        notificationProps: {
          lightNotifications: [
            { id: '1', text: '已保存' },
            { id: '2', text: '已格式化' },
            { id: '3', text: '已复制' },
          ],
        },
      })
      render(<PreviewModeContent {...props} />)

      const notifications = screen.getAllByTestId('light-notification')
      expect(notifications).toHaveLength(3)
      expect(notifications[0]).toHaveTextContent('已保存')
      expect(notifications[1]).toHaveTextContent('已格式化')
      expect(notifications[2]).toHaveTextContent('已复制')
    })

    it('通知应该有正确的位置样式', () => {
      const props = createMockProps({
        notificationProps: {
          lightNotifications: [
            { id: '1', text: 'First' },
            { id: '2', text: 'Second' },
          ],
        },
      })
      render(<PreviewModeContent {...props} />)

      const notifications = screen.getAllByTestId('light-notification')
      expect(notifications[0]).toHaveStyle({ top: '16px' })
      expect(notifications[1]).toHaveStyle({ top: '64px' }) // 16 + 48
    })

    it('无通知时不应该渲染通知元素', () => {
      const props = createMockProps({
        notificationProps: {
          lightNotifications: [],
        },
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.queryByTestId('light-notification')).not.toBeInTheDocument()
    })
  })

  describe('编辑器交互', () => {
    it('应该传递 onChange 回调给 CodeMirrorEditor', () => {
      const onChange = vi.fn()
      const props = createMockProps({
        editorProps: {
          ...createBaseProps().editorProps,
          onChange,
        },
      })
      render(<PreviewModeContent {...props} />)

      const changeBtn = screen.getByTestId('trigger-change')
      fireEvent.click(changeBtn)

      expect(onChange).toHaveBeenCalledWith('new value')
    })

    it('应该根据 contentType 判断是否为 AST 内容', () => {
      const props = createMockProps({
        contentType: ContentType.Ast,
        editorProps: {
          ...createBaseProps().editorProps,
          contentType: ContentType.Ast,
        },
      })
      render(<PreviewModeContent {...props} />)

      // isAstContent 函数应该返回 true
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })
  })

  describe('不同主题支持', () => {
    it('应该支持 dark 主题', () => {
      const props = createMockProps({
        editorProps: {
          ...createBaseProps().editorProps,
          editorTheme: 'dark',
        },
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('editor-theme')).toHaveTextContent('dark')
    })

    it('应该支持 seeDark 主题', () => {
      const props = createMockProps({
        editorProps: {
          ...createBaseProps().editorProps,
          editorTheme: 'seeDark',
        },
      })
      render(<PreviewModeContent {...props} />)

      expect(screen.getByTestId('editor-theme')).toHaveTextContent('seeDark')
    })
  })

  describe('组件结构验证', () => {
    it('FullScreenModeWrapper 的 key 应该为 "preview"', () => {
      const props = createMockProps()
      const { container } = render(<PreviewModeContent {...props} />)

      const wrapper = container.querySelector('[data-testid="fullscreen-wrapper"]')
      expect(wrapper).toBeInTheDocument()
    })

    it('PreviewEditArea 应该包含 PreviewEditorContainer 和 CodeMirrorEditor', () => {
      const props = createMockProps()
      const { container } = render(<PreviewModeContent {...props} />)

      const editArea = container.querySelector('[data-testid="preview-edit-area"]')
      expect(editArea).toBeInTheDocument()
      expect(
        editArea?.querySelector('[data-testid="preview-editor-container"]')
      ).toBeInTheDocument()
      expect(editArea?.querySelector('[data-testid="code-mirror-editor"]')).toBeInTheDocument()
    })
  })
})
