import React from 'react'
import { createChromeStorageAdapter } from './adapters/chrome-storage-adapter'
import { OptionsPageContent } from './components/OptionsPageContent'
import type { ExternalActions } from './types'

/**
 * 打开GitHub Releases页面检查更新
 */
const openReleasePage = () => {
  chrome.tabs.create({
    url: 'https://github.com/hei-f/schema-element-editor/releases',
    active: true,
  })
}

/** Chrome Storage 适配器实例 */
const chromeStorageAdapter = createChromeStorageAdapter()

/** 外部操作配置 */
const chromeActions: ExternalActions = {
  onCheckUpdate: openReleasePage,
  shouldSetDocumentTitle: true,
  isReleaseBuild: __IS_RELEASE_BUILD__,
}

/**
 * 设置页面容器组件（插件环境）
 * 注入 Chrome Storage 适配器和外部操作
 */
export const OptionsApp: React.FC = () => {
  return <OptionsPageContent storage={chromeStorageAdapter} actions={chromeActions} />
}
