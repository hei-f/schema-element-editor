import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import type { PreviewPosition } from '@/shared/types'

/** 预览容器 ID */
export const PREVIEW_CONTAINER_ID = 'schema-editor-preview-container'

/** 预览容器管理器 */
class PreviewContainerManager {
  private container: HTMLDivElement | null = null
  private currentZIndex: number = DEFAULT_VALUES.previewConfig.zIndex.preview

  /**
   * 创建或获取预览容器
   */
  createContainer(position: PreviewPosition, zIndex?: number): string {
    if (zIndex !== undefined) {
      this.currentZIndex = zIndex
    }

    if (!this.container) {
      this.container = document.createElement('div')
      this.container.id = PREVIEW_CONTAINER_ID
      this.container.style.cssText = this.getContainerStyle(position)
      document.body.appendChild(this.container)
    } else {
      this.updatePosition(position)
      this.container.style.zIndex = String(this.currentZIndex)
    }

    return PREVIEW_CONTAINER_ID
  }

  /**
   * 设置 z-index
   */
  setZIndex(zIndex: number): void {
    this.currentZIndex = zIndex
    if (this.container) {
      this.container.style.zIndex = String(zIndex)
    }
  }

  /**
   * 更新容器位置
   */
  updatePosition(position: PreviewPosition): void {
    if (!this.container) return

    this.container.style.left = `${position.left}px`
    this.container.style.top = `${position.top}px`
    this.container.style.width = `${position.width}px`
    this.container.style.height = `${position.height}px`
  }

  /**
   * 隐藏容器（拖拽时使用）
   */
  hide(): void {
    if (this.container) {
      this.container.style.display = 'none'
    }
  }

  /**
   * 显示容器（拖拽结束后使用）
   */
  show(): void {
    if (this.container) {
      this.container.style.display = 'block'
    }
  }

  /**
   * 清除容器
   */
  clear(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    this.container = null
  }

  /**
   * 获取容器 ID
   */
  getContainerId(): string {
    return PREVIEW_CONTAINER_ID
  }

  /**
   * 检查容器是否存在
   */
  exists(): boolean {
    return this.container !== null
  }

  /**
   * 生成容器样式
   */
  private getContainerStyle(position: PreviewPosition): string {
    return `
      position: fixed;
      left: ${position.left}px;
      top: ${position.top}px;
      width: ${position.width}px;
      height: ${position.height}px;
      z-index: ${this.currentZIndex};
      background: #f5f5f5;
      border-right: 1px solid #e8e8e8;
      overflow: auto;
      padding: 16px;
      box-sizing: border-box;
    `
  }
}

/** 预览容器管理器单例 */
export const previewContainerManager = new PreviewContainerManager()
