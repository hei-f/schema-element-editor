import type { ElementAttributes } from '@/shared/types'
import { formatTooltipContent } from '@/shared/utils/ui/tooltip'
import React from 'react'
import styled from 'styled-components'

const TooltipContainer = styled.div<{ $isValid: boolean }>`
  position: fixed;
  z-index: 2147483647;
  background: ${(props) =>
    props.$isValid ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 77, 79, 0.9)'};
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
  max-width: 300px;
  word-wrap: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`

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

