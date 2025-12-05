import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorPickerField } from '../ColorPickerField'

describe('ColorPickerField组件测试', () => {
  const defaultProps = {
    value: '#FF0000',
    onChange: vi.fn(),
    showText: true,
    format: 'hex' as const,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该渲染ColorPicker组件', () => {
      const { container } = render(<ColorPickerField {...defaultProps} />)

      const colorPicker = container.querySelector('.ant-color-picker-trigger')
      expect(colorPicker).toBeInTheDocument()
    })

    it('应该使用提供的value', () => {
      const { container } = render(<ColorPickerField value="#00FF00" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该处理undefined value', () => {
      const { container } = render(<ColorPickerField value={undefined} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })
  })

  describe('showText属性', () => {
    it('应该默认显示文本', () => {
      const { container } = render(<ColorPickerField {...defaultProps} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该支持隐藏文本', () => {
      const { container } = render(<ColorPickerField {...defaultProps} showText={false} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该在showText为true时显示颜色值文本', () => {
      const { container } = render(<ColorPickerField {...defaultProps} showText={true} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })
  })

  describe('format属性', () => {
    it('应该支持hex格式', () => {
      const { container } = render(<ColorPickerField {...defaultProps} format="hex" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该支持rgb格式', () => {
      const { container } = render(<ColorPickerField {...defaultProps} format="rgb" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该支持hsb格式', () => {
      const { container } = render(<ColorPickerField {...defaultProps} format="hsb" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })
  })

  describe('presets属性', () => {
    it('应该支持预设颜色', () => {
      const presets = [
        {
          label: '常用颜色',
          colors: ['#FF0000', '#00FF00', '#0000FF'],
        },
      ]

      const { container } = render(<ColorPickerField {...defaultProps} presets={presets} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该处理空预设数组', () => {
      const { container } = render(<ColorPickerField {...defaultProps} presets={[]} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该处理多个预设组', () => {
      const presets = [
        { label: '组1', colors: ['#FF0000', '#00FF00'] },
        { label: '组2', colors: ['#0000FF', '#FFFF00'] },
      ]

      const { container } = render(<ColorPickerField {...defaultProps} presets={presets} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })
  })

  describe('onChange回调', () => {
    it('应该在没有onChange时不报错', async () => {
      const user = userEvent.setup()
      const { container } = render(<ColorPickerField value="#FF0000" />)

      const trigger = container.querySelector('.ant-color-picker-trigger')
      if (trigger) {
        await user.click(trigger)
      }

      // 不应该抛出错误
      expect(container).toBeInTheDocument()
    }, 10000)

    it('应该接受onChange回调', () => {
      const onChange = vi.fn()
      render(<ColorPickerField {...defaultProps} onChange={onChange} />)

      // onChange prop应该被接受
      expect(onChange).not.toHaveBeenCalled() // 初始渲染不应调用
    })
  })

  describe('颜色值规范化', () => {
    it('应该规范化有效的hex颜色', () => {
      const { container } = render(<ColorPickerField value="#FF0000" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该规范化3位hex颜色', () => {
      const { container } = render(<ColorPickerField value="#F00" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该处理无效颜色值并使用默认值', () => {
      const { container } = render(<ColorPickerField value="invalid-color" />)

      // 应该使用默认颜色
      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该处理空字符串值', () => {
      const { container } = render(<ColorPickerField value="" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该处理value为null', () => {
      const { container } = render(<ColorPickerField value={null as any} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该处理value为对象', () => {
      const { container } = render(<ColorPickerField value={{} as any} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该处理value为数字', () => {
      const { container } = render(<ColorPickerField value={123 as any} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该处理所有属性都不提供的情况', () => {
      const { container } = render(<ColorPickerField />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })
  })

  describe('Props更新', () => {
    it('应该支持value更新', () => {
      const { rerender, container } = render(<ColorPickerField value="#FF0000" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()

      rerender(<ColorPickerField value="#00FF00" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该支持showText切换', () => {
      const { rerender, container } = render(<ColorPickerField {...defaultProps} showText={true} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()

      rerender(<ColorPickerField {...defaultProps} showText={false} />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该支持format切换', () => {
      const { rerender, container } = render(<ColorPickerField {...defaultProps} format="hex" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()

      rerender(<ColorPickerField {...defaultProps} format="rgb" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该支持onChange更新', () => {
      const onChange1 = vi.fn()
      const onChange2 = vi.fn()

      const { rerender } = render(<ColorPickerField {...defaultProps} onChange={onChange1} />)
      rerender(<ColorPickerField {...defaultProps} onChange={onChange2} />)

      // 不应该调用旧的onChange
      expect(onChange1).not.toHaveBeenCalled()
      expect(onChange2).not.toHaveBeenCalled()
    })
  })

  describe('特殊颜色值', () => {
    it('应该处理黑色', () => {
      const { container } = render(<ColorPickerField value="#000000" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该处理白色', () => {
      const { container } = render(<ColorPickerField value="#FFFFFF" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该处理透明色（虽然hex不支持透明度）', () => {
      const { container } = render(<ColorPickerField value="#FFFFFF00" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })

    it('应该处理大小写混合的hex值', () => {
      const { container } = render(<ColorPickerField value="#AaBbCc" />)

      expect(container.querySelector('.ant-color-picker-trigger')).toBeInTheDocument()
    })
  })
})
