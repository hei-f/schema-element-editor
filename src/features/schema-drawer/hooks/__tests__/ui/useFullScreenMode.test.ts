import { act, renderHook } from '@testing-library/react'
import { useFullScreenMode } from '../../ui/useFullScreenMode'
import { FULL_SCREEN_MODE } from '@/shared/constants/ui-modes'

describe('useFullScreenMode Hook 测试', () => {
  describe('初始化', () => {
    it('默认初始化为 NONE 模式', () => {
      const { result } = renderHook(() => useFullScreenMode())

      expect(result.current.mode).toBe(FULL_SCREEN_MODE.NONE)
      expect(result.current.isNone).toBe(true)
      expect(result.current.isPreview).toBe(false)
      expect(result.current.isDiff).toBe(false)
    })

    it('支持自定义初始模式', () => {
      const { result } = renderHook(() => useFullScreenMode(FULL_SCREEN_MODE.PREVIEW))

      expect(result.current.mode).toBe(FULL_SCREEN_MODE.PREVIEW)
      expect(result.current.isPreview).toBe(true)
      expect(result.current.isNone).toBe(false)
      expect(result.current.isDiff).toBe(false)
    })

    it('初始化为 DIFF 模式时派生状态正确', () => {
      const { result } = renderHook(() => useFullScreenMode(FULL_SCREEN_MODE.DIFF))

      expect(result.current.mode).toBe(FULL_SCREEN_MODE.DIFF)
      expect(result.current.isDiff).toBe(true)
      expect(result.current.isNone).toBe(false)
      expect(result.current.isPreview).toBe(false)
    })
  })

  describe('setMode 切换模式', () => {
    it('从 NONE 切换到 PREVIEW', () => {
      const { result } = renderHook(() => useFullScreenMode())

      act(() => {
        result.current.setMode(FULL_SCREEN_MODE.PREVIEW)
      })

      expect(result.current.mode).toBe(FULL_SCREEN_MODE.PREVIEW)
      expect(result.current.isPreview).toBe(true)
      expect(result.current.isNone).toBe(false)
    })

    it('从 NONE 切换到 DIFF', () => {
      const { result } = renderHook(() => useFullScreenMode())

      act(() => {
        result.current.setMode(FULL_SCREEN_MODE.DIFF)
      })

      expect(result.current.mode).toBe(FULL_SCREEN_MODE.DIFF)
      expect(result.current.isDiff).toBe(true)
      expect(result.current.isNone).toBe(false)
    })

    it('从 PREVIEW 切换到 DIFF', () => {
      const { result } = renderHook(() => useFullScreenMode(FULL_SCREEN_MODE.PREVIEW))

      act(() => {
        result.current.setMode(FULL_SCREEN_MODE.DIFF)
      })

      expect(result.current.mode).toBe(FULL_SCREEN_MODE.DIFF)
      expect(result.current.isDiff).toBe(true)
      expect(result.current.isPreview).toBe(false)
    })

    it('支持函数式更新', () => {
      const { result } = renderHook(() => useFullScreenMode())

      act(() => {
        result.current.setMode((prevMode) => {
          expect(prevMode).toBe(FULL_SCREEN_MODE.NONE)
          return FULL_SCREEN_MODE.PREVIEW
        })
      })

      expect(result.current.mode).toBe(FULL_SCREEN_MODE.PREVIEW)
    })
  })

  describe('reset 重置模式', () => {
    it('从 PREVIEW 重置到 NONE', () => {
      const { result } = renderHook(() => useFullScreenMode(FULL_SCREEN_MODE.PREVIEW))

      expect(result.current.isPreview).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.mode).toBe(FULL_SCREEN_MODE.NONE)
      expect(result.current.isNone).toBe(true)
      expect(result.current.isPreview).toBe(false)
    })

    it('从 DIFF 重置到 NONE', () => {
      const { result } = renderHook(() => useFullScreenMode(FULL_SCREEN_MODE.DIFF))

      expect(result.current.isDiff).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.mode).toBe(FULL_SCREEN_MODE.NONE)
      expect(result.current.isNone).toBe(true)
      expect(result.current.isDiff).toBe(false)
    })

    it('已经是 NONE 时调用 reset 不变', () => {
      const { result } = renderHook(() => useFullScreenMode())

      expect(result.current.isNone).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.mode).toBe(FULL_SCREEN_MODE.NONE)
      expect(result.current.isNone).toBe(true)
    })

    it('reset 函数引用稳定', () => {
      const { result, rerender } = renderHook(() => useFullScreenMode())

      const resetFn = result.current.reset

      act(() => {
        result.current.setMode(FULL_SCREEN_MODE.PREVIEW)
      })

      rerender()

      expect(result.current.reset).toBe(resetFn)
    })
  })

  describe('派生布尔值', () => {
    it('模式为 NONE 时只有 isNone 为 true', () => {
      const { result } = renderHook(() => useFullScreenMode(FULL_SCREEN_MODE.NONE))

      expect(result.current.isNone).toBe(true)
      expect(result.current.isPreview).toBe(false)
      expect(result.current.isDiff).toBe(false)
    })

    it('模式为 PREVIEW 时只有 isPreview 为 true', () => {
      const { result } = renderHook(() => useFullScreenMode(FULL_SCREEN_MODE.PREVIEW))

      expect(result.current.isNone).toBe(false)
      expect(result.current.isPreview).toBe(true)
      expect(result.current.isDiff).toBe(false)
    })

    it('模式为 DIFF 时只有 isDiff 为 true', () => {
      const { result } = renderHook(() => useFullScreenMode(FULL_SCREEN_MODE.DIFF))

      expect(result.current.isNone).toBe(false)
      expect(result.current.isPreview).toBe(false)
      expect(result.current.isDiff).toBe(true)
    })

    it('切换模式时派生布尔值正确更新', () => {
      const { result } = renderHook(() => useFullScreenMode())

      // NONE -> PREVIEW
      act(() => {
        result.current.setMode(FULL_SCREEN_MODE.PREVIEW)
      })
      expect(result.current.isPreview).toBe(true)
      expect(result.current.isDiff).toBe(false)

      // PREVIEW -> DIFF
      act(() => {
        result.current.setMode(FULL_SCREEN_MODE.DIFF)
      })
      expect(result.current.isPreview).toBe(false)
      expect(result.current.isDiff).toBe(true)

      // DIFF -> NONE
      act(() => {
        result.current.reset()
      })
      expect(result.current.isNone).toBe(true)
      expect(result.current.isDiff).toBe(false)
    })
  })
})
