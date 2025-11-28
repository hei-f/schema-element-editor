import { act, renderHook, waitFor } from '@testing-library/react'
import { useResizer, PREVIEW_WIDTH_LIMITS } from '../useResizer'

// Mock previewContainerManager
jest.mock('@/core/content/core/preview-container', () => ({
  previewContainerManager: {
    hide: jest.fn()
  }
}))

describe('useResizer Hook 测试', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
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
      const { result } = renderHook(() => useResizer({
        initialWidth: 30,
        minWidth: 10,
        maxWidth: 90
      }))

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
        preventDefault: jest.fn()
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      expect(result.current.isDragging).toBe(true)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('开始拖拽时隐藏预览容器', () => {
      const { previewContainerManager } = require('@/core/content/core/preview-container')
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: jest.fn()
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      expect(previewContainerManager.hide).toHaveBeenCalled()
    })
  })

  describe('鼠标事件处理', () => {
    it('拖拽状态时绑定全局鼠标事件', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
      
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: jest.fn()
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('mouseup 事件结束拖拽状态', async () => {
      const { result } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: jest.fn()
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      expect(result.current.isDragging).toBe(true)

      // 触发 mouseup 事件
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'))
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('mouseup 后触发 onResizeEnd 回调', async () => {
      const onResizeEnd = jest.fn()
      const { result } = renderHook(() => useResizer({
        initialWidth: 40,
        onResizeEnd
      }))

      const mockEvent = {
        preventDefault: jest.fn()
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'))
      })

      // 等待 setTimeout
      act(() => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(onResizeEnd).toHaveBeenCalledWith(40)
      })
    })
  })

  describe('卸载清理', () => {
    it('卸载时移除事件监听器', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
      
      const { result, unmount } = renderHook(() => useResizer({ initialWidth: 40 }))

      const mockEvent = {
        preventDefault: jest.fn()
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
        preventDefault: jest.fn()
      } as unknown as React.MouseEvent

      act(() => {
        result.current.handleResizeStart(mockEvent)
      })

      // 不应该抛出错误
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'))
      })

      act(() => {
        jest.advanceTimersByTime(100)
      })

      expect(result.current.isDragging).toBe(false)
    })

    it('onResizeEnd 回调变更时使用最新的回调', async () => {
      const onResizeEnd1 = jest.fn()
      const onResizeEnd2 = jest.fn()

      const { result, rerender } = renderHook(
        ({ onResizeEnd }) => useResizer({ initialWidth: 40, onResizeEnd }),
        { initialProps: { onResizeEnd: onResizeEnd1 } }
      )

      const mockEvent = {
        preventDefault: jest.fn()
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
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(onResizeEnd1).not.toHaveBeenCalled()
        expect(onResizeEnd2).toHaveBeenCalled()
      })
    })
  })
})

