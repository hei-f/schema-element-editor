import { useState, useCallback } from 'react'
import type { FullScreenMode } from '@/shared/constants/ui-modes'
import { FULL_SCREEN_MODE } from '@/shared/constants/ui-modes'

/**
 * 全屏模式状态管理 Hook
 * 封装模式状态与派生布尔值，提供统一的模式切换接口
 */
export function useFullScreenMode(initialMode: FullScreenMode = FULL_SCREEN_MODE.NONE) {
  const [mode, setMode] = useState<FullScreenMode>(initialMode)

  const reset = useCallback(() => setMode(FULL_SCREEN_MODE.NONE), [])

  return {
    mode,
    setMode,
    reset,
    isPreview: mode === FULL_SCREEN_MODE.PREVIEW,
    isDiff: mode === FULL_SCREEN_MODE.DIFF,
    isNone: mode === FULL_SCREEN_MODE.NONE,
  }
}
