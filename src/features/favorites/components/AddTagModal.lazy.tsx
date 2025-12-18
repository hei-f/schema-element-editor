import { lazy } from 'react'

/**
 * AddTagModal 的懒加载版本
 * 只在需要为收藏项添加标签时才动态加载
 *
 * 加载时机：
 * - 用户在收藏列表中点击"添加标签"按钮
 */
export const AddTagModal = lazy(() =>
  import('./AddTagModal').then((module) => ({
    default: module.AddTagModal,
  }))
)
