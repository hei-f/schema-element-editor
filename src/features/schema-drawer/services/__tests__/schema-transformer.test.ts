import { schemaTransformer, SchemaTransformer } from '../schema-transformer'

// Mock transformers
jest.mock('@/shared/utils/schema/serializer', () => ({
  serializeJson: jest.fn(),
  deserializeJson: jest.fn(),
}))

jest.mock('@/shared/utils/schema/transformers', () => ({
  formatJsonString: jest.fn(),
  convertToASTString: jest.fn(),
  convertToMarkdownString: jest.fn(),
  parserSchemaNodeToMarkdown: jest.fn(),
  isElementsArray: jest.fn(),
  isStringData: jest.fn(),
}))

import { deserializeJson, serializeJson } from '@/shared/utils/schema/serializer'
import {
  convertToASTString,
  convertToMarkdownString,
  formatJsonString,
  isElementsArray,
  isStringData,
  parserSchemaNodeToMarkdown,
} from '@/shared/utils/schema/transformers'

const mockSerializeJson = serializeJson as jest.MockedFunction<typeof serializeJson>
const mockDeserializeJson = deserializeJson as jest.MockedFunction<typeof deserializeJson>
const mockFormatJsonString = formatJsonString as jest.MockedFunction<typeof formatJsonString>
const mockConvertToASTString = convertToASTString as jest.MockedFunction<typeof convertToASTString>
const mockConvertToMarkdownString = convertToMarkdownString as jest.MockedFunction<
  typeof convertToMarkdownString
>
const mockParserSchemaNodeToMarkdown = parserSchemaNodeToMarkdown as jest.MockedFunction<
  typeof parserSchemaNodeToMarkdown
>
const mockIsElementsArray = isElementsArray as jest.MockedFunction<typeof isElementsArray>
const mockIsStringData = isStringData as jest.MockedFunction<typeof isStringData>

describe('SchemaTransformer 测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  describe('serializeJson 序列化', () => {
    it('应该成功序列化JSON', () => {
      const mockResult = { success: true, data: 'serialized' }
      mockSerializeJson.mockReturnValue(mockResult)

      const result = schemaTransformer.serializeJson('{"test": "data"}')

      expect(mockSerializeJson).toHaveBeenCalledWith({ test: 'data' })
      expect(result).toEqual(mockResult)
    })

    it('无效JSON应该直接序列化原始字符串', () => {
      // 现在序列化逻辑改为：无效JSON直接序列化原始字符串
      const mockResult = { success: true, data: '"{invalid json}"' }
      mockSerializeJson.mockReturnValue(mockResult)

      const result = schemaTransformer.serializeJson('{invalid json}')

      // 应该用原始字符串调用serializeJson（因为JSON.parse失败后回退）
      expect(mockSerializeJson).toHaveBeenCalledWith('{invalid json}')
      expect(result.success).toBe(true)
    })
  })

  describe('deserializeJson 反序列化', () => {
    it('应该调用 deserializeJson', () => {
      const mockResult = { success: true, data: 'deserialized', parseCount: 2 }
      mockDeserializeJson.mockReturnValue(mockResult)

      const result = schemaTransformer.deserializeJson('test string')

      expect(mockDeserializeJson).toHaveBeenCalledWith('test string')
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
})
