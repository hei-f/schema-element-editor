import { schemaTransformer } from '../services/schema-transformer'

/**
 * 对内容应用 JSON 格式化（美化）
 * @param content - 要格式化的内容
 * @returns 格式化后的内容，如果解析失败则返回原内容
 */
export function formatContent(content: string): string {
  try {
    const parsed = JSON.parse(content)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return content
  }
}

/**
 * 对内容应用 JSON 字符串去转义
 * @param content - 要去转义的内容
 * @returns 去转义后的内容，如果不是有效的 JSON 字符串则返回原内容
 */
export function unescapeContent(content: string): string {
  try {
    const result = JSON.parse(content)
    if (typeof result === 'string') {
      return result
    }
    return content
  } catch {
    return content
  }
}

/**
 * 对内容应用 JSON 压缩（移除空白符）
 * @param content - 要压缩的内容
 * @returns 压缩后的内容，如果解析失败则返回原内容
 */
export function compactContent(content: string): string {
  try {
    const parsed = JSON.parse(content)
    return JSON.stringify(parsed)
  } catch {
    return content
  }
}

/**
 * 对内容应用嵌套 JSON 解析（反序列化）
 * @param content - 要解析的内容
 * @returns 解析后的内容，如果解析失败则返回原内容
 */
export function parseContent(content: string): string {
  const result = schemaTransformer.parseNestedJson(content)
  if (result.success && result.data) {
    try {
      return JSON.stringify(JSON.parse(result.data), null, 2)
    } catch {
      return result.data
    }
  }
  return content
}
