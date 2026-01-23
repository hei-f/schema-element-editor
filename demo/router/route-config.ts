import type { LazyExoticComponent, ComponentType } from 'react'
import * as LazyComponents from './lazy-components'

export interface RouteConfig {
  /** 路由路径 */
  path: string
  /** 懒加载组件 */
  component: LazyExoticComponent<ComponentType<any>>
  /** 是否需要传递 siderCollapsed props */
  needsSiderCollapsed?: boolean
  /** 是否有 onNavigate 回调（用于索引页） */
  hasNavigateCallback?: boolean
  /** 是否有 onBack 回调（用于子页面） */
  hasBackCallback?: boolean
  /** 子路由配置 */
  children?: RouteConfig[]
}

/** 顶级路由配置 */
export const routeConfigs: RouteConfig[] = [
  {
    path: '/ast-test',
    component: LazyComponents.AstTestPage,
    needsSiderCollapsed: true,
  },
  {
    path: '/agentic-demo',
    component: LazyComponents.AgenticDemoPage,
    needsSiderCollapsed: true,
  },
  {
    path: '/recording-test',
    component: LazyComponents.RecordingTestPage,
    needsSiderCollapsed: true,
  },
  {
    path: '/iframe-test',
    component: LazyComponents.IframeTestPage,
    needsSiderCollapsed: true,
  },
  {
    path: '/builtin-preview-test',
    component: LazyComponents.BuiltinPreviewTestPage,
    needsSiderCollapsed: true,
  },
  {
    path: '/options-test',
    component: LazyComponents.OptionsTestPage,
    needsSiderCollapsed: true,
  },
]

/** Multi SDK 测试路由配置 */
export const multiSdkRoutes: RouteConfig[] = [
  {
    path: '/multi-sdk-test',
    component: LazyComponents.MultiSdkTestIndex,
    hasNavigateCallback: true,
  },
  {
    path: '/multi-sdk-test/same-level',
    component: LazyComponents.SameLevelTest,
    hasBackCallback: true,
  },
  {
    path: '/multi-sdk-test/priority-override',
    component: LazyComponents.PriorityOverrideTest,
    hasBackCallback: true,
  },
  {
    path: '/multi-sdk-test/priority-blocking',
    component: LazyComponents.PriorityBlockingTest,
    hasBackCallback: true,
  },
  {
    path: '/multi-sdk-test/method-level',
    component: LazyComponents.MethodLevelTest,
    hasBackCallback: true,
  },
  {
    path: '/multi-sdk-test/partial-implementation',
    component: LazyComponents.PartialImplementationTest,
    hasBackCallback: true,
  },
]

/** Schema 测试路由配置 */
export const schemaTestRoutes: RouteConfig[] = [
  {
    path: '/schema-tests',
    component: LazyComponents.SchemaTestIndex,
    hasNavigateCallback: true,
  },
  {
    path: '/schema-tests/basic-types',
    component: LazyComponents.BasicTypesTest,
    hasBackCallback: true,
  },
  {
    path: '/schema-tests/complex-types',
    component: LazyComponents.ComplexTypesTest,
    hasBackCallback: true,
  },
  {
    path: '/schema-tests/json-repair',
    component: LazyComponents.JsonRepairTest,
    hasBackCallback: true,
  },
  {
    path: '/schema-tests/quick-edit',
    component: LazyComponents.QuickEditTest,
    hasBackCallback: true,
  },
  {
    path: '/schema-tests/recording-mode',
    component: LazyComponents.RecordingModeTest,
    hasBackCallback: true,
  },
  {
    path: '/schema-tests/ui-features',
    component: LazyComponents.UIFeaturesTest,
    hasBackCallback: true,
  },
  {
    path: '/schema-tests/click-event',
    component: LazyComponents.ClickEventTest,
    hasBackCallback: true,
  },
]

/** 所有路由配置的组合 */
export const allRoutes = [...routeConfigs, ...multiSdkRoutes, ...schemaTestRoutes]
