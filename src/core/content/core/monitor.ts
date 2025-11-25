import type { ElementAttributes, HighlightAllConfig, SearchConfig } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'
import {
  findElementWithSchemaParams,
  getElementAttributes,
  getMousePosition,
  hasValidAttributes,
  isVisibleElement
} from '@/shared/utils/ui/dom'

/** 扩展UI元素的选择器 */
const UI_ELEMENT_SELECTOR = '[data-schema-editor-ui]'

/**
 * 元素监听器类
 * 负责监听鼠标事件，高亮元素，显示tooltip
 */
export class ElementMonitor {
  private isActive: boolean = false
  private currentElement: HTMLElement | null = null
  private tooltipElement: HTMLDivElement | null = null
  private onElementClickCallback: ((element: HTMLElement, attrs: ElementAttributes) => void) | null = null
  private isControlPressed: boolean = false
  private rafId: number | null = null
  private lastSearchTime: number = 0
  private searchConfig: SearchConfig | null = null
  private lastMouseX: number = 0
  private lastMouseY: number = 0
  
  // 单元素高亮相关属性
  private highlightBox: HTMLElement | null = null
  private currentHighlightedElement: HTMLElement | null = null
  private highlightInitialRect: { left: number; top: number } | null = null
  
  // 高亮所有元素相关属性
  private highlightAllConfig: HighlightAllConfig | null = null
  private isHighlightingAll: boolean = false
  private highlightAllElements: HTMLElement[] = []
  private highlightAllBoxes: Array<{
    targetElement: HTMLElement
    boxElement: HTMLElement
    initialRect: { left: number; top: number }
  }> = []
  
  // 滚动处理相关
  private scrollStopTimer: number | null = null
  private scrollUpdateRafId: number | null = null
  private readonly SCROLL_STOP_DELAY = 150

  /**
   * 启动监听
   */
  async start(): Promise<void> {
    if (this.isActive) return
    
    this.isActive = true
    logger.log('元素监听器已启动 (按住 Alt/Option 键启用检测)')
    
    // 加载搜索配置
    this.searchConfig = await storage.getSearchConfig()
    
    // 加载高亮所有元素配置
    this.highlightAllConfig = await storage.getHighlightAllConfig()
    
    // 添加事件监听
    document.addEventListener('mousemove', this.handleMouseMove, true)
    document.addEventListener('click', this.handleClick, true)
    document.addEventListener('keydown', this.handleKeyDown, true)
    document.addEventListener('keyup', this.handleKeyUp, true)
    document.addEventListener('scroll', this.handleScroll, true)
    window.addEventListener('schema-editor:clear-highlight', this.handleClearHighlight)
    
    // 创建tooltip元素
    this.createTooltip()
  }

  /**
   * 停止监听
   */
  stop(): void {
    if (!this.isActive) return
    
    this.isActive = false
    this.isControlPressed = false
    logger.log('元素监听器已停止')
    
    // 移除事件监听
    document.removeEventListener('mousemove', this.handleMouseMove, true)
    document.removeEventListener('click', this.handleClick, true)
    document.removeEventListener('keydown', this.handleKeyDown, true)
    document.removeEventListener('keyup', this.handleKeyUp, true)
    document.removeEventListener('scroll', this.handleScroll, true)  // 移除滚动监听
    window.removeEventListener('schema-editor:clear-highlight', this.handleClearHighlight)
    
    // 清理当前高亮
    this.clearHighlight()
    
    // 移除tooltip
    this.removeTooltip()
  }

  /**
   * 处理清除高亮事件
   */
  private handleClearHighlight = (): void => {
    this.clearHighlight()
  }

  /**
   * 设置元素点击回调
   */
  setOnElementClick(callback: (element: HTMLElement, attrs: ElementAttributes) => void): void {
    this.onElementClickCallback = callback
  }

  /**
   * 创建tooltip元素
   */
  private createTooltip(): void {
    if (this.tooltipElement) return
    
    this.tooltipElement = document.createElement('div')
    this.tooltipElement.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      pointer-events: none;
      display: none;
      max-width: 300px;
      word-wrap: break-word;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `
    document.body.appendChild(this.tooltipElement)
  }

  /**
   * 移除tooltip
   */
  private removeTooltip(): void {
    if (this.tooltipElement && this.tooltipElement.parentNode) {
      this.tooltipElement.parentNode.removeChild(this.tooltipElement)
      this.tooltipElement = null
    }
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isActive) return
    
    // 检测 Alt 键（Mac 上是 Option 键）
    if (event.altKey) {
      // 检测高亮所有元素快捷键
      // 使用 event.code 而不是 event.key，因为 Mac 上 Alt+A 会产生特殊字符 'å'
      const keyCode = event.code.toLowerCase()
      const keyBinding = this.highlightAllConfig?.keyBinding.toLowerCase()
      
      // 根据输入类型构建期望的 code
      // 字母: 'a' → 'keya'
      // 数字: '1' → 'digit1'
      const isDigit = /^[0-9]$/.test(keyBinding || '')
      const expectedCode = isDigit ? `digit${keyBinding}` : `key${keyBinding}`
      
      if (
        this.highlightAllConfig?.enabled &&
        keyCode === expectedCode &&
        !this.isHighlightingAll  // 防止重复触发
      ) {
        event.preventDefault()
        this.highlightAll()
        return
      }
      
      if (!this.isControlPressed) {
        this.isControlPressed = true
        
        // 如果正在高亮所有元素，不执行单元素高亮
        if (this.isHighlightingAll) {
          return
        }
        
        // 如果有有效的鼠标位置，立即触发一次检测
        if (this.lastMouseX !== 0 || this.lastMouseY !== 0) {
          const mockMouseEvent = new MouseEvent('mousemove', {
            clientX: this.lastMouseX,
            clientY: this.lastMouseY,
            bubbles: true,
            cancelable: true
          })
          this.performSearch(mockMouseEvent)
        }
      }
    }
  }

  /**
   * 处理键盘释放事件
   */
  private handleKeyUp = (event: KeyboardEvent): void => {
    if (!this.isActive) return
    
    // Alt 键释放
    if (!event.altKey) {
      if (this.isControlPressed) {
        this.isControlPressed = false
        // 清理当前高亮
        this.clearHighlight()
      }
      
      // 清除高亮所有元素
      if (this.isHighlightingAll) {
        this.clearAllHighlights()
      }
    }
  }

  /**
   * 处理滚动事件
   */
  private handleScroll = (): void => {
    // 使用 RAF 优化性能，实时更新高亮框位置
    if (this.scrollUpdateRafId) {
      cancelAnimationFrame(this.scrollUpdateRafId)
    }
    
    this.scrollUpdateRafId = requestAnimationFrame(() => {
      // 更新单元素高亮框位置
      this.updateHighlightBoxPosition()
      
      // 更新所有高亮框位置
      this.updateAllHighlightBoxPositions()
    })
    
    // 清除之前的滚动停止定时器
    if (this.scrollStopTimer) {
      clearTimeout(this.scrollStopTimer)
    }
    
    // 设置新的滚动停止定时器（debounce）
    this.scrollStopTimer = window.setTimeout(() => {
      // 滚动停止，重新检测鼠标位置的元素
      if (this.isControlPressed && (this.lastMouseX !== 0 || this.lastMouseY !== 0)) {
        // 创建模拟的鼠标事件
        const mockMouseEvent = new MouseEvent('mousemove', {
          clientX: this.lastMouseX,
          clientY: this.lastMouseY,
          bubbles: true,
          cancelable: true
        })
        // 重新执行搜索（会走条件判断逻辑）
        this.performSearch(mockMouseEvent)
      }
    }, this.SCROLL_STOP_DELAY)
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.isActive) return
    
    // 记录鼠标位置，供按键时使用
    this.lastMouseX = event.clientX
    this.lastMouseY = event.clientY
    
    // 只有在按住 Alt/Option 键时才进行检测
    if (!this.isControlPressed) {
      // 如果之前有高亮，清除它
      if (this.currentElement) {
        this.clearHighlight()
      }
      return
    }
    
    const target = event.target as HTMLElement
    
    // 忽略我们自己创建的元素
    if (target === this.tooltipElement || (target.closest && target.closest('[data-schema-editor-ui]'))) {
      return
    }
    
    // 取消之前的 RAF
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
    
    // 节流检查
    const now = Date.now()
    const throttleInterval = this.searchConfig?.throttleInterval ?? 16
    if (now - this.lastSearchTime < throttleInterval) {
      return
    }
    
    // 在下一帧执行搜索
    this.rafId = requestAnimationFrame(() => {
      this.performSearch(event)
      this.lastSearchTime = Date.now()
    })
  }

  /**
   * 执行搜索
   */
  private async performSearch(event: MouseEvent): Promise<void> {
    // 如果正在高亮所有元素，不执行单元素搜索
    if (this.isHighlightingAll) {
      return
    }
    
    // 使用新的智能搜索函数
    const { target } = await findElementWithSchemaParams(
      event.clientX,
      event.clientY
    )
    
    if (!target) {
      // 没找到任何元素，清理高亮并显示"非法目标"
      this.clearHighlight()
      this.showTooltip({ params: [] }, false, event)
      return
    }
    
    // 获取目标元素属性
    const attrs = await getElementAttributes(target)
    const isValid = hasValidAttributes(attrs)
    
    // 条件卸载：检查是否是同一个元素
    if (target === this.currentHighlightedElement) {
      // 同一个元素，只更新 tooltip 位置，不重建高亮框
      this.showTooltip(attrs, isValid, event)
      return
    }
    
    // 不同元素，需要重建高亮框
    // 设置当前元素
    this.currentElement = target
    
    // 创建高亮框
    const color = await storage.getHighlightColor()
    this.createHighlightBox(target, color)
    this.showTooltip(attrs, isValid, event)
  }

  /**
   * 处理点击事件
   */
  private handleClick = async (event: MouseEvent): Promise<void> => {
    if (!this.isActive) return
    
    // 只有在按住 Alt/Option 键时才响应点击
    if (!this.isControlPressed) return
    
    // 忽略我们自己创建的元素
    if ((event.target as HTMLElement) === this.tooltipElement || 
        (event.target as HTMLElement).closest('[data-schema-editor-ui]')) {
      return
    }
    
    // 使用当前已检测到的元素
    if (!this.currentElement) return
    
    // 获取元素属性
    const attrs = await getElementAttributes(this.currentElement)
    
    // 只有有效的元素才触发回调
    if (hasValidAttributes(attrs) && this.onElementClickCallback) {
      event.preventDefault()
      event.stopPropagation()
      this.onElementClickCallback(this.currentElement, attrs)
    }
  }

  /**
   * 显示tooltip
   */
  private showTooltip(attrs: ElementAttributes, isValid: boolean, event: MouseEvent): void {
    if (!this.tooltipElement) return
    
    const mousePos = getMousePosition(event)
    
    if (isValid) {
      // 显示参数列表
      const lines: string[] = []
      attrs.params.forEach((param, index) => {
        lines.push(`params${index + 1}: ${param}`)
      })
      this.tooltipElement.innerHTML = lines.join('<br>')
      this.tooltipElement.style.background = 'rgba(0, 0, 0, 0.85)'
      this.tooltipElement.style.color = 'white'
    } else {
      // 显示"非法目标"
      this.tooltipElement.textContent = '非法目标'
      this.tooltipElement.style.background = 'rgba(255, 77, 79, 0.9)'
      this.tooltipElement.style.color = 'white'
    }
    
    // 定位tooltip
    this.positionTooltip(mousePos.x, mousePos.y)
    this.tooltipElement.style.display = 'block'
  }

  /**
   * 定位tooltip
   */
  private positionTooltip(x: number, y: number): void {
    if (!this.tooltipElement) return
    
    const offset = 15
    let left = x + offset
    let top = y + offset
    
    // 确保tooltip不超出视口
    const tooltipRect = this.tooltipElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    if (left + tooltipRect.width > viewportWidth) {
      left = x - tooltipRect.width - offset
    }
    
    if (top + tooltipRect.height > viewportHeight) {
      top = y - tooltipRect.height - offset
    }
    
    this.tooltipElement.style.left = `${left}px`
    this.tooltipElement.style.top = `${top}px`
  }

  /**
   * 清理当前高亮
   */
  private clearHighlight(): void {
    // 移除高亮框
    this.removeHighlightBox()
    
    // 清除当前元素引用
    this.currentElement = null
    
    // 隐藏 tooltip
    if (this.tooltipElement) {
      this.tooltipElement.style.display = 'none'
    }
  }

  /**
   * 高亮所有合法元素
   */
  private async highlightAll(): Promise<void> {
    if (!this.highlightAllConfig) return
    
    // 清除单元素高亮（如果存在）
    this.clearHighlight()
    
    this.isHighlightingAll = true
    
    const attributeName = await storage.getAttributeName()
    const dataAttrName = `data-${attributeName}`
    const highlightColor = await storage.getHighlightColor()
    
    // 查找所有合法元素
    const allElements = document.querySelectorAll(`[${dataAttrName}]`)
    
    logger.log(`找到 ${allElements.length} 个合法元素`)
    
    // 应用数量限制
    const maxCount = this.highlightAllConfig.maxHighlightCount
    const elementsToHighlight = Array.from(allElements).slice(0, maxCount)
    
    if (allElements.length > maxCount) {
      logger.log(`仅高亮前 ${maxCount} 个元素`)
    }
    
    elementsToHighlight.forEach((el) => {
      const element = el as HTMLElement
      
      // 跳过不可见元素
      if (!isVisibleElement(element)) return
      
      // 跳过插件自己的元素
      if (element.closest(UI_ELEMENT_SELECTOR)) return
      
      // 获取属性值
      const attrValue = element.getAttribute(dataAttrName) || ''
      if (!attrValue) return
      
      // 解析参数
      const params = attrValue.split(',').map(s => s.trim()).filter(Boolean)
      if (params.length === 0) return
      
      // 添加高亮框和标签
      this.addHighlightBox(element, params, highlightColor)
      this.highlightAllElements.push(element)
    })
  }

  /**
   * 为元素添加高亮框和标签
   */
  private addHighlightBox(element: HTMLElement, params: string[], color: string): void {
    const rect = element.getBoundingClientRect()
    const offset = 4 // outlineOffset + border
    
    // 创建高亮框容器
    const container = document.createElement('div')
    container.className = 'schema-editor-highlight-all'
    container.setAttribute('data-schema-editor-ui', 'true')
    container.style.cssText = this.createHighlightBoxStyle(rect, color, true)
    
    // 创建标签
    const label = document.createElement('div')
    label.className = 'schema-editor-highlight-label'
    label.style.cssText = `
      position: absolute;
      top: -26px;
      left: 0;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border-radius: 6px;
      white-space: nowrap;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `
    
    // 格式化标签内容（单行显示）
    const labelText = params.map((param, index) => `params${index + 1}: ${param}`).join(', ')
    label.textContent = labelText
    
    container.appendChild(label)
    document.body.appendChild(container)
    
    // 存储到数组中（包含目标元素、高亮框元素和初始位置）
    this.highlightAllBoxes.push({
      targetElement: element,
      boxElement: container,
      initialRect: { left: rect.left - offset, top: rect.top - offset }
    })
  }

  /**
   * 清除所有高亮
   */
  private clearAllHighlights(): void {
    // 移除所有高亮框
    this.highlightAllBoxes.forEach(item => {
      if (item.boxElement.parentNode) {
        item.boxElement.parentNode.removeChild(item.boxElement)
      }
    })
    
    this.highlightAllBoxes = []
    this.highlightAllElements = []
    this.isHighlightingAll = false
    
    logger.log('已清除所有高亮')
  }

  /**
   * 生成高亮框样式（模拟 outline + outlineOffset 效果）
   */
  private createHighlightBoxStyle(
    rect: DOMRect,
    color: string,
    useTransform: boolean = true
  ): string {
    // outlineOffset: 2px + border: 2px = 每边偏移 4px
    const offset = 4
    const left = rect.left - offset
    const top = rect.top - offset
    const width = rect.width + offset * 2
    const height = rect.height + offset * 2
    
    const baseStyle = `
      position: fixed;
      width: ${width}px;
      height: ${height}px;
      border: 2px solid ${color};
      box-shadow: 0 0 10px ${this.hexToRgba(color, 0.5)};
      pointer-events: none;
      z-index: 999998;
      box-sizing: border-box;
    `
    
    if (useTransform) {
      return baseStyle + `
        left: 0;
        top: 0;
        transform: translate(${left}px, ${top}px);
      `
    } else {
      return baseStyle + `
        left: ${left}px;
        top: ${top}px;
      `
    }
  }

  /**
   * 创建单元素高亮框
   */
  private createHighlightBox(element: HTMLElement, color: string): void {
    // 如果已存在高亮框，先移除
    this.removeHighlightBox()
    
    const rect = element.getBoundingClientRect()
    
    // 创建高亮框元素
    const box = document.createElement('div')
    box.className = 'schema-editor-highlight-hover'
    box.setAttribute('data-schema-editor-ui', 'true')
    box.style.cssText = this.createHighlightBoxStyle(rect, color, true)
    
    document.body.appendChild(box)
    
    // 记录状态
    this.highlightBox = box
    this.currentHighlightedElement = element
    this.highlightInitialRect = { left: rect.left, top: rect.top }
  }

  /**
   * 移除单元素高亮框
   */
  private removeHighlightBox(): void {
    if (this.highlightBox && this.highlightBox.parentNode) {
      this.highlightBox.parentNode.removeChild(this.highlightBox)
    }
    this.highlightBox = null
    this.currentHighlightedElement = null
    this.highlightInitialRect = null
  }

  /**
   * 更新单元素高亮框位置（使用 transform）
   */
  private updateHighlightBoxPosition(): void {
    if (!this.highlightBox || !this.currentHighlightedElement || !this.highlightInitialRect) {
      return
    }
    
    const currentRect = this.currentHighlightedElement.getBoundingClientRect()
    const offset = 4 // outlineOffset + border
    const deltaX = currentRect.left - offset - this.highlightInitialRect.left
    const deltaY = currentRect.top - offset - this.highlightInitialRect.top
    
    this.highlightBox.style.transform = `translate(${this.highlightInitialRect.left + deltaX}px, ${this.highlightInitialRect.top + deltaY}px)`
  }

  /**
   * 更新所有高亮框位置
   */
  private updateAllHighlightBoxPositions(): void {
    for (const item of this.highlightAllBoxes) {
      const currentRect = item.targetElement.getBoundingClientRect()
      const offset = 4
      const deltaX = currentRect.left - offset - item.initialRect.left
      const deltaY = currentRect.top - offset - item.initialRect.top
      
      item.boxElement.style.transform = `translate(${item.initialRect.left + deltaX}px, ${item.initialRect.top + deltaY}px)`
    }
  }

  /**
   * 将 hex 颜色转换为 rgba 格式
   */
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
}

