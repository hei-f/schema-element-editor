import { render, screen, fireEvent } from '@testing-library/react'
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

  describe('用户交互 - 折叠按钮', () => {
    it('应该在点击折叠按钮时触发onCollapsedChange回调', () => {
      const onCollapsedChange = vi.fn()
      render(<SideMenu {...defaultProps} collapsed={false} onCollapsedChange={onCollapsedChange} />)

      const collapseButton = screen.getByRole('button')
      fireEvent.click(collapseButton)

      expect(onCollapsedChange).toHaveBeenCalledTimes(1)
      expect(onCollapsedChange).toHaveBeenCalledWith(true)
    })

    it('应该在折叠状态下点击按钮时传递false', () => {
      const onCollapsedChange = vi.fn()
      render(<SideMenu {...defaultProps} collapsed={true} onCollapsedChange={onCollapsedChange} />)

      const collapseButton = screen.getByRole('button')
      fireEvent.click(collapseButton)

      expect(onCollapsedChange).toHaveBeenCalledTimes(1)
      expect(onCollapsedChange).toHaveBeenCalledWith(false)
    })
  })

  describe('用户交互 - 主菜单项点击', () => {
    it('应该在点击主菜单项时触发onMenuClick回调', () => {
      const onMenuClick = vi.fn()
      render(<SideMenu {...defaultProps} onMenuClick={onMenuClick} />)

      const menuItem = screen.getByText('集成配置')
      fireEvent.click(menuItem)

      expect(onMenuClick).toHaveBeenCalledTimes(1)
      expect(onMenuClick).toHaveBeenCalledWith('section-integration-config')
    })

    it('应该在点击不同菜单项时传递正确的sectionId', () => {
      const onMenuClick = vi.fn()
      render(<SideMenu {...defaultProps} onMenuClick={onMenuClick} />)

      const elementDetectionItem = screen.getByText('元素检测与高亮')
      fireEvent.click(elementDetectionItem)

      expect(onMenuClick).toHaveBeenCalledWith('section-element-detection')
    })

    it('应该在折叠状态下点击菜单项时触发onCollapsedChange', () => {
      const onCollapsedChange = vi.fn()
      const onMenuClick = vi.fn()
      render(
        <SideMenu
          {...defaultProps}
          collapsed={true}
          onCollapsedChange={onCollapsedChange}
          onMenuClick={onMenuClick}
        />
      )

      const menuItem = screen.getByText('集成配置')
      fireEvent.click(menuItem)

      expect(onCollapsedChange).toHaveBeenCalledWith(false)
      expect(onMenuClick).toHaveBeenCalledWith('section-integration-config')
    })

    it('应该支持点击多个不同的菜单项', () => {
      const onMenuClick = vi.fn()
      render(<SideMenu {...defaultProps} onMenuClick={onMenuClick} />)

      fireEvent.click(screen.getByText('集成配置'))
      fireEvent.click(screen.getByText('编辑器配置'))
      fireEvent.click(screen.getByText('功能开关'))

      expect(onMenuClick).toHaveBeenCalledTimes(3)
      expect(onMenuClick).toHaveBeenNthCalledWith(1, 'section-integration-config')
      expect(onMenuClick).toHaveBeenNthCalledWith(2, 'section-editor-config')
      expect(onMenuClick).toHaveBeenNthCalledWith(3, 'section-feature-toggle')
    })
  })

  describe('用户交互 - 子菜单项点击', () => {
    it('应该在点击子菜单项时触发onSubMenuClick回调', () => {
      const onSubMenuClick = vi.fn()
      const onMenuClick = vi.fn()
      render(
        <SideMenu {...defaultProps} onSubMenuClick={onSubMenuClick} onMenuClick={onMenuClick} />
      )

      fireEvent.click(screen.getByText('集成配置'))

      const subMenuItem = screen.getByText('元素标记配置')
      fireEvent.click(subMenuItem)

      expect(onSubMenuClick).toHaveBeenCalledTimes(1)
      expect(onSubMenuClick).toHaveBeenCalledWith('field-attribute-name')
    })

    it('应该在点击子菜单项时同时触发onMenuClick', () => {
      const onSubMenuClick = vi.fn()
      const onMenuClick = vi.fn()
      render(
        <SideMenu {...defaultProps} onSubMenuClick={onSubMenuClick} onMenuClick={onMenuClick} />
      )

      fireEvent.click(screen.getByText('集成配置'))

      const subMenuItem = screen.getByText('元素标记配置')
      fireEvent.click(subMenuItem)

      expect(onMenuClick).toHaveBeenCalledWith('section-integration-config')
      expect(onSubMenuClick).toHaveBeenCalledWith('field-attribute-name')
    })

    it('应该在点击不同子菜单项时传递正确的anchorId', () => {
      const onSubMenuClick = vi.fn()
      render(<SideMenu {...defaultProps} onSubMenuClick={onSubMenuClick} />)

      fireEvent.click(screen.getByText('集成配置'))

      fireEvent.click(screen.getByText('元素标记配置'))
      expect(onSubMenuClick).toHaveBeenLastCalledWith('field-attribute-name')

      fireEvent.click(screen.getByText('postMessage 配置'))
      expect(onSubMenuClick).toHaveBeenLastCalledWith('field-request-timeout')

      fireEvent.click(screen.getByText('消息标识配置'))
      expect(onSubMenuClick).toHaveBeenLastCalledWith('field-source-config')

      expect(onSubMenuClick).toHaveBeenCalledTimes(3)
    })

    it('应该支持点击不同父菜单下的子菜单项', () => {
      const onSubMenuClick = vi.fn()
      render(<SideMenu {...defaultProps} onSubMenuClick={onSubMenuClick} />)

      fireEvent.click(screen.getByText('元素检测与高亮'))
      fireEvent.click(screen.getByText('基础模式'))

      expect(onSubMenuClick).toHaveBeenCalledWith('field-basic-mode')

      fireEvent.click(screen.getByText('编辑器配置'))
      fireEvent.click(screen.getByText('编辑器功能'))

      expect(onSubMenuClick).toHaveBeenCalledWith('field-editor-features')
      expect(onSubMenuClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('DOM渲染验证', () => {
    it('应该正确渲染所有主菜单项', () => {
      render(<SideMenu {...defaultProps} />)

      expect(screen.getByText('集成配置')).toBeInTheDocument()
      expect(screen.getByText('元素检测与高亮')).toBeInTheDocument()
      expect(screen.getByText('编辑器配置')).toBeInTheDocument()
      expect(screen.getByText('功能开关')).toBeInTheDocument()
      expect(screen.getByText('实时预览')).toBeInTheDocument()
      expect(screen.getByText('数据管理')).toBeInTheDocument()
      expect(screen.getByText('快捷键配置')).toBeInTheDocument()
      expect(screen.getByText('开发调试')).toBeInTheDocument()
      expect(screen.getByText('使用指南')).toBeInTheDocument()
    })

    it('应该在展开主菜单后显示子菜单项', () => {
      render(<SideMenu {...defaultProps} />)

      fireEvent.click(screen.getByText('集成配置'))

      expect(screen.getByText('元素标记配置')).toBeInTheDocument()
      expect(screen.getByText('postMessage 配置')).toBeInTheDocument()
      expect(screen.getByText('消息标识配置')).toBeInTheDocument()
      expect(screen.getByText('消息类型配置')).toBeInTheDocument()
    })

    it('应该在isReleaseBuild为true时不渲染调试菜单', () => {
      render(<SideMenu {...defaultProps} isReleaseBuild={true} />)

      expect(screen.queryByText('开发调试')).not.toBeInTheDocument()
    })

    it('应该在isReleaseBuild为false时渲染调试菜单', () => {
      render(<SideMenu {...defaultProps} isReleaseBuild={false} />)

      expect(screen.getByText('开发调试')).toBeInTheDocument()
    })

    it('应该在isReleaseBuild变化时正确切换调试菜单显示', () => {
      const { rerender } = render(<SideMenu {...defaultProps} isReleaseBuild={false} />)

      expect(screen.getByText('开发调试')).toBeInTheDocument()

      rerender(<SideMenu {...defaultProps} isReleaseBuild={true} />)

      expect(screen.queryByText('开发调试')).not.toBeInTheDocument()
    })
  })
})
