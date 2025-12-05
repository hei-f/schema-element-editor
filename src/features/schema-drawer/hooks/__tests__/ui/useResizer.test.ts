import { act, renderHook, waitFor } from '@testing-library/react'
import { useResizer, PREVIEW_WIDTH_LIMITS } from '../../ui/useResizer'
import { previewContainerManager } from '@/core/content/core/preview-container'

// Mock previewContainerManager
vi.mock('@/core/content/core/preview-container', () => ({
  previewContainerManager: {
    hide: vi.fn(),
  },
}))

describe('useResizer Hook 测试', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('常量导出', () => {
    it('导出正确的宽度限制常量', () => {
      expect(PREVIEW_WIDTH_LIMITS.MIN).toBe(20)
      expect(PREVIEW_WIDTH_LIMITS.MAX).toBe(80)
    })
  })

  describe('初始化', () => {
    it('使用初始宽度初始化', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 50 }))

      expect(result.current.width).toBe(50)
      expect(result.current.isDragging).toBe(false)
      expect(result.current.containerRef.current).toBe(null)
    })

    it('使用自定义 minWidth 和 maxWidth 初始化', () => {
      const { result } = renderHook(() =>
        useResizer({
          initialWidth: 30,
          minWidth: 10,
          maxWidth: 90,
        })
      )

      expect(result.current.width).toBe(30)
    })

    it('提供 handleResizeStart 函数', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      expect(typeof result.current.handleResizeStart).toBe('function')
    })

    it('提供 setWidth 函数', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      expect(typeof result.current.setWidth).toBe('function')
    })
  })

  describe('setWidth 手动设置宽度', () => {
    it('可以手动设置宽度', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      act(() => {
        result.current.setWidth(60)
      })

      expect(result.current.width).toBe(60)
    })

    it('手动设置可以超出限制范围（用于外部控制）', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      act(() => {
        result.current.setWidth(100)
      })

      expect(result.current.width).toBe(100)
    })
  })

  describe('handleResizeStart 开始拖拽', () => {
    it('调用 handleResizeStart 后 isDragging 变为 true', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      expect(result.current.isDragging).toBe(true)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('开始拖拽时隐藏预览容器', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      expect(previewContainerManager.hide).toHaveBeenCalled()
    })
  })

  describe('鼠标事件处理', () => {
    it('拖拽状态时绑定全局鼠标事件', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('mousemove 事件更新宽度', () => {
      const { result } = renderHook(() =>
        useResizer({ initialWidth: 40, minWidth: 20, maxWidth: 80 })
      )

      // 模拟 containerRef
      const mockContainer = {
        getBoundingClientRect: () => ({
          left: 0,
          width: 1000,
        }),
      }
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      })

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      // 触发 mousemove 事件，模拟移动到 500px 位置（50%）
      act(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 500 }))
      })

      expect(result.current.width).toBe(50)
    })

    it('mousemove 事件限制宽度在 minWidth 和 maxWidth 之间', () => {
      const { result } = renderHook(() =>
        useResizer({ initialWidth: 40, minWidth: 30, maxWidth: 70 })
      )

      const mockContainer = {
        getBoundingClientRect: () => ({
          left: 0,
          width: 1000,
        }),
      }
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      })

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      // 移动到 10% 位置，应该被限制到 minWidth (30%)
      act(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100 }))
      })

      expect(result.current.width).toBe(30)

      // 移动到 90% 位置，应该被限制到 maxWidth (70%)
      act(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 900 }))
      })

      expect(result.current.width).toBe(70)
    })

    it('containerRef 为 null 时 mousemove 不更新宽度', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      const initialWidth = result.current.width

      // containerRef 为 null，mousemove 不应该改变宽度
      act(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 500 }))
      })

      expect(result.current.width).toBe(initialWidth)
    })

    it('mouseup 事件结束拖拽状态', async () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      expect(result.current.isDragging).toBe(true)

      // 触发 mouseup 事件
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'))
      })

      // mouseup 后使用 setTimeout + requestAnimationFrame 延迟设置 isDragging
      // 需要推进定时器并等待 requestAnimationFrame
      await act(async () => {
        vi.advanceTimersByTime(100)
        await Promise.resolve()
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('mouseup 后触发 onResizeEnd 回调', async () => {
      const onResizeEnd = vi.fn()
      const { result } = renderHook(() =>
        useResizer({
          initialWidth: 40,
          onResizeEnd,
        })
      )

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'))
      })

      // 等待 setTimeout
      act(() => {
        vi.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(onResizeEnd).toHaveBeenCalledWith(40)
      })
    })
  })

  describe('卸载清理', () => {
    it('卸载时移除事件监听器', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { result, unmount } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })

  /**
   * React 19 RefObject 类型兼容性测试
   * React 19 中 useRef<T>(null) 返回 RefObject<T | null> 而非 RefObject<T>
   */
  describe('React 19 RefObject 类型兼容性', () => {
    it('containerRef 初始值为 null（React 19 类型：RefObject<HTMLDivElement | null>）', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      // React 19: useRef<HTMLDivElement>(null) 返回 RefObject<HTMLDivElement | null>
      // 因此 containerRef.current 可以是 HTMLDivElement 或 null
      expect(result.current.containerRef.current).toBeNull()
    })

    it('containerRef 类型应该允许 null 值', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      // 验证类型兼容性：可以安全地检查 null
      const isNull = result.current.containerRef.current === null
      expect(isNull).toBe(true)
    })

    it('containerRef 赋值后应该能正确访问', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      // 模拟 containerRef 被赋值后的情况
      const mockContainer = {
        getBoundingClientRect: () => ({
          left: 0,
          width: 1000,
        }),
      } as HTMLDivElement

      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      })

      // React 19 类型系统下，访问 current 需要处理可能的 null
      expect(result.current.containerRef.current).not.toBeNull()
      expect(result.current.containerRef.current).toBe(mockContainer)
    })

    it('在 containerRef 为 null 时鼠标移动不应该崩溃', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      // containerRef.current 为 null
      expect(result.current.containerRef.current).toBeNull()

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      // 不应该抛出错误
      expect(() => {
        act(() => {
          document.dispatchEvent(new MouseEvent('mousemove', { clientX: 500 }))
        })
      }).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('初始宽度为 0 时正常工作', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 0 }))

      expect(result.current.width).toBe(0)
    })

    it('初始宽度为 100 时正常工作', () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 100 }))

      expect(result.current.width).toBe(100)
    })

    it('没有 onResizeEnd 回调时不报错', async () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      // 不应该抛出错误
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'))
      })

      // mouseup 后使用 setTimeout + requestAnimationFrame 延迟设置 isDragging
      await act(async () => {
        vi.advanceTimersByTime(100)
        await Promise.resolve()
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('onResizeEnd 回调变更时使用最新的回调', async () => {
      const onResizeEnd1 = vi.fn()
      const onResizeEnd2 = vi.fn()

      const { result, rerender } = renderHook(
        ({ onResizeEnd }) => useResizer({ initialWidth: 40, onResizeEnd }),
        { initialProps: { onResizeEnd: onResizeEnd1 } }
      )

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      // 在拖拽过程中更换回调
      rerender({ onResizeEnd: onResizeEnd2 })

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'))
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(onResizeEnd1).not.toHaveBeenCalled()
        expect(onResizeEnd2).toHaveBeenCalled()
      })
    })
  })
})
