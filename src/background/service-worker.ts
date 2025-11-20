import { MessageType, type Message } from '@/types'
import { storage } from '@/utils/storage'

/**
 * 更新图标状态显示
 */
function updateIconState(isActive: boolean) {
  // 更新图标标题
  chrome.action.setTitle({
    title: `Schema Editor - ${isActive ? '已激活 ✓' : '未激活'}`
  })
  
  // 切换图标颜色
  const iconSuffix = isActive ? 'active' : 'inactive'
  chrome.action.setIcon({
    path: {
      16: `icons/icon-${iconSuffix}-16.png`,
      48: `icons/icon-${iconSuffix}-48.png`,
      128: `icons/icon-${iconSuffix}-128.png`
    }
  })
}

/**
 * 监听扩展图标点击事件
 */
chrome.action.onClicked.addListener(async (_tab: chrome.tabs.Tab) => {
  console.log('扩展图标被点击')
  
  // 切换激活状态
  const newState = await storage.toggleActiveState()
  console.log('激活状态已切换:', newState)
  
  // 更新图标状态
  updateIconState(newState)
  
  // 通知所有标签页的content script
  try {
    const tabs = await chrome.tabs.query({})
    console.log(`通知 ${tabs.length} 个标签页激活状态变更`)
    
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: MessageType.ACTIVE_STATE_CHANGED,
            payload: { isActive: newState }
          } as Message)
        } catch (error) {
          // 某些特殊页面（如 chrome://, edge:// 等）无法接收消息，忽略这些错误
          console.debug(`标签页 ${tab.id} 无法接收消息:`, error)
        }
      }
    }
  } catch (error) {
    console.error('查询标签页失败:', error)
  }
})

/**
 * 监听来自content script的消息
 */
chrome.runtime.onMessage.addListener((message: Message, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log('Background收到消息:', message)
  
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
})

console.log('Background Service Worker已启动')

/**
 * Service Worker启动/恢复时立即恢复图标状态
 * 解决 MV3 Service Worker 从休眠恢复后图标状态不一致的问题
 */
;(async () => {
  const isActive = await storage.getActiveState()
  updateIconState(isActive)
  console.log('图标状态已恢复:', isActive)
})()

