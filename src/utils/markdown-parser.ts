import type { Elements } from '@ant-design/md-editor'
import { parserMarkdownToSlateNode, parserSlateNodeToMarkdown } from '@ant-design/md-editor'

/**
 * 解析 Markdown 字符串，返回 Elements[]
 * @param markdownText Markdown 字符串
 * @returns Elements[] 数组，解析失败返回空数组
 */
export function parseMarkdownString(markdownText: string): Elements[] {
  try {
    const result = parserMarkdownToSlateNode(markdownText)
    const schema = result?.schema || []
    return schema
  } catch (error) {
    console.error('解析 Markdown 失败:', error)
    return []
  }
}

/**
 * 将 Elements[] 转换为 Markdown 字符串
 * 是 parseMarkdownString 的逆向操作
 * @param elements Elements[] 数组
 * @returns Markdown 字符串
 */
export function parserSchemaNodeToMarkdown(elements: Elements[]): string {
  try {
    return parserSlateNodeToMarkdown(elements)
  } catch (error) {
    console.error('转换为 Markdown 失败:', error)
    throw error
  }
}

/**
 * 检查数据是否为字符串类型
 * @param data 待检查的数据
 * @returns 是否为字符串
 */
export function isStringData(data: any): data is string {
  return typeof data === 'string'
}

/**
 * 检查数据是否为有效的 Elements[] 结构
 * Elements 必须是包含 children 属性的对象数组
 * @param data 待检查的数据
 * @returns 是否为有效的 Elements[] 数组
 */
export function isElementsArray(data: any): data is Elements[] {
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

