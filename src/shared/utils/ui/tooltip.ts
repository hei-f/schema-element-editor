import type { ElementAttributes } from '@/shared/types'

/**
 * 格式化 tooltip 内容
 * 纯函数：根据元素属性和有效性生成显示文本
 */
export const formatTooltipContent = (attributes: ElementAttributes, isValid: boolean): string => {
  if (!isValid) {
    return '非法目标'
  }
  
  const lines: string[] = []
  attributes.params.forEach((param: string, index: number) => {
    lines.push(`params${index + 1}: ${param}`)
  })
  
  return lines.join('\n')
}

