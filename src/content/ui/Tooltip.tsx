import type { ElementAttributes } from '@/types'
import { formatTooltipContent } from '@/utils/ui/tooltip'
import React from 'react'
import { TooltipContainer } from './styles'

interface TooltipProps {
  visible: boolean
  position: { x: number; y: number }
  attributes: ElementAttributes
  isValid: boolean
}

/**
 * Tooltip组件
 * 注意：当前实现中使用原生DOM创建tooltip（在monitor.ts中）
 * 这个组件作为备用方案保留
 */
export const Tooltip: React.FC<TooltipProps> = ({ 
  visible, 
  position, 
  attributes, 
  isValid 
}: TooltipProps) => {
  if (!visible) return null

  return (
    <TooltipContainer
      $isValid={isValid}
      style={{
        left: `${position.x + 15}px`,
        top: `${position.y + 15}px`
      }}
    >
      {formatTooltipContent(attributes, isValid)}
    </TooltipContainer>
  )
}

