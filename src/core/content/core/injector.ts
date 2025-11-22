import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'

/**
 * 注入页面脚本
 * 使用 chrome.runtime.getURL 加载独立的脚本文件
 */
export const injectPageScript = (): void => {
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
export const syncConfigToInjectedScript = async (): Promise<void> => {
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

