import { useState, useCallback } from 'react'
import type { FullScreenMode } from '@/shared/constants/ui-modes'
import { FULL_SCREEN_MODE } from '@/shared/constants/ui-modes'

/**
 * 全屏模式状态管理 Hook
 * 封装模式状态与派生布尔值，提供统一的模式切换接口
 */
export function useFullScreenMode(initialMode: FullScreenMode = FULL_SCREEN_MODE.NONE) {
  const [mode, setMode] = useState<FullScreenMode>(initialMode)
  const [prevMode, setPrevMode] = useState<FullScreenMode>(initialMode)

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

  const reset = useCallback(() => {
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
  }
}
