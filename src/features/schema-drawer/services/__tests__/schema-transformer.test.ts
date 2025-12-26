import { schemaTransformer, SchemaTransformer } from '../schema-transformer'

// Mock transformers
vi.mock('@/shared/utils/schema/serializer', () => ({
  escapeJson: vi.fn(),
  unescapeJson: vi.fn(),
  compactJson: vi.fn(),
  parseNestedJson: vi.fn(),
  addQuotesAndUnescape: vi.fn(),
  escapeAndRemoveQuotes: vi.fn(),
  compactEscapeAndRemoveQuotes: vi.fn(),
}))

vi.mock('@/shared/utils/schema/transformers', () => ({
  formatJsonString: vi.fn(),
  convertToASTString: vi.fn(),
  convertToMarkdownString: vi.fn(),
  parserSchemaNodeToMarkdown: vi.fn(),
  isElementsArray: vi.fn(),
  isStringData: vi.fn(),
}))

import {
  compactJson,
  escapeJson,
  parseNestedJson,
  unescapeJson,
  addQuotesAndUnescape,
  escapeAndRemoveQuotes,
  compactEscapeAndRemoveQuotes,
} from '@/shared/utils/schema/serializer'
import {
  convertToASTString,
  convertToMarkdownString,
  formatJsonString,
  isElementsArray,
  isStringData,
  parserSchemaNodeToMarkdown,
} from '@/shared/utils/schema/transformers'

const mockEscapeJson = vi.mocked(escapeJson)
const mockUnescapeJson = vi.mocked(unescapeJson)
const mockCompactJson = vi.mocked(compactJson)
const mockParseNestedJson = vi.mocked(parseNestedJson)
const mockAddQuotesAndUnescape = vi.mocked(addQuotesAndUnescape)
const mockEscapeAndRemoveQuotes = vi.mocked(escapeAndRemoveQuotes)
const mockCompactEscapeAndRemoveQuotes = vi.mocked(compactEscapeAndRemoveQuotes)
const mockFormatJsonString = vi.mocked(formatJsonString)
const mockConvertToASTString = vi.mocked(convertToASTString)
const mockConvertToMarkdownString = vi.mocked(convertToMarkdownString)
const mockParserSchemaNodeToMarkdown = vi.mocked(parserSchemaNodeToMarkdown)
const mockIsElementsArray = vi.mocked(isElementsArray)
const mockIsStringData = vi.mocked(isStringData)

describe('SchemaTransformer 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('单例', () => {
    it('应该导出单例实例', () => {
      expect(schemaTransformer).toBeInstanceOf(SchemaTransformer)
    })
  })

  describe('formatJson 格式化JSON', () => {
    it('应该调用 formatJsonString', () => {
      const mockResult = { success: true, data: '{"formatted": true}' }
      mockFormatJsonString.mockReturnValue(mockResult)

      const result = schemaTransformer.formatJson('{"test":1}')

      expect(mockFormatJsonString).toHaveBeenCalledWith('{"test":1}')
      expect(result).toEqual(mockResult)
    })
  })

  describe('escapeJson 转义', () => {
    it('应该调用 escapeJson', () => {
      const mockResult = { success: true, data: '"{\\"test\\":1}"' }
      mockEscapeJson.mockReturnValue(mockResult)

      const result = schemaTransformer.escapeJson('{"test":1}')

      expect(mockEscapeJson).toHaveBeenCalledWith('{"test":1}')
      expect(result).toEqual(mockResult)
    })
  })

  describe('unescapeJson 去转义', () => {
    it('应该调用 unescapeJson', () => {
      const mockResult = { success: true, data: '{"test":1}' }
      mockUnescapeJson.mockReturnValue(mockResult)

      const result = schemaTransformer.unescapeJson('"{\\"test\\":1}"')

      expect(mockUnescapeJson).toHaveBeenCalledWith('"{\\"test\\":1}"')
      expect(result).toEqual(mockResult)
    })
  })

  describe('compactJson 压缩', () => {
    it('应该成功压缩JSON', () => {
      const mockResult = { success: true, data: '{"test":"data"}' }
      mockCompactJson.mockReturnValue(mockResult)

      const result = schemaTransformer.compactJson('{"test": "data"}')

      expect(mockCompactJson).toHaveBeenCalledWith({ test: 'data' })
      expect(result).toEqual(mockResult)
    })

    it('无效JSON应该直接压缩原始字符串', () => {
      const mockResult = { success: true, data: '"{invalid json}"' }
      mockCompactJson.mockReturnValue(mockResult)

      const result = schemaTransformer.compactJson('{invalid json}')

      // 应该用原始字符串调用 compactJson（因为JSON.parse失败后回退）
      expect(mockCompactJson).toHaveBeenCalledWith('{invalid json}')
      expect(result.success).toBe(true)
    })
  })

  describe('parseNestedJson 解析', () => {
    it('应该调用 parseNestedJson', () => {
      const mockResult = { success: true, data: '{"parsed": true}', parseCount: 2 }
      mockParseNestedJson.mockReturnValue(mockResult)

      const result = schemaTransformer.parseNestedJson('test string')

      expect(mockParseNestedJson).toHaveBeenCalledWith('test string')
      expect(result).toEqual(mockResult)
    })
  })

  describe('convertToAST 转换为AST', () => {
    it('应该调用 convertToASTString', () => {
      const mockResult = { success: true, data: '[AST]' }
      mockConvertToASTString.mockReturnValue(mockResult)

      const result = schemaTransformer.convertToAST('input')

      expect(mockConvertToASTString).toHaveBeenCalledWith('input')
      expect(result).toEqual(mockResult)
    })
  })

  describe('convertToMarkdown 转换为Markdown', () => {
    it('应该调用 convertToMarkdownString', () => {
      const mockResult = { success: true, data: '# Markdown' }
      mockConvertToMarkdownString.mockReturnValue(mockResult)

      const result = schemaTransformer.convertToMarkdown('input')

      expect(mockConvertToMarkdownString).toHaveBeenCalledWith('input')
      expect(result).toEqual(mockResult)
    })
  })

  describe('convertElementsToMarkdown 将Elements转为Markdown', () => {
    it('应该成功转换Elements数组', () => {
      const elements = [{ type: 'element', name: 'div' }]
      mockParserSchemaNodeToMarkdown.mockReturnValue('# Markdown')

      const result = schemaTransformer.convertElementsToMarkdown(elements)

      expect(mockParserSchemaNodeToMarkdown).toHaveBeenCalledWith(elements)
      expect(result.success).toBe(true)
      expect(result.data).toBe('# Markdown')
    })

    it('转换失败应该返回错误', () => {
      const elements = [{ type: 'invalid' }]
      mockParserSchemaNodeToMarkdown.mockImplementation(() => {
        throw new Error('转换错误')
      })

      const result = schemaTransformer.convertElementsToMarkdown(elements)

      expect(result.success).toBe(false)
      expect(result.error).toContain('转换为Markdown失败')
    })
  })

  describe('prepareSaveData 准备保存数据', () => {
    describe('原始数据为字符串类型 (wasStringData=true)', () => {
      it('Elements数组应该转为Markdown字符串', () => {
        const elements = [{ type: 'element' }]
        mockIsElementsArray.mockReturnValue(true)
        mockIsStringData.mockReturnValue(false)
        mockParserSchemaNodeToMarkdown.mockReturnValue('# Markdown')

        const result = schemaTransformer.prepareSaveData(JSON.stringify(elements), true)

        expect(result.success).toBe(true)
        expect(result.data).toBe('# Markdown')
      })

      it('字符串数据应该直接返回', () => {
        const stringData = 'plain string'
        mockIsElementsArray.mockReturnValue(false)
        mockIsStringData.mockReturnValue(true)

        const result = schemaTransformer.prepareSaveData(JSON.stringify(stringData), true)

        expect(result.success).toBe(true)
        expect(result.data).toBe(stringData)
      })

      it('其他类型应该转为JSON字符串', () => {
        const obj = { key: 'value' }
        mockIsElementsArray.mockReturnValue(false)
        mockIsStringData.mockReturnValue(false)

        const result = schemaTransformer.prepareSaveData(JSON.stringify(obj), true)

        expect(result.success).toBe(true)
        expect(result.data).toBe(JSON.stringify(obj))
      })
    })

    describe('原始数据非字符串类型 (wasStringData=false)', () => {
      it('应该直接返回解析后的对象', () => {
        const obj = { key: 'value', nested: { data: 123 } }

        const result = schemaTransformer.prepareSaveData(JSON.stringify(obj), false)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(obj)
      })

      it('数组应该直接返回', () => {
        const arr = [1, 2, 3]

        const result = schemaTransformer.prepareSaveData(JSON.stringify(arr), false)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(arr)
      })
    })

    describe('错误处理', () => {
      it('无效JSON应该返回错误', () => {
        const result = schemaTransformer.prepareSaveData('{invalid json', false)

        expect(result.success).toBe(false)
        expect(result.error).toContain('数据解析失败')
      })

      it('Elements转Markdown失败应该返回错误', () => {
        mockIsElementsArray.mockReturnValue(true)
        mockParserSchemaNodeToMarkdown.mockImplementation(() => {
          throw new Error('转换失败')
        })

        const result = schemaTransformer.prepareSaveData(
          JSON.stringify([{ type: 'element' }]),
          true
        )

        expect(result.success).toBe(false)
        expect(result.error).toContain('转换为Markdown失败')
      })
    })
  })

  describe('isElementsArray 检查是否为Elements数组', () => {
    it('应该调用 isElementsArray 函数', () => {
      mockIsElementsArray.mockReturnValue(true)

      const result = schemaTransformer.isElementsArray([{ type: 'element' }])

      expect(mockIsElementsArray).toHaveBeenCalledWith([{ type: 'element' }])
      expect(result).toBe(true)
    })

    it('非Elements数组应该返回false', () => {
      mockIsElementsArray.mockReturnValue(false)

      const result = schemaTransformer.isElementsArray([1, 2, 3])

      expect(result).toBe(false)
    })
  })

  describe('isStringData 检查是否为字符串数据', () => {
    it('应该调用 isStringData 函数', () => {
      mockIsStringData.mockReturnValue(true)

      const result = schemaTransformer.isStringData('string')

      expect(mockIsStringData).toHaveBeenCalledWith('string')
      expect(result).toBe(true)
    })

    it('非字符串数据应该返回false', () => {
      mockIsStringData.mockReturnValue(false)

      const result = schemaTransformer.isStringData({ key: 'value' })

      expect(result).toBe(false)
    })
  })

  describe('综合场景', () => {
    it('应该处理复杂的保存场景 - Elements到Markdown', () => {
      const complexElements = [
        { type: 'element', name: 'div', children: [] },
        { type: 'element', name: 'span', children: [] },
      ]
      mockIsElementsArray.mockReturnValue(true)
      mockParserSchemaNodeToMarkdown.mockReturnValue('# Complex Markdown')

      const result = schemaTransformer.prepareSaveData(JSON.stringify(complexElements), true)

      expect(result.success).toBe(true)
      expect(result.data).toBe('# Complex Markdown')
    })

    it('应该处理嵌套JSON对象', () => {
      const nested = {
        level1: {
          level2: {
            level3: {
              data: 'deep',
            },
          },
        },
      }

      const result = schemaTransformer.prepareSaveData(JSON.stringify(nested), false)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(nested)
    })
  })

  describe('addQuotesAndUnescape 加引号+去转义', () => {
    it('应该调用 addQuotesAndUnescape', () => {
      const mockResult = { success: true, data: '{"user":"Alice"}' }
      mockAddQuotesAndUnescape.mockReturnValue(mockResult)

      const result = schemaTransformer.addQuotesAndUnescape('{\\"user\\":\\"Alice\\"}')

      expect(mockAddQuotesAndUnescape).toHaveBeenCalledWith('{\\"user\\":\\"Alice\\"}')
      expect(result).toEqual(mockResult)
    })
  })

  describe('escapeAndRemoveQuotes 转义+去引号', () => {
    it('应该调用 escapeAndRemoveQuotes', () => {
      const mockResult = { success: true, data: '{\\"user\\":\\"Alice\\"}' }
      mockEscapeAndRemoveQuotes.mockReturnValue(mockResult)

      const result = schemaTransformer.escapeAndRemoveQuotes('{"user":"Alice"}')

      expect(mockEscapeAndRemoveQuotes).toHaveBeenCalledWith('{"user":"Alice"}')
      expect(result).toEqual(mockResult)
    })
  })

  describe('compactEscapeAndRemoveQuotes 压缩+转义+去引号', () => {
    it('应该调用 compactEscapeAndRemoveQuotes', () => {
      const mockResult = { success: true, data: '{\\"user\\":\\"Alice\\"}' }
      mockCompactEscapeAndRemoveQuotes.mockReturnValue(mockResult)

      const result = schemaTransformer.compactEscapeAndRemoveQuotes('{ "user": "Alice" }')

      expect(mockCompactEscapeAndRemoveQuotes).toHaveBeenCalledWith('{ "user": "Alice" }')
      expect(result).toEqual(mockResult)
    })
  })
})
