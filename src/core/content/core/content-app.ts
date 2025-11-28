import { App } from '@/shared/components/ContentApp'
import { MessageType, type ElementAttributes, type Message } from '@/shared/types'
import { listenChromeMessages } from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { injectPageScript } from './injector'
import { ElementMonitor } from './monitor'
import { createShadowRoot } from './shadow-dom'

/** 扩展全局类型声明 */
declare global {
  interface Window {
    __SCHEMA_EDITOR_INSTANCE__?: SchemaEditorContent
    __SCHEMA_EDITOR_VERSION__?: string
  }
}

/** 当前扩展版本号 */
const EXTENSION_VERSION = chrome.runtime.getManifest().version

/**
 * Schema Editor Content Script 主应用类
 * 负责管理整个插件的生命周期
 */
export class SchemaEditorContent {
  private monitor!: ElementMonitor
  private reactRoot: ReactDOM.Root | null = null
  private container: HTMLDivElement | null = null
  private isActive: boolean = false
  private isInitialized: boolean = false
  private isDestroyed: boolean = false

  constructor() {
    // 如果已有旧实例且版本不同，先清理旧实例
    if (window.__SCHEMA_EDITOR_INSTANCE__ && window.__SCHEMA_EDITOR_VERSION__ !== EXTENSION_VERSION) {
      logger.log(`检测到旧版本实例 (${window.__SCHEMA_EDITOR_VERSION__})，正在清理...`)
      window.__SCHEMA_EDITOR_INSTANCE__.destroy()
    }
    
    // 如果已有相同版本的实例，不重复创建
    if (window.__SCHEMA_EDITOR_INSTANCE__ && window.__SCHEMA_EDITOR_VERSION__ === EXTENSION_VERSION) {
      logger.log('已存在相同版本的实例，跳过创建')
      this.isDestroyed = true // 标记为无效实例
      return
    }
    
    // 注册当前实例
    window.__SCHEMA_EDITOR_INSTANCE__ = this
    window.__SCHEMA_EDITOR_VERSION__ = EXTENSION_VERSION
    
    this.monitor = new ElementMonitor()
    this.init()
  }
  
  /**
   * 销毁实例
   */
  public destroy(): void {
    if (this.isDestroyed) return
    this.isDestroyed = true
    
    logger.log('销毁 Schema Editor 实例')
    this.stop()
    
    // 清理 React
    if (this.reactRoot) {
      this.reactRoot.unmount()
      this.reactRoot = null
    }
    
    // 清理容器
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
      this.container = null
    }
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
    listenChromeMessages((message: Message, _sender, sendResponse) => {
      return this.handleMessage(message, sendResponse)
    })

    // 设置元素点击回调
    this.monitor.setOnElementClick((element: HTMLElement, attrs: ElementAttributes) => {
      this.handleElementClick(element, attrs)
    })

    // 设置录制模式点击回调
    this.monitor.setOnRecordingModeClick((element: HTMLElement, attrs: ElementAttributes) => {
      this.handleRecordingModeClick(element, attrs)
    })

    logger.log('Schema Editor Content初始化完成, 激活状态:', this.isActive)
  }

  /**
   * 处理消息
   * @returns 返回 true 表示已同步响应
   */
  private handleMessage(message: Message, sendResponse?: (response: any) => void): boolean | void {
    // 已销毁的实例忽略消息
    if (this.isDestroyed) return

    switch (message.type) {
      case MessageType.ACTIVE_STATE_CHANGED:
        this.handleActiveStateChanged(message.payload?.isActive)
        break

      case MessageType.PING:
        // 响应 PING，返回当前版本号
        sendResponse?.({ status: 'ready', version: EXTENSION_VERSION })
        return true

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
  private async start(): Promise<void> {
    logger.log('启动Schema Editor')
    
    // 首次激活时执行初始化
    if (!this.isInitialized) {
      // 注入页面脚本（仅 windowFunction 模式需要）
      await injectPageScript()
      this.isInitialized = true
    }
    
    // 启动元素监听器
    this.monitor.start()

    // 懒加载React UI（首次需要时才创建）
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
      detail: { element, attributes: attrs, isRecordingMode: false }
    })
    window.dispatchEvent(event)
  }

  /**
   * 处理录制模式下的元素点击
   */
  private handleRecordingModeClick(element: HTMLElement, attrs: ElementAttributes): void {
    // 触发自定义事件，通知React应用以录制模式打开
    const event = new CustomEvent('schema-editor:element-click', {
      detail: { element, attributes: attrs, isRecordingMode: true }
    })
    window.dispatchEvent(event)
  }
}

