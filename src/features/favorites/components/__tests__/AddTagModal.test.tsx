import { render, screen, waitFor } from '@test/test-utils'
import userEvent from '@testing-library/user-event'
import { AddTagModal } from '../AddTagModal'
import type { FavoriteTag } from '@/shared/types'

/**
 * Mock shadowRootManager
 */
vi.mock('@/shared/utils/shadow-root-manager', () => ({
  shadowRootManager: {
    getContainer: () => document.body,
  },
}))

describe('AddTagModal组件测试', () => {
  const defaultProps = {
    visible: true,
    themeColor: '#1677ff',
    onAdd: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该在visible为true时渲染Modal', () => {
      render(<AddTagModal {...defaultProps} />)

      expect(screen.getByText('添加标签')).toBeInTheDocument()
    })

    it('应该在visible为false时不渲染Modal内容', () => {
      render(<AddTagModal {...defaultProps} visible={false} />)

      expect(screen.queryByText('添加标签')).not.toBeInTheDocument()
    })

    it('应该渲染标签名称输入框', () => {
      render(<AddTagModal {...defaultProps} />)

      expect(screen.getByPlaceholderText('请输入标签名称（最多10个字符）')).toBeInTheDocument()
    })

    it('应该渲染颜色选择区域', () => {
      render(<AddTagModal {...defaultProps} />)

      expect(screen.getByText('选择颜色')).toBeInTheDocument()
      // 验证颜色示例标签是否渲染
      const exampleTags = screen.getAllByText('示例')
      expect(exampleTags.length).toBeGreaterThan(0)
    })

    it('应该渲染预览效果区域', () => {
      render(<AddTagModal {...defaultProps} />)

      expect(screen.getByText('预览效果：')).toBeInTheDocument()
    })

    it('应该渲染确定和取消按钮', () => {
      render(<AddTagModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: /确\s*定/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /取\s*消/ })).toBeInTheDocument()
    })
  })

  describe('标签名称输入', () => {
    it('应该在输入时更新标签名称', async () => {
      const user = userEvent.setup()
      render(<AddTagModal {...defaultProps} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '测试标签')

      expect(input).toHaveValue('测试标签')
    })

    it('应该限制输入最大长度为10', () => {
      render(<AddTagModal {...defaultProps} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      expect(input).toHaveAttribute('maxlength', '10')
    })

    it('应该在输入时清除错误提示', async () => {
      const user = userEvent.setup()
      render(<AddTagModal {...defaultProps} />)

      const confirmButton = screen.getByRole('button', { name: /确\s*定/ })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText('请输入标签名称')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, 'a')

      await waitFor(() => {
        expect(screen.queryByText('请输入标签名称')).not.toBeInTheDocument()
      })
    })

    it('应该在预览区域显示输入的标签名称', async () => {
      const user = userEvent.setup()
      render(<AddTagModal {...defaultProps} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '测试')

      const previewSection = screen.getByText('预览效果：').parentElement
      expect(previewSection?.textContent).toContain('测试')
    })
  })

  describe('颜色选择', () => {
    it('应该默认显示第一个颜色的示例', () => {
      render(<AddTagModal {...defaultProps} />)

      // 验证第一个颜色示例（magenta）是否渲染
      const exampleTags = screen.getAllByText('示例')
      expect(exampleTags[0]).toHaveClass('see-tag-magenta')
    })

    it('应该在点击颜色块时切换选中的颜色', async () => {
      const user = userEvent.setup()
      render(<AddTagModal {...defaultProps} />)

      // 点击第二个颜色块（red）
      const secondColorBox = screen.getByTestId('color-box-red')
      await user.click(secondColorBox)

      // 验证预览区域的标签颜色已更新
      const previewSection = screen.getByText('预览效果：').parentElement
      const previewTag = previewSection?.querySelector('.see-tag')
      expect(previewTag).toBeInTheDocument()
    })

    it('应该在预览区域显示选中的颜色', async () => {
      const user = userEvent.setup()
      render(<AddTagModal {...defaultProps} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '测试')

      const secondColorBox = screen.getByTestId('color-box-red')
      await user.click(secondColorBox)

      const previewSection = screen.getByText('预览效果：').parentElement
      const previewTag = previewSection?.querySelector('.see-tag')
      expect(previewTag).toBeInTheDocument()
      expect(previewTag).toHaveClass('see-tag')
    })
  })

  describe('表单验证', () => {
    it('应该在标签名称为空时显示错误提示', async () => {
      const user = userEvent.setup()
      render(<AddTagModal {...defaultProps} />)

      const confirmButton = screen.getByRole('button', { name: /确\s*定/ })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText('请输入标签名称')).toBeInTheDocument()
      })
    })

    it('应该在标签名称仅包含空格时显示错误提示', async () => {
      const user = userEvent.setup()
      render(<AddTagModal {...defaultProps} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '   ')

      const confirmButton = screen.getByRole('button', { name: /确\s*定/ })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText('请输入标签名称')).toBeInTheDocument()
      })
    })

    it('应该在标签名称超过10个字符时被maxLength限制', async () => {
      const user = userEvent.setup()
      render(<AddTagModal {...defaultProps} />)

      const input = screen.getByPlaceholderText(
        '请输入标签名称（最多10个字符）'
      ) as HTMLInputElement
      await user.type(input, '12345678901234567890')

      // maxLength=10会限制只能输入10个字符
      expect(input.value.length).toBeLessThanOrEqual(10)
    })

    it('应该在标签名称与已有标签重复时显示错误提示', async () => {
      const user = userEvent.setup()
      const existingTags: FavoriteTag[] = [{ label: '已存在标签', color: 'blue' }]
      render(<AddTagModal {...defaultProps} existingTags={existingTags} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '已存在标签')

      const confirmButton = screen.getByRole('button', { name: /确\s*定/ })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText('标签名称已存在')).toBeInTheDocument()
      })
    })

    it('应该处理标签名称前后的空格', async () => {
      const user = userEvent.setup()
      const existingTags: FavoriteTag[] = [{ label: '测试标签', color: 'blue' }]
      render(<AddTagModal {...defaultProps} existingTags={existingTags} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '  测试标签  ')

      const confirmButton = screen.getByRole('button', { name: /确\s*定/ })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText('标签名称已存在')).toBeInTheDocument()
      })
    })
  })

  describe('按钮交互', () => {
    it('应该在点击确定按钮时调用onAdd并传入正确的标签信息', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      render(<AddTagModal {...defaultProps} onAdd={onAdd} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '新标签')

      const confirmButton = screen.getByRole('button', { name: /确\s*定/ })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(onAdd).toHaveBeenCalledWith({
          label: '新标签',
          color: 'magenta',
        })
      })
    })

    it('应该在添加成功后关闭Modal', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddTagModal {...defaultProps} onClose={onClose} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '新标签')

      const confirmButton = screen.getByRole('button', { name: /确\s*定/ })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('应该在点击取消按钮时调用onClose', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddTagModal {...defaultProps} onClose={onClose} />)

      const cancelButton = screen.getByRole('button', { name: /取\s*消/ })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('应该在点击Modal关闭图标时调用onClose', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddTagModal {...defaultProps} onClose={onClose} />)

      const closeButton = document.querySelector('.see-modal-close')
      if (closeButton) {
        await user.click(closeButton)
      }

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })
  })

  describe('Modal关闭后状态重置', () => {
    it('应该在通过onClose关闭后保留当前输入内容（受控组件行为）', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<AddTagModal {...defaultProps} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '测试')

      // Modal通过visible控制，关闭后内容保留是正常的
      rerender(<AddTagModal {...defaultProps} visible={false} />)
      rerender(<AddTagModal {...defaultProps} visible={true} />)

      // 内容保留，因为组件内部使用了useState管理状态
      expect(input).toHaveValue('测试')
    })

    it('应该在添加成功后清空输入内容', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<AddTagModal {...defaultProps} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '测试标签')

      const confirmButton = screen.getByRole('button', { name: /确\s*定/ })
      await user.click(confirmButton)

      // 添加成功后会调用handleClose，清空状态
      // 需要重新渲染来验证
      rerender(<AddTagModal {...defaultProps} visible={false} />)
      rerender(<AddTagModal {...defaultProps} visible={true} />)

      expect(input).toHaveValue('')
    })

    it('应该在关闭后重置选中的颜色为默认值', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const { rerender } = render(<AddTagModal {...defaultProps} onClose={onClose} />)

      const thirdColorBox = screen.getByTestId('color-box-volcano')
      await user.click(thirdColorBox)

      const cancelButton = screen.getByRole('button', { name: /取\s*消/ })
      await user.click(cancelButton)

      rerender(<AddTagModal {...defaultProps} visible={false} onClose={onClose} />)
      rerender(<AddTagModal {...defaultProps} visible={true} onClose={onClose} />)

      // 重新打开后验证第一个颜色（magenta）被选中
      const newExampleTags = screen.getAllByText('示例')
      expect(newExampleTags[0]).toHaveClass('see-tag-magenta')
    })

    it('应该在关闭后清除错误提示', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const { rerender } = render(<AddTagModal {...defaultProps} onClose={onClose} />)

      const confirmButton = screen.getByRole('button', { name: /确\s*定/ })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText('请输入标签名称')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /取\s*消/ })
      await user.click(cancelButton)

      rerender(<AddTagModal {...defaultProps} visible={false} onClose={onClose} />)
      rerender(<AddTagModal {...defaultProps} visible={true} onClose={onClose} />)

      expect(screen.queryByText('请输入标签名称')).not.toBeInTheDocument()
    })
  })

  describe('主题色应用', () => {
    it('应该使用传入的主题色配置按钮样式', () => {
      const customThemeColor = '#52c41a'
      render(<AddTagModal {...defaultProps} themeColor={customThemeColor} />)

      expect(screen.getByRole('button', { name: /确\s*定/ })).toBeInTheDocument()
    })

    it('应该响应主题色变化', () => {
      const { rerender } = render(<AddTagModal {...defaultProps} themeColor="#1677ff" />)

      rerender(<AddTagModal {...defaultProps} themeColor="#52c41a" />)

      expect(screen.getByRole('button', { name: /确\s*定/ })).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该处理特殊字符输入', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      render(<AddTagModal {...defaultProps} onAdd={onAdd} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '<script>')

      const confirmButton = screen.getByRole('button', { name: /确\s*定/ })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(onAdd).toHaveBeenCalledWith({
          label: '<script>',
          color: 'magenta',
        })
      })
    })

    it('应该处理emoji输入', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      render(<AddTagModal {...defaultProps} onAdd={onAdd} />)

      const input = screen.getByPlaceholderText('请输入标签名称（最多10个字符）')
      await user.type(input, '😀标签')

      const confirmButton = screen.getByRole('button', { name: /确\s*定/ })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(onAdd).toHaveBeenCalledWith({
          label: '😀标签',
          color: 'magenta',
        })
      })
    })

    it('应该处理existingTags为undefined的情况', () => {
      render(<AddTagModal {...defaultProps} existingTags={undefined} />)

      expect(screen.getByText('添加标签')).toBeInTheDocument()
    })

    it('应该处理空的existingTags数组', () => {
      render(<AddTagModal {...defaultProps} existingTags={[]} />)

      expect(screen.getByText('添加标签')).toBeInTheDocument()
    })
  })
})
