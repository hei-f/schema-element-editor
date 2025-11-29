import React, { useRef, useState, useEffect, useCallback } from 'react'
import { ParamsContainerWrapper, ParamsContainer } from '../../styles/toolbar/toolbar.styles'
import { ParamTag } from './ParamTag'

interface ScrollableParamsProps {
  params: string[]
}

/** 遮罩渐变的阈值距离（px） */
const FADE_THRESHOLD = 20

/**
 * 可滚动的参数列表组件
 * 使用哨兵元素 + IntersectionObserver 实现平滑的遮罩透明度变化
 */
export const ScrollableParams: React.FC<ScrollableParamsProps> = ({ params }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const leftSentinelRef = useRef<HTMLDivElement>(null)
  const rightSentinelRef = useRef<HTMLDivElement>(null)

  const [leftMaskOpacity, setLeftMaskOpacity] = useState(0)
  const [rightMaskOpacity, setRightMaskOpacity] = useState(0)

  /** 根据哨兵元素位置计算遮罩透明度 */
  const updateMaskOpacity = useCallback(() => {
    const container = containerRef.current
    const leftSentinel = leftSentinelRef.current
    const rightSentinel = rightSentinelRef.current

    if (!container || !leftSentinel || !rightSentinel) return

    const containerRect = container.getBoundingClientRect()

    // 左侧哨兵：计算其右边缘距离容器左边缘的距离
    const leftRect = leftSentinel.getBoundingClientRect()
    const leftOffset = containerRect.left - leftRect.right
    setLeftMaskOpacity(Math.min(Math.max(leftOffset / FADE_THRESHOLD, 0), 1))

    // 右侧哨兵：计算其左边缘距离容器右边缘的距离
    const rightRect = rightSentinel.getBoundingClientRect()
    const rightOffset = rightRect.left - containerRect.right
    setRightMaskOpacity(Math.min(Math.max(rightOffset / FADE_THRESHOLD, 0), 1))
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const leftSentinel = leftSentinelRef.current
    const rightSentinel = rightSentinelRef.current

    if (!container || !leftSentinel || !rightSentinel) return

    // 初始计算
    updateMaskOpacity()

    // 监听左侧哨兵元素
    const leftObserver = new IntersectionObserver(updateMaskOpacity, {
      root: container,
      threshold: Array.from({ length: 21 }, (_, i) => i / 20),
    })

    // 监听右侧哨兵元素
    const rightObserver = new IntersectionObserver(updateMaskOpacity, {
      root: container,
      threshold: Array.from({ length: 21 }, (_, i) => i / 20),
    })

    leftObserver.observe(leftSentinel)
    rightObserver.observe(rightSentinel)

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(updateMaskOpacity)
    resizeObserver.observe(container)

    return () => {
      leftObserver.disconnect()
      rightObserver.disconnect()
      resizeObserver.disconnect()
    }
  }, [params, updateMaskOpacity])

  if (!params || params.length === 0) {
    return null
  }

  /** 哨兵元素样式：宽度为 0，不占空间 */
  const sentinelStyle: React.CSSProperties = {
    width: 0,
    height: '100%',
    flexShrink: 0,
  }

  return (
    <ParamsContainerWrapper $leftMaskOpacity={leftMaskOpacity} $rightMaskOpacity={rightMaskOpacity}>
      <ParamsContainer ref={containerRef}>
        {/* 左侧哨兵元素 */}
        <div ref={leftSentinelRef} style={sentinelStyle} />
        {params.map((param: string, index: number) => (
          <ParamTag key={index} value={param} index={index} />
        ))}
        {/* 右侧哨兵元素 */}
        <div ref={rightSentinelRef} style={sentinelStyle} />
      </ParamsContainer>
    </ParamsContainerWrapper>
  )
}
