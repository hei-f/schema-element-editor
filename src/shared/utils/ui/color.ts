/**
 * 验证颜色字符串格式是否有效
 * 支持 #RGB 和 #RRGGBB 格式
 */
export const isValidHexColor = (color: string): boolean => {
  if (!color || typeof color !== 'string') {
    return false
  }

  return /^#[0-9A-Fa-f]{6}$/.test(color) || /^#[0-9A-Fa-f]{3}$/.test(color)
}

/**
 * 规范化颜色值
 * 确保返回有效的 hex 颜色字符串，无效时返回默认值
 */
export const normalizeColorValue = (value: unknown, defaultColor: string): string => {
  if (!value || typeof value !== 'string') {
    return defaultColor
  }

  if (isValidHexColor(value)) {
    return value
  }

  return defaultColor
}
