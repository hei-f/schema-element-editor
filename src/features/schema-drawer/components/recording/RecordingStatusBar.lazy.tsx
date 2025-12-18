import { lazy } from 'react'

/**
 * RecordingStatusBar 的懒加载版本
 * 只在录制模式下才动态加载
 *
 * 加载时机：
 * - isInRecordingMode 为 true
 * - 用户进入录制模式
 */
export const RecordingStatusBar = lazy(() =>
  import('./RecordingStatusBar').then((module) => ({
    default: module.RecordingStatusBar,
  }))
)
