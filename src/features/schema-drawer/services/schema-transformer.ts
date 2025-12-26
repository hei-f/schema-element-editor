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

/**
 * 转换操作的结果
 */
interface TransformResult {
  success: boolean
  data?: string
  error?: string
  /** 解析的层数 */
  parseCount?: number
}

/**
 * Schema数据转换服务
 * 负责处理所有Schema数据的格式转换操作
 */
export class SchemaTransformer {
  /**
   * 格式化JSON字符串
   */
  formatJson(value: string): TransformResult {
    return formatJsonString(value)
  }

  /**
   * 转义JSON
   * 将 JSON 内容包装成字符串值，添加引号和转义
   * @example {"a":1} → "{\"a\":1}"
   */
  escapeJson(value: string): TransformResult {
    return escapeJson(value)
  }

  /**
   * 去转义JSON
   * 将被包装成字符串值的 JSON 还原，移除外层引号和转义
   * @example "{\"a\":1}" → {"a":1}
   */
  unescapeJson(value: string): TransformResult {
    return unescapeJson(value)
  }

  /**
   * 压缩JSON
   * 将格式化的 JSON 压缩成一行
   * @example { "a": 1 } → {"a":1}
   */
  compactJson(value: string): TransformResult {
    try {
      // 尝试先解析，如果是有效 JSON 则压缩解析后的值
      const parsed = JSON.parse(value)
      return compactJson(parsed)
    } catch {
      // 如果不是有效 JSON（如普通多行文本），直接压缩原始字符串
      return compactJson(value)
    }
  }

  /**
   * 解析嵌套JSON
   * 处理多层嵌套/转义的 JSON 字符串，递归解析并格式化显示
   */
  parseNestedJson(value: string): TransformResult {
    return parseNestedJson(value)
  }

  /**
   * 加引号+去转义
   * 组合操作：先添加外层引号，再执行去转义。用于处理裸露的转义JSON
   * @example {\"user\":\"Alice\"} → {"user":"Alice"}
   */
  addQuotesAndUnescape(value: string): TransformResult {
    return addQuotesAndUnescape(value)
  }

  /**
   * 转义+去引号
   * 组合操作：先执行转义，再去除外层引号。用于将JSON转换为裸露的转义格式
   * @example {"user":"Alice"} → {\"user\":\"Alice\"}
   */
  escapeAndRemoveQuotes(value: string): TransformResult {
    return escapeAndRemoveQuotes(value)
  }

  /**
   * 压缩+转义+去引号
   * 组合操作：先压缩JSON，再转义，最后去除外层引号。用于将格式化JSON转换为紧凑的裸露转义格式
   * @example { "user": "Alice" } → {\"user\":\"Alice\"}
   */
  compactEscapeAndRemoveQuotes(value: string): TransformResult {
    return compactEscapeAndRemoveQuotes(value)
  }

  /**
   * 转换为AST字符串
   */
  convertToAST(value: string): TransformResult {
    return convertToASTString(value)
  }

  /**
   * 转换为Markdown字符串
   */
  convertToMarkdown(value: string): TransformResult {
    return convertToMarkdownString(value)
  }

  /**
   * 将Elements数组转换为Markdown字符串（用于保存）
   */
  convertElementsToMarkdown(elements: any[]): TransformResult {
    try {
      const markdownString = parserSchemaNodeToMarkdown(elements)
      return {
        success: true,
        data: markdownString,
      }
    } catch (error: any) {
      return {
        success: false,
        error: `转换为Markdown失败: ${error.message}`,
      }
    }
  }

  /**
   * 准备保存数据
   * 根据原始数据类型和当前数据类型，确定保存时的正确格式
   */
  prepareSaveData(editorValue: string, wasStringData: boolean): TransformResult {
    try {
      const parsed = JSON.parse(editorValue)

      if (wasStringData) {
        // 原始数据是字符串类型
        if (isElementsArray(parsed)) {
          // 转换Elements数组为Markdown字符串
          return this.convertElementsToMarkdown(parsed)
        } else if (isStringData(parsed)) {
          // 直接返回字符串数据
          return {
            success: true,
            data: parsed,
          }
        } else {
          // 转换为JSON字符串
          return {
            success: true,
            data: JSON.stringify(parsed),
          }
        }
      } else {
        // 原始数据不是字符串类型，直接返回解析后的对象
        return {
          success: true,
          data: parsed,
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `数据解析失败: ${error.message}`,
      }
    }
  }

  /**
   * 检查数据是否为Elements数组
   */
  isElementsArray(data: any): boolean {
    return isElementsArray(data)
  }

  /**
   * 检查数据是否为字符串数据
   */
  isStringData(data: any): boolean {
    return isStringData(data)
  }
}

/**
 * 导出单例实例
 */
export const schemaTransformer = new SchemaTransformer()
