import type { ElementAttributes, SearchConfig } from '@/types'
import {
  addHighlight,
  findElementWithSchemaParams,
  getElementAttributes,
  getMousePosition,
  hasValidAttributes,
  removeCandidateHighlight,
  removeHighlight
} from '@/utils/element-detector'
import { storage } from '@/utils/storage'

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
  private candidateElements: HTMLElement[] = []
  private lastMouseX: number = 0
  private lastMouseY: number = 0

  /**
   * 启动监听
   */
  async start(): Promise<void> {
    if (this.isActive) return
    
    this.isActive = true
    console.log('元素监听器已启动 (按住 Alt/Option 键启用检测)')
    
    // 加载搜索配置
    this.searchConfig = await storage.getSearchConfig()
    
    // 添加事件监听
    document.addEventListener('mousemove', this.handleMouseMove, true)
    document.addEventListener('click', this.handleClick, true)
    document.addEventListener('keydown', this.handleKeyDown, true)
    document.addEventListener('keyup', this.handleKeyUp, true)
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
    console.log('元素监听器已停止')
    
    // 移除事件监听
    document.removeEventListener('mousemove', this.handleMouseMove, true)
    document.removeEventListener('click', this.handleClick, true)
    document.removeEventListener('keydown', this.handleKeyDown, true)
    document.removeEventListener('keyup', this.handleKeyUp, true)
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
      if (!this.isControlPressed) {
        this.isControlPressed = true
        console.log('🎮 Alt/Option 键已按下，hover 检测已启用')
        
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
        console.log('🎮 Alt/Option 键已释放，hover 检测已禁用')
        // 清理当前高亮
        this.clearHighlight()
      }
    }
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
    const throttleInterval = this.searchConfig?.throttleInterval ?? 100
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
    // 清理之前的高亮
    this.clearHighlight()
    
    // 使用新的智能搜索函数
    const { target } = await findElementWithSchemaParams(
      event.clientX,
      event.clientY
    )
    
    if (!target) {
      // 没找到任何元素，显示"非法目标"
      this.showTooltip({ params: [] }, false, event)
      return
    }
    
    // 获取目标元素属性
    const attrs = await getElementAttributes(target)
    const isValid = hasValidAttributes(attrs)
    
    // 设置当前元素
    this.currentElement = target
    
    // 直接高亮目标元素
    addHighlight(target)
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
    if (this.currentElement) {
      removeHighlight(this.currentElement)
      this.currentElement = null
    }
    this.clearCandidateHighlights()
    
    if (this.tooltipElement) {
      this.tooltipElement.style.display = 'none'
    }
  }

  /**
   * 清除候选元素高亮
   */
  private clearCandidateHighlights(): void {
    for (const element of this.candidateElements) {
      removeCandidateHighlight(element)
    }
    this.candidateElements = []
  }
}

