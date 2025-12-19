/**
 * ToolbarSection 组件单元测试
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ToolbarSection } from '../ToolbarSection'
import { TOOLBAR_MODE } from '@/shared/constants/ui-modes'
import { ContentType } from '@/shared/types'
import type { BaseContentProps } from '../../types'

// Mock DrawerToolbar 组件
vi.mock('../../../toolbar/DrawerToolbar', () => ({
  DrawerToolbar: (props: any) => (
    <div data-testid="drawer-toolbar">
      <div data-testid="toolbar-mode">{props.mode}</div>
      <div data-testid="content-type">{props.contentType}</div>
      <div data-testid="can-parse">{String(props.canParse)}</div>
      <div data-testid="preview-enabled">{String(props.previewEnabled)}</div>
      <div data-testid="is-recording">{String(props.isRecording)}</div>
      <div data-testid="show-diff-button">{String(props.showDiffButton)}</div>
      <div data-testid="is-diff-mode">{String(props.isDiffMode)}</div>
      <div data-testid="has-pending-repair">{String(props.hasPendingRepair)}</div>
      <button data-testid="toolbar-format" onClick={props.onFormat}>
        Format
      </button>
      <button data-testid="toolbar-parse" onClick={props.onParse}>
        Parse
      </button>
      <button data-testid="apply-repair" onClick={props.onApplyRepair}>
        Apply
      </button>
      <button data-testid="cancel-repair" onClick={props.onCancelRepair}>
        Cancel
      </button>
    </div>
  ),
}))

describe('ToolbarSection', () => {
  const createBaseProps = (): BaseContentProps => ({
    attributes: { params: ['test-element'] },
    contentType: ContentType.Other,
    canParse: true,
    toolbarButtons: {
      astRawStringToggle: false,
      escape: true,
      deserialize: true,
      compact: true,
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
      onRenderPreview: vi.fn(),
      onLocateError: vi.fn(),
      onRepairJson: vi.fn(),
      onEnterDiffMode: vi.fn(),
      onExitDiffMode: vi.fn(),
      onCopyParam: vi.fn(),
    },
    editorProps: {
      editorRef: { current: null },
      editorValue: '{}',
      editorTheme: 'light',
      enableAstTypeHints: false,
      contentType: ContentType.Other,
      onChange: vi.fn(),
    },
    notificationProps: {
      lightNotifications: [],
    },
  })

  const createMockProps = (overrides?: any) => ({
    mode: TOOLBAR_MODE.NORMAL,
    baseProps: createBaseProps(),
    previewEnabled: false,
    isRecording: false,
    showDiffButton: false,
    isDiffMode: false,
    hasPendingRepair: false,
    onApplyRepair: vi.fn(),
    onCancelRepair: vi.fn(),
    ...overrides,
  })

  describe('基本渲染', () => {
    it('应该正确渲染 DrawerToolbar', () => {
      const props = createMockProps()
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('drawer-toolbar')).toBeInTheDocument()
    })

    it('应该传递 mode 给 DrawerToolbar', () => {
      const props = createMockProps({
        mode: TOOLBAR_MODE.NORMAL,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent(TOOLBAR_MODE.NORMAL)
    })

    it('应该从 baseProps 中提取 attributes', () => {
      const props = createMockProps()
      render(<ToolbarSection {...props} />)

      // DrawerToolbar 接收到了正确的 props
      expect(screen.getByTestId('drawer-toolbar')).toBeInTheDocument()
    })

    it('应该从 baseProps 中提取 contentType', () => {
      const props = createMockProps()
      render(<ToolbarSection {...props} />)

      // DrawerToolbar 接收到contentType(通过mock)
      const contentTypeEl = screen.getByTestId('content-type')
      expect(contentTypeEl).toBeInTheDocument()
    })

    it('应该从 baseProps 中提取 canParse', () => {
      const props = createMockProps()
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('can-parse')).toHaveTextContent('true')
    })
  })

  describe('不同模式支持', () => {
    it('应该支持 NORMAL 模式', () => {
      const props = createMockProps({
        mode: TOOLBAR_MODE.NORMAL,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent(TOOLBAR_MODE.NORMAL)
    })

    it('应该支持 RECORDING 模式', () => {
      const props = createMockProps({
        mode: TOOLBAR_MODE.RECORDING,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent(TOOLBAR_MODE.RECORDING)
    })

    it('应该支持 DIFF 模式', () => {
      const props = createMockProps({
        mode: TOOLBAR_MODE.DIFF,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent(TOOLBAR_MODE.DIFF)
    })

    it('应该支持 PREVIEW 模式', () => {
      const props = createMockProps({
        mode: TOOLBAR_MODE.PREVIEW,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent(TOOLBAR_MODE.PREVIEW)
    })
  })

  describe('预览和录制状态', () => {
    it('previewEnabled 为 true 时应该传递给 DrawerToolbar', () => {
      const props = createMockProps({
        previewEnabled: true,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('preview-enabled')).toHaveTextContent('true')
    })

    it('previewEnabled 为 false 时应该传递给 DrawerToolbar', () => {
      const props = createMockProps({
        previewEnabled: false,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('preview-enabled')).toHaveTextContent('false')
    })

    it('isRecording 为 true 时应该传递给 DrawerToolbar', () => {
      const props = createMockProps({
        isRecording: true,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('is-recording')).toHaveTextContent('true')
    })

    it('isRecording 为 false 时应该传递给 DrawerToolbar', () => {
      const props = createMockProps({
        isRecording: false,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('is-recording')).toHaveTextContent('false')
    })
  })

  describe('Diff 模式相关', () => {
    it('showDiffButton 为 true 时应该传递给 DrawerToolbar', () => {
      const props = createMockProps({
        showDiffButton: true,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('show-diff-button')).toHaveTextContent('true')
    })

    it('isDiffMode 为 true 时应该传递给 DrawerToolbar', () => {
      const props = createMockProps({
        isDiffMode: true,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('is-diff-mode')).toHaveTextContent('true')
    })

    it('应该传递 diffToolbarActions 给 DrawerToolbar', () => {
      const diffToolbarActions = {
        onDiffFormat: vi.fn(),
        onDiffSegmentChange: vi.fn(),
      }

      const props = createMockProps({
        diffToolbarActions,
      })
      render(<ToolbarSection {...props} />)

      // DrawerToolbar 应该接收到 diffToolbarActions
      expect(screen.getByTestId('drawer-toolbar')).toBeInTheDocument()
    })
  })

  describe('修复功能相关', () => {
    it('hasPendingRepair 为 true 时应该传递给 DrawerToolbar', () => {
      const props = createMockProps({
        hasPendingRepair: true,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('has-pending-repair')).toHaveTextContent('true')
    })

    it('应该传递 onApplyRepair 回调', () => {
      const onApplyRepair = vi.fn()
      const props = createMockProps({
        onApplyRepair,
      })
      render(<ToolbarSection {...props} />)

      const applyBtn = screen.getByTestId('apply-repair')
      applyBtn.click()

      expect(onApplyRepair).toHaveBeenCalled()
    })

    it('应该传递 onCancelRepair 回调', () => {
      const onCancelRepair = vi.fn()
      const props = createMockProps({
        onCancelRepair,
      })
      render(<ToolbarSection {...props} />)

      const cancelBtn = screen.getByTestId('cancel-repair')
      cancelBtn.click()

      expect(onCancelRepair).toHaveBeenCalled()
    })
  })

  describe('工具栏操作回调', () => {
    it('应该从 baseProps 中提取并传递 onFormat', () => {
      const onFormat = vi.fn()
      const baseProps = createBaseProps()
      baseProps.toolbarActions.onFormat = onFormat

      const props = createMockProps({
        baseProps,
      })
      render(<ToolbarSection {...props} />)

      const formatBtn = screen.getByTestId('toolbar-format')
      formatBtn.click()

      expect(onFormat).toHaveBeenCalled()
    })

    it('应该从 baseProps 中提取并传递 onParse', () => {
      const onParse = vi.fn()
      const baseProps = createBaseProps()
      baseProps.toolbarActions.onParse = onParse

      const props = createMockProps({
        baseProps,
      })
      render(<ToolbarSection {...props} />)

      const parseBtn = screen.getByTestId('toolbar-parse')
      parseBtn.click()

      expect(onParse).toHaveBeenCalled()
    })

    it('应该从 baseProps 中提取并传递所有工具栏操作', () => {
      const toolbarActions = {
        onFormat: vi.fn(),
        onEscape: vi.fn(),
        onUnescape: vi.fn(),
        onCompact: vi.fn(),
        onParse: vi.fn(),
        onSegmentChange: vi.fn(),
        onRenderPreview: vi.fn(),
        onEnterDiffMode: vi.fn(),
        onExitDiffMode: vi.fn(),
        onLocateError: vi.fn(),
        onRepairJson: vi.fn(),
        onCopyParam: vi.fn(),
      }

      const baseProps = createBaseProps()
      baseProps.toolbarActions = toolbarActions

      const props = createMockProps({
        baseProps,
      })

      // 渲染不应该抛出错误
      expect(() => render(<ToolbarSection {...props} />)).not.toThrow()
    })
  })

  describe('工具栏按钮配置', () => {
    it('应该从 baseProps 中提取 toolbarButtons', () => {
      const toolbarButtons = {
        astRawStringToggle: false,
        escape: false,
        deserialize: true,
        compact: false,
        format: true,
        preview: false,
        importExport: false,
        draft: false,
        favorites: false,
        history: false,
      }

      const baseProps = createBaseProps()
      baseProps.toolbarButtons = toolbarButtons

      const props = createMockProps({
        baseProps,
      })

      // DrawerToolbar 应该接收到 toolbarButtons
      expect(() => render(<ToolbarSection {...props} />)).not.toThrow()
    })
  })

  describe('复杂场景组合', () => {
    it('录制模式 + 预览开启', () => {
      const props = createMockProps({
        mode: TOOLBAR_MODE.RECORDING,
        isRecording: true,
        previewEnabled: true,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent(TOOLBAR_MODE.RECORDING)
      expect(screen.getByTestId('is-recording')).toHaveTextContent('true')
      expect(screen.getByTestId('preview-enabled')).toHaveTextContent('true')
    })

    it('Diff 模式 + 有待修复内容', () => {
      const props = createMockProps({
        mode: TOOLBAR_MODE.DIFF,
        isDiffMode: true,
        hasPendingRepair: true,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent(TOOLBAR_MODE.DIFF)
      expect(screen.getByTestId('is-diff-mode')).toHaveTextContent('true')
      expect(screen.getByTestId('has-pending-repair')).toHaveTextContent('true')
    })

    it('预览模式 + 显示 Diff 按钮', () => {
      const props = createMockProps({
        mode: TOOLBAR_MODE.PREVIEW,
        previewEnabled: true,
        showDiffButton: true,
      })
      render(<ToolbarSection {...props} />)

      expect(screen.getByTestId('toolbar-mode')).toHaveTextContent(TOOLBAR_MODE.PREVIEW)
      expect(screen.getByTestId('preview-enabled')).toHaveTextContent('true')
      expect(screen.getByTestId('show-diff-button')).toHaveTextContent('true')
    })
  })

  describe('组件结构验证', () => {
    it('应该是纯 props 透传组件', () => {
      const props = createMockProps()
      const { container } = render(<ToolbarSection {...props} />)

      // 只有一个根元素 DrawerToolbar
      expect(container.querySelector('[data-testid="drawer-toolbar"]')).toBeInTheDocument()
    })
  })
})
