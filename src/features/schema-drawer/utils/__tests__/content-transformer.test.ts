import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  formatContent,
  unescapeContent,
  compactContent,
  parseContent,
} from '../content-transformer'
import { schemaTransformer } from '../../services/schema-transformer'

// Mock schemaTransformer
vi.mock('../../services/schema-transformer', () => ({
  schemaTransformer: {
    parseNestedJson: vi.fn(),
  },
}))

describe('content-transformer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('formatContent', () => {
    it('应该格式化有效的 JSON 字符串', () => {
      const input = '{"name":"test","value":123}'
      const result = formatContent(input)
      expect(result).toBe('{\n  "name": "test",\n  "value": 123\n}')
    })

    it('应该格式化嵌套的 JSON 对象', () => {
      const input = '{"outer":{"inner":"value"}}'
      const result = formatContent(input)
      expect(result).toBe('{\n  "outer": {\n    "inner": "value"\n  }\n}')
    })

    it('应该格式化 JSON 数组', () => {
      const input = '[1,2,3]'
      const result = formatContent(input)
      expect(result).toBe('[\n  1,\n  2,\n  3\n]')
    })

    it('无效 JSON 时应该返回原内容', () => {
      const input = 'invalid json {'
      const result = formatContent(input)
      expect(result).toBe(input)
    })

    it('空字符串应该返回原内容', () => {
      const input = ''
      const result = formatContent(input)
      expect(result).toBe(input)
    })
  })

  describe('unescapeContent', () => {
    it('应该去转义 JSON 字符串值', () => {
      const input = '"hello world"'
      const result = unescapeContent(input)
      expect(result).toBe('hello world')
    })

    it('应该处理包含转义字符的字符串', () => {
      const input = '"line1\\nline2"'
      const result = unescapeContent(input)
      expect(result).toBe('line1\nline2')
    })

    it('应该处理包含引号的字符串', () => {
      const input = '"say \\"hello\\""'
      const result = unescapeContent(input)
      expect(result).toBe('say "hello"')
    })

    it('非字符串类型的 JSON 应该返回原内容', () => {
      const input = '{"key": "value"}'
      const result = unescapeContent(input)
      expect(result).toBe(input)
    })

    it('无效 JSON 应该返回原内容', () => {
      const input = 'not a json string'
      const result = unescapeContent(input)
      expect(result).toBe(input)
    })

    it('数字类型应该返回原内容', () => {
      const input = '123'
      const result = unescapeContent(input)
      expect(result).toBe(input)
    })
  })

  describe('compactContent', () => {
    it('应该压缩格式化的 JSON', () => {
      const input = '{\n  "name": "test",\n  "value": 123\n}'
      const result = compactContent(input)
      expect(result).toBe('{"name":"test","value":123}')
    })

    it('应该压缩带空格的 JSON', () => {
      const input = '{ "a" : 1 , "b" : 2 }'
      const result = compactContent(input)
      expect(result).toBe('{"a":1,"b":2}')
    })

    it('应该压缩 JSON 数组', () => {
      const input = '[\n  1,\n  2,\n  3\n]'
      const result = compactContent(input)
      expect(result).toBe('[1,2,3]')
    })

    it('无效 JSON 应该返回原内容', () => {
      const input = 'invalid json'
      const result = compactContent(input)
      expect(result).toBe(input)
    })

    it('已压缩的 JSON 应该保持不变', () => {
      const input = '{"a":1}'
      const result = compactContent(input)
      expect(result).toBe('{"a":1}')
    })
  })

  describe('parseContent', () => {
    it('成功解析时应该返回格式化的结果', () => {
      const input = '{"nested": "{\\"key\\": \\"value\\"}"}'
      const parsedData = '{"key": "value"}'

      vi.mocked(schemaTransformer.parseNestedJson).mockReturnValue({
        success: true,
        data: parsedData,
      })

      const result = parseContent(input)
      expect(schemaTransformer.parseNestedJson).toHaveBeenCalledWith(input)
      expect(result).toBe('{\n  "key": "value"\n}')
    })

    it('解析结果不是有效 JSON 时应该返回原始解析数据', () => {
      const input = 'some content'
      const parsedData = 'not valid json'

      vi.mocked(schemaTransformer.parseNestedJson).mockReturnValue({
        success: true,
        data: parsedData,
      })

      const result = parseContent(input)
      expect(result).toBe(parsedData)
    })

    it('解析失败时应该返回原内容', () => {
      const input = 'unparseable content'

      vi.mocked(schemaTransformer.parseNestedJson).mockReturnValue({
        success: false,
        data: undefined,
      })

      const result = parseContent(input)
      expect(result).toBe(input)
    })

    it('解析成功但 data 为空时应该返回原内容', () => {
      const input = 'some content'

      vi.mocked(schemaTransformer.parseNestedJson).mockReturnValue({
        success: true,
        data: '',
      })

      const result = parseContent(input)
      expect(result).toBe(input)
    })
  })
})
