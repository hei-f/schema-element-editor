import { fireEvent, render, screen } from '@test/test-utils'
import userEvent from '@testing-library/user-event'
import { AddFavoriteModal } from '../AddFavoriteModal'

/**
 * Mock shadowRootManager
 */
vi.mock('@/shared/utils/shadow-root-manager', () => ({
  shadowRootManager: {
    getContainer: () => document.body,
  },
}))

/**
 * 获取 footer 中的添加按钮（primary 按钮）
 */
const getAddButton = () => {
  const footer = document.querySelector('.see-modal-footer')
  if (footer) {
    const buttons = footer.querySelectorAll('button')
    return buttons[buttons.length - 1] // primary 按钮通常是最后一个
  }
  return null
}

/**
 * 获取 footer 中的取消按钮
 */
const getCancelButton = () => {
  const footer = document.querySelector('.see-modal-footer')
  if (footer) {
    const buttons = footer.querySelectorAll('button')
    return buttons[0]
  }
  return null
}

describe('AddFavoriteModal组件测试', () => {
  const defaultProps = {
    visible: true,
    favoriteNameInput: '',
    onInputChange: vi.fn(),
    onAdd: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该在visible为true时渲染Modal', () => {
      render(<AddFavoriteModal {...defaultProps} />)

      expect(screen.getByText('添加到收藏')).toBeInTheDocument()
    })

    it('应该在visible为false时不渲染Modal内容', () => {
      render(<AddFavoriteModal {...defaultProps} visible={false} />)

      expect(screen.queryByText('添加到收藏')).not.toBeInTheDocument()
    })

    it('应该渲染输入框', () => {
      render(<AddFavoriteModal {...defaultProps} />)

      expect(screen.getByPlaceholderText('请输入收藏名称（不超过50字符）')).toBeInTheDocument()
    })

    it('应该渲染添加和取消按钮', () => {
      render(<AddFavoriteModal {...defaultProps} />)

      const footer = document.querySelector('.see-modal-footer')
      expect(footer).toBeInTheDocument()
      const buttons = footer?.querySelectorAll('button')
      expect(buttons?.length).toBe(2)
    })
  })

  describe('输入交互', () => {
    it('应该显示favoriteNameInput的值', () => {
      render(<AddFavoriteModal {...defaultProps} favoriteNameInput="测试名称" />)

      const input = screen.getByPlaceholderText(
        '请输入收藏名称（不超过50字符）'
      ) as HTMLInputElement
      expect(input.value).toBe('测试名称')
    })

    it('应该在输入时调用onInputChange', async () => {
      const user = userEvent.setup()
      const onInputChange = vi.fn()
      render(<AddFavoriteModal {...defaultProps} onInputChange={onInputChange} />)

      const input = screen.getByPlaceholderText('请输入收藏名称（不超过50字符）')
      await user.type(input, 'a')

      expect(onInputChange).toHaveBeenCalledWith('a')
    })

    it('应该限制输入最大长度为50', () => {
      render(<AddFavoriteModal {...defaultProps} />)

      const input = screen.getByPlaceholderText('请输入收藏名称（不超过50字符）')
      expect(input).toHaveAttribute('maxlength', '50')
    })
  })

  describe('按钮交互', () => {
    it('应该在点击添加按钮时调用onAdd', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn().mockResolvedValue(undefined)
      render(<AddFavoriteModal {...defaultProps} onAdd={onAdd} />)

      const addButton = getAddButton()
      if (addButton) {
        await user.click(addButton)
      }

      expect(onAdd).toHaveBeenCalled()
    })

    it('应该在点击取消按钮时调用onClose', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddFavoriteModal {...defaultProps} onClose={onClose} />)

      const cancelButton = getCancelButton()
      if (cancelButton) {
        await user.click(cancelButton)
      }

      expect(onClose).toHaveBeenCalled()
    })

    it('应该在按下Enter键时调用onAdd', () => {
      const onAdd = vi.fn().mockResolvedValue(undefined)
      render(<AddFavoriteModal {...defaultProps} onAdd={onAdd} />)

      const input = screen.getByPlaceholderText('请输入收藏名称（不超过50字符）')
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(onAdd).toHaveBeenCalled()
    })
  })

  describe('Modal关闭', () => {
    it('应该在点击Modal关闭图标时调用onClose', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddFavoriteModal {...defaultProps} onClose={onClose} />)

      const closeButton = document.querySelector('.see-modal-close')
      if (closeButton) {
        await user.click(closeButton)
        expect(onClose).toHaveBeenCalled()
      }
    })
  })

  describe('边界情况', () => {
    it('应该处理空的favoriteNameInput', () => {
      render(<AddFavoriteModal {...defaultProps} favoriteNameInput="" />)

      const input = screen.getByPlaceholderText(
        '请输入收藏名称（不超过50字符）'
      ) as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('应该处理特殊字符输入', async () => {
      const user = userEvent.setup()
      const onInputChange = vi.fn()
      render(<AddFavoriteModal {...defaultProps} onInputChange={onInputChange} />)

      const input = screen.getByPlaceholderText('请输入收藏名称（不超过50字符）')
      await user.type(input, '<script>')

      expect(onInputChange).toHaveBeenCalled()
    })

    it('应该处理onAdd返回的Promise', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn().mockResolvedValue(undefined)
      render(<AddFavoriteModal {...defaultProps} onAdd={onAdd} />)

      const addButton = getAddButton()
      if (addButton) {
        await user.click(addButton)
      }

      await vi.waitFor(() => {
        expect(onAdd).toHaveBeenCalled()
      })
    })
  })

  describe('Props更新', () => {
    it('应该响应visible变化', () => {
      const { rerender } = render(<AddFavoriteModal {...defaultProps} visible={false} />)

      expect(screen.queryByText('添加到收藏')).not.toBeInTheDocument()

      rerender(<AddFavoriteModal {...defaultProps} visible={true} />)

      expect(screen.getByText('添加到收藏')).toBeInTheDocument()
    })

    it('应该响应favoriteNameInput变化', () => {
      const { rerender } = render(<AddFavoriteModal {...defaultProps} favoriteNameInput="名称1" />)

      const input = screen.getByPlaceholderText(
        '请输入收藏名称（不超过50字符）'
      ) as HTMLInputElement
      expect(input.value).toBe('名称1')

      rerender(<AddFavoriteModal {...defaultProps} favoriteNameInput="名称2" />)

      expect(input.value).toBe('名称2')
    })
  })
})
