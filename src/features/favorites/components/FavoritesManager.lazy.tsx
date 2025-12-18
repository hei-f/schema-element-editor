import { lazy } from 'react'

/**
 * FavoritesManager 的懒加载版本
 * 只在需要使用收藏功能时才动态加载
 *
 * 加载时机：
 * - 用户点击添加收藏按钮
 * - 用户点击查看收藏列表按钮
 * - 收藏相关模态框需要显示时
 */
export const FavoritesManager = lazy(() =>
  import('./FavoritesManager').then((module) => ({
    default: module.FavoritesManager,
  }))
)
