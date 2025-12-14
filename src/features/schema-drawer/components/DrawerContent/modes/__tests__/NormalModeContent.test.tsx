/**
 * NormalModeContent 组件单元测试
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NormalModeContent } from '../NormalModeContent'
import { ContentType } from '@/shared/types'
import type { NormalModeContentProps } from '../../types'

// Mock EditorSection 组件
vi.mock('../../shared', () => ({
  EditorSection: ({ editorProps, notificationProps }: any) => (
    <div data-testid="editor-section">
      <div data-testid="editor-value">{editorProps.editorValue}</div>
      <div data-testid="editor-theme">{editorProps.editorTheme}</div>
      <div data-testid="notifications-count">{notificationProps.lightNotifications.length}</div>
    </div>
  ),
}))

describe('NormalModeContent', () => {
  const createMockProps = (
    overrides?: Partial<NormalModeContentProps>
  ): NormalModeContentProps => ({
    attributes: {},
    contentType: ContentType.Json,
    canParse: true,
    toolbarButtons: {
      showFormatButton: true,
      showEscapeButton: true,
      showUnescapeButton: true,
      showCompactButton: true,
      showParseButton: true,
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
      contentType: ContentType.Json,
      onChange: vi.fn(),
    },
    notificationProps: {
      lightNotifications: [],
    },
    previewEnabled: false,
    ...overrides,
  })

  describe('基本渲染', () => {
    it('应该正确渲染组件', () => {
      const props = createMockProps()
      render(<NormalModeContent {...props} />)

      expect(screen.getByTestId('editor-section')).toBeInTheDocument()
    })

    it('应该将 editorProps 传递给 EditorSection', () => {
      const props = createMockProps({
        editorProps: {
          editorRef: { current: null },
          editorValue: '{"key": "value"}',
          editorTheme: 'dark',
          enableAstTypeHints: true,
          contentType: ContentType.Ast,
          onChange: vi.fn(),
        },
      })
      render(<NormalModeContent {...props} />)

      expect(screen.getByTestId('editor-value')).toHaveTextContent('{"key": "value"}')
      expect(screen.getByTestId('editor-theme')).toHaveTextContent('dark')
    })

    it('应该将 notificationProps 传递给 EditorSection', () => {
      const props = createMockProps({
        notificationProps: {
          lightNotifications: [
            { id: '1', text: 'Notification 1' },
            { id: '2', text: 'Notification 2' },
          ],
        },
      })
      render(<NormalModeContent {...props} />)

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('2')
    })
  })

  describe('不同编辑器主题', () => {
    it('应该支持 light 主题', () => {
      const props = createMockProps({
        editorProps: {
          ...createMockProps().editorProps,
          editorTheme: 'light',
        },
      })
      render(<NormalModeContent {...props} />)

      expect(screen.getByTestId('editor-theme')).toHaveTextContent('light')
    })

    it('应该支持 dark 主题', () => {
      const props = createMockProps({
        editorProps: {
          ...createMockProps().editorProps,
          editorTheme: 'dark',
        },
      })
      render(<NormalModeContent {...props} />)

      expect(screen.getByTestId('editor-theme')).toHaveTextContent('dark')
    })

    it('应该支持 seeDark 主题', () => {
      const props = createMockProps({
        editorProps: {
          ...createMockProps().editorProps,
          editorTheme: 'seeDark',
        },
      })
      render(<NormalModeContent {...props} />)

      expect(screen.getByTestId('editor-theme')).toHaveTextContent('seeDark')
    })
  })

  describe('不同内容类型', () => {
    it('应该支持 JSON 内容类型', () => {
      const props = createMockProps({
        contentType: ContentType.Json,
        editorProps: {
          ...createMockProps().editorProps,
          contentType: ContentType.Json,
        },
      })
      render(<NormalModeContent {...props} />)

      expect(screen.getByTestId('editor-section')).toBeInTheDocument()
    })

    it('应该支持 AST 内容类型', () => {
      const props = createMockProps({
        contentType: ContentType.Ast,
        editorProps: {
          ...createMockProps().editorProps,
          contentType: ContentType.Ast,
        },
      })
      render(<NormalModeContent {...props} />)

      expect(screen.getByTestId('editor-section')).toBeInTheDocument()
    })
  })

  describe('空状态处理', () => {
    it('应该处理空编辑器内容', () => {
      const props = createMockProps({
        editorProps: {
          ...createMockProps().editorProps,
          editorValue: '',
        },
      })
      render(<NormalModeContent {...props} />)

      expect(screen.getByTestId('editor-value')).toHaveTextContent('')
    })

    it('应该处理无通知的情况', () => {
      const props = createMockProps({
        notificationProps: {
          lightNotifications: [],
        },
      })
      render(<NormalModeContent {...props} />)

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0')
    })
  })

  describe('工具栏隐藏（预留）', () => {
    it('hideToolbar 属性应该可以传递（由父组件管理）', () => {
      const props = createMockProps({
        hideToolbar: true,
      })

      // NormalModeContent 不直接处理工具栏，只是透传属性
      expect(() => render(<NormalModeContent {...props} />)).not.toThrow()
    })

    it('hideToolbar 为 false 时应该正常渲染', () => {
      const props = createMockProps({
        hideToolbar: false,
      })

      render(<NormalModeContent {...props} />)
      expect(screen.getByTestId('editor-section')).toBeInTheDocument()
    })
  })

  describe('组件结构验证', () => {
    it('应该是纯组合组件，不包含复杂逻辑', () => {
      const props = createMockProps()
      const { container } = render(<NormalModeContent {...props} />)

      // 验证组件结构简单
      expect(container.querySelector('[data-testid="editor-section"]')).toBeInTheDocument()
    })
  })
})
