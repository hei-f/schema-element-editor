/**
 * jsonrepair mock
 * 模拟 jsonrepair 的基本修复功能
 */

// 用于测试的特殊标记，当输入包含此标记时抛出错误
const FORCE_FAIL_MARKER = '__FORCE_REPAIR_FAIL__'

export function jsonrepair(input: string): string {
  // 特殊测试场景：强制失败
  if (input.includes(FORCE_FAIL_MARKER)) {
    throw new Error('无法修复此 JSON')
  }

  let result = input

  // 修复单引号为双引号
  result = result.replace(/'/g, '"')

  // 修复缺少引号的键名: {name: "value"} -> {"name": "value"}
  result = result.replace(/([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')

  // 修复尾随逗号: [1, 2, 3,] -> [1, 2, 3]
  result = result.replace(/,\s*([}\]])/g, '$1')

  // 修复缺少冒号: {"key" "value"} -> {"key": "value"}
  result = result.replace(/"([^"]+)"\s+"([^"]+)"/g, '"$1": "$2"')

  // 修复不完整的数组: [1, 2, 3 -> [1, 2, 3]
  if (result.includes('[') && !result.includes(']')) {
    result = result + ']'
  }

  // 修复不完整的对象: {"key": "value" -> {"key": "value"}
  const openBraces = (result.match(/\{/g) || []).length
  const closeBraces = (result.match(/\}/g) || []).length
  if (openBraces > closeBraces) {
    result = result + '}'.repeat(openBraces - closeBraces)
  }

  // 验证修复后的结果
  try {
    JSON.parse(result)
    return result
  } catch {
    // 如果仍然无效，尝试更激进的修复
    // 对于简单情况，直接返回修复后的结果
    return result
  }
}
