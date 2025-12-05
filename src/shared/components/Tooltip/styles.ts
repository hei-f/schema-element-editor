import styled from 'styled-components'

/**
 * Tooltip 容器
 */
export const TooltipContainer = styled.div<{ $isValid: boolean }>`
  position: fixed;
  z-index: 2147483647;
  background: ${(props) => (props.$isValid ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 77, 79, 0.9)')};
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
