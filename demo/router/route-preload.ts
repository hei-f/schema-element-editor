/**
 * 路由预加载工具
 * 根据路由路径预加载对应的组件代码
 */

/** 预加载缓存 - 避免重复预加载 */
const preloadCache = new Set<string>()

/**
 * 预加载路由组件
 * @param path 路由路径
 */
export const preloadRoute = (path: string): void => {
  // 已预加载，跳过
  if (preloadCache.has(path)) {
    return
  }

  // 标记为已预加载
  preloadCache.add(path)

  // 根据路径动态导入对应组件
  const routeMap: Record<string, () => Promise<unknown>> = {
    '/ast-test': () => import('../pages/AstTestPage'),
    '/agentic-demo': () => import('../pages/AgenticDemoPage'),
    '/recording-test': () => import('../pages/RecordingTestPage'),
    '/iframe-test': () => import('../pages/IframeTestPage'),
    '/builtin-preview-test': () => import('../pages/BuiltinPreviewTestPage'),
    '/options-test': () => import('../pages/OptionsTestPage'),
    '/multi-sdk-test': () => import('../pages/multi-sdk-tests/index'),
    '/multi-sdk-test/same-level': () => import('../pages/multi-sdk-tests/SameLevelTest'),
    '/multi-sdk-test/priority-override': () =>
      import('../pages/multi-sdk-tests/PriorityOverrideTest'),
    '/multi-sdk-test/priority-blocking': () =>
      import('../pages/multi-sdk-tests/PriorityBlockingTest'),
    '/multi-sdk-test/method-level': () => import('../pages/multi-sdk-tests/MethodLevelTest'),
    '/multi-sdk-test/partial-implementation': () =>
      import('../pages/multi-sdk-tests/PartialImplementationTest'),
    '/schema-tests': () => import('../pages/schema-tests/index'),
    '/schema-tests/basic-types': () => import('../pages/schema-tests/BasicTypesTest'),
    '/schema-tests/complex-types': () => import('../pages/schema-tests/ComplexTypesTest'),
    '/schema-tests/json-repair': () => import('../pages/schema-tests/JsonRepairTest'),
    '/schema-tests/quick-edit': () => import('../pages/schema-tests/QuickEditTest'),
    '/schema-tests/recording-mode': () => import('../pages/schema-tests/RecordingModeTest'),
    '/schema-tests/ui-features': () => import('../pages/schema-tests/UIFeaturesTest'),
    '/schema-tests/click-event': () => import('../pages/schema-tests/ClickEventTest'),
  }

  const loader = routeMap[path]
  if (loader) {
    // 静默预加载（不阻塞主线程）
    loader().catch((error) => {
      console.warn(`[RoutePreload] 预加载失败: ${path}`, error)
      // 预加载失败时从缓存移除，允许重试
      preloadCache.delete(path)
    })
  }
}
