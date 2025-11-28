import type { ElementAttributes } from '@/shared/types'
import { formatTooltipContent } from '../ui/tooltip'

describe('Tooltip格式化工具测试', () => {
  describe('formatTooltipContent', () => {
    it('应该格式化有效的元素属性', () => {
      const attributes: ElementAttributes = {
        params: ['value1', 'value2', 'value3'],
      }
      const result = formatTooltipContent(attributes, true)
      expect(result).toBe('params1: value1\nparams2: value2\nparams3: value3')
    })

    it('应该处理单个参数', () => {
      const attributes: ElementAttributes = {
        params: ['single'],
      }
      const result = formatTooltipContent(attributes, true)
      expect(result).toBe('params1: single')
    })

    it('应该处理空参数数组', () => {
      const attributes: ElementAttributes = {
        params: [],
      }
      const result = formatTooltipContent(attributes, true)
      expect(result).toBe('')
    })

    it('应该对无效目标返回错误提示', () => {
      const attributes: ElementAttributes = {
        params: ['value1', 'value2'],
      }
      const result = formatTooltipContent(attributes, false)
      expect(result).toBe('非法目标')
    })

    it('应该处理包含特殊字符的参数', () => {
      const attributes: ElementAttributes = {
        params: ['user,name', 'user:id', 'user/profile'],
      }
      const result = formatTooltipContent(attributes, true)
      expect(result).toBe('params1: user,name\nparams2: user:id\nparams3: user/profile')
    })

    it('应该处理长参数值', () => {
      const attributes: ElementAttributes = {
        params: ['a'.repeat(100), 'b'.repeat(50)],
      }
      const result = formatTooltipContent(attributes, true)
      expect(result).toContain('params1: ' + 'a'.repeat(100))
      expect(result).toContain('params2: ' + 'b'.repeat(50))
    })
  })
})
