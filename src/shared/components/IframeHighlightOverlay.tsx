import type {
  IframeElementHoverPayload,
  IframeElementRect,
  IframeHighlightAllResponsePayload,
} from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

/** 高亮框样式 */
const HighlightBox = styled.div<{ $color: string; $isRecording: boolean }>`
  position: fixed;
  pointer-events: none;
  z-index: 999998;
  box-sizing: border-box;
  border: 2px solid ${(props) => props.$color};
  box-shadow: 0 0 10px ${(props) => props.$color}80;
`

/** Tooltip 样式 */
const Tooltip = styled.div<{ $isValid: boolean }>`
  position: fixed;
  z-index: 2147483647;
  background: ${(props) => (props.$isValid ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 77, 79, 0.9)')};
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

/** 录制模式标签 */
const RecordingLabel = styled.div`
  background: #ff4d4f;
  color: white;
  padding: 4px 8px;
  margin: -8px -12px 8px -12px;
  border-radius: 6px 6px 0 0;
  font-weight: 600;
  font-size: 13px;
  text-align: center;
`

/** 高亮所有元素时的标签 */
const HighlightLabel = styled.div`
  position: absolute;
  top: -26px;
  left: 0;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 6px;
  white-space: nowrap;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`

interface IframeHighlightOverlayProps {
  /** 录制模式高亮颜色 */
  recordingModeColor?: string
}

/**
 * iframe 高亮覆盖层组件
 * 用于在 top frame 渲染来自 iframe 的元素高亮框
 */
export const IframeHighlightOverlay: React.FC<IframeHighlightOverlayProps> = (props) => {
  const { recordingModeColor = '#FF4D4F' } = props

  // 当前悬停元素状态
  const [hoverState, setHoverState] = useState<IframeElementHoverPayload | null>(null)
  // 高亮颜色
  const [highlightColor, setHighlightColor] = useState('#39C5BB')
  // 高亮所有元素列表
  const [highlightAllElements, setHighlightAllElements] = useState<
    IframeHighlightAllResponsePayload['elements']
  >([])

  // 加载高亮颜色
  useEffect(() => {
    storage.getHighlightColor().then(setHighlightColor)
  }, [])

  // 监听 iframe 元素悬停事件
  useEffect(() => {
    const handleHover = (event: Event) => {
      const customEvent = event as CustomEvent<IframeElementHoverPayload>
      setHoverState(customEvent.detail)
    }

    const handleClearHighlight = () => {
      setHoverState(null)
    }

    window.addEventListener('schema-editor:iframe-element-hover', handleHover)
    window.addEventListener('schema-editor:iframe-clear-highlight', handleClearHighlight)

    return () => {
      window.removeEventListener('schema-editor:iframe-element-hover', handleHover)
      window.removeEventListener('schema-editor:iframe-clear-highlight', handleClearHighlight)
    }
  }, [])

  // 监听 iframe 高亮所有元素响应
  useEffect(() => {
    const handleHighlightAllResponse = (event: Event) => {
      const customEvent = event as CustomEvent<IframeHighlightAllResponsePayload>
      setHighlightAllElements((prev) => [...prev, ...customEvent.detail.elements])
    }

    const handleClearAll = () => {
      setHighlightAllElements([])
    }

    window.addEventListener(
      'schema-editor:iframe-highlight-all-response',
      handleHighlightAllResponse
    )
    // 当 Alt 键释放时，主页面会派发清除事件
    window.addEventListener('schema-editor:clear-highlight', handleClearAll)

    return () => {
      window.removeEventListener(
        'schema-editor:iframe-highlight-all-response',
        handleHighlightAllResponse
      )
      window.removeEventListener('schema-editor:clear-highlight', handleClearAll)
    }
  }, [])

  // 计算高亮框样式
  const getHighlightBoxStyle = useCallback((rect: IframeElementRect) => {
    const offset = 4 // outlineOffset + border
    return {
      left: rect.left - offset,
      top: rect.top - offset,
      width: rect.width + offset * 2,
      height: rect.height + offset * 2,
    }
  }, [])

  // 计算 tooltip 位置
  const getTooltipStyle = useCallback((mousePos: { x: number; y: number }) => {
    const offset = 15
    let left = mousePos.x + offset
    let top = mousePos.y + offset

    // 确保不超出视口
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const tooltipWidth = 300 // 估算最大宽度
    const tooltipHeight = 100 // 估算高度

    if (left + tooltipWidth > viewportWidth) {
      left = mousePos.x - tooltipWidth - offset
    }
    if (top + tooltipHeight > viewportHeight) {
      top = mousePos.y - tooltipHeight - offset
    }

    return { left, top }
  }, [])

  // 当前使用的高亮颜色
  const currentColor = hoverState?.isRecordingMode ? recordingModeColor : highlightColor

  return (
    <>
      {/* 单元素悬停高亮框 */}
      {hoverState && (
        <>
          <HighlightBox
            $color={currentColor}
            $isRecording={hoverState.isRecordingMode}
            style={getHighlightBoxStyle(hoverState.rect)}
          />
          <Tooltip $isValid={hoverState.isValid} style={getTooltipStyle(hoverState.mousePosition)}>
            {hoverState.isRecordingMode && <RecordingLabel>🔴 录制模式</RecordingLabel>}
            {hoverState.isValid
              ? hoverState.attrs.params.map((param, index) => (
                  <div key={index}>
                    params{index + 1}: {param}
                  </div>
                ))
              : '非法目标'}
          </Tooltip>
        </>
      )}

      {/* 高亮所有元素 */}
      {highlightAllElements.map((element, index) => (
        <HighlightBox
          key={`iframe-highlight-${index}`}
          $color={highlightColor}
          $isRecording={false}
          style={getHighlightBoxStyle(element.rect)}
        >
          <HighlightLabel>
            {element.params.map((param, i) => `params${i + 1}: ${param}`).join(', ')}
          </HighlightLabel>
        </HighlightBox>
      ))}
    </>
  )
}
