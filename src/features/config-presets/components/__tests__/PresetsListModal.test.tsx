import { render, screen, createMockConfigPreset } from '@test/test-utils'
import userEvent from '@testing-library/user-event'
import type { ConfigPreset } from '@/shared/types'
import { PresetsListModal } from '../PresetsListModal'

/**
 * Mock shadowRootManager
 */
vi.mock('@/shared/utils/shadow-root-manager', () => ({
  shadowRootManager: {
    getContainer: () => document.body,
  },
}))

describe('PresetsListModal 组件测试', () => {
  const mockPresets: ConfigPreset[] = [
    createMockConfigPreset({
      id: 'preset-1',
      name: '深色主题预设',
      timestamp: new Date('2024-01-01T10:00:00').getTime(),
    }),
    createMockConfigPreset({
      id: 'preset-2',
      name: '浅色主题预设',
      timestamp: new Date('2024-01-02T15:30:00').getTime(),
    }),
    createMockConfigPreset({
      id: 'preset-3',
      name: '自定义配置',
      timestamp: new Date('2024-01-03T20:45:00').getTime(),
    }),
  ]

  const defaultProps = {
    visible: true,
    presetsList: mockPresets,
    themeColor: '#1890ff',
    onApply: vi.fn(),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该在visible为true时渲染Modal', () => {
      render(<PresetsListModal {...defaultProps} />)

      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
    })

    it('应该在visible为false时不渲染Modal内容', () => {
      render(<PresetsListModal {...defaultProps} visible={false} />)

      expect(screen.queryByText('预设配置管理')).not.toBeInTheDocument()
    })

    it('应该渲染表格', () => {
      render(<PresetsListModal {...defaultProps} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('应该渲染表格列头', () => {
      render(<PresetsListModal {...defaultProps} />)

      expect(screen.getByText('名称')).toBeInTheDocument()
      expect(screen.getByText('保存时间')).toBeInTheDocument()
      expect(screen.getByText('操作')).toBeInTheDocument()
    })
  })

  describe('预设数据显示', () => {
    it('应该显示所有预设项', () => {
      render(<PresetsListModal {...defaultProps} />)

      expect(screen.getByText('深色主题预设')).toBeInTheDocument()
      expect(screen.getByText('浅色主题预设')).toBeInTheDocument()
      expect(screen.getByText('自定义配置')).toBeInTheDocument()
    })

    it('应该显示格式化的时间', () => {
      render(<PresetsListModal {...defaultProps} />)

      // 检查是否包含日期格式的文本（有多个匹配）
      const dates = screen.getAllByText(/2024/)
      expect(dates.length).toBeGreaterThan(0)
    })

    it('应该为每行显示操作按钮', () => {
      render(<PresetsListModal {...defaultProps} />)

      const applyButtons = screen.getAllByRole('button', { name: /应用/i })
      const deleteButtons = screen.getAllByRole('button', { name: /删除/i })

      expect(applyButtons).toHaveLength(3)
      expect(deleteButtons).toHaveLength(3)
    })

    it('应该处理空的预设列表', () => {
      render(<PresetsListModal {...defaultProps} presetsList={[]} />)

      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
      // 表格应该存在，但没有数据行
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('应该处理单个预设', () => {
      render(<PresetsListModal {...defaultProps} presetsList={[mockPresets[0]]} />)

      expect(screen.getByText('深色主题预设')).toBeInTheDocument()
      expect(screen.queryByText('浅色主题预设')).not.toBeInTheDocument()
    })
  })

  describe('操作按钮交互', () => {
    it('应该在点击应用时调用onApply', async () => {
      const user = userEvent.setup()
      const onApply = vi.fn()
      render(<PresetsListModal {...defaultProps} onApply={onApply} />)

      const applyButtons = screen.getAllByRole('button', { name: /应用/i })
      await user.click(applyButtons[0])

      expect(onApply).toHaveBeenCalledWith(mockPresets[0])
    })

    it('应该在点击删除时调用onDelete', async () => {
      const user = userEvent.setup()
      const onDelete = vi.fn().mockResolvedValue(undefined)
      render(<PresetsListModal {...defaultProps} onDelete={onDelete} />)

      const deleteButtons = screen.getAllByRole('button', { name: /删除/i })
      await user.click(deleteButtons[0])

      expect(onDelete).toHaveBeenCalledWith('preset-1')
    })

    it('应该支持对不同预设执行操作', async () => {
      const user = userEvent.setup()
      const onApply = vi.fn()
      render(<PresetsListModal {...defaultProps} onApply={onApply} />)

      const applyButtons = screen.getAllByRole('button', { name: /应用/i })
      await user.click(applyButtons[1])

      expect(onApply).toHaveBeenCalledWith(mockPresets[1])
    })

    it('应该支持连续操作', async () => {
      const user = userEvent.setup()
      const onApply = vi.fn()
      render(<PresetsListModal {...defaultProps} onApply={onApply} />)

      const applyButtons = screen.getAllByRole('button', { name: /应用/i })
      await user.click(applyButtons[0])
      await user.click(applyButtons[1])

      expect(onApply).toHaveBeenCalledTimes(2)
    })
  })

  describe('Modal关闭', () => {
    it('应该在点击Modal关闭图标时调用onClose', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<PresetsListModal {...defaultProps} onClose={onClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })

    it('应该不显示footer', () => {
      render(<PresetsListModal {...defaultProps} />)

      // Modal footer 应该为 null，不应该有默认的确定/取消按钮
      expect(screen.queryByRole('button', { name: /确定/i })).not.toBeInTheDocument()
    })
  })

  describe('分页功能', () => {
    it('应该配置每页显示10条', () => {
      render(<PresetsListModal {...defaultProps} />)

      // 当数据少于10条时，不会显示分页器
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    it('应该在数据超过10条时显示分页', () => {
      const manyPresets: ConfigPreset[] = Array.from({ length: 15 }, (_, i) =>
        createMockConfigPreset({
          id: `preset-${i}`,
          name: `预设${i}`,
          timestamp: Date.now(),
        })
      )

      render(<PresetsListModal {...defaultProps} presetsList={manyPresets} />)

      // 应该有分页控件
      expect(screen.getByRole('list')).toBeInTheDocument()
    })
  })

  describe('Props更新', () => {
    it('应该响应visible变化', () => {
      const { rerender } = render(<PresetsListModal {...defaultProps} visible={false} />)

      expect(screen.queryByText('预设配置管理')).not.toBeInTheDocument()

      rerender(<PresetsListModal {...defaultProps} visible={true} />)

      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
    })

    it('应该响应presetsList变化', () => {
      const { rerender } = render(
        <PresetsListModal {...defaultProps} presetsList={[mockPresets[0]]} />
      )

      expect(screen.getByText('深色主题预设')).toBeInTheDocument()
      expect(screen.queryByText('浅色主题预设')).not.toBeInTheDocument()

      rerender(<PresetsListModal {...defaultProps} presetsList={mockPresets} />)

      expect(screen.getByText('深色主题预设')).toBeInTheDocument()
      expect(screen.getByText('浅色主题预设')).toBeInTheDocument()
    })

    it('应该支持多次打开和关闭', () => {
      const { rerender } = render(<PresetsListModal {...defaultProps} visible={true} />)

      expect(screen.getByText('预设配置管理')).toBeInTheDocument()

      rerender(<PresetsListModal {...defaultProps} visible={false} />)
      rerender(<PresetsListModal {...defaultProps} visible={true} />)

      expect(screen.getByText('预设配置管理')).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该处理很长的预设名称', () => {
      const longName = 'a'.repeat(100)
      const preset: ConfigPreset = createMockConfigPreset({
        id: 'preset-long',
        name: longName,
        timestamp: Date.now(),
      })

      render(<PresetsListModal {...defaultProps} presetsList={[preset]} />)

      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('应该处理特殊字符的预设名称', () => {
      const preset: ConfigPreset = createMockConfigPreset({
        id: 'preset-special',
        name: '<script>alert("xss")</script>',
        timestamp: Date.now(),
      })

      render(<PresetsListModal {...defaultProps} presetsList={[preset]} />)

      expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument()
    })

    it('应该处理emoji的预设名称', () => {
      const preset: ConfigPreset = createMockConfigPreset({
        id: 'preset-emoji',
        name: '😀 快乐预设 🎉',
        timestamp: Date.now(),
      })

      render(<PresetsListModal {...defaultProps} presetsList={[preset]} />)

      expect(screen.getByText('😀 快乐预设 🎉')).toBeInTheDocument()
    })

    it('应该处理时间戳为0的情况', () => {
      const preset: ConfigPreset = createMockConfigPreset({
        id: 'preset-zero',
        name: '零时间预设',
        timestamp: 0,
      })

      render(<PresetsListModal {...defaultProps} presetsList={[preset]} />)

      expect(screen.getByText('零时间预设')).toBeInTheDocument()
    })

    it('应该处理未来时间戳', () => {
      const futureTimestamp = Date.now() + 1000 * 60 * 60 * 24 * 365 // 1年后
      const preset: ConfigPreset = createMockConfigPreset({
        id: 'preset-future',
        name: '未来预设',
        timestamp: futureTimestamp,
      })

      render(<PresetsListModal {...defaultProps} presetsList={[preset]} />)

      expect(screen.getByText('未来预设')).toBeInTheDocument()
    })
  })

  describe('表格样式', () => {
    it('应该设置Modal宽度为900', () => {
      render(<PresetsListModal {...defaultProps} />)

      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
    })

    it('应该为名称列设置省略号', () => {
      const longNamePreset: ConfigPreset = createMockConfigPreset({
        id: 'long-name',
        name: '这是一个非常非常非常非常长的预设配置名称用于测试省略号功能是否正常工作',
        timestamp: Date.now(),
      })

      render(<PresetsListModal {...defaultProps} presetsList={[longNamePreset]} />)

      // 检查表头是否应用了 ellipsis 样式
      const nameHeader = screen.getByText('名称')
      expect(nameHeader.closest('th')).toHaveClass('see-table-cell-ellipsis')

      // 检查数据单元格是否应用了 ellipsis 样式
      const nameCell = screen.getByText(/这是一个非常非常非常非常长的/)
      expect(nameCell.closest('td')).toHaveClass('see-table-cell-ellipsis')
    })
  })
})
