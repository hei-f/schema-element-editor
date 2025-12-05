import { useCallback, useState } from 'react'
import { MENU_CONFIG } from '../config/menu-config'

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

  /**
   * 快速平滑滚动到目标位置
   */
  const smoothScrollTo = useCallback((targetY: number, duration = 150) => {
    const startY = window.scrollY
    const diff = targetY - startY
    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      window.scrollTo(0, startY + diff * easeProgress)
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [])

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
   * 滚动到指定 Section（快速平滑滚动）并展开该 Section
   */
  const scrollToSection = useCallback(
    (sectionId: string) => {
      setExpandedSections((prev) => new Set(prev).add(sectionId))
      setActiveSection(sectionId)

      requestAnimationFrame(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          const targetPosition = element.getBoundingClientRect().top + window.scrollY - 20
          smoothScrollTo(targetPosition, 150)
        }
      })
    },
    [smoothScrollTo]
  )

  /**
   * 滚动到指定锚点（配置项，快速平滑滚动）
   */
  const scrollToAnchor = useCallback(
    (anchorId: string) => {
      const element = document.getElementById(anchorId)
      if (element) {
        const rect = element.getBoundingClientRect()
        const targetPosition = rect.top + window.scrollY - window.innerHeight / 2 + rect.height / 2
        smoothScrollTo(targetPosition, 150)
        // 高亮效果（主题色）
        element.style.transition = 'background-color 0.3s ease'
        element.style.backgroundColor = 'rgba(57, 197, 187, 0.1)'
        setTimeout(() => {
          element.style.backgroundColor = ''
        }, 1500)
      }
    },
    [smoothScrollTo]
  )

  return {
    activeSection,
    expandedSections,
    toggleSectionExpanded,
    scrollToSection,
    scrollToAnchor,
  }
}
