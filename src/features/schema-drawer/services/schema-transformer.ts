import { deserializeJson, serializeJson } from '@/shared/utils/schema/serializer'
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
export interface TransformResult {
  success: boolean
  data?: string
  error?: string
  /** 反序列化的解析层数 */
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
   * 序列化数据
   * 将编辑器内容转换为 JSON 字符串格式
   */
  serializeJson(value: string): TransformResult {
    try {
      // 尝试先解析，如果是有效 JSON 则序列化解析后的值
      const parsed = JSON.parse(value)
      return serializeJson(parsed)
    } catch {
      // 如果不是有效 JSON（如普通多行文本），直接序列化原始字符串
      return serializeJson(value)
    }
  }

  /**
   * 反序列化JSON字符串
   */
  deserializeJson(value: string): TransformResult {
    return deserializeJson(value)
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
