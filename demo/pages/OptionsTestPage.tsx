import React from 'react'
import { createMockStorageAdapter } from '../../src/features/options-page/adapters/mock-storage-adapter'
import { OptionsPageContent } from '../../src/features/options-page/components/OptionsPageContent'
import type { ExternalActions } from '../../src/features/options-page/types'

/** Mock Storage 适配器实例 */
const mockStorageAdapter = createMockStorageAdapter()

/** 测试环境外部操作配置 */
const mockActions: ExternalActions = {
  // 隐藏检查更新按钮
  onCheckUpdate: undefined,
  // 不设置 document.title
  shouldSetDocumentTitle: false,
  // 显示 DebugSection
  isReleaseBuild: false,
}

interface OptionsTestPageProps {
  siderCollapsed: boolean
}

/**
 * 设置页面测试页（Demo 环境）
 * 使用 Mock Storage 适配器，方便开发和样式调试
 */
export const OptionsTestPage: React.FC<OptionsTestPageProps> = () => {
  return <OptionsPageContent storage={mockStorageAdapter} actions={mockActions} />
}
