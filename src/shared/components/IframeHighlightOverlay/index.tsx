import { PLUGIN_EVENTS } from '@/shared/constants/events'
import type {
  IframeElementHoverPayload,
  IframeElementRect,
  IframeHighlightAllResponsePayload,
} from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  HighlightBox,
  HighlightLabel,
  IframeTooltip,
  RecordingLabel,
  TooltipContent,
} from './styles'

/** 检查 tooltip 内容是否变化 */
function isContentChanged(
  prev: IframeElementHoverPayload | null,
  next: IframeElementHoverPayload
): boolean {
  if (!prev) return true
  if (prev.isValid !== next.isValid) return true
  if (prev.isRecordingMode !== next.isRecordingMode) return true
  if (prev.rect.left !== next.rect.left || prev.rect.top !== next.rect.top) return true
  if (prev.rect.width !== next.rect.width || prev.rect.height !== next.rect.height) return true
  if (prev.attrs.params.length !== next.attrs.params.length) return true
  return prev.attrs.params.some((param, index) => param !== next.attrs.params[index])
}

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

  // 当前悬停元素状态（只在内容变化时更新）
  const [hoverState, setHoverState] = useState<IframeElementHoverPayload | null>(null)
  // tooltip DOM 引用，用于直接更新位置
  const tooltipRef = useRef<HTMLDivElement>(null)
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

  // 计算 tooltip 位置字符串
  const calcTooltipTransform = useCallback((mousePos: { x: number; y: number }) => {
    const offset = 15
    let x = mousePos.x + offset
    let y = mousePos.y + offset

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const tooltipWidth = 300
    const tooltipHeight = 100

    if (x + tooltipWidth > viewportWidth) {
      x = mousePos.x - tooltipWidth - offset
    }
    if (y + tooltipHeight > viewportHeight) {
      y = mousePos.y - tooltipHeight - offset
    }

    return `translate(${x}px, ${y}px)`
  }, [])

  // 监听 iframe 元素悬停事件
  useEffect(() => {
    const handleHover = (event: Event) => {
      const customEvent = event as CustomEvent<IframeElementHoverPayload>
      const payload = customEvent.detail

      // 检查内容是否变化
      if (isContentChanged(hoverState, payload)) {
        // 内容变化，更新 state 触发重新渲染
        setHoverState(payload)
      } else if (tooltipRef.current) {
        // 内容相同，只更新位置（直接操作 DOM，不触发重新渲染）
        tooltipRef.current.style.transform = calcTooltipTransform(payload.mousePosition)
      }
    }

    const handleClearHighlight = () => {
      setHoverState(null)
    }

    window.addEventListener(PLUGIN_EVENTS.IFRAME_ELEMENT_HOVER, handleHover)
    window.addEventListener(PLUGIN_EVENTS.IFRAME_CLEAR_HIGHLIGHT, handleClearHighlight)

    return () => {
      window.removeEventListener(PLUGIN_EVENTS.IFRAME_ELEMENT_HOVER, handleHover)
      window.removeEventListener(PLUGIN_EVENTS.IFRAME_CLEAR_HIGHLIGHT, handleClearHighlight)
    }
  }, [hoverState, calcTooltipTransform])

  // 监听 iframe 高亮所有元素响应
  useEffect(() => {
    const handleHighlightAllResponse = (event: Event) => {
      const customEvent = event as CustomEvent<IframeHighlightAllResponsePayload>
      setHighlightAllElements((prev) => [...prev, ...customEvent.detail.elements])
    }

    const handleClearAll = () => {
      setHighlightAllElements([])
    }

    window.addEventListener(PLUGIN_EVENTS.IFRAME_HIGHLIGHT_ALL_RESPONSE, handleHighlightAllResponse)
    // 当 Alt 键释放时，主页面会派发清除事件
    window.addEventListener(PLUGIN_EVENTS.CLEAR_HIGHLIGHT, handleClearAll)

    return () => {
      window.removeEventListener(
        PLUGIN_EVENTS.IFRAME_HIGHLIGHT_ALL_RESPONSE,
        handleHighlightAllResponse
      )
      window.removeEventListener(PLUGIN_EVENTS.CLEAR_HIGHLIGHT, handleClearAll)
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

  // 当前使用的高亮颜色
  const currentColor = hoverState?.isRecordingMode ? recordingModeColor : highlightColor

  // 判断是否有有效的高亮框（rect 不为空）
  const hasValidRect = hoverState && (hoverState.rect.width > 0 || hoverState.rect.height > 0)

  return (
    <>
      {/* 单元素悬停高亮框 - 只有 rect 有效时才显示 */}
      {hasValidRect && (
        <HighlightBox
          $color={currentColor}
          $isRecording={hoverState.isRecordingMode}
          style={getHighlightBoxStyle(hoverState.rect)}
        />
      )}

      {/* Tooltip - 始终显示（包括"非法目标"） */}
      {hoverState && (
        <IframeTooltip
          ref={tooltipRef}
          $isValid={hoverState.isValid}
          style={{ transform: calcTooltipTransform(hoverState.mousePosition) }}
        >
          {hoverState.isRecordingMode && <RecordingLabel>🔴 录制模式</RecordingLabel>}
          <TooltipContent>
            {hoverState.isValid
              ? hoverState.attrs.params.map((param, index) => (
                  <div key={index}>
                    params{index + 1}: {param}
                  </div>
                ))
              : '非法目标'}
          </TooltipContent>
        </IframeTooltip>
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
