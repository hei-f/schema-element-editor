import styled from 'styled-components'

/** 高亮框样式 */
export const HighlightBox = styled.div<{ $color: string; $isRecording: boolean }>`
  position: fixed;
  pointer-events: none;
  z-index: 999998;
  box-sizing: border-box;
  border: 2px solid ${(props) => props.$color};
  border-radius: 12px;
`

/** Tooltip 容器 - 只负责定位，不设置 padding */
export const IframeTooltip = styled.div<{ $isValid: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  background: ${(props) => (props.$isValid ? '#E1ECFB' : 'rgba(255, 77, 79, 0.9)')};
  color: ${(props) => (props.$isValid ? '#3D3D3D' : 'white')};
  border-radius: 8px;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
  max-width: 300px;
  overflow: hidden;
`

/** 录制模式标签 */
export const RecordingLabel = styled.div`
  background: #ff4d4f;
  color: white;
  padding: 4px 8px;
  font-weight: 600;
  font-size: 13px;
  text-align: center;
`

/** Tooltip 内容区域 */
export const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 8px;
  word-wrap: break-word;
`

/** 高亮所有元素时的标签 */
export const HighlightLabel = styled.div`
  position: absolute;
  top: -26px;
  left: 0;
  padding: 4px 8px;
  background: #e1ecfb;
  color: #3d3d3d;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 8px;
  white-space: nowrap;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
`
