import { useCallback, useEffect, useRef, useState } from 'react'
import { previewContainerManager } from '@/core/content/core/preview-container'
import { useLatest } from '@/shared/hooks/useLatest'

/** 预览区域宽度限制（百分比） */
export const PREVIEW_WIDTH_LIMITS = {
  MIN: 20,
  MAX: 80,
} as const

interface UseResizerOptions {
  /** 最小宽度百分比 */
  minWidth?: number
  /** 最大宽度百分比 */
  maxWidth?: number
  /** 初始宽度百分比（必需） */
  initialWidth: number
  /** 拖拽结束回调 */
  onResizeEnd?: (width: number) => void
}

interface UseResizerReturn {
  /** 当前宽度百分比 */
  width: number
  /** 设置宽度 */
  setWidth: (width: number) => void
  /** 是否正在拖拽 */
  isDragging: boolean
  /** 容器 ref（React 19: RefObject 类型包含 null） */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** 开始拖拽处理函数 */
  handleResizeStart: (e: React.MouseEvent) => void
}

/**
 * 可拖拽分隔条 Hook
 * 封装拖拽逻辑，通过回调驱动而非 useEffect 监听状态
 */
export const useResizer = (options: UseResizerOptions): UseResizerReturn => {
  const {
    minWidth = PREVIEW_WIDTH_LIMITS.MIN,
    maxWidth = PREVIEW_WIDTH_LIMITS.MAX,
    initialWidth,
    onResizeEnd,
  } = options

  const [width, setWidth] = useState(initialWidth)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 使用 useLatest 存储最新的值，避免闭包问题
  const widthRef = useLatest(width)
  const onResizeEndRef = useLatest(onResizeEnd)

  /**
   * 开始拖拽
   */
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    // 拖拽开始时隐藏预览容器，避免遮挡
    previewContainerManager.hide()
  }, [])

  /**
   * 拖拽过程中的鼠标移动处理（事件监听器）
   * 注意：这里使用 useEffect 是必要的，用于绑定/解绑全局鼠标事件
   */
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const mouseX = e.clientX - containerRect.left

      // 计算新的预览宽度百分比
      let newWidth = (mouseX / containerWidth) * 100

      // 限制在 minWidth - maxWidth 之间
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))

      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      // 使用 ref 获取最新的 width 值
      const finalWidth = widthRef.current
      const roundedWidth = Math.round(finalWidth)

      // 先同步更新宽度为取整后的值
      setWidth(roundedWidth)

      // 使用 setTimeout 等待 React 完成渲染后再触发回调和禁用拖拽状态
      setTimeout(() => {
        // 先触发回调，让外部状态更新为取整后的值
        onResizeEndRef.current?.(roundedWidth)

        // 再延迟一帧设置 isDragging=false，确保外部状态更新完成后再启用 transition
        requestAnimationFrame(() => {
          setIsDragging(false)
        })
      }, 50)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, minWidth, maxWidth])

  return {
    width,
    setWidth,
    isDragging,
    containerRef,
    handleResizeStart,
  }
}
