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
 * 转义JSON
 * @description 将 JSON 内容包装成字符串值，添加引号和转义
 * @example {"a":1} → "{\"a\":1}"
 * @param input 要转义的内容
 * @returns 转义后的字符串
 */
export const escapeJson = (input: string): JsonProcessResult => {
  try {
    const trimmed = input.trim()
    if (!trimmed) {
      return {
        success: false,
        error: '输入内容为空',
      }
    }

    // 将整个内容作为字符串值进行 JSON 序列化（会自动添加引号和转义）
    const escaped = JSON.stringify(trimmed)
    return {
      success: true,
      data: escaped,
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

/**
 * 去转义JSON
 * @description 将被包装成字符串值的 JSON 还原，移除外层引号和转义
 * @example "{\"a\":1}" → {"a":1}（格式化显示）
 * @param input 要去转义的内容
 * @returns 去转义后的字符串
 */
export const unescapeJson = (input: string): JsonProcessResult => {
  try {
    const trimmed = input.trim()
    if (!trimmed) {
      return {
        success: false,
        error: '输入内容为空',
      }
    }

    // 检查是否是被引号包裹的字符串
    if (!trimmed.startsWith('"') || !trimmed.endsWith('"')) {
      return {
        success: false,
        error: '输入不是有效的转义字符串（需要以引号开头和结尾）',
      }
    }

    // 使用 JSON.parse 解析字符串值，自动处理转义
    const unescaped = JSON.parse(trimmed)

    // 如果解析结果不是字符串，说明输入格式有问题
    if (typeof unescaped !== 'string') {
      return {
        success: false,
        error: '输入格式错误，解析结果不是字符串',
      }
    }

    // 尝试将解析后的内容作为 JSON 格式化显示
    try {
      const parsed = JSON.parse(unescaped)
      return {
        success: true,
        data: JSON.stringify(parsed, null, 2),
      }
    } catch {
      // 如果不是有效 JSON，直接返回解析后的字符串
      return {
        success: true,
        data: unescaped,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `去转义失败: ${(error as Error).message}`,
    }
  }
}

/**
 * 压缩JSON
 * @description 将格式化的 JSON 压缩成一行，去除空白字符
 * @example { "a": 1 } → {"a":1}
 * @param data 要压缩的内容（可以是字符串、对象、数组等）
 * @returns 压缩后的 JSON 字符串
 */
export const compactJson = (data: any): JsonProcessResult => {
  try {
    // 压缩为紧凑的一行 JSON 格式
    const jsonString = JSON.stringify(data)
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
 * 解析嵌套JSON
 * @description 处理从外部复制的多层嵌套/转义的 JSON 字符串，递归解析并格式化显示
 * 支持多种输入格式：
 * 1. 标准JSON格式：[{"key":"value"}]
 * 2. 单层嵌套字符串："[{\"key\":\"value\"}]"
 * 3. 多层嵌套字符串："\\"[{\\\\\"key\\\\\":\\\\\"value\\\\\"}]\\""
 * 4. 文本形式的转义符：[{\"key\":\"value\"}]（包含真实的反斜杠字符）
 * @param input 待解析的JSON字符串
 * @returns 解析结果对象
 */
export const parseNestedJson = (input: string): JsonProcessResult => {
  const MAX_PARSE_DEPTH = 10
  let parseCount = 0

  try {
    let parsed: any = input.trim()

    if (!parsed) {
      return {
        success: false,
        error: '输入内容为空',
      }
    }

    // 尝试修复常见的格式问题
    const fixedInput = tryFixJsonString(parsed)
    if (fixedInput !== parsed) {
      parsed = fixedInput
      parseCount++
    }

    // 递归解析：如果结果是字符串，继续解析直到得到对象
    while (typeof parsed === 'string' && parseCount < MAX_PARSE_DEPTH) {
      try {
        const nextParsed = JSON.parse(parsed)
        parsed = nextParsed
        parseCount++
      } catch {
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
        error: '已达到最大解析深度，可能存在过度嵌套',
      }
    }

    // 如果没有进行任何解析且仍是字符串，说明输入不是有效的 JSON 格式
    if (parseCount === 0 && typeof parsed === 'string') {
      return {
        success: false,
        error: '无法解析为有效的JSON格式，请检查输入内容',
      }
    }

    // 解析成功
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
  } catch {
    // 继续尝试其他策略
  }

  // 策略2: 移除首尾的额外引号（针对过度嵌套）
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const unquoted = trimmed.slice(1, -1)
      const unescaped = unquoted.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      JSON.parse(unescaped)
      return unescaped
    } catch {
      // 继续尝试其他策略
    }
  }

  // 策略3: 处理文本形式的转义符（不在引号包裹内）
  if (trimmed.includes('\\') && !trimmed.startsWith('"')) {
    try {
      const unescaped = trimmed.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      JSON.parse(unescaped)
      return unescaped
    } catch {
      // 所有策略失败，返回原始输入
    }
  }

  return trimmed
}
