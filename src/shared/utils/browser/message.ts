import type { Message } from '@/shared/types'
import { logger } from '@/shared/utils/logger'

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
export async function sendMessageToContent<T = any>(
  tabId: number,
  message: Message
): Promise<T> {
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
  chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
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
  })
}

/**
 * 发送消息到页面上下文（通过postMessage）
 */
export function postMessageToPage(message: Message): void {
  const fullMessage = {
    source: 'schema-editor-content',
    type: message.type,
    payload: message.payload
  }
  
  window.postMessage(fullMessage, '*')
}

/**
 * 监听来自页面上下文的消息（通过postMessage）
 */
export function listenPageMessages(
  handler: (message: Message) => void
): () => void {
  const listener = (event: MessageEvent) => {
    // 只处理来自当前窗口的消息
    if (event.source !== window) return
    
    // 只处理来自injected script的消息
    if (!event.data || event.data.source !== 'schema-editor-injected') return
    
    handler(event.data)
  }
  
  window.addEventListener('message', listener)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('message', listener)
  }
}

