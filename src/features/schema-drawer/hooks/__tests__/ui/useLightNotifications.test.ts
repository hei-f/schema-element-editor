import { act, renderHook, waitFor } from '@testing-library/react'
import { useLightNotifications } from '../../ui/useLightNotifications'

describe('useLightNotifications Hook 测试', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('初始化', () => {
    it('应该初始化为空通知列表', () => {
      const { result } = renderHook(() => useLightNotifications())

      expect(result.current.lightNotifications).toEqual([])
    })
  })

  describe('showLightNotification 显示通知', () => {
    it('应该添加通知到列表', () => {
      const { result } = renderHook(() => useLightNotifications())

      act(() => {
        result.current.showLightNotification('测试通知')
      })

      expect(result.current.lightNotifications).toHaveLength(1)
      expect(result.current.lightNotifications[0].text).toBe('测试通知')
      expect(result.current.lightNotifications[0].id).toMatch(/^notification_/)
    })

    it('应该生成唯一的通知ID', () => {
      const { result } = renderHook(() => useLightNotifications())

      act(() => {
        result.current.showLightNotification('通知1')
        result.current.showLightNotification('通知2')
      })

      const ids = result.current.lightNotifications.map((n) => n.id)
      expect(ids[0]).not.toBe(ids[1])
    })

    it('应该支持添加多个通知', () => {
      const { result } = renderHook(() => useLightNotifications())

      act(() => {
        result.current.showLightNotification('通知1')
        result.current.showLightNotification('通知2')
        result.current.showLightNotification('通知3')
      })

      expect(result.current.lightNotifications).toHaveLength(3)
      expect(result.current.lightNotifications[0].text).toBe('通知1')
      expect(result.current.lightNotifications[1].text).toBe('通知2')
      expect(result.current.lightNotifications[2].text).toBe('通知3')
    })
  })

  describe('自动消失', () => {
    it('通知应该在1500ms后自动消失', async () => {
      const { result } = renderHook(() => useLightNotifications())

      act(() => {
        result.current.showLightNotification('临时通知')
      })

      expect(result.current.lightNotifications).toHaveLength(1)

      act(() => {
        jest.advanceTimersByTime(1500)
      })

      await waitFor(() => {
        expect(result.current.lightNotifications).toHaveLength(0)
      })
    })

    it('多个通知应该独立计时', async () => {
      const { result } = renderHook(() => useLightNotifications())

      act(() => {
        result.current.showLightNotification('通知1')
      })

      act(() => {
        jest.advanceTimersByTime(500)
      })

      act(() => {
        result.current.showLightNotification('通知2')
      })

      expect(result.current.lightNotifications).toHaveLength(2)

      // 再过1000ms，第一个通知应该消失
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(result.current.lightNotifications).toHaveLength(1)
        expect(result.current.lightNotifications[0].text).toBe('通知2')
      })

      // 再过500ms，第二个通知也应该消失
      act(() => {
        jest.advanceTimersByTime(500)
      })

      await waitFor(() => {
        expect(result.current.lightNotifications).toHaveLength(0)
      })
    })

    it('应该在消失时清理定时器引用', async () => {
      const { result } = renderHook(() => useLightNotifications())

      act(() => {
        result.current.showLightNotification('通知')
      })

      act(() => {
        jest.advanceTimersByTime(1500)
      })

      await waitFor(() => {
        expect(result.current.lightNotifications).toHaveLength(0)
      })

      // 定时器应该被清理（没有直接的方式验证，但通过运行时无错误来验证）
      expect(jest.getTimerCount()).toBe(0)
    })
  })

  describe('清理', () => {
    it('卸载时应该清理所有定时器', () => {
      const { result, unmount } = renderHook(() => useLightNotifications())

      act(() => {
        result.current.showLightNotification('通知1')
        result.current.showLightNotification('通知2')
        result.current.showLightNotification('通知3')
      })

      expect(jest.getTimerCount()).toBe(3)

      unmount()

      // 所有定时器应该被清理
      expect(jest.getTimerCount()).toBe(0)
    })

    it('卸载后定时器不应该触发状态更新', () => {
      const { result, unmount } = renderHook(() => useLightNotifications())

      act(() => {
        result.current.showLightNotification('通知')
      })

      unmount()

      // 这不应该导致任何错误
      act(() => {
        jest.advanceTimersByTime(1500)
      })

      // 没有错误就是成功
      expect(true).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该支持空字符串通知', () => {
      const { result } = renderHook(() => useLightNotifications())

      act(() => {
        result.current.showLightNotification('')
      })

      expect(result.current.lightNotifications).toHaveLength(1)
      expect(result.current.lightNotifications[0].text).toBe('')
    })

    it('应该支持很长的通知文本', () => {
      const { result } = renderHook(() => useLightNotifications())
      const longText = 'A'.repeat(1000)

      act(() => {
        result.current.showLightNotification(longText)
      })

      expect(result.current.lightNotifications[0].text).toBe(longText)
    })

    it('应该支持特殊字符', () => {
      const { result } = renderHook(() => useLightNotifications())
      const specialText = '测试 <html> & "quotes" \'single\' \n\t'

      act(() => {
        result.current.showLightNotification(specialText)
      })

      expect(result.current.lightNotifications[0].text).toBe(specialText)
    })
  })

  describe('性能', () => {
    it('应该能处理大量通知', () => {
      const { result } = renderHook(() => useLightNotifications())

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.showLightNotification(`通知${i}`)
        }
      })

      expect(result.current.lightNotifications).toHaveLength(100)
    })

    it('大量通知应该能正常消失', async () => {
      const { result } = renderHook(() => useLightNotifications())

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.showLightNotification(`通知${i}`)
        }
      })

      expect(result.current.lightNotifications).toHaveLength(10)

      act(() => {
        jest.advanceTimersByTime(1500)
      })

      await waitFor(() => {
        expect(result.current.lightNotifications).toHaveLength(0)
      })
    })
  })
})
