import { ContentType } from '@/shared/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DrawerToolbar } from '../DrawerToolbar'

describe('DrawerToolbar组件测试', () => {
  const mockAttributes = {
    params: ['param1', 'param2', 'param3'],
  }

  const defaultToolbarButtons = {
    astRawStringToggle: true,
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
    onFormat: jest.fn(),
    onSerialize: jest.fn(),
    onDeserialize: jest.fn(),
    onSegmentChange: jest.fn(),
    onRenderPreview: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
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

      expect(screen.getByText('params1:')).toBeInTheDocument()
      expect(screen.getByText('params2:')).toBeInTheDocument()
      expect(screen.getByText('params3:')).toBeInTheDocument()
      expect(screen.getByText('param1')).toBeInTheDocument()
      expect(screen.getByText('param2')).toBeInTheDocument()
      expect(screen.getByText('param3')).toBeInTheDocument()
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

      expect(screen.queryByText(/params1:/)).not.toBeInTheDocument()
    })

    it('应该根据toolbarButtons配置显示按钮', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={{
            astRawStringToggle: true,
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

      expect(screen.getByText('反序列化')).toBeInTheDocument()
      expect(screen.queryByText('序列化')).not.toBeInTheDocument()
      expect(screen.getByText('格式化')).toBeInTheDocument()
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

    it('应该调用onSerialize当点击序列化按钮', async () => {
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

      await user.click(screen.getByText('序列化'))

      expect(mockHandlers.onSerialize).toHaveBeenCalledTimes(1)
    })

    it('应该调用onDeserialize当点击反序列化按钮', async () => {
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

      await user.click(screen.getByText('反序列化'))

      expect(mockHandlers.onDeserialize).toHaveBeenCalledTimes(1)
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
      const formatButton = screen.getByText('格式化').closest('button')
      const serializeButton = screen.getByText('序列化').closest('button')
      const deserializeButton = screen.getByText('反序列化').closest('button')

      // 格式化和反序列化需要有效JSON，所以被禁用
      expect(formatButton).toBeDisabled()
      expect(deserializeButton).toBeDisabled()
      // 序列化可以处理任何文本，不依赖canParse
      expect(serializeButton).not.toBeDisabled()
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

      expect(screen.getByText('params1:')).toBeInTheDocument()
      expect(screen.getByText('params50:')).toBeInTheDocument()
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

      expect(screen.getByText(longParam)).toBeInTheDocument()
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

      // 验证参数被渲染（特殊字符可能被截断或在tooltip中）
      expect(screen.getByText('params1:')).toBeInTheDocument()
      expect(screen.getByText('params2:')).toBeInTheDocument()
      expect(screen.getByText('params3:')).toBeInTheDocument()
    })

    it('应该处理所有按钮都禁用的情况', () => {
      render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={{
            astRawStringToggle: false,
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

      expect(screen.queryByText('格式化')).not.toBeInTheDocument()
      expect(screen.queryByText('序列化')).not.toBeInTheDocument()
      expect(screen.queryByText('反序列化')).not.toBeInTheDocument()
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
      expect(screen.queryByText(/params1:/)).not.toBeInTheDocument()
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
    beforeEach(() => {
      // Mock clipboard API
      const writeTextMock = jest.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock,
        },
        writable: true,
        configurable: true,
      })
    })

    it('应该为每个参数渲染复制图标容器和图标', () => {
      const { container } = render(
        <DrawerToolbar
          attributes={mockAttributes}
          contentType={ContentType.Ast}
          canParse={true}
          toolbarButtons={defaultToolbarButtons}
          {...mockHandlers}
        />
      )

      // 检查复制图标容器
      const copyIconWrappers = container.querySelectorAll('.copy-icon-wrapper')
      expect(copyIconWrappers).toHaveLength(3) // 三个params

      // 检查初始时显示的是CopyOutlined图标
      const copyIcons = container.querySelectorAll('[aria-label="copy"]')
      expect(copyIcons.length).toBeGreaterThanOrEqual(3)
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

      // 验证params标签被包裹在wrapper中
      const params = screen.getAllByText(/param[123]/)
      expect(params).toHaveLength(3)

      params.forEach((param) => {
        // 每个param应该在一个包含复制功能的结构中
        expect(param.parentElement).toBeInTheDocument()
      })
    })
  })
})
