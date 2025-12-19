import type { Message, PostMessageSourceConfig } from '@/shared/types'
import { logger } from '@/shared/utils/logger'

/** 默认消息来源标识 */
export const MESSAGE_SOURCE = {
  /** Content Script 发送的消息（默认值，可配置） */
  FROM_CONTENT: 'schema-element-editor-content',
  /** 宿主应用响应的消息（默认值，可配置） */
  FROM_HOST: 'schema-element-editor-host',
} as const

/** requestId 计数器 */
let requestCounter = 0

/** 待处理请求 Map */
const pendingRequests = new Map<
  string,
  {
    resolve: (value: any) => void
    reject: (reason: any) => void
    timeoutId: ReturnType<typeof setTimeout>
  }
>()

/**
 * 发送消息到Background Service Worker
 */
export async function sendMessageToBackground<T = any>(message: Message): Promise<T> {
  try {
    const response = await chrome.runtime.sendMessage(message)
    return response
  } catch (error) {
    logger.error('发送消息到Background失败:', error)
    throw error
  }
}

/**
 * 发送消息到Content Script
 */
export async function sendMessageToContent<T = any>(tabId: number, message: Message): Promise<T> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, message)
    return response
  } catch (error) {
    logger.error('发送消息到Content Script失败:', error)
    throw error
  }
}

/**
 * 监听来自Background或Content Script的消息
 * handler 可以返回响应值（同步）或 Promise（异步）
 */
export function listenChromeMessages(
  handler: (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => void | boolean | Promise<void>
): void {
  chrome.runtime.onMessage.addListener(
    (
      message: Message,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      const result = handler(message, sender, sendResponse)

      // 如果handler返回Promise，等待其完成
      if (result instanceof Promise) {
        result.then(() => sendResponse({ success: true }))
        return true // 保持消息通道开启
      }

      // 如果handler返回true，表示需要异步响应
      if (result === true) {
        return true
      }

      return false
    }
  )
}

/**
 * 发送请求到宿主应用并等待响应（postMessage 直连模式）
 * @param type 消息类型
 * @param payload 消息载荷
 * @param timeoutSeconds 超时时间（秒）
 * @param sourceConfig 可选的 source 配置，不传则使用默认值
 * @returns Promise，resolve 时返回宿主响应
 */
export function sendRequestToHost<T = any>(
  type: string,
  payload: any,
  timeoutSeconds: number = 5,
  sourceConfig?: PostMessageSourceConfig
): Promise<T> {
  return new Promise((resolve, reject) => {
    const requestId = `req-${++requestCounter}-${Date.now()}`
    const timeoutMs = timeoutSeconds * 1000
    const contentSource = sourceConfig?.contentSource ?? MESSAGE_SOURCE.FROM_CONTENT

    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId)
      reject(
        new Error(
          `请求超时（${timeoutSeconds}秒）。` +
            `可能原因：1.宿主应用未正确监听 postMessage；2.多个同级SDK均未返回有效数据`
        )
      )
    }, timeoutMs)

    // 存储待处理请求
    pendingRequests.set(requestId, { resolve, reject, timeoutId })

    // 发送请求到宿主
    window.postMessage(
      {
        source: contentSource,
        type,
        payload,
        requestId,
      },
      '*'
    )
  })
}

/**
 * 初始化宿主消息监听器（postMessage 直连模式）
 * 需要在 Content Script 启动时调用一次
 * @param sourceConfig 可选的 source 配置，不传则使用默认值
 */
export function initHostMessageListener(sourceConfig?: PostMessageSourceConfig): () => void {
  const hostSource = sourceConfig?.hostSource ?? MESSAGE_SOURCE.FROM_HOST

  const listener = (event: MessageEvent) => {
    // 只处理来自当前窗口的消息
    if (event.source !== window) return

    // 只处理来自宿主的响应
    if (!event.data || event.data.source !== hostSource) return

    const { requestId } = event.data
    const pending = pendingRequests.get(requestId)

    if (pending) {
      clearTimeout(pending.timeoutId)
      pendingRequests.delete(requestId)
      pending.resolve(event.data)
    }
  }

  window.addEventListener('message', listener)

  // 返回清理函数
  return () => {
    window.removeEventListener('message', listener)
    // 清理所有待处理请求
    pendingRequests.forEach(({ timeoutId }) => clearTimeout(timeoutId))
    pendingRequests.clear()
  }
}

/**
 * 宿主推送消息的载荷结构
 */
export interface HostPushPayload {
  success: boolean
  data?: any
  error?: string
}

/**
 * 监听宿主主动推送的消息（用于录制模式事件驱动）
 * @param messageType 要监听的消息类型（如 'SCHEMA_PUSH'）
 * @param handler 收到推送时的回调函数
 * @param sourceConfig 可选的 source 配置
 * @returns 清理函数
 */
export function listenHostPush(
  messageType: string,
  handler: (payload: HostPushPayload) => void,
  sourceConfig?: PostMessageSourceConfig
): () => void {
  const hostSource = sourceConfig?.hostSource ?? MESSAGE_SOURCE.FROM_HOST

  const listener = (event: MessageEvent) => {
    // 只处理来自当前窗口的消息
    if (event.source !== window) return

    // 只处理来自宿主的消息
    if (!event.data || event.data.source !== hostSource) return

    // 只处理指定类型的推送消息
    if (event.data.type !== messageType) return

    // 调用处理函数
    handler(event.data.payload ?? event.data)
  }

  window.addEventListener('message', listener)

  // 返回清理函数
  return () => {
    window.removeEventListener('message', listener)
  }
}
