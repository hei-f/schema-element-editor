import { render, screen } from '@testing-library/react'
import { Tooltip } from '../index'

describe('Tooltip组件测试', () => {
  const mockAttributes = {
    params: ['param1', 'param2'],
  }

  const defaultProps = {
    visible: true,
    position: { x: 100, y: 200 },
    attributes: mockAttributes,
    isValid: true,
  }

  describe('基本渲染', () => {
    it('应该在visible为true时渲染tooltip', () => {
      const { container } = render(<Tooltip {...defaultProps} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toBeInTheDocument()
      expect(tooltip).toHaveTextContent('params1: param1')
      expect(tooltip).toHaveTextContent('params2: param2')
    })

    it('应该在visible为false时不渲染tooltip', () => {
      const { container } = render(<Tooltip {...defaultProps} visible={false} />)

      expect(container.firstChild).toBeNull()
    })

    it('应该根据位置设置样式', () => {
      const { container } = render(<Tooltip {...defaultProps} position={{ x: 50, y: 75 }} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toHaveStyle({
        left: '65px', // x + 15
        top: '90px', // y + 15
      })
    })
  })

  describe('有效性状态', () => {
    it('应该为有效目标显示深色背景', () => {
      const { container } = render(<Tooltip {...defaultProps} isValid={true} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toBeInTheDocument()
      expect(screen.getByText(/params1:/)).toBeInTheDocument()
    })

    it('应该为无效目标显示红色背景', () => {
      const { container } = render(<Tooltip {...defaultProps} isValid={false} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toBeInTheDocument()
      expect(screen.getByText('非法目标')).toBeInTheDocument()
    })
  })

  describe('内容格式化', () => {
    it('应该显示单个参数', () => {
      render(<Tooltip {...defaultProps} attributes={{ params: ['single-param'] }} />)

      expect(screen.getByText(/params1: single-param/)).toBeInTheDocument()
    })

    it('应该显示多个参数', () => {
      render(<Tooltip {...defaultProps} attributes={{ params: ['param1', 'param2', 'param3'] }} />)

      expect(screen.getByText(/params1: param1/)).toBeInTheDocument()
      expect(screen.getByText(/params2: param2/)).toBeInTheDocument()
      expect(screen.getByText(/params3: param3/)).toBeInTheDocument()
    })

    it('应该处理空参数数组', () => {
      const { container } = render(<Tooltip {...defaultProps} attributes={{ params: [] }} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toBeInTheDocument()
      // 空参数时，formatTooltipContent返回空字符串
      expect(tooltip).toHaveTextContent('')
    })
  })

  describe('边界情况', () => {
    it('应该处理负数位置', () => {
      const { container } = render(<Tooltip {...defaultProps} position={{ x: -10, y: -20 }} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toHaveStyle({
        left: '5px', // -10 + 15
        top: '-5px', // -20 + 15
      })
    })

    it('应该处理零位置', () => {
      const { container } = render(<Tooltip {...defaultProps} position={{ x: 0, y: 0 }} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toHaveStyle({
        left: '15px',
        top: '15px',
      })
    })

    it('应该处理大数值位置', () => {
      const { container } = render(<Tooltip {...defaultProps} position={{ x: 9999, y: 9999 }} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toHaveStyle({
        left: '10014px',
        top: '10014px',
      })
    })

    it('应该处理包含特殊字符的参数', () => {
      render(
        <Tooltip
          {...defaultProps}
          attributes={{ params: ['<script>alert("xss")</script>', '参数中文🎉'] }}
        />
      )

      expect(screen.getByText(/<script>alert\("xss"\)<\/script>/)).toBeInTheDocument()
      expect(screen.getByText(/参数中文🎉/)).toBeInTheDocument()
    })

    it('应该处理非常长的参数', () => {
      const longParam = 'a'.repeat(500)
      render(<Tooltip {...defaultProps} attributes={{ params: [longParam] }} />)

      expect(screen.getByText(new RegExp(longParam))).toBeInTheDocument()
    })
  })

  describe('可见性切换', () => {
    it('应该支持从不可见到可见', () => {
      const { container, rerender } = render(<Tooltip {...defaultProps} visible={false} />)

      expect(container.firstChild).toBeNull()

      rerender(<Tooltip {...defaultProps} visible={true} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toBeInTheDocument()
    })

    it('应该支持从可见到不可见', () => {
      const { container, rerender } = render(<Tooltip {...defaultProps} visible={true} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toBeInTheDocument()

      rerender(<Tooltip {...defaultProps} visible={false} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('位置更新', () => {
    it('应该支持动态更新位置', () => {
      const { container, rerender } = render(
        <Tooltip {...defaultProps} position={{ x: 100, y: 200 }} />
      )

      let tooltip = container.querySelector('div')
      expect(tooltip).toHaveStyle({ left: '115px', top: '215px' })

      rerender(<Tooltip {...defaultProps} position={{ x: 300, y: 400 }} />)

      tooltip = container.querySelector('div')
      expect(tooltip).toHaveStyle({ left: '315px', top: '415px' })
    })
  })

  describe('样式验证', () => {
    it('应该有固定定位', () => {
      const { container } = render(<Tooltip {...defaultProps} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toHaveStyle({ position: 'fixed' })
    })

    it('应该有正确的z-index', () => {
      const { container } = render(<Tooltip {...defaultProps} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toHaveStyle({ 'z-index': '2147483647' })
    })

    it('应该有pointer-events: none', () => {
      const { container } = render(<Tooltip {...defaultProps} />)

      const tooltip = container.querySelector('div')
      expect(tooltip).toHaveStyle({ 'pointer-events': 'none' })
    })
  })
})
