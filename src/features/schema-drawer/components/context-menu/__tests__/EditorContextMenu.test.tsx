import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EditorContextMenu } from '../EditorContextMenu'
import type { EditorTheme } from '@/shared/types'
import { CONTEXT_MENU_TRIGGER_MODE } from '@/shared/constants/context-menu'

describe('EditorContextMenu 组件测试', () => {
  const defaultProps = {
    visible: true,
    position: { x: 100, y: 100 },
    config: {
      enabled: true,
      triggerMode: CONTEXT_MENU_TRIGGER_MODE.CONTEXT_MENU,
    },
    hasSelection: true,
    themeColor: '#1890ff',
    editorTheme: 'light' as EditorTheme,
    onSelect: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该在visible为true时成功渲染', () => {
      expect(() => {
        render(<EditorContextMenu {...defaultProps} />)
      }).not.toThrow()
    })

    it('应该在visible为false时返回null', () => {
      const { container } = render(<EditorContextMenu {...defaultProps} visible={false} />)

      // visible为false时组件应该返回null
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Props处理', () => {
    it('应该接受所有必需的props', () => {
      expect(() => {
        render(<EditorContextMenu {...defaultProps} />)
      }).not.toThrow()
    })

    it('应该接受不同的position', () => {
      const positions = [
        { x: 0, y: 0 },
        { x: 100, y: 200 },
        { x: 500, y: 500 },
        { x: -10, y: -10 },
      ]

      positions.forEach((position) => {
        expect(() => {
          render(<EditorContextMenu {...defaultProps} position={position} />)
        }).not.toThrow()
      })
    })

    it('应该接受不同的hasSelection值', () => {
      expect(() => {
        render(<EditorContextMenu {...defaultProps} hasSelection={true} />)
      }).not.toThrow()

      expect(() => {
        render(<EditorContextMenu {...defaultProps} hasSelection={false} />)
      }).not.toThrow()
    })

    it('应该接受不同的主题', () => {
      const themes: EditorTheme[] = ['light', 'dark', 'seeDark']

      themes.forEach((theme) => {
        expect(() => {
          render(<EditorContextMenu {...defaultProps} editorTheme={theme} />)
        }).not.toThrow()
      })
    })

    it('应该接受不同的主题色', () => {
      const colors = ['#1890ff', '#52c41a', '#ff4d4f', '#722ed1', '#fa8c16']

      colors.forEach((color) => {
        expect(() => {
          render(<EditorContextMenu {...defaultProps} themeColor={color} />)
        }).not.toThrow()
      })
    })
  })

  describe('Props变化', () => {
    it('应该响应visible变化', () => {
      const { rerender } = render(<EditorContextMenu {...defaultProps} visible={false} />)

      expect(() => {
        rerender(<EditorContextMenu {...defaultProps} visible={true} />)
      }).not.toThrow()
    })

    it('应该响应position变化', () => {
      const { rerender } = render(
        <EditorContextMenu {...defaultProps} position={{ x: 100, y: 100 }} />
      )

      expect(() => {
        rerender(<EditorContextMenu {...defaultProps} position={{ x: 200, y: 200 }} />)
      }).not.toThrow()
    })

    it('应该响应hasSelection变化', () => {
      const { rerender } = render(<EditorContextMenu {...defaultProps} hasSelection={true} />)

      expect(() => {
        rerender(<EditorContextMenu {...defaultProps} hasSelection={false} />)
      }).not.toThrow()
    })

    it('应该响应editorTheme变化', () => {
      const { rerender } = render(<EditorContextMenu {...defaultProps} editorTheme="light" />)

      expect(() => {
        rerender(<EditorContextMenu {...defaultProps} editorTheme="dark" />)
      }).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理极端位置值', () => {
      const extremePositions = [
        { x: 0, y: 0 },
        { x: 10000, y: 10000 },
        { x: -1000, y: -1000 },
      ]

      extremePositions.forEach((position) => {
        expect(() => {
          render(<EditorContextMenu {...defaultProps} position={position} />)
        }).not.toThrow()
      })
    })

    it('应该处理小数位置', () => {
      expect(() => {
        render(<EditorContextMenu {...defaultProps} position={{ x: 100.5, y: 200.7 }} />)
      }).not.toThrow()
    })
  })

  describe('组件生命周期', () => {
    it('应该能够正确卸载', () => {
      const { unmount } = render(<EditorContextMenu {...defaultProps} />)

      expect(() => unmount()).not.toThrow()
    })

    it('应该支持多次显示和隐藏', () => {
      const { rerender } = render(<EditorContextMenu {...defaultProps} visible={false} />)

      for (let i = 0; i < 5; i++) {
        expect(() => {
          rerender(<EditorContextMenu {...defaultProps} visible={true} />)
          rerender(<EditorContextMenu {...defaultProps} visible={false} />)
        }).not.toThrow()
      }
    })

    it('应该支持位置频繁变化', () => {
      const { rerender } = render(<EditorContextMenu {...defaultProps} position={{ x: 0, y: 0 }} />)

      for (let i = 0; i < 10; i++) {
        expect(() => {
          rerender(<EditorContextMenu {...defaultProps} position={{ x: i * 10, y: i * 10 }} />)
        }).not.toThrow()
      }
    })
  })
})
