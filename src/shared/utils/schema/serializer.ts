/**
 * JSON处理结果接口
 */
export interface JsonProcessResult {
  success: boolean
  data?: string
  parseCount?: number
  error?: string
}

/**
 * 序列化JSON
 * @description 将内容序列化为 JSON 字符串格式
 * @param data 要序列化的内容（可以是字符串、对象、数组等）
 * @returns 序列化后的 JSON 字符串
 */
export const serializeJson = (data: any): JsonProcessResult => {
  try {
    // 只需要一次 JSON.stringify 即可将内容转为 JSON 格式
    // 例如：多行字符串 "行1\n行2" → JSON字符串 "\"行1\\n行2\""
    const jsonString = JSON.stringify(data, null, 2)
    return {
      success: true,
      data: jsonString,
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

/**
 * 反序列化JSON字符串
 * @description 处理从外部复制的序列化JSON字符串，转换为格式化的JSON对象
 * 支持多种输入格式：
 * 1. 标准JSON格式：[{"key":"value"}]
 * 2. 单层序列化字符串："[{\"key\":\"value\"}]"
 * 3. 多层序列化字符串："\\"[{\\\\\"key\\\\\":\\\\\"value\\\\\"}]\\""
 * 4. 文本形式的转义符：[{\"key\":\"value\"}]（包含真实的反斜杠字符）
 * @param input 待反序列化的JSON字符串
 * @returns 反序列化结果对象
 */
export const deserializeJson = (input: string): JsonProcessResult => {
  const MAX_PARSE_DEPTH = 10
  let parseCount = 0

  try {
    let parsed: any = input.trim()

    // 如果输入为空
    if (!parsed) {
      return {
        success: false,
        error: '输入内容为空',
      }
    }

    // 尝试修复常见的格式问题
    // 处理文本形式的转义符：[{\"key\":\"value\"}] -> [{"key":"value"}]
    const fixedInput = tryFixJsonString(parsed)
    if (fixedInput !== parsed) {
      parsed = fixedInput
      parseCount++ // 记录进行了一次修复
    }

    // 递归解析：如果结果是字符串，继续解析直到得到对象
    while (typeof parsed === 'string' && parseCount < MAX_PARSE_DEPTH) {
      try {
        const nextParsed = JSON.parse(parsed)
        parsed = nextParsed
        parseCount++
      } catch (_error) {
        // 解析失败，说明字符串格式有问题或已经是最终结果
        break
      }
    }

    // 检查是否超过最大解析深度
    if (parseCount >= MAX_PARSE_DEPTH && typeof parsed === 'string') {
      return {
        success: true,
        data: JSON.stringify(parsed, null, 2),
        parseCount,
        error: '已达到最大解析深度，可能存在过度序列化',
      }
    }

    // 如果没有进行任何解析且仍是字符串，说明输入不是有效的 JSON 格式
    if (parseCount === 0 && typeof parsed === 'string') {
      return {
        success: false,
        error: '无法解析为有效的JSON格式，请检查输入内容',
      }
    }

    // 解析成功（包括解析后是字符串、对象、数组等任何类型）
    return {
      success: true,
      data: typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2),
      parseCount: parseCount > 0 ? parseCount : undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: `解析失败: ${(error as Error).message}`,
    }
  }
}

/**
 * 尝试修复常见的JSON格式问题
 * @param input 输入字符串
 * @returns 修复后的字符串
 */
export const tryFixJsonString = (input: string): string => {
  const trimmed = input.trim()

  // 策略1: 尝试直接解析（可能已经是有效JSON）
  try {
    JSON.parse(trimmed)
    return trimmed
  } catch (error) {
    console.debug('JSON 解析失败，尝试修复:', error)
  }

  // 策略2: 移除首尾的额外引号（针对过度序列化）
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const unquoted = trimmed.slice(1, -1)
      // 需要处理转义的引号：\" -> "，转义的反斜杠：\\\\ -> \\
      const unescaped = unquoted.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      JSON.parse(unescaped)
      return unescaped
    } catch (error) {
      console.debug('反转义修复失败，尝试其他策略:', error)
    }
  }

  // 策略3: 处理文本形式的转义符（不在引号包裹内）
  // 例如：[{\"key\":\"value\"}] -> [{"key":"value"}]
  if (trimmed.includes('\\') && !trimmed.startsWith('"')) {
    try {
      const unescaped = trimmed.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      JSON.parse(unescaped)
      return unescaped
    } catch (error) {
      console.debug('所有修复策略失败，返回原始输入:', error)
    }
  }

  return trimmed
}
