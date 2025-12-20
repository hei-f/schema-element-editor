import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApplyFavoriteConfirmModal } from '../ApplyFavoriteConfirmModal'

describe('ApplyFavoriteConfirmModal 组件测试', () => {
  const defaultProps = {
    visible: true,
    themeColor: '#1890ff',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该成功渲染组件', () => {
      const { container } = render(<ApplyFavoriteConfirmModal {...defaultProps} />)
      expect(container).toBeDefined()
    })

    it('应该在visible为false时不抛出错误', () => {
      expect(() => {
        render(<ApplyFavoriteConfirmModal {...defaultProps} visible={false} />)
      }).not.toThrow()
    })

    it('应该在visible为true时不抛出错误', () => {
      expect(() => {
        render(<ApplyFavoriteConfirmModal {...defaultProps} visible={true} />)
      }).not.toThrow()
    })
  })

  describe('Props处理', () => {
    it('应该接受所有必需的props', () => {
      expect(() => {
        render(<ApplyFavoriteConfirmModal {...defaultProps} />)
      }).not.toThrow()
    })

    it('应该接受onConfirm回调', () => {
      const onConfirm = vi.fn()
      expect(() => {
        render(<ApplyFavoriteConfirmModal {...defaultProps} onConfirm={onConfirm} />)
      }).not.toThrow()
    })

    it('应该接受onCancel回调', () => {
      const onCancel = vi.fn()
      expect(() => {
        render(<ApplyFavoriteConfirmModal {...defaultProps} onCancel={onCancel} />)
      }).not.toThrow()
    })

    it('应该接受visible prop', () => {
      expect(() => {
        render(<ApplyFavoriteConfirmModal {...defaultProps} visible={true} />)
      }).not.toThrow()

      expect(() => {
        render(<ApplyFavoriteConfirmModal {...defaultProps} visible={false} />)
      }).not.toThrow()
    })

    it('应该接受themeColor prop', () => {
      const themeColors = ['#1890ff', '#52c41a', '#ff4d4f', '#722ed1', '#fa8c16']

      themeColors.forEach((color) => {
        expect(() => {
          render(<ApplyFavoriteConfirmModal {...defaultProps} themeColor={color} />)
        }).not.toThrow()
      })
    })
  })

  describe('Props变化', () => {
    it('应该响应visible变化', () => {
      const { rerender } = render(<ApplyFavoriteConfirmModal {...defaultProps} visible={false} />)

      expect(() => {
        rerender(<ApplyFavoriteConfirmModal {...defaultProps} visible={true} />)
      }).not.toThrow()

      expect(() => {
        rerender(<ApplyFavoriteConfirmModal {...defaultProps} visible={false} />)
      }).not.toThrow()
    })

    it('应该响应themeColor变化', () => {
      const { rerender } = render(
        <ApplyFavoriteConfirmModal {...defaultProps} themeColor="#1890ff" />
      )

      expect(() => {
        rerender(<ApplyFavoriteConfirmModal {...defaultProps} themeColor="#52c41a" />)
      }).not.toThrow()
    })

    it('应该响应回调函数变化', () => {
      const { rerender } = render(<ApplyFavoriteConfirmModal {...defaultProps} />)

      const newOnConfirm = vi.fn()
      const newOnCancel = vi.fn()

      expect(() => {
        rerender(
          <ApplyFavoriteConfirmModal
            {...defaultProps}
            onConfirm={newOnConfirm}
            onCancel={newOnCancel}
          />
        )
      }).not.toThrow()
    })
  })

  describe('组件生命周期', () => {
    it('应该能够正确卸载', () => {
      const { unmount } = render(<ApplyFavoriteConfirmModal {...defaultProps} />)

      expect(() => unmount()).not.toThrow()
    })

    it('应该支持多次打开和关闭', () => {
      const { rerender } = render(<ApplyFavoriteConfirmModal {...defaultProps} visible={false} />)

      for (let i = 0; i < 5; i++) {
        expect(() => {
          rerender(<ApplyFavoriteConfirmModal {...defaultProps} visible={true} />)
          rerender(<ApplyFavoriteConfirmModal {...defaultProps} visible={false} />)
        }).not.toThrow()
      }
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串themeColor', () => {
      expect(() => {
        render(<ApplyFavoriteConfirmModal {...defaultProps} themeColor="" />)
      }).not.toThrow()
    })

    it('应该处理短格式颜色', () => {
      expect(() => {
        render(<ApplyFavoriteConfirmModal {...defaultProps} themeColor="#abc" />)
      }).not.toThrow()
    })

    it('应该处理无效的themeColor', () => {
      expect(() => {
        render(<ApplyFavoriteConfirmModal {...defaultProps} themeColor="invalid-color" />)
      }).not.toThrow()
    })
  })
})
