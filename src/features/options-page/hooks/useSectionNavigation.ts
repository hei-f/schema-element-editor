import { useCallback, useRef, useState } from 'react'
import { MENU_CONFIG } from '../config/menu-config'

/** 高亮状态，用于追踪和清理 */
interface HighlightState {
  timerId: ReturnType<typeof setTimeout> | null
  observer: IntersectionObserver | null
}

interface UseSectionNavigationReturn {
  /** 当前激活的 Section */
  activeSection: string
  /** 各 Section 的展开状态 */
  expandedSections: Set<string>
  /** 切换 Section 展开状态 */
  toggleSectionExpanded: (sectionId: string, expanded: boolean) => void
  /** 滚动到指定 Section */
  scrollToSection: (sectionId: string) => void
  /** 滚动到指定锚点 */
  scrollToAnchor: (anchorId: string) => void
}

/**
 * Section 导航 Hook
 * 处理菜单导航、滚动、展开/折叠等逻辑
 */
export const useSectionNavigation = (): UseSectionNavigationReturn => {
  const [activeSection, setActiveSection] = useState<string>(MENU_CONFIG[0]?.sectionId ?? '')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  /** 高亮状态 ref，用于清理之前的定时器和 observer */
  const highlightStateRef = useRef<HighlightState>({ timerId: null, observer: null })

  /**
   * 切换 Section 的展开状态
   */
  const toggleSectionExpanded = useCallback((sectionId: string, expanded: boolean) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (expanded) {
        next.add(sectionId)
      } else {
        next.delete(sectionId)
      }
      return next
    })
  }, [])

  /**
   * 滚动到指定 Section 并展开该 Section
   * 使用 data-scroll-container 属性定位滚动容器
   */
  const scrollToSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => new Set(prev).add(sectionId))
    setActiveSection(sectionId)

    requestAnimationFrame(() => {
      const element = document.getElementById(sectionId)
      const scrollContainer = document.querySelector('[data-scroll-container]')
      if (element && scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect()
        const elementRect = element.getBoundingClientRect()
        const targetScrollTop = scrollContainer.scrollTop + elementRect.top - containerRect.top - 20

        scrollContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        })
      }
    })
  }, [])

  /**
   * 滚动到指定锚点
   * 使用 CSS 类实现高亮效果，支持主题色
   */
  const scrollToAnchor = useCallback((anchorId: string) => {
    const doScroll = (element: HTMLElement) => {
      const scrollContainer = document.querySelector('[data-scroll-container]')
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect()
        const elementRect = element.getBoundingClientRect()
        const targetScrollTop =
          scrollContainer.scrollTop +
          elementRect.top -
          containerRect.top -
          containerRect.height / 2 +
          elementRect.height / 2

        scrollContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        })
      }

      // 清理之前的高亮状态（定时器和 observer）
      const prevState = highlightStateRef.current
      if (prevState.timerId) {
        clearTimeout(prevState.timerId)
      }
      if (prevState.observer) {
        prevState.observer.disconnect()
      }

      // 使用 IntersectionObserver 检测元素进入可视区域后再添加高亮
      const highlightRoot = scrollContainer ?? document.querySelector('[data-scroll-container]')
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (entry.isIntersecting) {
            // 元素进入可视区域，开始高亮动画
            observer.disconnect()
            // 使用 requestAnimationFrame 确保动画重置可靠
            // 先移除类，等待下一帧后再添加，确保浏览器识别为新动画
            element.classList.remove('anchor-highlight')
            requestAnimationFrame(() => {
              element.classList.add('anchor-highlight')
              const timerId = setTimeout(() => {
                element.classList.remove('anchor-highlight')
                highlightStateRef.current.timerId = null
              }, 2000)
              highlightStateRef.current.timerId = timerId
            })
          }
        },
        {
          root: highlightRoot,
          threshold: 0,
        }
      )
      observer.observe(element)
      highlightStateRef.current.observer = observer
    }

    // 先检查元素是否已存在（Section 已展开的情况）
    const element = document.getElementById(anchorId)
    if (element) {
      // 元素已存在，立即滚动
      doScroll(element)
      return
    }

    // 元素不存在，等待 Collapse 展开后重试
    const tryScroll = (retries = 5) => {
      const el = document.getElementById(anchorId)
      if (el) {
        doScroll(el)
      } else if (retries > 0) {
        setTimeout(() => tryScroll(retries - 1), 80)
      }
    }

    // 等待一帧后开始重试（给 React 时间更新 DOM）
    requestAnimationFrame(() => tryScroll())
  }, [])

  return {
    activeSection,
    expandedSections,
    toggleSectionExpanded,
    scrollToSection,
    scrollToAnchor,
  }
}
