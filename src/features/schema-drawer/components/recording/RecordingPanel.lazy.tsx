import { lazy } from 'react'

/**
 * RecordingPanel 的懒加载版本
 * 只在录制模式下才动态加载
 *
 * 加载时机：
 * - isInRecordingMode 为 true
 * - 用户进入录制模式
 */
export const RecordingPanel = lazy(() =>
  import('./RecordingPanel').then((module) => ({
    default: module.RecordingPanel,
  }))
)
