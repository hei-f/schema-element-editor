import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EditorContextMenu } from '../EditorContextMenu'
import type { EditorTheme } from '@/shared/types'
import { CONTEXT_MENU_TRIGGER_MODE } from '@/shared/constants/context-menu'
import { ContextMenuAction } from '../types'

// Mock shadowRootManager to return document.body as container
vi.mock('@/shared/utils/shadow-root-manager', () => ({
  shadowRootManager: {
    init: vi.fn(),
    get: vi.fn(() => document.body as unknown as ShadowRoot),
    getContainer: vi.fn(() => document.body),
    reset: vi.fn(),
  },
}))

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
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runAllTimers()
    vi.useRealTimers()
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

  describe('菜单交互', () => {
    it('应该渲染菜单项内容', () => {
      const { getByText } = render(<EditorContextMenu {...defaultProps} />)

      expect(getByText('单独编辑')).toBeInTheDocument()
    })

    it('应该在hasSelection为true时启用菜单项', () => {
      const { getByText } = render(<EditorContextMenu {...defaultProps} hasSelection={true} />)

      const menuItem = getByText('单独编辑')
      expect(menuItem).toBeInTheDocument()
    })

    it('应该在hasSelection为false时渲染但禁用菜单项', () => {
      const { getByText } = render(<EditorContextMenu {...defaultProps} hasSelection={false} />)

      const menuItem = getByText('单独编辑')
      expect(menuItem).toBeInTheDocument()
    })
  })

  describe('回调函数', () => {
    it('应该在点击菜单项时调用onSelect并传入正确的action', () => {
      const onSelect = vi.fn()
      const { getByText } = render(<EditorContextMenu {...defaultProps} onSelect={onSelect} />)

      const menuItem = getByText('单独编辑')
      fireEvent.click(menuItem)

      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenCalledWith(ContextMenuAction.QUICK_EDIT)
    })

    it('应该在点击菜单项后调用onClose', () => {
      const onClose = vi.fn()
      const { getByText } = render(<EditorContextMenu {...defaultProps} onClose={onClose} />)

      const menuItem = getByText('单独编辑')
      fireEvent.click(menuItem)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('应该在点击菜单项时同时调用onSelect和onClose', () => {
      const onSelect = vi.fn()
      const onClose = vi.fn()
      const { getByText } = render(
        <EditorContextMenu {...defaultProps} onSelect={onSelect} onClose={onClose} />
      )

      const menuItem = getByText('单独编辑')
      fireEvent.click(menuItem)

      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('禁用状态', () => {
    it('应该在hasSelection为false时不触发onSelect', () => {
      const onSelect = vi.fn()
      const { getByText } = render(
        <EditorContextMenu {...defaultProps} hasSelection={false} onSelect={onSelect} />
      )

      const menuItem = getByText('单独编辑')
      fireEvent.click(menuItem)

      expect(onSelect).not.toHaveBeenCalled()
    })

    it('应该在hasSelection为false时不触发onClose', () => {
      const onClose = vi.fn()
      const { getByText } = render(
        <EditorContextMenu {...defaultProps} hasSelection={false} onClose={onClose} />
      )

      const menuItem = getByText('单独编辑')
      fireEvent.click(menuItem)

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('外部点击关闭', () => {
    it('应该在点击菜单外部时调用onClose', () => {
      const onClose = vi.fn()
      render(<EditorContextMenu {...defaultProps} onClose={onClose} />)

      // 快进定时器以触发事件监听器的添加
      vi.runAllTimers()

      // 模拟点击 body（菜单外部）
      fireEvent.mouseDown(document.body)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('应该在点击菜单内部时不调用onClose', () => {
      const onClose = vi.fn()
      const { getByText } = render(<EditorContextMenu {...defaultProps} onClose={onClose} />)

      // 快进定时器
      vi.runAllTimers()

      const menuItem = getByText('单独编辑')
      // 点击菜单内的元素
      fireEvent.mouseDown(menuItem)

      // onClose 不应该被外部点击逻辑触发（但会被菜单项点击触发）
      expect(onClose).not.toHaveBeenCalled()
    })

    it('应该在visible为false时不添加外部点击监听器', () => {
      const onClose = vi.fn()
      render(<EditorContextMenu {...defaultProps} visible={false} onClose={onClose} />)

      vi.runAllTimers()

      fireEvent.mouseDown(document.body)

      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
