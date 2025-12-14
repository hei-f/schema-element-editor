/**
 * EditorSection 组件单元测试
 */

import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { EditorSection } from '../EditorSection'
import { ContentType } from '@/shared/types'
import type { EditorProps, NotificationProps } from '../../types'

// Mock CodeMirrorEditor 组件
vi.mock('../../../editor/CodeMirrorEditor', () => ({
  CodeMirrorEditor: ({
    defaultValue,
    theme,
    placeholder,
    height,
    enableAstHints,
    isAstContent,
  }: any) => (
    <div data-testid="code-mirror-editor">
      <div data-testid="editor-value">{defaultValue}</div>
      <div data-testid="editor-theme">{theme}</div>
      <div data-testid="editor-placeholder">{placeholder}</div>
      <div data-testid="editor-height">{height}</div>
      <div data-testid="enable-ast-hints">{String(enableAstHints)}</div>
      <div data-testid="is-ast-content">{String(isAstContent ? isAstContent() : false)}</div>
    </div>
  ),
}))

// Mock EditorContainer
vi.mock('../../../../styles/editor/editor.styles', () => ({
  EditorContainer: ({ children }: any) => <div data-testid="editor-container">{children}</div>,
}))

// Mock LightSuccessNotification
vi.mock('../../../../styles/notifications/notifications.styles', () => ({
  LightSuccessNotification: ({ children, style }: any) => (
    <div data-testid="light-notification" style={style}>
      {children}
    </div>
  ),
}))

describe('EditorSection', () => {
  const createEditorProps = (overrides?: Partial<EditorProps>): EditorProps => ({
    editorRef: createRef(),
    editorValue: '{"test": "value"}',
    editorTheme: 'light',
    enableAstTypeHints: false,
    contentType: ContentType.Other,
    onChange: vi.fn(),
    ...overrides,
  })

  const createNotificationProps = (overrides?: Partial<NotificationProps>): NotificationProps => ({
    lightNotifications: [],
    ...overrides,
  })

  describe('基本渲染', () => {
    it('应该正确渲染 EditorContainer 和 CodeMirrorEditor', () => {
      const editorProps = createEditorProps()
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('editor-container')).toBeInTheDocument()
      expect(screen.getByTestId('code-mirror-editor')).toBeInTheDocument()
    })

    it('应该传递编辑器值给 CodeMirrorEditor', () => {
      const editorProps = createEditorProps({
        editorValue: '{"custom": "data"}',
      })
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('editor-value')).toHaveTextContent('{"custom": "data"}')
    })

    it('应该传递编辑器主题给 CodeMirrorEditor', () => {
      const editorProps = createEditorProps({
        editorTheme: 'dark',
      })
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('editor-theme')).toHaveTextContent('dark')
    })

    it('应该传递占位符文本给 CodeMirrorEditor', () => {
      const editorProps = createEditorProps()
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('editor-placeholder')).toHaveTextContent('在此输入 JSON Schema...')
    })

    it('应该传递高度 100% 给 CodeMirrorEditor', () => {
      const editorProps = createEditorProps()
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('editor-height')).toHaveTextContent('100%')
    })
  })

  describe('AST 类型提示', () => {
    it('enableAstTypeHints 为 true 时应该传递给 CodeMirrorEditor', () => {
      const editorProps = createEditorProps({
        enableAstTypeHints: true,
      })
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('enable-ast-hints')).toHaveTextContent('true')
    })

    it('enableAstTypeHints 为 false 时应该传递给 CodeMirrorEditor', () => {
      const editorProps = createEditorProps({
        enableAstTypeHints: false,
      })
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('enable-ast-hints')).toHaveTextContent('false')
    })

    it('contentType 为 AST 时 isAstContent 应该返回 true', () => {
      const editorProps = createEditorProps({
        contentType: ContentType.Ast,
      })
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('is-ast-content')).toHaveTextContent('true')
    })

    it('contentType 为 Json 时 isAstContent 应该返回 false', () => {
      const editorProps = createEditorProps({
        contentType: ContentType.Other,
      })
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('is-ast-content')).toHaveTextContent('false')
    })
  })

  describe('轻量通知显示', () => {
    it('应该渲染所有轻量通知', () => {
      const editorProps = createEditorProps()
      const notificationProps = createNotificationProps({
        lightNotifications: [
          { id: '1', text: '已保存' },
          { id: '2', text: '已格式化' },
          { id: '3', text: '已复制' },
        ],
      })

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      const notifications = screen.getAllByTestId('light-notification')
      expect(notifications).toHaveLength(3)
      expect(notifications[0]).toHaveTextContent('✓ 已保存')
      expect(notifications[1]).toHaveTextContent('✓ 已格式化')
      expect(notifications[2]).toHaveTextContent('✓ 已复制')
    })

    it('通知应该按索引计算正确的 top 位置', () => {
      const editorProps = createEditorProps()
      const notificationProps = createNotificationProps({
        lightNotifications: [
          { id: '1', text: 'First' },
          { id: '2', text: 'Second' },
          { id: '3', text: 'Third' },
        ],
      })

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      const notifications = screen.getAllByTestId('light-notification')
      expect(notifications[0]).toHaveStyle({ top: '16px' }) // 16 + 0 * 48
      expect(notifications[1]).toHaveStyle({ top: '64px' }) // 16 + 1 * 48
      expect(notifications[2]).toHaveStyle({ top: '112px' }) // 16 + 2 * 48
    })

    it('无通知时不应该渲染任何通知元素', () => {
      const editorProps = createEditorProps()
      const notificationProps = createNotificationProps({
        lightNotifications: [],
      })

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.queryByTestId('light-notification')).not.toBeInTheDocument()
    })

    it('通知应该使用唯一的 key（基于 notification.id）', () => {
      const editorProps = createEditorProps()
      const notificationProps = createNotificationProps({
        lightNotifications: [
          { id: 'unique-1', text: 'Notification 1' },
          { id: 'unique-2', text: 'Notification 2' },
        ],
      })

      // React 在渲染时会使用 key，虽然无法直接测试，但确保不会报错
      expect(() => {
        render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)
      }).not.toThrow()
    })
  })

  describe('不同编辑器主题', () => {
    it('应该支持 light 主题', () => {
      const editorProps = createEditorProps({
        editorTheme: 'light',
      })
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('editor-theme')).toHaveTextContent('light')
    })

    it('应该支持 dark 主题', () => {
      const editorProps = createEditorProps({
        editorTheme: 'dark',
      })
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('editor-theme')).toHaveTextContent('dark')
    })

    it('应该支持 seeDark 主题', () => {
      const editorProps = createEditorProps({
        editorTheme: 'seeDark',
      })
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('editor-theme')).toHaveTextContent('seeDark')
    })
  })

  describe('组件结构验证', () => {
    it('EditorContainer 应该包含通知和编辑器', () => {
      const editorProps = createEditorProps()
      const notificationProps = createNotificationProps({
        lightNotifications: [{ id: '1', text: 'Test' }],
      })

      const { container } = render(
        <EditorSection editorProps={editorProps} notificationProps={notificationProps} />
      )

      const editorContainer = container.querySelector('[data-testid="editor-container"]')
      expect(editorContainer).toBeInTheDocument()
      expect(
        editorContainer?.querySelector('[data-testid="light-notification"]')
      ).toBeInTheDocument()
      expect(
        editorContainer?.querySelector('[data-testid="code-mirror-editor"]')
      ).toBeInTheDocument()
    })

    it('通知应该在编辑器之前渲染', () => {
      const editorProps = createEditorProps()
      const notificationProps = createNotificationProps({
        lightNotifications: [{ id: '1', text: 'Test' }],
      })

      const { container } = render(
        <EditorSection editorProps={editorProps} notificationProps={notificationProps} />
      )

      const editorContainer = container.querySelector('[data-testid="editor-container"]')
      const children = Array.from(editorContainer?.children || [])
      const notificationIndex = children.findIndex(
        (child) => child.getAttribute('data-testid') === 'light-notification'
      )
      const editorIndex = children.findIndex(
        (child) => child.getAttribute('data-testid') === 'code-mirror-editor'
      )

      expect(notificationIndex).toBeGreaterThanOrEqual(0)
      expect(editorIndex).toBeGreaterThan(notificationIndex)
    })
  })

  describe('空状态处理', () => {
    it('应该处理空编辑器内容', () => {
      const editorProps = createEditorProps({
        editorValue: '',
      })
      const notificationProps = createNotificationProps()

      render(<EditorSection editorProps={editorProps} notificationProps={notificationProps} />)

      expect(screen.getByTestId('editor-value')).toHaveTextContent('')
    })
  })
})
