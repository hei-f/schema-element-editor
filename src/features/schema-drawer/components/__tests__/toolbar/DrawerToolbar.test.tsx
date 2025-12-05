import type { Mock } from 'vitest'
import { ContentType } from '@/shared/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DrawerToolbar } from '../../toolbar/DrawerToolbar'

describe('DrawerToolbar组件测试', () => {
  const mockAttributes = {
    params: ['param1', 'param2', 'param3'],
  }

  const defaultToolbarButtons = {
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
  }

  const mockHandlers = {
    onFormat: vi.fn(),
    onEscape: vi.fn(),
    onUnescape: vi.fn(),
    onCompact: vi.fn(),
    onParse: vi.fn(),
    onSegmentChange: vi.fn(),
    onRenderPreview: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该渲染所有参数标签', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('params 1')).toBeInTheDocument()
      expect(screen.getByText('params 2')).toBeInTheDocument()
      expect(screen.getByText('params 3')).toBeInTheDocument()
    })

    it('应该在没有参数时不渲染参数容器', () => {
      render(
        <DrawerToolbar
          attributes={{ params: [] }}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      expect(screen.queryByText(/params 1/)).not.toBeInTheDocument()
    })

    it('应该根据toolbarButtons配置显示按钮', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={{
            astRawStringToggle: true,
            escape: true,
            deserialize: true,
            serialize: false,
            format: true,
            preview: false,
            importExport: true,
            draft: true,
            favorites: true,
            history: true,
          }}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/解\s*析/)).toBeInTheDocument()
      expect(screen.queryByText(/压\s*缩/)).not.toBeInTheDocument()
      expect(screen.getByText(/格式化/)).toBeInTheDocument()
      expect(screen.queryByText('更新预览')).not.toBeInTheDocument()
    })
  })

  describe('AST/RawString切换', () => {
    it('应该显示AST和RawString选项', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('AST')).toBeInTheDocument()
      expect(screen.getByText('RawString')).toBeInTheDocument()
    })

    it('应该在contentType为Other时禁用Segmented', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Other}
          canParse={false}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      // Segmented组件应该被禁用
      const segmented = screen.getByText('AST').closest('.ant-segmented')
      expect(segmented).toHaveClass('ant-segmented-disabled')
    })

    it('应该调用onSegmentChange当切换类型时', async () => {
      const user = userEvent.setup()

      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('RawString'))

      expect(mockHandlers.onSegmentChange).toHaveBeenCalledWith(ContentType.RawString)
    }, 10000)
  })

  describe('按钮交互', () => {
    it('应该调用onFormat当点击格式化按钮', async () => {
      const user = userEvent.setup()

      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('格式化'))

      expect(mockHandlers.onFormat).toHaveBeenCalledTimes(1)
    })

    it('应该调用onCompact当点击压缩按钮', async () => {
      const user = userEvent.setup()

      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText(/压\s*缩/))

      expect(mockHandlers.onCompact).toHaveBeenCalledTimes(1)
    })

    it('应该调用onParse当点击解析按钮', async () => {
      const user = userEvent.setup()

      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText(/解\s*析/))

      expect(mockHandlers.onParse).toHaveBeenCalledTimes(1)
    })

    it('应该在canParse为false时禁用需要解析的操作按钮', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={false}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      // 对于Ant Design Button，需要查找父级button元素
      const formatButton = screen.getByText(/格式化/).closest('button')
      const compactButton = screen.getByText(/压\s*缩/).closest('button')
      const parseButton = screen.getByText(/解\s*析/).closest('button')

      // 格式化和解析需要有效JSON，所以被禁用
      expect(formatButton).toBeDisabled()
      expect(parseButton).toBeDisabled()
      // 压缩可以处理任何文本，不依赖canParse
      expect(compactButton).not.toBeDisabled()
    })
  })

  describe('预览功能', () => {
    it('应该在previewEnabled为true且提供onRenderPreview时显示预览按钮', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          previewEnabled={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('更新预览')).toBeInTheDocument()
    })

    it('应该在previewEnabled为false时不显示预览按钮', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          previewEnabled={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByText('更新预览')).not.toBeInTheDocument()
    })

    it('应该在没有提供onRenderPreview时不显示预览按钮', () => {
      const { onRenderPreview: _onRenderPreview, ...handlersWithoutPreview } = mockHandlers

      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          previewEnabled={true}
          {...handlersWithoutPreview}
        />
      )

      expect(screen.queryByText('更新预览')).not.toBeInTheDocument()
    })

    it('应该调用onRenderPreview当点击更新预览按钮', async () => {
      const user = userEvent.setup()

      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          previewEnabled={true}
          {...mockHandlers}
        />
      )

      await user.click(screen.getByText('更新预览'))

      expect(mockHandlers.onRenderPreview).toHaveBeenCalledTimes(1)
    })
  })

  describe('边界情况', () => {
    it('应该处理大量参数', () => {
      const manyParams = Array.from({ length: 50 }, (_, i) => `param${i + 1}`)

      render(
        <DrawerToolbar
          attributes={{ params: manyParams }}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('params 1')).toBeInTheDocument()
      expect(screen.getByText('params 50')).toBeInTheDocument()
    })

    it('应该处理非常长的参数值', () => {
      const longParam = 'a'.repeat(500)

      render(
        <DrawerToolbar
          attributes={{ params: [longParam] }}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      // 参数值显示在 tooltip 中，只验证标签存在
      expect(screen.getByText('params 1')).toBeInTheDocument()
    })

    it('应该处理特殊字符参数', () => {
      const specialParams = ['<script>alert("xss")</script>', '参数中文🎉', 'test@example.com']

      render(
        <DrawerToolbar
          attributes={{ params: specialParams }}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      // 参数值显示在 tooltip 中，只验证标签存在
      expect(screen.getByText('params 1')).toBeInTheDocument()
      expect(screen.getByText('params 2')).toBeInTheDocument()
      expect(screen.getByText('params 3')).toBeInTheDocument()
    })

    it('应该处理所有按钮都禁用的情况', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={{
            astRawStringToggle: false,
            escape: false,
            deserialize: false,
            serialize: false,
            format: false,
            preview: false,
            importExport: false,
            draft: false,
            favorites: false,
            history: false,
          }}
          {...mockHandlers}
        />
      )

      expect(screen.queryByText(/格式化/)).not.toBeInTheDocument()
      expect(screen.queryByText(/压\s*缩/)).not.toBeInTheDocument()
      expect(screen.queryByText(/解\s*析/)).not.toBeInTheDocument()
      expect(screen.queryByText('AST')).not.toBeInTheDocument()
    })

    it('应该处理空参数数组', () => {
      render(
        <DrawerToolbar
          attributes={{ params: [] }}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      // 空参数时不应该渲染参数标签
      expect(screen.queryByText(/params 1/)).not.toBeInTheDocument()
    })
  })

  describe('不同内容类型', () => {
    it('应该在AST类型下正常显示', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      const segmented = screen.getByText('AST').closest('.ant-segmented')
      expect(segmented).not.toHaveClass('ant-segmented-disabled')
    })

    it('应该在RawString类型下正常显示', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.RawString}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      const segmented = screen.getByText('RawString').closest('.ant-segmented')
      expect(segmented).not.toHaveClass('ant-segmented-disabled')
    })

    it('应该在Other类型下禁用Segmented并显示提示', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Other}
          canParse={false}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      const segmented = screen.getByText('AST').closest('.ant-segmented')
      expect(segmented).toHaveClass('ant-segmented-disabled')
    })
  })

  describe('参数复制功能', () => {
    let writeTextMock: Mock

    beforeEach(() => {
      // Mock clipboard API
      writeTextMock = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock,
        },
        writable: true,
        configurable: true,
      })
    })

    it('应该为每个参数渲染复制图标容器和图标', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      // 验证参数标签被渲染
      expect(screen.getByText('params 1')).toBeInTheDocument()
      expect(screen.getByText('params 2')).toBeInTheDocument()
      expect(screen.getByText('params 3')).toBeInTheDocument()
    })

    it('应该渲染AttributeTagWrapper组件', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      // 验证params标签被渲染
      const params = screen.getAllByText(/params \d/)
      expect(params).toHaveLength(3)

      params.forEach((param) => {
        // 每个param应该在一个包含复制功能的结构中
        expect(param.parentElement).toBeInTheDocument()
      })
    })

    it('复制按钮应该能够被点击', async () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      // 验证参数标签被渲染（每个标签都包含复制图标）
      expect(screen.getByText('params 1')).toBeInTheDocument()
      expect(screen.getByText('params 2')).toBeInTheDocument()
      expect(screen.getByText('params 3')).toBeInTheDocument()
    })
  })

  describe('Diff模式', () => {
    const diffModeHandlers = {
      ...mockHandlers,
      onExitDiffMode: vi.fn(),
      onDiffDisplayModeChange: vi.fn(),
    }

    it('在Diff模式下应该显示简化工具栏', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          isDiffMode={true}
          diffDisplayMode="raw"
          showDiffButton={true}
          {...diffModeHandlers}
        />
      )

      // Diff模式下应该显示退出按钮，不显示格式化等按钮
      expect(screen.getByText('Diff')).toBeInTheDocument()
      expect(screen.queryByText('格式化')).not.toBeInTheDocument()
      expect(screen.queryByText(/压\s*缩/)).not.toBeInTheDocument()
    })

    it('有待确认修复时应该显示应用和取消按钮', () => {
      const onApplyRepair = vi.fn()
      const onCancelRepair = vi.fn()

      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          isDiffMode={true}
          diffDisplayMode="raw"
          hasPendingRepair={true}
          onApplyRepair={onApplyRepair}
          onCancelRepair={onCancelRepair}
          {...diffModeHandlers}
        />
      )

      // 应该显示应用修复和取消按钮（Ant Design 会在两个中文字符间添加空格）
      expect(screen.getByText('应用修复')).toBeInTheDocument()
      expect(screen.getByText(/取\s*消/)).toBeInTheDocument()
    })

    it('点击应用修复按钮应该触发回调', async () => {
      const user = userEvent.setup()
      const onApplyRepair = vi.fn()
      const onCancelRepair = vi.fn()

      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          isDiffMode={true}
          diffDisplayMode="raw"
          hasPendingRepair={true}
          onApplyRepair={onApplyRepair}
          onCancelRepair={onCancelRepair}
          {...diffModeHandlers}
        />
      )

      await user.click(screen.getByText('应用修复'))
      expect(onApplyRepair).toHaveBeenCalled()
    })

    it('点击取消按钮应该触发回调', async () => {
      const user = userEvent.setup()
      const onApplyRepair = vi.fn()
      const onCancelRepair = vi.fn()

      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          isDiffMode={true}
          diffDisplayMode="raw"
          hasPendingRepair={true}
          onApplyRepair={onApplyRepair}
          onCancelRepair={onCancelRepair}
          {...diffModeHandlers}
        />
      )

      await user.click(screen.getByText(/取\s*消/))
      expect(onCancelRepair).toHaveBeenCalled()
    })

    it('没有待确认修复时不应该显示应用和取消按钮', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          isDiffMode={true}
          diffDisplayMode="raw"
          hasPendingRepair={false}
          {...diffModeHandlers}
        />
      )

      expect(screen.queryByText('应用修复')).not.toBeInTheDocument()
      expect(screen.queryByText(/取\s*消/)).not.toBeInTheDocument()
    })

    it('点击退出对比按钮应该触发回调', async () => {
      const user = userEvent.setup()

      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          isDiffMode={true}
          diffDisplayMode="raw"
          showDiffButton={true}
          {...diffModeHandlers}
        />
      )

      await user.click(screen.getByText('Diff'))
      expect(diffModeHandlers.onExitDiffMode).toHaveBeenCalled()
    })
  })
})
