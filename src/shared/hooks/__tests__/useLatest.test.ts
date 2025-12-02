import { renderHook } from '@testing-library/react'
import { useLatest } from '../useLatest'

describe('useLatest Hook 测试', () => {
  describe('基本功能', () => {
    it('应该返回包含初始值的 ref', () => {
      const { result } = renderHook(() => useLatest('initial'))

      expect(result.current.current).toBe('initial')
    })

    it('应该在值变化时更新 ref.current', () => {
      const { result, rerender } = renderHook(
        (props: { value: string }) => useLatest(props.value),
        {
          initialProps: { value: 'first' },
        }
      )

      expect(result.current.current).toBe('first')

      rerender({ value: 'second' })

      expect(result.current.current).toBe('second')
    })

    it('返回的 ref 对象应该保持稳定', () => {
      const { result, rerender } = renderHook(
        (props: { value: number }) => useLatest(props.value),
        {
          initialProps: { value: 1 },
        }
      )

      const firstRef = result.current

      rerender({ value: 2 })

      const secondRef = result.current

      // ref 对象应该是同一个引用
      expect(firstRef).toBe(secondRef)
      expect(secondRef.current).toBe(2)
    })
  })

  describe('不同数据类型', () => {
    it('应该正确处理数字类型', () => {
      const { result, rerender } = renderHook(
        (props: { value: number }) => useLatest(props.value),
        {
          initialProps: { value: 42 },
        }
      )

      expect(result.current.current).toBe(42)

      rerender({ value: 100 })
      expect(result.current.current).toBe(100)
    })

    it('应该正确处理布尔类型', () => {
      const { result, rerender } = renderHook(
        (props: { value: boolean }) => useLatest(props.value),
        {
          initialProps: { value: true },
        }
      )

      expect(result.current.current).toBe(true)

      rerender({ value: false })
      expect(result.current.current).toBe(false)
    })

    it('应该正确处理对象类型', () => {
      const obj1 = { name: 'Alice', age: 30 }
      const obj2 = { name: 'Bob', age: 25 }

      const { result, rerender } = renderHook(
        (props: { value: typeof obj1 }) => useLatest(props.value),
        {
          initialProps: { value: obj1 },
        }
      )

      expect(result.current.current).toBe(obj1)
      expect(result.current.current.name).toBe('Alice')

      rerender({ value: obj2 })
      expect(result.current.current).toBe(obj2)
      expect(result.current.current.name).toBe('Bob')
    })

    it('应该正确处理数组类型', () => {
      const arr1 = [1, 2, 3]
      const arr2 = [4, 5, 6]

      const { result, rerender } = renderHook(
        (props: { value: number[] }) => useLatest(props.value),
        {
          initialProps: { value: arr1 },
        }
      )

      expect(result.current.current).toBe(arr1)

      rerender({ value: arr2 })
      expect(result.current.current).toBe(arr2)
    })

    it('应该正确处理函数类型', () => {
      const fn1 = () => 'first'
      const fn2 = () => 'second'

      const { result, rerender } = renderHook(
        (props: { value: () => string }) => useLatest(props.value),
        {
          initialProps: { value: fn1 },
        }
      )

      expect(result.current.current).toBe(fn1)
      expect(result.current.current()).toBe('first')

      rerender({ value: fn2 })
      expect(result.current.current).toBe(fn2)
      expect(result.current.current()).toBe('second')
    })

    it('应该正确处理 null 和 undefined', () => {
      const { result, rerender } = renderHook(
        (props: { value: string | null | undefined }) => useLatest(props.value),
        {
          initialProps: { value: 'initial' as string | null | undefined },
        }
      )

      expect(result.current.current).toBe('initial')

      rerender({ value: null })
      expect(result.current.current).toBeNull()

      rerender({ value: undefined })
      expect(result.current.current).toBeUndefined()

      rerender({ value: 'back' })
      expect(result.current.current).toBe('back')
    })
  })

  describe('闭包场景', () => {
    it('应该在闭包中提供最新值', () => {
      const { result, rerender } = renderHook(
        (props: { value: number }) => {
          const latestRef = useLatest(props.value)
          // 模拟在闭包中使用
          const getLatestValue = () => latestRef.current
          return { latestRef, getLatestValue }
        },
        { initialProps: { value: 1 } }
      )

      expect(result.current.getLatestValue()).toBe(1)

      rerender({ value: 5 })

      // 即使是之前创建的 getLatestValue 函数，也能获取最新值
      expect(result.current.getLatestValue()).toBe(5)
    })

    it('在异步回调中应该能获取最新值', async () => {
      const { result, rerender } = renderHook(
        (props: { value: number }) => {
          const latestRef = useLatest(props.value)
          return () => latestRef.current
        },
        { initialProps: { value: 10 } }
      )

      // 捕获当前的获取函数
      const capturedGetValue = result.current

      expect(capturedGetValue()).toBe(10)

      // 更新值
      rerender({ value: 20 })

      // 使用之前捕获的函数应该得到新值
      expect(capturedGetValue()).toBe(20)
    })
  })

  describe('性能相关', () => {
    it('多次重渲染应该始终保持最新值', () => {
      const { result, rerender } = renderHook(
        (props: { value: number }) => useLatest(props.value),
        {
          initialProps: { value: 0 },
        }
      )

      for (let i = 1; i <= 100; i++) {
        rerender({ value: i })
        expect(result.current.current).toBe(i)
      }
    })

    it('相同值的重渲染也应该正常工作', () => {
      const { result, rerender } = renderHook(
        (props: { value: number }) => useLatest(props.value),
        {
          initialProps: { value: 42 },
        }
      )

      expect(result.current.current).toBe(42)

      // 使用相同值重渲染
      rerender({ value: 42 })
      expect(result.current.current).toBe(42)

      rerender({ value: 42 })
      expect(result.current.current).toBe(42)
    })
  })

  describe('与其他 hook 组合使用', () => {
    it('应该能在 useCallback 中正确使用', () => {
      const { result, rerender } = renderHook(
        (props: { count: number }) => {
          const latestCount = useLatest(props.count)

          // 模拟 useCallback 场景
          const handleClick = () => {
            return latestCount.current * 2
          }

          return handleClick
        },
        { initialProps: { count: 5 } }
      )

      expect(result.current()).toBe(10)

      rerender({ count: 10 })

      expect(result.current()).toBe(20)
    })
  })

  describe('边界情况', () => {
    it('初始值为 undefined 时应该正常工作', () => {
      const { result, rerender } = renderHook(
        (props: { value?: string }) => useLatest(props.value),
        {
          initialProps: {},
        }
      )

      expect(result.current.current).toBeUndefined()

      rerender({ value: 'defined' })
      expect(result.current.current).toBe('defined')
    })

    it('值从定义变为 undefined 应该正常工作', () => {
      const { result, rerender } = renderHook(
        (props: { value?: string }) => useLatest(props.value),
        {
          initialProps: { value: 'initial' },
        }
      )

      expect(result.current.current).toBe('initial')

      rerender({})
      expect(result.current.current).toBeUndefined()
    })

    it('应该正确处理复杂嵌套对象', () => {
      const complexObj1 = {
        level1: {
          level2: {
            value: 'deep',
          },
        },
        array: [1, 2, { nested: true }],
      }

      const complexObj2 = {
        level1: {
          level2: {
            value: 'deeper',
          },
        },
        array: [3, 4, { nested: false }],
      }

      const { result, rerender } = renderHook(
        (props: { value: typeof complexObj1 }) => useLatest(props.value),
        {
          initialProps: { value: complexObj1 },
        }
      )

      expect(result.current.current.level1.level2.value).toBe('deep')

      rerender({ value: complexObj2 })
      expect(result.current.current.level1.level2.value).toBe('deeper')
    })
  })
})
