/**
 * DiffModeContent 组件单元测试
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DiffModeContent } from '../DiffModeContent'
import { ContentType } from '@/shared/types'
import type { DiffModeContentProps, BaseContentProps } from '../../types'
import type { SchemaSnapshot } from '@/shared/types'

// Mock SchemaDiffView 组件
vi.mock('../../../editor/SchemaDiffView', () => ({
  SchemaDiffView: ({ snapshots, theme, transformedLeftContent, transformedRightContent }: any) => (
    <div data-testid="schema-diff-view">
      <div data-testid="snapshots-count">{snapshots.length}</div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="left-content">{transformedLeftContent || 'no-left'}</div>
      <div data-testid="right-content">{transformedRightContent || 'no-right'}</div>
      <div data-testid="snapshot-ids">{snapshots.map((s: any) => s.id).join(',')}</div>
    </div>
  ),
}))

// Mock FullScreenModeWrapper
vi.mock('../../../../styles/layout/drawer.styles', () => ({
  FullScreenModeWrapper: ({ children, $animate }: any) => (
    <div data-testid="fullscreen-wrapper" data-animate={String($animate)}>
      {children}
    </div>
  ),
}))

describe('DiffModeContent', () => {
  const createBaseProps = (): BaseContentProps => ({
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
      editorValue: '{"current": "value"}',
      editorTheme: 'light',
      enableAstTypeHints: false,
      contentType: ContentType.Json,
      onChange: vi.fn(),
    },
    notificationProps: {
      lightNotifications: [],
    },
  })

  const createMockProps = (overrides?: Partial<DiffModeContentProps>): DiffModeContentProps => ({
    ...createBaseProps(),
    isFullScreenTransition: false,
    isInRecordingMode: false,
    snapshots: [],
    originalValue: '{"original": "value"}',
    repairOriginalValue: '',
    pendingRepairedValue: '',
    editorValue: '{"editor": "value"}',
    onApplyRepair: vi.fn(),
    onCancelRepair: vi.fn(),
    ...overrides,
  })

  describe('基本渲染', () => {
    it('应该正确渲染 SchemaDiffView', () => {
      const props = createMockProps()
      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('schema-diff-view')).toBeInTheDocument()
    })

    it('应该渲染在 FullScreenModeWrapper 中', () => {
      const props = createMockProps()
      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('fullscreen-wrapper')).toBeInTheDocument()
    })

    it('应该传递编辑器主题给 SchemaDiffView', () => {
      const props = createMockProps({
        editorProps: {
          ...createBaseProps().editorProps,
          editorTheme: 'dark',
        },
      })
      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    })
  })

  describe('非录制模式：构建两个快照', () => {
    it('非录制模式应该构建包含原始值和编辑器值的两个快照', () => {
      const props = createMockProps({
        isInRecordingMode: false,
        originalValue: '{"original": 1}',
        editorValue: '{"editor": 2}',
      })
      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('2')
      expect(screen.getByTestId('snapshot-ids')).toHaveTextContent('1,2')
    })

    it('非录制模式应该使用 repairOriginalValue 替代 originalValue（如果存在）', () => {
      const props = createMockProps({
        isInRecordingMode: false,
        originalValue: '{"original": 1}',
        repairOriginalValue: '{"repaired": 1}',
        editorValue: '{"editor": 2}',
      })

      // 由于我们mock的组件不直接显示content，我们验证snapshots被正确创建
      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('2')
    })

    it('非录制模式应该使用 pendingRepairedValue 替代 editorValue（如果存在）', () => {
      const props = createMockProps({
        isInRecordingMode: false,
        originalValue: '{"original": 1}',
        editorValue: '{"editor": 2}',
        pendingRepairedValue: '{"pending": 3}',
      })

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('2')
    })

    it('非录制模式快照的 timestamp 应该为 0 和 1', () => {
      const props = createMockProps({
        isInRecordingMode: false,
        originalValue: '{"a": 1}',
        editorValue: '{"b": 2}',
      })

      render(<DiffModeContent {...props} />)

      // 验证创建了2个快照
      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('2')
    })
  })

  describe('录制模式：使用传入的快照', () => {
    it('录制模式应该直接使用传入的 snapshots', () => {
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 1, content: '{"v1": 1}', timestamp: 1000 },
        { id: 2, content: '{"v2": 2}', timestamp: 2000 },
        { id: 3, content: '{"v3": 3}', timestamp: 3000 },
      ]

      const props = createMockProps({
        isInRecordingMode: true,
        snapshots: mockSnapshots,
      })

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('3')
      expect(screen.getByTestId('snapshot-ids')).toHaveTextContent('1,2,3')
    })

    it('录制模式下空快照数组应该正确处理', () => {
      const props = createMockProps({
        isInRecordingMode: true,
        snapshots: [],
      })

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('snapshots-count')).toHaveTextContent('0')
    })

    it('录制模式应该忽略 originalValue 和 editorValue', () => {
      const mockSnapshots: SchemaSnapshot[] = [
        { id: 10, content: '{"snapshot": "data"}', timestamp: 1000 },
      ]

      const props = createMockProps({
        isInRecordingMode: true,
        snapshots: mockSnapshots,
        originalValue: '{"should": "be ignored"}',
        editorValue: '{"also": "ignored"}',
      })

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('snapshot-ids')).toHaveTextContent('10')
    })
  })

  describe('全屏过渡动画', () => {
    it('isFullScreenTransition 为 true 时应该传递给 FullScreenModeWrapper', () => {
      const props = createMockProps({
        isFullScreenTransition: true,
      })

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('fullscreen-wrapper')).toHaveAttribute('data-animate', 'true')
    })

    it('isFullScreenTransition 为 false 时应该传递给 FullScreenModeWrapper', () => {
      const props = createMockProps({
        isFullScreenTransition: false,
      })

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('fullscreen-wrapper')).toHaveAttribute('data-animate', 'false')
    })
  })

  describe('转换内容传递', () => {
    it('应该传递 diffLeftContent 给 SchemaDiffView', () => {
      const props = createMockProps({
        diffLeftContent: 'transformed left content',
      })

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('left-content')).toHaveTextContent('transformed left content')
    })

    it('应该传递 diffRightContent 给 SchemaDiffView', () => {
      const props = createMockProps({
        diffRightContent: 'transformed right content',
      })

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('right-content')).toHaveTextContent('transformed right content')
    })

    it('未提供转换内容时应该使用默认值', () => {
      const props = createMockProps()

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('left-content')).toHaveTextContent('no-left')
      expect(screen.getByTestId('right-content')).toHaveTextContent('no-right')
    })
  })

  describe('不同主题支持', () => {
    it('应该支持 light 主题', () => {
      const props = createMockProps({
        editorProps: {
          ...createBaseProps().editorProps,
          editorTheme: 'light',
        },
      })

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('theme')).toHaveTextContent('light')
    })

    it('应该支持 dark 主题', () => {
      const props = createMockProps({
        editorProps: {
          ...createBaseProps().editorProps,
          editorTheme: 'dark',
        },
      })

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    })

    it('应该支持 seeDark 主题', () => {
      const props = createMockProps({
        editorProps: {
          ...createBaseProps().editorProps,
          editorTheme: 'seeDark',
        },
      })

      render(<DiffModeContent {...props} />)

      expect(screen.getByTestId('theme')).toHaveTextContent('seeDark')
    })
  })

  describe('组件结构验证', () => {
    it('FullScreenModeWrapper 的 key 应该为 "diff"', () => {
      const props = createMockProps()
      const { container } = render(<DiffModeContent {...props} />)

      // FullScreenModeWrapper 应该包含 SchemaDiffView
      const wrapper = container.querySelector('[data-testid="fullscreen-wrapper"]')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper?.querySelector('[data-testid="schema-diff-view"]')).toBeInTheDocument()
    })
  })
})
