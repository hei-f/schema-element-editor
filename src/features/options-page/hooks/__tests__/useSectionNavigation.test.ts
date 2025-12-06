import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useSectionNavigation } from '../useSectionNavigation'

describe('useSectionNavigation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('初始状态', () => {
    it('应该返回正确的初始值', () => {
      const { result } = renderHook(() => useSectionNavigation())

      expect(result.current.activeSection).toBeDefined()
      expect(result.current.expandedSections).toBeInstanceOf(Set)
      expect(result.current.expandedSections.size).toBe(0)
    })
  })

  describe('toggleSectionExpanded', () => {
    it('应该能够展开 section', () => {
      const { result } = renderHook(() => useSectionNavigation())

      act(() => {
        result.current.toggleSectionExpanded('section-1', true)
      })

      expect(result.current.expandedSections.has('section-1')).toBe(true)
    })

    it('应该能够折叠 section', () => {
      const { result } = renderHook(() => useSectionNavigation())

      act(() => {
        result.current.toggleSectionExpanded('section-1', true)
      })
      expect(result.current.expandedSections.has('section-1')).toBe(true)

      act(() => {
        result.current.toggleSectionExpanded('section-1', false)
      })
      expect(result.current.expandedSections.has('section-1')).toBe(false)
    })

    it('应该能够同时展开多个 section', () => {
      const { result } = renderHook(() => useSectionNavigation())

      act(() => {
        result.current.toggleSectionExpanded('section-1', true)
        result.current.toggleSectionExpanded('section-2', true)
      })

      expect(result.current.expandedSections.has('section-1')).toBe(true)
      expect(result.current.expandedSections.has('section-2')).toBe(true)
    })
  })

  describe('scrollToSection', () => {
    it('应该更新 activeSection 并展开目标 section', () => {
      const { result } = renderHook(() => useSectionNavigation())

      // 创建模拟元素
      const mockElement = document.createElement('div')
      mockElement.id = 'section-test'
      mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ top: 100 })
      document.body.appendChild(mockElement)

      act(() => {
        result.current.scrollToSection('section-test')
      })

      expect(result.current.activeSection).toBe('section-test')
      expect(result.current.expandedSections.has('section-test')).toBe(true)

      // 清理
      document.body.removeChild(mockElement)
    })
  })

  describe('scrollToAnchor', () => {
    it('应该滚动到锚点并添加高亮效果', () => {
      const { result } = renderHook(() => useSectionNavigation())

      // 创建滚动容器
      const scrollContainer = document.createElement('div')
      scrollContainer.setAttribute('data-scroll-container', '')
      scrollContainer.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 0,
        height: 500,
      })
      scrollContainer.scrollTop = 0
      scrollContainer.scrollTo = vi.fn()
      document.body.appendChild(scrollContainer)

      // 创建模拟元素
      const mockElement = document.createElement('div')
      mockElement.id = 'anchor-test'
      mockElement.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 200,
        height: 50,
      })
      scrollContainer.appendChild(mockElement)

      // Mock IntersectionObserver
      const observeCallback = vi.fn()
      const mockObserver = {
        observe: vi.fn().mockImplementation(() => {
          // 立即触发 intersection callback
          setTimeout(() => {
            observeCallback([{ isIntersecting: true }], mockObserver)
          }, 0)
        }),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      }
      const IntersectionObserverMock = vi.fn().mockImplementation((callback) => {
        observeCallback.mockImplementation(callback)
        return mockObserver
      })
      vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

      // Mock requestAnimationFrame
      vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        setTimeout(() => cb(0), 0)
        return 0
      })

      act(() => {
        result.current.scrollToAnchor('anchor-test')
      })

      // 等待 IntersectionObserver 回调和 requestAnimationFrame
      act(() => {
        vi.advanceTimersByTime(10)
      })

      // 验证高亮类被添加（使用 CSS 类而非内联样式）
      expect(mockElement.classList.contains('anchor-highlight')).toBe(true)

      // 快进时间，验证高亮效果被移除
      act(() => {
        vi.advanceTimersByTime(2500)
      })
      expect(mockElement.classList.contains('anchor-highlight')).toBe(false)

      // 清理
      document.body.removeChild(scrollContainer)
      vi.unstubAllGlobals()
    })

    it('元素不存在时不应该报错', () => {
      const { result } = renderHook(() => useSectionNavigation())

      expect(() => {
        act(() => {
          result.current.scrollToAnchor('non-existent')
        })
      }).not.toThrow()
    })
  })
})
