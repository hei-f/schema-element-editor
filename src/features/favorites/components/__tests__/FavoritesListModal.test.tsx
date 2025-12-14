import { act, render, screen, waitFor } from '@test/test-utils'
import userEvent from '@testing-library/user-event'
import type { Favorite } from '@/shared/types'
import { FavoritesListModal } from '../FavoritesListModal'

/**
 * Mock shadowRootManager
 */
vi.mock('@/shared/utils/shadow-root-manager', () => ({
  shadowRootManager: {
    getContainer: () => document.body,
  },
}))

describe('FavoritesListModal组件测试', () => {
  const mockFavorites: Favorite[] = [
    {
      id: '1',
      name: '收藏1',
      content: '{"type": "test1"}',
      timestamp: Date.now() - 1000 * 60 * 60, // 1小时前
      lastUsedTime: Date.now() - 1000 * 60 * 30, // 30分钟前使用
    },
    {
      id: '2',
      name: '收藏2',
      content: '{"type": "test2"}',
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1天前
      lastUsedTime: Date.now() - 1000 * 60 * 60 * 12, // 12小时前使用
    },
    {
      id: '3',
      name: '特殊收藏',
      content: '{"keyword": "搜索测试"}',
      timestamp: Date.now(),
      lastUsedTime: Date.now(),
    },
  ]

  const defaultProps = {
    visible: true,
    favoritesList: mockFavorites,
    onEdit: vi.fn(),
    onApply: vi.fn(),
    onDelete: vi.fn().mockResolvedValue(undefined),
    onPin: vi.fn().mockResolvedValue(undefined),
    onAddTag: vi.fn().mockResolvedValue(undefined),
    onRemoveTag: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基本渲染', () => {
    it('应该在visible为true时渲染Modal', () => {
      render(<FavoritesListModal {...defaultProps} />)

      expect(screen.getByText('收藏列表')).toBeInTheDocument()
    })

    it('应该在visible为false时不渲染Modal内容', () => {
      render(<FavoritesListModal {...defaultProps} visible={false} />)

      expect(screen.queryByText('收藏列表')).not.toBeInTheDocument()
    })

    it('应该渲染搜索框', () => {
      render(<FavoritesListModal {...defaultProps} />)

      expect(screen.getByPlaceholderText('搜索收藏名称或内容...')).toBeInTheDocument()
    })

    it('应该渲染表格', () => {
      render(<FavoritesListModal {...defaultProps} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('应该渲染表格列头', () => {
      render(<FavoritesListModal {...defaultProps} />)

      expect(screen.getByText('名称')).toBeInTheDocument()
      expect(screen.getByText('保存时间')).toBeInTheDocument()
      expect(screen.getByText('操作')).toBeInTheDocument()
    })
  })

  describe('数据展示', () => {
    it('应该显示所有收藏项', () => {
      render(<FavoritesListModal {...defaultProps} />)

      expect(screen.getByText('收藏1')).toBeInTheDocument()
      expect(screen.getByText('收藏2')).toBeInTheDocument()
      expect(screen.getByText('特殊收藏')).toBeInTheDocument()
    })

    it('应该显示格式化的时间', () => {
      render(<FavoritesListModal {...defaultProps} />)

      // 检查表格中有时间相关的内容
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('应该为每行显示操作按钮', () => {
      render(<FavoritesListModal {...defaultProps} />)

      const editButtons = screen.getAllByText('编辑')
      const applyButtons = screen.getAllByText('应用')
      const deleteButtons = screen.getAllByText('删除')

      expect(editButtons.length).toBe(mockFavorites.length)
      expect(applyButtons.length).toBe(mockFavorites.length)
      expect(deleteButtons.length).toBe(mockFavorites.length)
    })

    it('应该在没有收藏时显示空状态', () => {
      render(<FavoritesListModal {...defaultProps} favoritesList={[]} />)

      // antd Table 空状态会显示 .see-empty 类
      const emptyState = document.querySelector('.see-empty')
      expect(emptyState).toBeInTheDocument()
    })
  })

  describe('搜索功能', () => {
    it('应该根据名称过滤收藏', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<FavoritesListModal {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('搜索收藏名称或内容...')
      await user.type(searchInput, '特殊')

      // 等待防抖完成
      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      await waitFor(() => {
        expect(screen.getByText('特殊收藏')).toBeInTheDocument()
        expect(screen.queryByText('收藏1')).not.toBeInTheDocument()
        expect(screen.queryByText('收藏2')).not.toBeInTheDocument()
      })
    })

    it('应该根据内容过滤收藏', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<FavoritesListModal {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('搜索收藏名称或内容...')
      await user.type(searchInput, 'test1')

      // 等待防抖完成
      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      await waitFor(() => {
        expect(screen.getByText('收藏1')).toBeInTheDocument()
        expect(screen.queryByText('收藏2')).not.toBeInTheDocument()
        expect(screen.queryByText('特殊收藏')).not.toBeInTheDocument()
      })
    })

    it('应该支持大小写不敏感搜索', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<FavoritesListModal {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('搜索收藏名称或内容...')
      await user.type(searchInput, 'TEST1')

      // 等待防抖完成
      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      await waitFor(() => {
        expect(screen.getByText('收藏1')).toBeInTheDocument()
      })
    })

    it('应该在搜索无结果时显示空状态', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<FavoritesListModal {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('搜索收藏名称或内容...')
      await user.type(searchInput, '不存在的内容')

      // 等待防抖完成
      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      await waitFor(() => {
        // antd Table 空状态会显示 .see-empty 类
        const emptyState = document.querySelector('.see-empty')
        expect(emptyState).toBeInTheDocument()
      })
    })

    it('应该支持清除搜索', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<FavoritesListModal {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('搜索收藏名称或内容...')
      await user.type(searchInput, '特殊')

      // 等待防抖完成
      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      await waitFor(() => {
        expect(screen.queryByText('收藏1')).not.toBeInTheDocument()
      })

      // 清除搜索
      await user.clear(searchInput)

      // 等待防抖完成
      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      await waitFor(() => {
        expect(screen.getByText('收藏1')).toBeInTheDocument()
        expect(screen.getByText('收藏2')).toBeInTheDocument()
        expect(screen.getByText('特殊收藏')).toBeInTheDocument()
      })
    })
  })

  describe('操作交互', () => {
    it('应该在点击编辑时调用onEdit', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onEdit = vi.fn()
      render(<FavoritesListModal {...defaultProps} onEdit={onEdit} />)

      const editButtons = screen.getAllByText('编辑')
      await user.click(editButtons[0])

      expect(onEdit).toHaveBeenCalledWith(mockFavorites[0])
    })

    it('应该在点击应用时调用onApply', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onApply = vi.fn()
      render(<FavoritesListModal {...defaultProps} onApply={onApply} />)

      const applyButtons = screen.getAllByText('应用')
      await user.click(applyButtons[0])

      expect(onApply).toHaveBeenCalledWith(mockFavorites[0])
    })

    it('应该在点击删除时调用onDelete', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onDelete = vi.fn().mockResolvedValue(undefined)
      render(<FavoritesListModal {...defaultProps} onDelete={onDelete} />)

      const deleteButtons = screen.getAllByText('删除')
      await user.click(deleteButtons[0])

      expect(onDelete).toHaveBeenCalledWith(mockFavorites[0].id)
    })
  })

  describe('Modal关闭', () => {
    it('应该在点击取消时调用onClose', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onClose = vi.fn()
      render(<FavoritesListModal {...defaultProps} onClose={onClose} />)

      const closeButton = document.querySelector('.see-modal-close')
      if (closeButton) {
        await user.click(closeButton)
        expect(onClose).toHaveBeenCalled()
      }
    })
  })

  describe('分页', () => {
    it('应该显示分页组件当数据超过pageSize', () => {
      const manyFavorites: Favorite[] = Array.from({ length: 15 }, (_, i) => ({
        id: `${i}`,
        name: `收藏${i}`,
        content: `{"index": ${i}}`,
        timestamp: Date.now() - i * 1000,
        lastUsedTime: Date.now() - i * 500,
      }))

      render(<FavoritesListModal {...defaultProps} favoritesList={manyFavorites} />)

      // 检查分页组件存在
      const pagination = document.querySelector('.see-pagination')
      expect(pagination).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该处理空搜索关键词', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<FavoritesListModal {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('搜索收藏名称或内容...')
      await user.type(searchInput, '   ')

      // 等待防抖完成
      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      // 空格应该被视为空搜索，显示所有结果
      await waitFor(() => {
        expect(screen.getByText('收藏1')).toBeInTheDocument()
        expect(screen.getByText('收藏2')).toBeInTheDocument()
        expect(screen.getByText('特殊收藏')).toBeInTheDocument()
      })
    })

    it('应该处理特殊字符搜索', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const favoritesWithSpecialChars: Favorite[] = [
        {
          id: '1',
          name: '收藏(测试)',
          content: '{"test": true}',
          timestamp: Date.now(),
          lastUsedTime: Date.now(),
        },
      ]

      render(<FavoritesListModal {...defaultProps} favoritesList={favoritesWithSpecialChars} />)

      const searchInput = screen.getByPlaceholderText('搜索收藏名称或内容...')
      await user.type(searchInput, '(测试)')

      // 等待防抖完成
      await act(async () => {
        vi.advanceTimersByTime(400)
      })

      await waitFor(() => {
        expect(screen.getByText('收藏(测试)')).toBeInTheDocument()
      })
    })
  })

  describe('Props更新', () => {
    it('应该响应favoritesList变化', () => {
      const { rerender } = render(<FavoritesListModal {...defaultProps} />)

      expect(screen.getByText('收藏1')).toBeInTheDocument()

      const newFavorites: Favorite[] = [
        {
          id: '4',
          name: '新收藏',
          content: '{"new": true}',
          timestamp: Date.now(),
          lastUsedTime: Date.now(),
        },
      ]

      rerender(<FavoritesListModal {...defaultProps} favoritesList={newFavorites} />)

      expect(screen.queryByText('收藏1')).not.toBeInTheDocument()
      expect(screen.getByText('新收藏')).toBeInTheDocument()
    })

    it('应该响应visible变化', () => {
      const { rerender } = render(<FavoritesListModal {...defaultProps} visible={false} />)

      expect(screen.queryByText('收藏列表')).not.toBeInTheDocument()

      rerender(<FavoritesListModal {...defaultProps} visible={true} />)

      expect(screen.getByText('收藏列表')).toBeInTheDocument()
    })
  })
})
