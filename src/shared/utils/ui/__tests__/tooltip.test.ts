import type { ElementAttributes } from '@/shared/types'
import { formatTooltipContent } from '../tooltip'

describe('Tooltip工具测试', () => {
  describe('formatTooltipContent', () => {
    it('应该为非法目标返回错误信息', () => {
      const attributes: ElementAttributes = {
        params: ['param1', 'param2'],
      }

      expect(formatTooltipContent(attributes, false)).toBe('非法目标')
    })

    it('应该格式化单个参数', () => {
      const attributes: ElementAttributes = {
        params: ['test-param'],
      }

      const result = formatTooltipContent(attributes, true)
      expect(result).toBe('params1: test-param')
    })

    it('应该格式化多个参数', () => {
      const attributes: ElementAttributes = {
        params: ['param1', 'param2', 'param3'],
      }

      const result = formatTooltipContent(attributes, true)
      expect(result).toBe('params1: param1\nparams2: param2\nparams3: param3')
    })

    it('应该处理空参数数组', () => {
      const attributes: ElementAttributes = {
        params: [],
      }

      const result = formatTooltipContent(attributes, true)
      expect(result).toBe('')
    })

    it('应该处理包含特殊字符的参数', () => {
      const attributes: ElementAttributes = {
        params: ['<script>alert("xss")</script>', 'param\nwith\nnewlines', 'param\twith\ttabs'],
      }

      const result = formatTooltipContent(attributes, true)
      expect(result).toContain('<script>alert("xss")</script>')
      expect(result).toContain('param\nwith\nnewlines')
      expect(result).toContain('param\twith\ttabs')
    })

    it('应该处理包含Unicode字符的参数', () => {
      const attributes: ElementAttributes = {
        params: ['参数1', '🎉', '👍测试'],
      }

      const result = formatTooltipContent(attributes, true)
      expect(result).toBe('params1: 参数1\nparams2: 🎉\nparams3: 👍测试')
    })

    it('应该处理非常长的参数', () => {
      const longParam = 'a'.repeat(1000)
      const attributes: ElementAttributes = {
        params: [longParam],
      }

      const result = formatTooltipContent(attributes, true)
      expect(result).toBe(`params1: ${longParam}`)
    })

    it('应该处理大量参数', () => {
      const attributes: ElementAttributes = {
        params: Array.from({ length: 100 }, (_, i) => `param${i + 1}`),
      }

      const result = formatTooltipContent(attributes, true)
      const lines = result.split('\n')
      expect(lines).toHaveLength(100)
      expect(lines[0]).toBe('params1: param1')
      expect(lines[99]).toBe('params100: param100')
    })

    it('应该处理包含空字符串的参数', () => {
      const attributes: ElementAttributes = {
        params: ['', 'param2', ''],
      }

      const result = formatTooltipContent(attributes, true)
      expect(result).toBe('params1: \nparams2: param2\nparams3: ')
    })

    it('应该处理包含纯空格的参数', () => {
      const attributes: ElementAttributes = {
        params: ['   ', '\t\t', '\n\n'],
      }

      const result = formatTooltipContent(attributes, true)
      expect(result).toContain('params1:    ')
      expect(result).toContain('params2: \t\t')
      expect(result).toContain('params3: \n\n')
    })
  })

  describe('边界情况', () => {
    it('无论参数内容如何，非法目标总是返回错误信息', () => {
      const testCases = [
        { params: [] },
        { params: ['test'] },
        { params: ['a', 'b', 'c'] },
        { params: Array.from({ length: 100 }, (_, i) => `param${i}`) },
      ]

      testCases.forEach((attributes) => {
        expect(formatTooltipContent(attributes as ElementAttributes, false)).toBe('非法目标')
      })
    })

    it('应该正确编号参数（从1开始）', () => {
      const attributes: ElementAttributes = {
        params: ['first', 'second', 'third'],
      }

      const result = formatTooltipContent(attributes, true)
      expect(result).toMatch(/params1:/)
      expect(result).toMatch(/params2:/)
      expect(result).toMatch(/params3:/)
      expect(result).not.toMatch(/params0:/)
    })

    it('应该使用换行符分隔参数', () => {
      const attributes: ElementAttributes = {
        params: ['param1', 'param2'],
      }

      const result = formatTooltipContent(attributes, true)
      expect(result.split('\n')).toHaveLength(2)
    })

    it('应该保留参数值中的原始格式', () => {
      const attributes: ElementAttributes = {
        params: ['  leading space', 'trailing space  ', '  both  '],
      }

      const result = formatTooltipContent(attributes, true)
      expect(result).toContain('params1:   leading space')
      expect(result).toContain('params2: trailing space  ')
      expect(result).toContain('params3:   both  ')
    })
  })
})
