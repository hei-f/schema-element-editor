import type {
  ElementAttributes,
  IframeBridgeMessageType,
  IframeElementClickPayload,
  IframeElementHoverPayload,
  IframeElementRect,
  IframeHighlightAllResponsePayload,
} from '@/shared/types'
import { IframeBridgeMessageType as MessageType } from '@/shared/types'
import { logger } from './logger'

/** iframe bridge 消息来源标识 */
const IFRAME_BRIDGE_SOURCE = 'schema-element-editor-iframe-bridge'

/**
 * iframe bridge 消息结构
 */
interface IframeBridgeMessage<T = unknown> {
  source: typeof IFRAME_BRIDGE_SOURCE
  type: IframeBridgeMessageType
  payload: T
}

/**
 * 检查当前是否为 top frame
 */
export function isTopFrame(): boolean {
  return window === window.top
}

/**
 * 检查当前是否在 iframe 内
 */
export function isInIframe(): boolean {
  return window !== window.top
}

/**
 * 检查 iframe 是否同源
 * 跨域 iframe 无法访问 window.frameElement
 */
export function isSameOriginIframe(): boolean {
  if (!isInIframe()) return false

  try {
    // 尝试访问 parent 的 location，如果跨域会抛出异常
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    window.parent.location.href
    return true
  } catch {
    return false
  }
}

/**
 * 获取当前 iframe 相对于 top frame 的偏移量
 * 仅在同源 iframe 中有效
 */
export function getIframeOffset(): { left: number; top: number } | null {
  if (!isInIframe()) return null

  try {
    let totalLeft = 0
    let totalTop = 0
    let currentWindow: Window = window

    // 逐级向上累加偏移量
    while (currentWindow !== window.top) {
      const frameElement = currentWindow.frameElement as HTMLIFrameElement | null
      if (!frameElement) break

      const rect = frameElement.getBoundingClientRect()
      totalLeft += rect.left
      totalTop += rect.top

      currentWindow = currentWindow.parent
    }

    return { left: totalLeft, top: totalTop }
  } catch {
    // 跨域时会抛出异常
    return null
  }
}

/**
 * 将元素的 rect 转换为相对于 top frame 视口的坐标
 */
export function convertRectToTopFrame(rect: DOMRect): IframeElementRect | null {
  const offset = getIframeOffset()
  if (!offset) return null

  return {
    left: rect.left + offset.left,
    top: rect.top + offset.top,
    width: rect.width,
    height: rect.height,
  }
}

/**
 * 将鼠标位置转换为相对于 top frame 视口的坐标
 */
export function convertMousePositionToTopFrame(
  x: number,
  y: number
): { x: number; y: number } | null {
  const offset = getIframeOffset()
  if (!offset) return null

  return {
    x: x + offset.left,
    y: y + offset.top,
  }
}

/**
 * 向 top frame 发送消息
 */
function sendToTopFrame<T>(type: IframeBridgeMessageType, payload: T): void {
  if (!window.top) {
    logger.error('无法发送消息：window.top 不存在')
    return
  }

  const message: IframeBridgeMessage<T> = {
    source: IFRAME_BRIDGE_SOURCE,
    type,
    payload,
  }

  logger.log('[iframe-bridge] 发送消息到 top frame:', type, payload)
  window.top.postMessage(message, '*')
}

/**
 * 向所有 iframe 发送消息
 */
function broadcastToIframes<T>(type: IframeBridgeMessageType, payload: T): void {
  const message: IframeBridgeMessage<T> = {
    source: IFRAME_BRIDGE_SOURCE,
    type,
    payload,
  }

  // 获取所有 iframe
  const iframes = document.querySelectorAll('iframe')
  iframes.forEach((iframe) => {
    try {
      iframe.contentWindow?.postMessage(message, '*')
    } catch {
      // 跨域 iframe 会抛出异常，忽略
    }
  })
}

/**
 * 发送元素悬停消息到 top frame
 */
export function sendElementHoverToTop(
  rect: IframeElementRect,
  attrs: ElementAttributes,
  isValid: boolean,
  mousePosition: { x: number; y: number },
  isRecordingMode: boolean
): void {
  const payload: IframeElementHoverPayload = {
    rect,
    attrs,
    isValid,
    mousePosition,
    isRecordingMode,
  }
  sendToTopFrame(MessageType.ELEMENT_HOVER, payload)
}

/**
 * 发送元素点击消息到 top frame
 */
export function sendElementClickToTop(attrs: ElementAttributes, isRecordingMode: boolean): void {
  const payload: IframeElementClickPayload = {
    attrs,
    isRecordingMode,
    iframeOrigin: window.location.origin,
  }
  sendToTopFrame(MessageType.ELEMENT_CLICK, payload)
}

/**
 * 发送清除高亮消息到 top frame
 */
export function sendClearHighlightToTop(): void {
  sendToTopFrame(MessageType.CLEAR_HIGHLIGHT, null)
}

/**
 * 向所有 iframe 广播高亮所有元素请求
 */
export function broadcastHighlightAllRequest(): void {
  const iframes = document.querySelectorAll('iframe')
  console.log('[iframe-bridge] 广播 HIGHLIGHT_ALL_REQUEST, iframe 数量:', iframes.length)
  broadcastToIframes(MessageType.HIGHLIGHT_ALL_REQUEST, null)
}

/**
 * 向所有 iframe 广播 Alt 键状态
 */
export function broadcastAltKeyState(
  isPressed: boolean,
  mousePosition: { x: number; y: number }
): void {
  logger.log('[iframe-bridge] 广播 Alt 键状态到 iframes:', { isPressed, mousePosition })
  broadcastToIframes(MessageType.SYNC_ALT_KEY, { isPressed, mousePosition })
}

/**
 * 发送高亮所有元素响应到 top frame
 */
export function sendHighlightAllResponseToTop(
  elements: IframeHighlightAllResponsePayload['elements']
): void {
  const payload: IframeHighlightAllResponsePayload = { elements }
  sendToTopFrame(MessageType.HIGHLIGHT_ALL_RESPONSE, payload)
}

/** Alt 键状态同步 payload */
export interface AltKeySyncPayload {
  isPressed: boolean
  mousePosition: { x: number; y: number }
}

/**
 * iframe bridge 消息处理器类型
 */
export interface IframeBridgeHandlers {
  onElementHover?: (payload: IframeElementHoverPayload) => void
  onElementClick?: (payload: IframeElementClickPayload) => void
  onClearHighlight?: () => void
  onHighlightAllRequest?: () => void
  onHighlightAllResponse?: (payload: IframeHighlightAllResponsePayload) => void
  onCrossOriginDetected?: () => void
  onAltKeySync?: (payload: AltKeySyncPayload) => void
}

/**
 * 初始化 iframe bridge 消息监听器
 * @param handlers 消息处理器
 * @returns 清理函数
 */
export function initIframeBridgeListener(handlers: IframeBridgeHandlers): () => void {
  logger.log('[iframe-bridge] 初始化 iframe bridge 监听器')

  const listener = (event: MessageEvent) => {
    // 只处理来自同源的消息
    if (!event.data || event.data.source !== IFRAME_BRIDGE_SOURCE) return

    const message = event.data as IframeBridgeMessage
    logger.log('[iframe-bridge] 收到消息:', message.type, message.payload)

    switch (message.type) {
      case MessageType.ELEMENT_HOVER:
        handlers.onElementHover?.(message.payload as IframeElementHoverPayload)
        break

      case MessageType.ELEMENT_CLICK:
        handlers.onElementClick?.(message.payload as IframeElementClickPayload)
        break

      case MessageType.CLEAR_HIGHLIGHT:
        handlers.onClearHighlight?.()
        break

      case MessageType.HIGHLIGHT_ALL_REQUEST:
        console.log('[iframe-bridge] 收到 HIGHLIGHT_ALL_REQUEST')
        handlers.onHighlightAllRequest?.()
        break

      case MessageType.HIGHLIGHT_ALL_RESPONSE:
        handlers.onHighlightAllResponse?.(message.payload as IframeHighlightAllResponsePayload)
        break

      case MessageType.CROSS_ORIGIN_DETECTED:
        handlers.onCrossOriginDetected?.()
        break

      case MessageType.SYNC_ALT_KEY:
        handlers.onAltKeySync?.(message.payload as AltKeySyncPayload)
        break

      default:
        break
    }
  }

  window.addEventListener('message', listener)

  return () => {
    window.removeEventListener('message', listener)
  }
}
