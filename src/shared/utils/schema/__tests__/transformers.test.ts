import {
  convertToASTString,
  convertToMarkdownString,
  formatJsonString,
  isElementsArray,
  isStringData,
  parseMarkdownString,
  parserSchemaNodeToMarkdown,
} from '../transformers'

// Mock logger
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

// Mock @ant-design/agentic-ui
vi.mock('@ant-design/agentic-ui', () => ({
  parserMarkdownToSlateNode: vi.fn(),
  parserSlateNodeToMarkdown: vi.fn(),
}))

import { parserMarkdownToSlateNode, parserSlateNodeToMarkdown } from '@ant-design/agentic-ui'
import { logger } from '@/shared/utils/logger'

const mockParserMarkdownToSlateNode = parserMarkdownToSlateNode as MockedFunction<
  typeof parserMarkdownToSlateNode
>
const mockParserSlateNodeToMarkdown = parserSlateNodeToMarkdown as MockedFunction<
  typeof parserSlateNodeToMarkdown
>
const mockLogger = logger as vi.Mocked<typeof logger>

describe('transformers 工具函数测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isStringData', () => {
    it('字符串应该返回 true', () => {
      expect(isStringData('hello')).toBe(true)
      expect(isStringData('')).toBe(true)
      expect(isStringData('123')).toBe(true)
    })

    it('非字符串应该返回 false', () => {
      expect(isStringData(123)).toBe(false)
      expect(isStringData(null)).toBe(false)
      expect(isStringData(undefined)).toBe(false)
      expect(isStringData({})).toBe(false)
      expect(isStringData([])).toBe(false)
      expect(isStringData(true)).toBe(false)
    })
  })

  describe('isElementsArray', () => {
    it('有效的 Elements[] 应该返回 true', () => {
      const validElements = [
        { type: 'paragraph', children: [{ text: 'hello' }] },
        { type: 'heading', children: [{ text: 'title' }] },
      ]
      expect(isElementsArray(validElements)).toBe(true)
    })

    it('单个有效元素的数组应该返回 true', () => {
      const singleElement = [{ type: 'paragraph', children: [{ text: 'hello' }] }]
      expect(isElementsArray(singleElement)).toBe(true)
    })

    it('空数组应该返回 false', () => {
      expect(isElementsArray([])).toBe(false)
    })

    it('非数组应该返回 false', () => {
      expect(isElementsArray(null)).toBe(false)
      expect(isElementsArray(undefined)).toBe(false)
      expect(isElementsArray('string')).toBe(false)
      expect(isElementsArray(123)).toBe(false)
      expect(isElementsArray({})).toBe(false)
    })

    it('元素缺少 type 属性应该返回 false', () => {
      const invalidElements = [{ children: [{ text: 'hello' }] }]
      expect(isElementsArray(invalidElements)).toBe(false)
    })

    it('元素 type 不是字符串应该返回 false', () => {
      const invalidElements = [{ type: 123, children: [{ text: 'hello' }] }]
      expect(isElementsArray(invalidElements)).toBe(false)
    })

    it('元素缺少 children 属性应该返回 false', () => {
      const invalidElements = [{ type: 'paragraph' }]
      expect(isElementsArray(invalidElements)).toBe(false)
    })

    it('元素 children 不是数组应该返回 false', () => {
      const invalidElements = [{ type: 'paragraph', children: 'not array' }]
      expect(isElementsArray(invalidElements)).toBe(false)
    })

    it('包含 null 元素应该返回 false', () => {
      const invalidElements = [null, { type: 'paragraph', children: [] }]
      expect(isElementsArray(invalidElements)).toBe(false)
    })

    it('部分元素无效应该返回 false', () => {
      const mixedElements = [
        { type: 'paragraph', children: [{ text: 'valid' }] },
        { type: 'invalid' }, // 缺少 children
      ]
      expect(isElementsArray(mixedElements)).toBe(false)
    })
  })

  describe('formatJsonString', () => {
    it('应该格式化有效的 JSON 字符串', () => {
      const input = '{"key":"value","nested":{"prop":1}}'
      const result = formatJsonString(input)

      expect(result.success).toBe(true)
      expect(result.data).toContain('\n')
      expect(JSON.parse(result.data!)).toEqual({ key: 'value', nested: { prop: 1 } })
    })

    it('应该格式化 JSON 数组', () => {
      const input = '[1,2,3]'
      const result = formatJsonString(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual([1, 2, 3])
    })

    it('无效 JSON 应该返回错误', () => {
      const input = '{invalid json}'
      const result = formatJsonString(input)

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('空字符串应该返回错误', () => {
      const result = formatJsonString('')

      expect(result.success).toBe(false)
    })

    it('应该处理布尔值', () => {
      expect(formatJsonString('true').success).toBe(true)
      expect(formatJsonString('false').success).toBe(true)
    })

    it('应该处理 null', () => {
      const result = formatJsonString('null')

      expect(result.success).toBe(true)
      expect(result.data).toBe('null')
    })

    it('应该处理数字', () => {
      const result = formatJsonString('123.45')

      expect(result.success).toBe(true)
      expect(result.data).toBe('123.45')
    })
  })

  describe('parseMarkdownString', () => {
    it('应该正确解析 Markdown 字符串', () => {
      const mockSchema = [{ type: 'paragraph', children: [{ text: 'hello' }] }]
      mockParserMarkdownToSlateNode.mockReturnValue({ schema: mockSchema } as any)

      const result = parseMarkdownString('# Hello')

      expect(mockParserMarkdownToSlateNode).toHaveBeenCalledWith('# Hello')
      expect(result).toEqual(mockSchema)
    })

    it('结果为空时应该返回空数组', () => {
      mockParserMarkdownToSlateNode.mockReturnValue({ schema: [] } as any)

      const result = parseMarkdownString('')

      expect(result).toEqual([])
    })

    it('结果没有 schema 属性时应该返回空数组', () => {
      mockParserMarkdownToSlateNode.mockReturnValue({} as any)

      const result = parseMarkdownString('test')

      expect(result).toEqual([])
    })

    it('解析失败时应该记录错误并返回空数组', () => {
      const error = new Error('解析失败')
      mockParserMarkdownToSlateNode.mockImplementation(() => {
        throw error
      })

      const result = parseMarkdownString('invalid')

      expect(mockLogger.error).toHaveBeenCalledWith('解析 Markdown 失败:', error)
      expect(result).toEqual([])
    })
  })

  describe('parserSchemaNodeToMarkdown', () => {
    it('应该正确将 Elements[] 转换为 Markdown', () => {
      mockParserSlateNodeToMarkdown.mockReturnValue('# Hello\n\nWorld')

      const elements = [{ type: 'paragraph', children: [{ text: 'hello' }] }]
      const result = parserSchemaNodeToMarkdown(elements as any)

      expect(mockParserSlateNodeToMarkdown).toHaveBeenCalledWith(elements)
      expect(result).toBe('# Hello\n\nWorld')
    })

    it('转换失败时应该记录错误并抛出异常', () => {
      const error = new Error('转换失败')
      mockParserSlateNodeToMarkdown.mockImplementation(() => {
        throw error
      })

      const elements = [{ type: 'paragraph', children: [{ text: 'hello' }] }]

      expect(() => parserSchemaNodeToMarkdown(elements as any)).toThrow(error)
      expect(mockLogger.error).toHaveBeenCalledWith('转换为 Markdown 失败:', error)
    })
  })

  describe('convertToASTString', () => {
    it('应该将字符串类型的 JSON 转换为 AST 结构', () => {
      const mockSchema = [{ type: 'paragraph', children: [{ text: 'hello' }] }]
      mockParserMarkdownToSlateNode.mockReturnValue({ schema: mockSchema } as any)

      const input = JSON.stringify('# Hello World')
      const result = convertToASTString(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual(mockSchema)
    })

    it('非字符串类型的 JSON 应该返回错误', () => {
      const input = JSON.stringify({ key: 'value' })
      const result = convertToASTString(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('当前内容不是字符串类型')
    })

    it('解析结果为空应该返回错误', () => {
      mockParserMarkdownToSlateNode.mockReturnValue({ schema: [] } as any)

      const input = JSON.stringify('')
      const result = convertToASTString(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('无法解析为有效的AST结构')
    })

    it('无效 JSON 应该返回错误', () => {
      const result = convertToASTString('{invalid}')

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('数组类型的 JSON 应该返回错误', () => {
      const input = JSON.stringify([1, 2, 3])
      const result = convertToASTString(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('当前内容不是字符串类型')
    })

    it('数字类型的 JSON 应该返回错误', () => {
      const input = JSON.stringify(123)
      const result = convertToASTString(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('当前内容不是字符串类型')
    })
  })

  describe('convertToMarkdownString', () => {
    it('应该将 Elements[] 类型的 JSON 转换为 Markdown 字符串', () => {
      mockParserSlateNodeToMarkdown.mockReturnValue('# Hello World')

      const elements = [{ type: 'paragraph', children: [{ text: 'hello' }] }]
      const input = JSON.stringify(elements)
      const result = convertToMarkdownString(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toBe('# Hello World')
    })

    it('非 Elements[] 类型的 JSON 应该返回错误', () => {
      const input = JSON.stringify({ key: 'value' })
      const result = convertToMarkdownString(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('当前内容不是Elements[]类型')
    })

    it('字符串类型的 JSON 应该返回错误', () => {
      const input = JSON.stringify('hello')
      const result = convertToMarkdownString(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('当前内容不是Elements[]类型')
    })

    it('空数组应该返回错误', () => {
      const input = JSON.stringify([])
      const result = convertToMarkdownString(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('当前内容不是Elements[]类型')
    })

    it('无效 JSON 应该返回错误', () => {
      const result = convertToMarkdownString('{invalid}')

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('转换过程中出错应该返回错误', () => {
      const error = new Error('转换失败')
      mockParserSlateNodeToMarkdown.mockImplementation(() => {
        throw error
      })

      const elements = [{ type: 'paragraph', children: [{ text: 'hello' }] }]
      const input = JSON.stringify(elements)
      const result = convertToMarkdownString(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('转换失败')
    })

    it('无效元素结构应该返回错误', () => {
      const invalidElements = [{ invalid: 'structure' }]
      const input = JSON.stringify(invalidElements)
      const result = convertToMarkdownString(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('当前内容不是Elements[]类型')
    })
  })

  describe('边界情况', () => {
    it('isElementsArray 应该处理原始类型元素', () => {
      expect(isElementsArray([1, 2, 3])).toBe(false)
      expect(isElementsArray(['a', 'b', 'c'])).toBe(false)
      expect(isElementsArray([true, false])).toBe(false)
    })

    it('formatJsonString 应该处理嵌套复杂结构', () => {
      const complex = {
        level1: {
          level2: {
            level3: [1, 2, { deep: 'value' }],
          },
        },
      }
      const input = JSON.stringify(complex)
      const result = formatJsonString(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual(complex)
    })

    it('isElementsArray 应该处理带额外属性的有效元素', () => {
      const elementsWithExtra = [
        {
          type: 'paragraph',
          children: [{ text: 'hello' }],
          extraProp: 'value',
          id: '123',
        },
      ]
      expect(isElementsArray(elementsWithExtra)).toBe(true)
    })

    it('formatJsonString 应该处理包含特殊字符的 JSON', () => {
      const withSpecialChars = { key: 'value with "quotes" and \\backslash' }
      const input = JSON.stringify(withSpecialChars)
      const result = formatJsonString(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual(withSpecialChars)
    })

    it('formatJsonString 应该处理 Unicode 字符', () => {
      const withUnicode = { message: '你好世界 🌍' }
      const input = JSON.stringify(withUnicode)
      const result = formatJsonString(input)

      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual(withUnicode)
    })
  })
})
