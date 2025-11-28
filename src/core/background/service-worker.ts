import { MessageType, type Message } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'

/** 当前扩展版本号 */
const EXTENSION_VERSION = chrome.runtime.getManifest().version

/**
 * 更新图标状态显示
 */
function updateIconState(isActive: boolean) {
  // 更新图标标题
  chrome.action.setTitle({
    title: `Schema Editor - ${isActive ? '已激活 ✓' : '未激活'}`,
  })

  // 切换图标颜色
  const iconSuffix = isActive ? 'active' : 'inactive'
  chrome.action.setIcon({
    path: {
      16: `icons/icon-${iconSuffix}-16.png`,
      48: `icons/icon-${iconSuffix}-48.png`,
      128: `icons/icon-${iconSuffix}-128.png`,
    },
  })
}

/**
 * 监听扩展图标点击事件
 */
chrome.action.onClicked.addListener(async (_tab: chrome.tabs.Tab) => {
  logger.log('扩展图标被点击')

  // 切换激活状态
  const newState = await storage.toggleActiveState()
  logger.log('激活状态已切换:', newState)

  // 更新图标状态
  updateIconState(newState)

  // 通知所有标签页的content script
  try {
    const tabs = await chrome.tabs.query({})
    logger.log(`通知 ${tabs.length} 个标签页激活状态变更`)

    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: MessageType.ACTIVE_STATE_CHANGED,
            payload: { isActive: newState },
          } as Message)
        } catch (error) {
          // 某些特殊页面（如 chrome://, edge:// 等）无法接收消息，忽略这些错误
          logger.warn(`标签页 ${tab.id} 无法接收消息:`, error)
        }
      }
    }
  } catch (error) {
    logger.error('查询标签页失败:', error)
  }
})

/**
 * 监听来自content script的消息
 */
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    logger.log('Background收到消息:', message)

    // 这里可以添加更多的消息处理逻辑
    switch (message.type) {
      case MessageType.TOGGLE_ACTIVE:
        storage.toggleActiveState().then((newState) => {
          sendResponse({ success: true, isActive: newState })
        })
        return true // 保持消息通道开启

      default:
        sendResponse({ success: false, error: '未知的消息类型' })
    }

    return false
  }
)

logger.log('Background Service Worker已启动')

/**
 * Ping Content Script 检测是否存活及版本号
 * @returns 响应对象或 null（无响应）
 */
async function pingContentScript(
  tabId: number
): Promise<{ status: string; version: string } | null> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: MessageType.PING })
    return response
  } catch {
    // 无响应（未注入或页面不支持）
    return null
  }
}

/**
 * 动态注入 Content Script
 */
async function injectContentScript(tabId: number): Promise<boolean> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/core/content/index.tsx'],
    })
    logger.log(`已向 tab ${tabId} 动态注入 Content Script`)
    return true
  } catch (error) {
    logger.warn(`向 tab ${tabId} 注入失败:`, error)
    return false
  }
}

/**
 * 检查并按需注入 Content Script
 * - 无响应：不注入（可能是特殊页面）
 * - 版本不匹配：强制重新注入
 * - 版本匹配：不注入
 */
async function checkAndInjectIfNeeded(tabId: number): Promise<void> {
  const response = await pingContentScript(tabId)

  if (!response) {
    // 无响应，不注入（可能是特殊页面如 chrome://）
    logger.log(`Tab ${tabId} 无响应，跳过注入`)
    return
  }

  if (response.version !== EXTENSION_VERSION) {
    // 版本不匹配，需要重新注入
    logger.log(`Tab ${tabId} 版本不匹配 (${response.version} vs ${EXTENSION_VERSION})，重新注入`)
    await injectContentScript(tabId)
  } else {
    logger.log(`Tab ${tabId} 版本匹配，无需注入`)
  }
}

/**
 * 监听 Tab 切换事件
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  logger.log('Tab 切换:', activeInfo.tabId)
  await checkAndInjectIfNeeded(activeInfo.tabId)
})

/**
 * Service Worker启动/恢复时立即恢复图标状态
 * 解决 MV3 Service Worker 从休眠恢复后图标状态不一致的问题
 */
;(async () => {
  const isActive = await storage.getActiveState()
  updateIconState(isActive)
  logger.log('图标状态已恢复:', isActive)

  // Service Worker 启动时检查当前活跃 tab
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (activeTab?.id) {
      logger.log('Service Worker 启动，检查当前 tab:', activeTab.id)
      await checkAndInjectIfNeeded(activeTab.id)
    }
  } catch (error) {
    logger.warn('检查当前 tab 失败:', error)
  }
})()
