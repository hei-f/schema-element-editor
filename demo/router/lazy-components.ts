import { lazy } from 'react'

/** 顶级页面组件 */
export const AstTestPage = lazy(() =>
  import('../pages/AstTestPage').then((m) => ({ default: m.AstTestPage }))
)

export const AgenticDemoPage = lazy(() =>
  import('../pages/AgenticDemoPage').then((m) => ({ default: m.AgenticDemoPage }))
)

export const IframeTestPage = lazy(() =>
  import('../pages/IframeTestPage').then((m) => ({ default: m.IframeTestPage }))
)

export const OptionsTestPage = lazy(() =>
  import('../pages/OptionsTestPage').then((m) => ({ default: m.OptionsTestPage }))
)

export const BuiltinPreviewTestPage = lazy(() =>
  import('../pages/BuiltinPreviewTestPage').then((m) => ({ default: m.BuiltinPreviewTestPage }))
)

export const RecordingTestPage = lazy(() =>
  import('../pages/RecordingTestPage').then((m) => ({ default: m.RecordingTestPage }))
)

/** Multi SDK 测试页面 */
export const MultiSdkTestIndex = lazy(() =>
  import('../pages/multi-sdk-tests/index').then((m) => ({ default: m.MultiSdkTestIndex }))
)

export const SameLevelTest = lazy(() =>
  import('../pages/multi-sdk-tests/SameLevelTest').then((m) => ({ default: m.SameLevelTest }))
)

export const PriorityOverrideTest = lazy(() =>
  import('../pages/multi-sdk-tests/PriorityOverrideTest').then((m) => ({
    default: m.PriorityOverrideTest,
  }))
)

export const PriorityBlockingTest = lazy(() =>
  import('../pages/multi-sdk-tests/PriorityBlockingTest').then((m) => ({
    default: m.PriorityBlockingTest,
  }))
)

export const MethodLevelTest = lazy(() =>
  import('../pages/multi-sdk-tests/MethodLevelTest').then((m) => ({ default: m.MethodLevelTest }))
)

export const PartialImplementationTest = lazy(() =>
  import('../pages/multi-sdk-tests/PartialImplementationTest').then((m) => ({
    default: m.PartialImplementationTest,
  }))
)

/** Schema 测试页面 */
export const SchemaTestIndex = lazy(() =>
  import('../pages/schema-tests/index').then((m) => ({ default: m.SchemaTestIndex }))
)

export const BasicTypesTest = lazy(() =>
  import('../pages/schema-tests/BasicTypesTest').then((m) => ({ default: m.BasicTypesTest }))
)

export const ComplexTypesTest = lazy(() =>
  import('../pages/schema-tests/ComplexTypesTest').then((m) => ({ default: m.ComplexTypesTest }))
)

export const JsonRepairTest = lazy(() =>
  import('../pages/schema-tests/JsonRepairTest').then((m) => ({ default: m.JsonRepairTest }))
)

export const QuickEditTest = lazy(() =>
  import('../pages/schema-tests/QuickEditTest').then((m) => ({ default: m.QuickEditTest }))
)

export const RecordingModeTest = lazy(() =>
  import('../pages/schema-tests/RecordingModeTest').then((m) => ({ default: m.RecordingModeTest }))
)

export const UIFeaturesTest = lazy(() =>
  import('../pages/schema-tests/UIFeaturesTest').then((m) => ({ default: m.UIFeaturesTest }))
)

export const ClickEventTest = lazy(() =>
  import('../pages/schema-tests/ClickEventTest').then((m) => ({ default: m.ClickEventTest }))
)
