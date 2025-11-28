/**
 * 表单路径工具函数
 * 用于处理嵌套表单字段的路径操作
 */

/**
 * 将路径数组转换为点分隔字符串
 * @example pathToString(['searchConfig', 'searchDepthDown']) => 'searchConfig.searchDepthDown'
 */
export function pathToString(path: string[]): string {
  return path.join('.')
}

/**
 * 深度比较两个路径数组是否相等
 * @example pathEqual(['a', 'b'], ['a', 'b']) => true
 */
export function pathEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

/**
 * 从嵌套的 changedValues 对象中提取变更字段的完整路径
 * @example
 * getChangedFieldPath({ searchConfig: { searchDepthDown: 5 } })
 * => ['searchConfig', 'searchDepthDown']
 */
export function getChangedFieldPath(changedValues: any, prefix: string[] = []): string[] {
  const keys = Object.keys(changedValues)
  if (keys.length === 0) return prefix

  const key = keys[0]
  const value = changedValues[key]

  // 如果值是普通对象（非数组、非null），继续递归
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  ) {
    return getChangedFieldPath(value, [...prefix, key])
  }

  // 否则返回当前路径
  return [...prefix, key]
}

/**
 * 根据路径数组从对象中获取嵌套值
 * @example getValueByPath({ a: { b: 1 } }, ['a', 'b']) => 1
 */
export function getValueByPath(obj: any, path: string[]): any {
  if (!obj || path.length === 0) return undefined

  let current = obj
  for (const key of path) {
    if (current === null || current === undefined) return undefined
    current = current[key]
  }

  return current
}

/**
 * 根据路径数组设置对象的嵌套值
 * @example setValueByPath({}, ['a', 'b'], 1) => { a: { b: 1 } }
 */
export function setValueByPath(obj: any, path: string[], value: any): void {
  if (!obj || path.length === 0) return

  let current = obj
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[path[path.length - 1]] = value
}
