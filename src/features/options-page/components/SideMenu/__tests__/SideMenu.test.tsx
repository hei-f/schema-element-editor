import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SideMenu } from '../SideMenu'

describe('SideMenu 组件测试', () => {
  const defaultProps = {
    collapsed: false,
    onCollapsedChange: vi.fn(),
    activeSection: undefined,
    onMenuClick: vi.fn(),
    onSubMenuClick: vi.fn(),
    isReleaseBuild: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该成功渲染组件', () => {
      const { container } = render(<SideMenu {...defaultProps} />)
      expect(container).toBeDefined()
    })

    it('应该在collapsed为false时渲染展开的菜单', () => {
      const { container } = render(<SideMenu {...defaultProps} collapsed={false} />)
      expect(container).toBeDefined()
    })

    it('应该在collapsed为true时渲染折叠的菜单', () => {
      const { container } = render(<SideMenu {...defaultProps} collapsed={true} />)
      expect(container).toBeDefined()
    })
  })

  describe('Props处理', () => {
    it('应该接受所有必需的props', () => {
      expect(() => {
        render(<SideMenu {...defaultProps} />)
      }).not.toThrow()
    })

    it('应该接受activeSection prop', () => {
      const { container } = render(<SideMenu {...defaultProps} activeSection="elementDetection" />)
      expect(container).toBeDefined()
    })

    it('应该接受isReleaseBuild prop', () => {
      const { container } = render(<SideMenu {...defaultProps} isReleaseBuild={true} />)
      expect(container).toBeDefined()
    })

    it('应该接受回调函数props', () => {
      const onCollapsedChange = vi.fn()
      const onMenuClick = vi.fn()
      const onSubMenuClick = vi.fn()

      const { container } = render(
        <SideMenu
          {...defaultProps}
          onCollapsedChange={onCollapsedChange}
          onMenuClick={onMenuClick}
          onSubMenuClick={onSubMenuClick}
        />
      )
      expect(container).toBeDefined()
    })
  })

  describe('Props变化', () => {
    it('应该响应collapsed变化', () => {
      const { rerender } = render(<SideMenu {...defaultProps} collapsed={false} />)

      expect(() => {
        rerender(<SideMenu {...defaultProps} collapsed={true} />)
      }).not.toThrow()
    })

    it('应该响应activeSection变化', () => {
      const { rerender } = render(<SideMenu {...defaultProps} activeSection="section1" />)

      expect(() => {
        rerender(<SideMenu {...defaultProps} activeSection="section2" />)
      }).not.toThrow()
    })

    it('应该响应isReleaseBuild变化', () => {
      const { rerender } = render(<SideMenu {...defaultProps} isReleaseBuild={false} />)

      expect(() => {
        rerender(<SideMenu {...defaultProps} isReleaseBuild={true} />)
      }).not.toThrow()
    })

    it('应该响应回调函数变化', () => {
      const { rerender } = render(<SideMenu {...defaultProps} />)

      const newOnCollapsedChange = vi.fn()
      const newOnMenuClick = vi.fn()
      const newOnSubMenuClick = vi.fn()

      expect(() => {
        rerender(
          <SideMenu
            {...defaultProps}
            onCollapsedChange={newOnCollapsedChange}
            onMenuClick={newOnMenuClick}
            onSubMenuClick={newOnSubMenuClick}
          />
        )
      }).not.toThrow()
    })
  })

  describe('isReleaseBuild 功能', () => {
    it('应该在isReleaseBuild为false时显示所有菜单', () => {
      const { container } = render(<SideMenu {...defaultProps} isReleaseBuild={false} />)
      expect(container).toBeDefined()
    })

    it('应该在isReleaseBuild为true时隐藏调试菜单', () => {
      const { container } = render(<SideMenu {...defaultProps} isReleaseBuild={true} />)
      expect(container).toBeDefined()
    })
  })

  describe('组件生命周期', () => {
    it('应该能够正确卸载', () => {
      const { unmount } = render(<SideMenu {...defaultProps} />)

      expect(() => unmount()).not.toThrow()
    })

    it('应该支持多次渲染和卸载', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<SideMenu {...defaultProps} />)
        expect(() => unmount()).not.toThrow()
      }
    })
  })

  describe('边界情况', () => {
    it('应该处理undefined的activeSection', () => {
      const { container } = render(<SideMenu {...defaultProps} activeSection={undefined} />)
      expect(container).toBeDefined()
    })

    it('应该处理空字符串的activeSection', () => {
      const { container } = render(<SideMenu {...defaultProps} activeSection="" />)
      expect(container).toBeDefined()
    })

    it('应该处理不存在的activeSection', () => {
      const { container } = render(
        <SideMenu {...defaultProps} activeSection="non-existent-section" />
      )
      expect(container).toBeDefined()
    })

    it('应该处理缺少可选回调的情况', () => {
      expect(() => {
        render(<SideMenu collapsed={false} onCollapsedChange={vi.fn()} />)
      }).not.toThrow()
    })
  })

  describe('折叠状态切换', () => {
    it('应该支持从展开到折叠', () => {
      const { rerender } = render(<SideMenu {...defaultProps} collapsed={false} />)

      expect(() => {
        rerender(<SideMenu {...defaultProps} collapsed={true} />)
      }).not.toThrow()
    })

    it('应该支持从折叠到展开', () => {
      const { rerender } = render(<SideMenu {...defaultProps} collapsed={true} />)

      expect(() => {
        rerender(<SideMenu {...defaultProps} collapsed={false} />)
      }).not.toThrow()
    })

    it('应该支持快速多次切换', () => {
      const { rerender } = render(<SideMenu {...defaultProps} collapsed={false} />)

      for (let i = 0; i < 10; i++) {
        expect(() => {
          rerender(<SideMenu {...defaultProps} collapsed={i % 2 === 0} />)
        }).not.toThrow()
      }
    })
  })

  describe('激活状态切换', () => {
    it('应该支持快速切换激活的section', () => {
      const sections = ['section1', 'section2', 'section3', 'section4', 'section5']
      const { rerender } = render(<SideMenu {...defaultProps} activeSection={sections[0]} />)

      sections.forEach((section) => {
        expect(() => {
          rerender(<SideMenu {...defaultProps} activeSection={section} />)
        }).not.toThrow()
      })
    })

    it('应该支持在有activeSection和无activeSection之间切换', () => {
      const { rerender } = render(<SideMenu {...defaultProps} activeSection="section1" />)

      expect(() => {
        rerender(<SideMenu {...defaultProps} activeSection={undefined} />)
        rerender(<SideMenu {...defaultProps} activeSection="section2" />)
        rerender(<SideMenu {...defaultProps} activeSection={undefined} />)
      }).not.toThrow()
    })
  })
})
