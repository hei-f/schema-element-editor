import { lazy } from 'react'

/**
 * QuickEditModal 的懒加载版本
 * 只在用户选择"单独编辑"菜单项时才动态加载
 *
 * 加载时机：
 * - contextMenuConfig.enabled 为 true
 * - 用户在右键菜单中选择"单独编辑"选项
 *
 * 注意：此组件内部包含完整的 CodeMirror 编辑器，体积较大
 */
export const QuickEditModal = lazy(() =>
  import('./QuickEditModal').then((module) => ({
    default: module.QuickEditModal,
  }))
)
