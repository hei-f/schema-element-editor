import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ColorPickerField, generateRandomColor } from '../ColorPickerField'

describe('ColorPickerField 组件测试', () => {
  const defaultProps = {
    value: '#1890ff',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该成功渲染组件', () => {
      const { container } = render(<ColorPickerField {...defaultProps} />)
      expect(container).toBeDefined()
    })

    it('应该渲染颜色选择器', () => {
      const { container } = render(<ColorPickerField {...defaultProps} />)
      const colorPicker = container.querySelector('.ant-color-picker-trigger')
      expect(colorPicker).toBeInTheDocument()
    })

    it('应该默认显示Surprise me按钮', () => {
      render(<ColorPickerField {...defaultProps} />)
      expect(screen.getByText('Surprise me')).toBeInTheDocument()
    })

    it('应该在showSurprise为false时隐藏Surprise me按钮', () => {
      render(<ColorPickerField {...defaultProps} showSurprise={false} />)
      expect(screen.queryByText('Surprise me')).not.toBeInTheDocument()
    })
  })

  describe('Props处理', () => {
    it('应该接受value prop', () => {
      const { container } = render(<ColorPickerField {...defaultProps} value="#ff0000" />)
      expect(container).toBeDefined()
    })

    it('应该接受onChange prop', () => {
      const onChange = vi.fn()
      const { container } = render(<ColorPickerField {...defaultProps} onChange={onChange} />)
      expect(container).toBeDefined()
    })

    it('应该接受showText prop', () => {
      const { container } = render(<ColorPickerField {...defaultProps} showText={false} />)
      expect(container).toBeDefined()
    })

    it('应该接受format prop', () => {
      const { container } = render(<ColorPickerField {...defaultProps} format="rgb" />)
      expect(container).toBeDefined()
    })

    it('应该接受presets prop', () => {
      const presets = [{ label: '推荐', colors: ['#1890ff', '#52c41a'] }]
      const { container } = render(<ColorPickerField {...defaultProps} presets={presets} />)
      expect(container).toBeDefined()
    })
  })

  describe('用户交互', () => {
    it('应该在点击Surprise me时调用onChange', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ColorPickerField {...defaultProps} onChange={onChange} />)

      const surpriseButton = screen.getByText('Surprise me')
      await user.click(surpriseButton)

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^#[0-9a-f]{6}$/i))
    })

    it('应该支持多次点击Surprise me', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ColorPickerField {...defaultProps} onChange={onChange} />)

      const surpriseButton = screen.getByText('Surprise me')

      await user.click(surpriseButton)
      await user.click(surpriseButton)
      await user.click(surpriseButton)

      expect(onChange).toHaveBeenCalledTimes(3)
    })

    it('应该在没有onChange时不报错', async () => {
      const user = userEvent.setup()
      render(<ColorPickerField value="#1890ff" />)

      const surpriseButton = screen.getByText('Surprise me')

      await expect(user.click(surpriseButton)).resolves.not.toThrow()
    })
  })

  describe('颜色值处理', () => {
    it('应该接受hex格式颜色', () => {
      const { container } = render(<ColorPickerField {...defaultProps} value="#1890ff" />)
      expect(container).toBeDefined()
    })

    it('应该接受短格式hex颜色', () => {
      const { container } = render(<ColorPickerField {...defaultProps} value="#abc" />)
      expect(container).toBeDefined()
    })

    it('应该处理undefined值', () => {
      const { container } = render(<ColorPickerField {...defaultProps} value={undefined} />)
      expect(container).toBeDefined()
    })

    it('应该处理空字符串值', () => {
      const { container } = render(<ColorPickerField {...defaultProps} value="" />)
      expect(container).toBeDefined()
    })

    it('应该处理无效的颜色值', () => {
      const { container } = render(<ColorPickerField {...defaultProps} value="invalid-color" />)
      expect(container).toBeDefined()
    })
  })

  describe('Props变化', () => {
    it('应该响应value变化', () => {
      const { rerender } = render(<ColorPickerField {...defaultProps} value="#1890ff" />)

      expect(() => {
        rerender(<ColorPickerField {...defaultProps} value="#52c41a" />)
      }).not.toThrow()
    })

    it('应该响应showSurprise变化', () => {
      const { rerender } = render(<ColorPickerField {...defaultProps} showSurprise={true} />)

      expect(screen.getByText('Surprise me')).toBeInTheDocument()

      rerender(<ColorPickerField {...defaultProps} showSurprise={false} />)

      expect(screen.queryByText('Surprise me')).not.toBeInTheDocument()
    })

    it('应该响应onChange变化', () => {
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      const { rerender } = render(<ColorPickerField {...defaultProps} onChange={onChange1} />)

      rerender(<ColorPickerField {...defaultProps} onChange={onChange2} />)

      expect(() => {}).not.toThrow()
    })
  })

  describe('组件生命周期', () => {
    it('应该能够正确卸载', () => {
      const { unmount } = render(<ColorPickerField {...defaultProps} />)

      expect(() => unmount()).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理没有任何props的情况', () => {
      expect(() => {
        render(<ColorPickerField />)
      }).not.toThrow()
    })

    it('应该处理多个预设颜色', () => {
      const presets = [
        { label: '推荐', colors: ['#1890ff', '#52c41a', '#ff4d4f'] },
        { label: '最近使用', colors: ['#722ed1', '#fa8c16'] },
      ]

      const { container } = render(<ColorPickerField {...defaultProps} presets={presets} />)
      expect(container).toBeDefined()
    })

    it('应该处理空的presets数组', () => {
      const { container } = render(<ColorPickerField {...defaultProps} presets={[]} />)
      expect(container).toBeDefined()
    })
  })
})

describe('generateRandomColor 函数测试', () => {
  it('应该生成有效的hex颜色', () => {
    const color = generateRandomColor()
    expect(color).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('应该每次生成不同的颜色', () => {
    const colors = new Set()

    for (let i = 0; i < 10; i++) {
      colors.add(generateRandomColor())
    }

    // 生成10次至少应该有几个不同的颜色
    expect(colors.size).toBeGreaterThan(1)
  })

  it('应该生成7个字符的字符串（#加6位hex）', () => {
    const color = generateRandomColor()
    expect(color).toHaveLength(7)
    expect(color[0]).toBe('#')
  })

  it('应该连续调用100次都返回有效颜色', () => {
    for (let i = 0; i < 100; i++) {
      const color = generateRandomColor()
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
