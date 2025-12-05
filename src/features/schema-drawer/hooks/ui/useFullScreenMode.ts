import { useState, useCallback, useRef, useEffect } from 'react'
import type { FullScreenMode } from '@/shared/constants/ui-modes'
import { FULL_SCREEN_MODE } from '@/shared/constants/ui-modes'

/** Drawer 宽度过渡动画时长（毫秒） */
const DRAWER_TRANSITION_DURATION = 300

/**
 * 全屏模式状态管理 Hook
 * 封装模式状态与派生布尔值，提供统一的模式切换接口
 */
export function useFullScreenMode(initialMode: FullScreenMode = FULL_SCREEN_MODE.NONE) {
  const [mode, setMode] = useState<FullScreenMode>(initialMode)
  const [prevMode, setPrevMode] = useState<FullScreenMode>(initialMode)
  /** 预览关闭过渡状态：保持布局结构，隐藏预览内容 */
  const [isClosingPreview, setIsClosingPreview] = useState(false)
  /** 预览打开初始状态：预览区域宽度为 0，用于触发 CSS transition */
  const [isOpeningPreview, setIsOpeningPreview] = useState(false)
  /** 预览打开动画进行中：CSS transition 正在执行 */
  const [isOpeningAnimating, setIsOpeningAnimating] = useState(false)
  const closingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openingAnimatingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 清理定时器
  useEffect(() => {
    return () => {
      if (closingTimerRef.current) {
        clearTimeout(closingTimerRef.current)
      }
      if (openingTimerRef.current) {
        clearTimeout(openingTimerRef.current)
      }
      if (openingAnimatingTimerRef.current) {
        clearTimeout(openingAnimatingTimerRef.current)
      }
    }
  }, [])

  /**
   * 判断是否是全屏模式之间的切换（Diff ↔ Preview）
   * 只有在两个全屏模式之间切换时才需要过渡动画
   */
  const isFullScreenTransition =
    prevMode !== FULL_SCREEN_MODE.NONE && mode !== FULL_SCREEN_MODE.NONE

  const setModeWithTracking = useCallback(
    (newMode: FullScreenMode | ((prev: FullScreenMode) => FullScreenMode)) => {
      setMode((prev) => {
        const nextMode = typeof newMode === 'function' ? newMode(prev) : newMode
        setPrevMode(prev)
        return nextMode
      })
    },
    []
  )

  /**
   * 打开预览模式（带过渡动画）
   * 1. 立即切换到预览模式，设置 isOpeningPreview，预览区域初始宽度为 0
   * 2. 下一帧取消 isOpeningPreview，触发预览区域扩展动画，同时设置 isOpeningAnimating
   * 3. 动画完成后（300ms）清除 isOpeningAnimating，拖动条才显示
   */
  const openPreviewWithTransition = useCallback(() => {
    // 清除之前的定时器
    if (openingTimerRef.current) {
      clearTimeout(openingTimerRef.current)
    }
    if (openingAnimatingTimerRef.current) {
      clearTimeout(openingAnimatingTimerRef.current)
    }

    // 设置打开过渡状态（预览区域初始宽度为 0）
    setIsOpeningPreview(true)
    setIsOpeningAnimating(true)

    // 立即切换到预览模式
    setMode((prev) => {
      setPrevMode(prev)
      return FULL_SCREEN_MODE.PREVIEW
    })

    // 使用 requestAnimationFrame 确保初始状态（宽度为 0）已渲染
    // 然后取消 isOpeningPreview，触发 CSS transition 动画
    requestAnimationFrame(() => {
      openingTimerRef.current = setTimeout(() => {
        setIsOpeningPreview(false)
        openingTimerRef.current = null
      }, 16) // 约一帧的时间，触发动画

      // CSS transition 完成后（300ms），清除动画状态，显示拖动条
      openingAnimatingTimerRef.current = setTimeout(() => {
        setIsOpeningAnimating(false)
        openingAnimatingTimerRef.current = null
      }, DRAWER_TRANSITION_DURATION)
    })
  }, [])

  /**
   * 关闭预览模式（带过渡动画）
   * - 如果目标是 NONE：等待动画完成后再切换
   * - 如果目标是其他模式（如 DIFF）：立即切换模式，预览收缩只是视觉效果
   * @param onBeforeClose 关闭前的回调（用于清理预览容器等）
   * @param targetMode 关闭后要切换到的目标模式，默认为 NONE
   */
  const closePreviewWithTransition = useCallback(
    (onBeforeClose?: () => void, targetMode: FullScreenMode = FULL_SCREEN_MODE.NONE) => {
      // 清除之前的定时器
      if (closingTimerRef.current) {
        clearTimeout(closingTimerRef.current)
      }

      // 立即执行清理回调
      onBeforeClose?.()

      // 如果目标是其他模式（非 NONE），立即切换以获得更流畅的体验
      if (targetMode !== FULL_SCREEN_MODE.NONE) {
        setMode((prev) => {
          setPrevMode(prev)
          return targetMode
        })
        // 不需要过渡动画，直接完成
        return
      }

      // 目标是 NONE 时，使用过渡动画
      setIsClosingPreview(true)

      // 延迟切换模式，等待 Drawer 动画完成
      closingTimerRef.current = setTimeout(() => {
        setMode((prev) => {
          setPrevMode(prev)
          return targetMode
        })
        setIsClosingPreview(false)
        closingTimerRef.current = null
      }, DRAWER_TRANSITION_DURATION)
    },
    []
  )

  const reset = useCallback(() => {
    // 清除过渡定时器
    if (closingTimerRef.current) {
      clearTimeout(closingTimerRef.current)
      closingTimerRef.current = null
    }
    if (openingTimerRef.current) {
      clearTimeout(openingTimerRef.current)
      openingTimerRef.current = null
    }
    if (openingAnimatingTimerRef.current) {
      clearTimeout(openingAnimatingTimerRef.current)
      openingAnimatingTimerRef.current = null
    }
    setIsClosingPreview(false)
    setIsOpeningPreview(false)
    setIsOpeningAnimating(false)
    setMode((prev) => {
      setPrevMode(prev)
      return FULL_SCREEN_MODE.NONE
    })
  }, [])

  return {
    mode,
    setMode: setModeWithTracking,
    reset,
    isPreview: mode === FULL_SCREEN_MODE.PREVIEW,
    isDiff: mode === FULL_SCREEN_MODE.DIFF,
    isNone: mode === FULL_SCREEN_MODE.NONE,
    /** 是否是全屏模式之间的切换（需要过渡动画） */
    isFullScreenTransition,
    /** 预览关闭过渡状态 */
    isClosingPreview,
    /** 预览打开初始状态：预览区域宽度为 0 */
    isOpeningPreview,
    /** 预览打开过渡中：包含初始状态和动画进行中，用于控制拖动条隐藏 */
    isOpeningTransition: isOpeningPreview || isOpeningAnimating,
    /** 关闭预览模式（带过渡动画） */
    closePreviewWithTransition,
    /** 打开预览模式（带过渡动画） */
    openPreviewWithTransition,
  }
}
