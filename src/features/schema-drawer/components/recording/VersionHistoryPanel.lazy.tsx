import { lazy } from 'react'

/**
 * VersionHistoryPanel 的懒加载版本
 * 只在录制模式下才动态加载
 *
 * 加载时机：
 * - isInRecordingMode 为 true
 * - 用户进入录制模式并查看版本历史
 */
export const VersionHistoryPanel = lazy(() =>
  import('./VersionHistoryPanel').then((module) => ({
    default: module.VersionHistoryPanel,
  }))
)
