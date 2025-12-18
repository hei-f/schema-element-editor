import { lazy } from 'react'

/**
 * EditorContextMenu 的懒加载版本
 * 只在启用右键菜单功能并且用户触发时才动态加载
 *
 * 加载时机：
 * - contextMenuConfig.enabled 为 true
 * - 用户在编辑器中触发右键菜单或选中文本
 */
export const EditorContextMenu = lazy(() =>
  import('./EditorContextMenu').then((module) => ({
    default: module.EditorContextMenu,
  }))
)
