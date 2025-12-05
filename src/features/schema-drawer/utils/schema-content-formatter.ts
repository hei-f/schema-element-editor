import { parseMarkdownString } from '@/shared/utils/schema/transformers'
import { schemaTransformer } from '../services/schema-transformer'

/**
 * 格式化 Schema 内容的选项
 */
export interface FormatSchemaOptions {
  /** 是否处于录制模式 */
  isRecordingMode: boolean
  /** 是否启用自动解析 */
  autoParseEnabled: boolean
}

/**
 * 格式化 Schema 内容的结果
 */
export interface FormatSchemaResult {
  /** 格式化后的内容 */
  content: string
  /** 原始数据是否为字符串类型 */
  wasStringData: boolean
  /** 警告信息（如果有） */
  warning?: string
}

/**
 * 格式化 Schema 数据为编辑器显示内容
 *
 * 处理三种场景：
 * 1. 自动解析模式下的 Markdown 字符串 → 解析为 Elements 数组
 * 2. 录制模式下的字符串 → 直接显示（保留换行符）
 * 3. 默认场景 → JSON 格式化
 *
 * @param data - 原始 Schema 数据
 * @param options - 格式化选项
 * @returns 格式化结果，包含内容、数据类型标记和可能的警告
 */
export function formatSchemaContent(
  data: unknown,
  options: FormatSchemaOptions
): FormatSchemaResult {
  const { isRecordingMode, autoParseEnabled } = options
  const shouldAutoParse = !isRecordingMode && autoParseEnabled

  // 场景1：自动解析 Markdown 字符串
  if (shouldAutoParse && schemaTransformer.isStringData(data)) {
    const elements = parseMarkdownString(data as string)
    if (elements.length > 0) {
      return {
        content: JSON.stringify(elements, null, 2),
        wasStringData: true,
      }
    }
    // Markdown 解析失败，返回原始字符串并附带警告
    return {
      content: JSON.stringify(data, null, 2),
      wasStringData: false,
      warning: 'Markdown解析失败，显示原始字符串',
    }
  }

  // 场景2：录制模式下的字符串直接显示（保留换行符格式）
  if (isRecordingMode && typeof data === 'string') {
    return {
      content: data,
      wasStringData: true,
    }
  }

  // 场景3：默认 JSON 格式化
  return {
    content: JSON.stringify(data, null, 2),
    wasStringData: false,
  }
}

/**
 * 检查 JSON 字符串是否有语法错误
 *
 * @param jsonString - 要检查的 JSON 字符串
 * @returns 如果有错误返回错误信息，否则返回 null
 */
export function getJsonSyntaxError(jsonString: string): string | null {
  try {
    JSON.parse(jsonString)
    return null
  } catch (error) {
    if (error instanceof SyntaxError) {
      return error.message
    }
    return '未知的 JSON 解析错误'
  }
}

/**
 * 安全地解析 JSON 字符串
 *
 * @param jsonString - 要解析的 JSON 字符串
 * @returns 解析结果，包含成功标志、数据和可能的错误
 */
export function safeJsonParse<T = unknown>(
  jsonString: string
): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = JSON.parse(jsonString) as T
    return { success: true, data }
  } catch (error) {
    const errorMessage = error instanceof SyntaxError ? error.message : '未知的 JSON 解析错误'
    return { success: false, error: errorMessage }
  }
}

/**
 * 比较两个值是否相等（深度比较）
 * 用于检测编辑器内容是否发生变化
 *
 * @param a - 第一个值
 * @param b - 第二个值
 * @returns 是否相等
 */
export function isContentEqual(a: string, b: string): boolean {
  // 先直接比较字符串
  if (a === b) return true

  // 尝试解析为 JSON 后比较（忽略格式差异）
  try {
    const parsedA = JSON.parse(a)
    const parsedB = JSON.parse(b)
    return JSON.stringify(parsedA) === JSON.stringify(parsedB)
  } catch {
    // 如果不是有效 JSON，直接返回字符串比较结果
    return false
  }
}
