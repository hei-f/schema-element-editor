import type { ElementAttributes } from '@/types'
import { render, screen } from '@testing-library/react'
import { Tooltip } from '../Tooltip'

// Mock formatTooltipContent
jest.mock('@/utils/ui/tooltip', () => ({
  formatTooltipContent: jest.fn((attributes, isValid) => {
    if (!isValid) return '非法目标'
    return attributes.params.map((p: string, i: number) => `params${i + 1}: ${p}`).join('\n')
  })
}))

describe('Tooltip组件测试', () => {
  const defaultProps = {
    visible: true,
    position: { x: 100, y: 200 },
    attributes: { params: ['test1', 'test2'] } as ElementAttributes,
    isValid: true
  }

  it('当visible为false时不应渲染', () => {
    const { container } = render(
      <Tooltip {...defaultProps} visible={false} />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('当visible为true时应该渲染', () => {
    render(<Tooltip {...defaultProps} />)
    
    expect(screen.getByText(/params1: test1/)).toBeInTheDocument()
  })

  it('应该显示有效的参数列表', () => {
    render(<Tooltip {...defaultProps} />)
    
    expect(screen.getByText(/params1: test1/)).toBeInTheDocument()
    expect(screen.getByText(/params2: test2/)).toBeInTheDocument()
  })

  it('应该在正确的位置显示', () => {
    const { container } = render(<Tooltip {...defaultProps} />)
    
    const tooltip = container.firstChild as HTMLElement
    expect(tooltip.style.left).toBe('115px') // x + 15
    expect(tooltip.style.top).toBe('215px')  // y + 15
  })

  it('当isValid为false时应显示错误提示', () => {
    render(<Tooltip {...defaultProps} isValid={false} />)
    
    expect(screen.getByText('非法目标')).toBeInTheDocument()
  })

  it('应该处理空参数数组', () => {
    const props = {
      ...defaultProps,
      attributes: { params: [] } as ElementAttributes
    }
    
    render(<Tooltip {...props} />)
    
    // 应该渲染但内容为空
    const { container } = render(<Tooltip {...props} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('应该处理单个参数', () => {
    const props = {
      ...defaultProps,
      attributes: { params: ['single'] } as ElementAttributes
    }
    
    render(<Tooltip {...props} />)
    
    expect(screen.getByText(/params1: single/)).toBeInTheDocument()
  })

  it('位置应该随props变化', () => {
    const { container, rerender } = render(<Tooltip {...defaultProps} />)
    
    let tooltip = container.firstChild as HTMLElement
    expect(tooltip.style.left).toBe('115px')
    
    rerender(<Tooltip {...defaultProps} position={{ x: 300, y: 400 }} />)
    
    tooltip = container.firstChild as HTMLElement
    expect(tooltip.style.left).toBe('315px')
    expect(tooltip.style.top).toBe('415px')
  })
})

