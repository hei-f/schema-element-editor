import { act, renderHook } from '@testing-library/react'
import { useDeferredEffect } from '../useDeferredEffect'

describe('useDeferredEffect Hook 测试', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('基本功能', () => {
    it('应该在默认延迟（0ms）后执行 effect', () => {
      const effect = vi.fn()

      renderHook(() => useDeferredEffect(effect, []))

      // 立即检查，effect 不应该被调用
      expect(effect).not.toHaveBeenCalled()

      // 推进定时器
      act(() => {
        vi.advanceTimersByTime(0)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('应该在指定延迟后执行 effect', () => {
      const effect = vi.fn()
      const delay = 500

      renderHook(() => useDeferredEffect(effect, [], { delay }))

      // 延迟前不应该执行
      act(() => {
        vi.advanceTimersByTime(delay - 1)
      })
      expect(effect).not.toHaveBeenCalled()

      // 延迟后应该执行
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('当 enabled 为 false 时不应该执行 effect', () => {
      const effect = vi.fn()

      renderHook(() => useDeferredEffect(effect, [], { enabled: false }))

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(effect).not.toHaveBeenCalled()
    })

    it('当 enabled 从 false 变为 true 时应该执行 effect', () => {
      const effect = vi.fn()

      const { rerender } = renderHook(
        (props: { enabled: boolean }) => useDeferredEffect(effect, [], { enabled: props.enabled }),
        { initialProps: { enabled: false } }
      )

      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(effect).not.toHaveBeenCalled()

      rerender({ enabled: true })

      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(effect).toHaveBeenCalledTimes(1)
    })
  })

  describe('依赖变化', () => {
    it('当依赖变化时应该重新执行 effect', () => {
      const effect = vi.fn()

      const { rerender } = renderHook(
        (props: { dep: number }) => useDeferredEffect(effect, [props.dep]),
        { initialProps: { dep: 1 } }
      )

      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(effect).toHaveBeenCalledTimes(1)

      // 改变依赖
      rerender({ dep: 2 })

      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(effect).toHaveBeenCalledTimes(2)
    })

    it('当依赖不变时不应该重新执行 effect', () => {
      const effect = vi.fn()

      const { rerender } = renderHook(
        (props: { dep: number }) => useDeferredEffect(effect, [props.dep]),
        { initialProps: { dep: 1 } }
      )

      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(effect).toHaveBeenCalledTimes(1)

      // 依赖不变
      rerender({ dep: 1 })

      act(() => {
        vi.advanceTimersByTime(0)
      })
      // 不应该额外调用
      expect(effect).toHaveBeenCalledTimes(1)
    })
  })

  describe('清理逻辑', () => {
    it('组件卸载时应该清理定时器', () => {
      const effect = vi.fn()
      const delay = 1000

      const { unmount } = renderHook(() => useDeferredEffect(effect, [], { delay }))

      // 卸载组件
      unmount()

      // 推进时间
      act(() => {
        vi.advanceTimersByTime(delay + 100)
      })

      // effect 不应该被调用
      expect(effect).not.toHaveBeenCalled()
    })

    it('依赖变化时应该清理之前的定时器', () => {
      const effect = vi.fn()
      const delay = 1000

      const { rerender } = renderHook(
        (props: { dep: number }) => useDeferredEffect(effect, [props.dep], { delay }),
        { initialProps: { dep: 1 } }
      )

      // 推进一半时间
      act(() => {
        vi.advanceTimersByTime(delay / 2)
      })
      expect(effect).not.toHaveBeenCalled()

      // 改变依赖（应该重置定时器）
      rerender({ dep: 2 })

      // 再推进一半时间（从第一次开始算应该够了，但新定时器还没到）
      act(() => {
        vi.advanceTimersByTime(delay / 2)
      })
      expect(effect).not.toHaveBeenCalled()

      // 再推进一半时间（新定时器到期）
      act(() => {
        vi.advanceTimersByTime(delay / 2)
      })
      expect(effect).toHaveBeenCalledTimes(1)
    })
  })

  describe('effect 函数更新', () => {
    it('应该始终执行最新的 effect 函数', () => {
      const effect1 = vi.fn()
      const effect2 = vi.fn()
      const delay = 500

      const { rerender } = renderHook(
        (props: { effect: () => void }) => useDeferredEffect(props.effect, [], { delay }),
        { initialProps: { effect: effect1 } }
      )

      // 推进一半时间
      act(() => {
        vi.advanceTimersByTime(delay / 2)
      })

      // 更新 effect 函数（但依赖没变，不会重置定时器）
      rerender({ effect: effect2 })

      // 推进剩余时间
      act(() => {
        vi.advanceTimersByTime(delay / 2)
      })

      // 应该执行新的 effect（由于 useLayoutEffect 更新了 ref）
      expect(effect1).not.toHaveBeenCalled()
      expect(effect2).toHaveBeenCalledTimes(1)
    })
  })

  describe('delay 变化', () => {
    it('当 delay 变化时应该重新启动定时器', () => {
      const effect = vi.fn()

      const { rerender } = renderHook(
        (props: { delay: number }) => useDeferredEffect(effect, [], { delay: props.delay }),
        { initialProps: { delay: 1000 } }
      )

      // 推进一半时间
      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(effect).not.toHaveBeenCalled()

      // 改变 delay 为 200ms
      rerender({ delay: 200 })

      // 推进新的 delay 时间
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(effect).toHaveBeenCalledTimes(1)
    })
  })

  describe('多依赖场景', () => {
    it('应该正确处理多个依赖', () => {
      const effect = vi.fn()

      const { rerender } = renderHook(
        (props: { a: number; b: string }) => useDeferredEffect(effect, [props.a, props.b]),
        { initialProps: { a: 1, b: 'hello' } }
      )

      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(effect).toHaveBeenCalledTimes(1)

      // 只改变 a
      rerender({ a: 2, b: 'hello' })
      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(effect).toHaveBeenCalledTimes(2)

      // 只改变 b
      rerender({ a: 2, b: 'world' })
      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(effect).toHaveBeenCalledTimes(3)
    })
  })

  describe('边界情况', () => {
    it('应该处理 delay 为 0 的情况', () => {
      const effect = vi.fn()

      renderHook(() => useDeferredEffect(effect, [], { delay: 0 }))

      act(() => {
        vi.advanceTimersByTime(0)
      })

      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('应该处理空依赖数组', () => {
      const effect = vi.fn()

      const { rerender } = renderHook(() => useDeferredEffect(effect, []))

      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(effect).toHaveBeenCalledTimes(1)

      // 重新渲染不应该触发额外调用
      rerender()
      act(() => {
        vi.advanceTimersByTime(0)
      })
      expect(effect).toHaveBeenCalledTimes(1)
    })

    it('effect 抛出错误时不应该影响清理', () => {
      const effect = vi.fn().mockImplementation(() => {
        throw new Error('测试错误')
      })

      const { unmount } = renderHook(() => useDeferredEffect(effect, []))

      // 不应该阻止正常的渲染流程
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(0)
        })
      }).toThrow('测试错误')

      // 卸载不应该抛出错误
      expect(() => unmount()).not.toThrow()
    })
  })
})
