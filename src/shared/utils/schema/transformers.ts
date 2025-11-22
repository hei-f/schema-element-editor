import { logger } from '@/shared/utils/logger'
import type { Elements } from '@ant-design/md-editor'
import { parserMarkdownToSlateNode, parserSlateNodeToMarkdown } from '@ant-design/md-editor'

/**
 * 转换结果类型
 */
export interface TransformResult {
  success: boolean
  data?: string
  error?: string
}

/**
 * 解析 Markdown 字符串，返回 Elements[]
 */
export const parseMarkdownString = (markdownText: string): Elements[] => {
  try {
    const result = parserMarkdownToSlateNode(markdownText)
    const schema = result?.schema || []
    return schema
  } catch (error) {
    logger.error('解析 Markdown 失败:', error)
    return []
  }
}

/**
 * 将 Elements[] 转换为 Markdown 字符串
 */
export const parserSchemaNodeToMarkdown = (elements: Elements[]): string => {
  try {
    return parserSlateNodeToMarkdown(elements)
  } catch (error) {
    logger.error('转换为 Markdown 失败:', error)
    throw error
  }
}

/**
 * 检查数据是否为字符串类型
 */
export const isStringData = (data: any): data is string => {
  return typeof data === 'string'
}

/**
 * 检查数据是否为有效的 Elements[] 结构
 */
export const isElementsArray = (data: any): data is Elements[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return false
  }
  
  return data.every(item => {
    return (
      item !== null &&
      typeof item === 'object' &&
      'children' in item &&
      Array.isArray(item.children)
    )
  })
}

/**
 * 格式化JSON字符串
 */
export const formatJsonString = (jsonString: string): TransformResult => {
  try {
    const parsed = JSON.parse(jsonString)
    const formatted = JSON.stringify(parsed, null, 2)
    return { success: true, data: formatted }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 将字符串类型的JSON转换为AST结构
 */
export const convertToASTString = (jsonString: string): TransformResult => {
  try {
    const parsed = JSON.parse(jsonString)
    
    if (!isStringData(parsed)) {
      return { success: false, error: '当前内容不是字符串类型' }
    }
    
    const elements = parseMarkdownString(parsed)
    
    if (elements.length > 0) {
      const formatted = JSON.stringify(elements, null, 2)
      return { success: true, data: formatted }
    }
    
    return { success: false, error: '无法解析为有效的AST结构' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 将AST结构转换为Markdown字符串
 */
export const convertToMarkdownString = (jsonString: string): TransformResult => {
  try {
    const parsed = JSON.parse(jsonString)
    
    if (!isElementsArray(parsed)) {
      return { success: false, error: '当前内容不是Elements[]类型' }
    }
    
    const markdownString = parserSchemaNodeToMarkdown(parsed)
    const formatted = JSON.stringify(markdownString, null, 2)
    return { success: true, data: formatted }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

