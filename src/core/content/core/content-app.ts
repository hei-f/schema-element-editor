import { App } from '@/shared/components/ContentApp'
import { MessageType, type ElementAttributes, type Message } from '@/shared/types'
import { listenChromeMessages } from '@/shared/utils/browser/message'
import { configureMonaco } from '@/shared/utils/browser/monaco'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { injectPageScript } from './injector'
import { ElementMonitor } from './monitor'
import { createShadowRoot } from './shadow-dom'

/**
 * Schema Editor Content Script 主应用类
 * 负责管理整个插件的生命周期
 */
export class SchemaEditorContent {
  private monitor: ElementMonitor
  private reactRoot: ReactDOM.Root | null = null
  private container: HTMLDivElement | null = null
  private isActive: boolean = false
  private isInitialized: boolean = false

  constructor() {
    this.monitor = new ElementMonitor()
    this.init()
  }

  /**
   * 初始化
   */
  private async init(): Promise<void> {
    // 检查初始激活状态
    this.isActive = await storage.getActiveState()
    if (this.isActive) {
      this.start()
    }

    // 监听来自background的消息
    listenChromeMessages((message: Message) => {
      this.handleMessage(message)
    })

    // 设置元素点击回调
    this.monitor.setOnElementClick((element: HTMLElement, attrs: ElementAttributes) => {
      this.handleElementClick(element, attrs)
    })

    logger.log('Schema Editor Content初始化完成, 激活状态:', this.isActive)
  }

  /**
   * 处理消息
   */
  private handleMessage(message: Message): void {
    switch (message.type) {
      case MessageType.ACTIVE_STATE_CHANGED:
        this.handleActiveStateChanged(message.payload?.isActive)
        break

      default:
        break
    }
  }

  /**
   * 处理激活状态变化
   */
  private handleActiveStateChanged(isActive: boolean): void {
    logger.log('激活状态变化:', isActive)
    this.isActive = isActive

    if (isActive) {
      this.start()
    } else {
      this.stop()
    }
  }

  /**
   * 启动监听
   */
  private start(): void {
    logger.log('启动Schema Editor')
    
    // 首次激活时执行初始化
    if (!this.isInitialized) {
      // 注入页面脚本
      injectPageScript()
      // 配置Monaco Editor（不再依赖全局CSS）
      configureMonaco()
      this.isInitialized = true
    }
    
    // 启动元素监听器
    this.monitor.start()

    // 懒加载React UI（首次需要时才创建，Monaco CSS将在Shadow DOM创建时注入）
    if (!this.reactRoot) {
      this.initReactUI()
    }
  }

  /**
   * 停止监听
   */
  private stop(): void {
    logger.log('停止Schema Editor')
    this.monitor.stop()
    
    // 移除UI容器（完全清除DOM元素）
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }

  /**
   * 初始化React UI
   */
  private async initReactUI(): Promise<void> {
    if (this.reactRoot) return

    const { container, root, shadowRoot } = await createShadowRoot()
    this.container = container
    this.reactRoot = root

    // 渲染React应用，传递shadowRoot引用
    this.reactRoot.render(
      React.createElement(React.StrictMode, null,
        React.createElement(App, { shadowRoot })
      )
    )
  }

  /**
   * 处理元素点击
   */
  private handleElementClick(element: HTMLElement, attrs: ElementAttributes): void {
    // 触发自定义事件，通知React应用
    const event = new CustomEvent('schema-editor:element-click', {
      detail: { element, attributes: attrs }
    })
    window.dispatchEvent(event)
  }
}

