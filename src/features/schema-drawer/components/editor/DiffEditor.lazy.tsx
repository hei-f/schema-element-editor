import { lazy } from 'react'

/**
 * DiffEditor 的懒加载版本
 * 只在需要显示 Diff 对比视图时才动态加载
 *
 * 加载时机：
 * - 用户点击"JSON 修复"并进入 Diff 模式
 * - 录制模式下用户查看版本对比
 *
 * 注意：此组件依赖大量 CodeMirror 模块，懒加载可以显著减少初始包体积
 */
export const DiffEditor = lazy(() =>
  import('./DiffEditor').then((module) => ({
    default: module.DiffEditor,
  }))
)
