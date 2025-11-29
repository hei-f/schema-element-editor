/**
 * parse-json mock
 * 模拟 parse-json 的行为，提供详细的错误信息
 */

// 用于测试的特殊标记
const NO_CODE_FRAME_MARKER = '__NO_CODE_FRAME__'
const ALT_FORMAT_MARKER = '__ALT_FORMAT__'
// 模拟 parseJson 成功但 JSON.parse 失败的场景（用于覆盖 getJsonError 第 127 行）
const PARSE_JSON_SUCCESS_MARKER = '__PARSE_JSON_SUCCESS__'

class JSONParseError extends Error {
  rawCodeFrame?: string

  constructor(message: string, rawCodeFrame?: string) {
    super(message)
    this.name = 'JSONParseError'
    this.rawCodeFrame = rawCodeFrame
  }
}

function parseJson(input: string): unknown {
  // 特殊测试场景：parseJson 成功但 JSON.parse 失败
  // 用于测试 getJsonError 中 parseJson 成功的分支
  if (input.includes(PARSE_JSON_SUCCESS_MARKER)) {
    return { mockSuccess: true }
  }

  try {
    return JSON.parse(input)
  } catch (originalError) {
    // 尝试找到错误位置
    const errorMessage = (originalError as Error).message

    // 从原生错误中提取位置信息
    const positionMatch = errorMessage.match(/position\s+(\d+)/)
    const position = positionMatch ? parseInt(positionMatch[1], 10) : 0

    // 计算行号和列号
    let line = 1
    let column = 1
    for (let i = 0; i < position && i < input.length; i++) {
      if (input[i] === '\n') {
        line++
        column = 1
      } else {
        column++
      }
    }

    // 生成 codeFrame
    const lines = input.split('\n')
    const errorLine = lines[line - 1] || ''
    const codeFrame = `> ${line} | ${errorLine}\n    | ${' '.repeat(column - 1)}^`

    // 特殊测试场景：使用备用错误格式（不包含标准 (line X column Y) 格式）
    if (input.includes(ALT_FORMAT_MARKER)) {
      const altMessage = `Syntax error at line ${line}, column ${column}`
      throw new JSONParseError(altMessage, codeFrame)
    }

    // 特殊测试场景：不提供 codeFrame
    if (input.includes(NO_CODE_FRAME_MARKER)) {
      const detailedMessage = `${errorMessage} (line ${line} column ${column})`
      throw new JSONParseError(detailedMessage, undefined)
    }

    const detailedMessage = `${errorMessage} (line ${line} column ${column})\n\n${codeFrame}`

    throw new JSONParseError(detailedMessage, codeFrame)
  }
}

export default parseJson
