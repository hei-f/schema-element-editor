import { MessageType, type ElementAttributes, type Message } from '@/types'
import { logger } from '@/utils/logger'
import { listenChromeMessages } from '@/utils/message'
import { configureMonaco } from '@/utils/monaco-loader'
import { storage } from '@/utils/storage'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ElementMonitor } from './monitor'
import { App } from './ui/App'

logger.log('Schema Editor Content Script已加载')

/**
 * 注入页面脚本
 * 使用chrome.runtime.getURL加载独立的脚本文件
 */
function injectPageScript(): void {
  // 检查是否已经注入过
  if ((window as any).__SCHEMA_EDITOR_INJECTED__) {
    logger.log('⏭️ Injected script已存在，跳过注入')
    // 即使已注入，也要同步配置（配置可能已更新）
    syncConfigToInjectedScript()
    return
  }
  
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('injected.js')
  script.onload = async () => {
    logger.log('✅ Injected script已成功注入')
    script.remove()
    
    await syncConfigToInjectedScript()
  }
  script.onerror = (error) => {
    logger.error('❌ Injected script注入失败:', error)
  }
  ;(document.head || document.documentElement).appendChild(script)
}

/**
 * 同步配置到注入脚本
 */
async function syncConfigToInjectedScript(): Promise<void> {
  try {
    const getFunctionName = await storage.getGetFunctionName()
    const updateFunctionName = await storage.getUpdateFunctionName()
    
    window.postMessage(
      {
        source: 'schema-editor-content',
        type: 'CONFIG_SYNC',
        payload: {
          getFunctionName,
          updateFunctionName
        }
      },
      '*'
    )
    
    logger.log('⚙️ 配置已同步到injected script:', { getFunctionName, updateFunctionName })
  } catch (error) {
    logger.error('❌ 同步配置失败:', error)
  }
}

/**
 * 创建Shadow DOM容器并挂载React应用
 */
function createShadowRoot(): { container: HTMLDivElement; root: ReactDOM.Root } {
  // 创建容器
  const container = document.createElement('div')
  container.id = 'schema-editor-root'
  container.setAttribute('data-schema-editor-ui', 'true')
  container.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2147483646;
    pointer-events: none;
  `
  document.body.appendChild(container)

  // 创建Shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' })

  // 创建样式容器
  const styleContainer = document.createElement('div')
  styleContainer.style.cssText = `
    pointer-events: auto;
  `
  shadowRoot.appendChild(styleContainer)

  // 注入Ant Design样式
  const antdStyle = document.createElement('link')
  antdStyle.rel = 'stylesheet'
  antdStyle.href = 'https://cdn.jsdelivr.net/npm/antd@5.12.0/dist/reset.css'
  shadowRoot.appendChild(antdStyle)

  // 创建React根容器
  const reactContainer = document.createElement('div')
  reactContainer.id = 'react-root'
  styleContainer.appendChild(reactContainer)

  // 创建React Root
  const root = ReactDOM.createRoot(reactContainer)

  return { container, root }
}

/**
 * 主逻辑
 */
class SchemaEditorContent {
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
      // 配置Monaco Editor（必须在Shadow DOM创建之前）
      configureMonaco()
      // 注入页面脚本
      injectPageScript()
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
      logger.log('✅ UI容器已移除')
    }
  }

  /**
   * 初始化React UI
   */
  private initReactUI(): void {
    if (this.reactRoot) return

    const { container, root } = createShadowRoot()
    this.container = container
    this.reactRoot = root

    // 渲染React应用
    this.reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )

    logger.log('React UI已初始化')
  }

  /**
   * 处理元素点击
   */
  private handleElementClick(element: HTMLElement, attrs: ElementAttributes): void {
    logger.log('元素点击事件:', element, attrs)

    // 触发自定义事件，通知React应用
    const event = new CustomEvent('schema-editor:element-click', {
      detail: { element, attributes: attrs }
    })
    window.dispatchEvent(event)
  }
}

// 启动Content Script
new SchemaEditorContent()

