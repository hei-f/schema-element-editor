import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'

/**
 * 检查是否需要注入页面脚本
 * 只有 windowFunction 模式才需要注入
 */
export const shouldInjectPageScript = async (): Promise<boolean> => {
  const apiConfig = await storage.getApiConfig()
  return apiConfig.communicationMode === 'windowFunction'
}

/**
 * 注入页面脚本（仅 windowFunction 模式需要）
 * 使用 chrome.runtime.getURL 加载独立的脚本文件
 */
export const injectPageScript = async (): Promise<void> => {
  // 检查是否需要注入
  const needInject = await shouldInjectPageScript()
  if (!needInject) {
    logger.log('postMessage 模式，跳过脚本注入')
    return
  }

  // 检查是否已经注入过
  if ((window as any).__SCHEMA_EDITOR_INJECTED__) {
    // 即使已注入，也要同步配置（配置可能已更新）
    await syncConfigToInjectedScript()
    return
  }

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL('injected.js')
    script.onload = async () => {
      script.remove()
      await syncConfigToInjectedScript()
      resolve()
    }
    script.onerror = (error) => {
      logger.error('❌ Injected script注入失败:', error)
      resolve()
    }
    ;(document.head || document.documentElement).appendChild(script)
  })
}

/**
 * 同步配置到注入脚本（仅 windowFunction 模式使用）
 */
export const syncConfigToInjectedScript = async (): Promise<void> => {
  try {
    const [getFunctionName, updateFunctionName, previewFunctionName] = await Promise.all([
      storage.getGetFunctionName(),
      storage.getUpdateFunctionName(),
      storage.getPreviewFunctionName(),
    ])

    window.postMessage(
      {
        source: 'schema-editor-content',
        type: 'CONFIG_SYNC',
        payload: {
          getFunctionName,
          updateFunctionName,
          previewFunctionName,
        },
      },
      '*'
    )
  } catch (error) {
    logger.error('❌ 同步配置失败:', error)
  }
}
