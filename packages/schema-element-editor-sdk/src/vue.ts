/**
 * Schema Element Editor Host SDK - Vue
 * Vue 3 Composition API 包装
 */

import { onMounted, onUnmounted, watch, toValue, type MaybeRefOrGetter } from 'vue'
import { createSchemaElementEditorBridge } from './bridge'
import type {
  SchemaElementEditorConfig,
  SchemaElementEditorBridge,
  SchemaElementEditorRecording,
  SchemaValue,
  PostMessageSourceConfig,
  PostMessageTypeConfig,
  MethodLevelConfig,
} from './types'

// 注意：类型从主入口 (@schema-element-editor/host-sdk) 导出
// 如需类型，请从主入口导入：import type { ... } from '@schema-element-editor/host-sdk'

/**
 * Vue 版本的 Schema Element Editor 配置
 * 支持响应式值（ref/reactive/getter）
 */
export interface VueSchemaElementEditorConfig {
  /**
   * 获取 Schema 数据
   */
  getSchema: MaybeRefOrGetter<(params: string) => SchemaValue>

  /**
   * 更新 Schema 数据
   */
  updateSchema: MaybeRefOrGetter<(schema: SchemaValue, params: string) => boolean>

  /**
   * 渲染预览（可选）
   *
   * 特殊值说明：
   * - undefined（默认）：不关心预览功能，不参与优先级竞争
   * - null：明确阻止预览功能，参与优先级竞争但告诉插件不支持预览（触发内置预览器）
   * - function：提供预览功能，参与优先级竞争并正常渲染
   */
  renderPreview?: MaybeRefOrGetter<
    ((schema: SchemaValue, containerId: string) => (() => void) | void) | null | undefined
  >

  /**
   * 是否启用桥接（默认 true）
   * 设为 false 时不创建桥接器，不监听消息
   * 支持响应式值
   */
  enabled?: MaybeRefOrGetter<boolean>

  /** 消息标识配置（可选，有默认值） */
  sourceConfig?: Partial<PostMessageSourceConfig>

  /** 消息类型配置（可选，有默认值） */
  messageTypes?: Partial<PostMessageTypeConfig>

  /**
   * SDK 实例唯一标识（可选，自动生成）
   * 用于多 SDK 实例协调
   */
  sdkId?: string

  /**
   * SDK 优先级（可选，默认 0）
   * 数值越大优先级越高，当多个 SDK 实例共存时，优先级高的响应请求
   */
  level?: number

  /**
   * 方法级别优先级配置（可选）
   * 可以为每个方法单独配置优先级，未配置的方法使用 level 作为优先级
   */
  methodLevels?: MethodLevelConfig
}

/** Vue composable 返回值 */
export interface UseSchemaElementEditorReturn {
  /** 录制相关方法 */
  recording: SchemaElementEditorRecording
}

/**
 * Schema Element Editor 插件接入 composable（Vue 3）
 * 用于在宿主页面接入 Schema Element Editor 插件，通过 postMessage 接收插件请求并返回响应
 *
 * @param config - Schema Element Editor 配置（支持响应式值）
 * @returns 桥接器方法，包含 pushSchema
 *
 * @example
 * ```vue
 * <script setup>
 * import { useSchemaElementEditor } from '@schema-element-editor/host-sdk/vue'
 * import { ref } from 'vue'
 *
 * const dataStore = ref({})
 *
 * const { pushSchema } = useSchemaElementEditor({
 *   getSchema: (params) => dataStore.value[params],
 *   updateSchema: (schema, params) => {
 *     dataStore.value[params] = schema
 *     return true
 *   },
 * })
 *
 * // 数据变化时调用 pushSchema 推送数据（录制功能自动可用）
 * sseHandler.onData = (params, data) => pushSchema(params, data)
 * </script>
 * ```
 */
export function useSchemaElementEditor(
  config: VueSchemaElementEditorConfig
): UseSchemaElementEditorReturn {
  const {
    getSchema,
    updateSchema,
    renderPreview,
    sourceConfig,
    messageTypes,
    enabled,
    sdkId,
    level,
    methodLevels,
  } = config

  let bridge: SchemaElementEditorBridge | null = null

  const destroyBridge = () => {
    if (bridge) {
      bridge.cleanup()
      bridge = null
    }
  }

  const createBridgeInstance = () => {
    // 清理之前的桥接
    destroyBridge()

    // enabled 明确为 false 时不创建桥接
    if (toValue(enabled) === false) {
      return
    }

    // 创建代理配置，始终使用最新的值
    const proxyConfig: SchemaElementEditorConfig = {
      getSchema: (params) => toValue(getSchema)(params),
      updateSchema: (schema, params) => toValue(updateSchema)(schema, params),
      renderPreview: toValue(renderPreview)
        ? (schema, containerId) => toValue(renderPreview)?.(schema, containerId)
        : undefined,
      sourceConfig,
      messageTypes,
      sdkId,
      level,
      methodLevels,
    }

    bridge = createSchemaElementEditorBridge(proxyConfig)
  }

  onMounted(() => {
    createBridgeInstance()
  })

  onUnmounted(() => {
    destroyBridge()
  })

  // 监听配置变化，重新创建桥接
  watch(
    () => [
      toValue(enabled),
      sourceConfig?.contentSource,
      sourceConfig?.hostSource,
      messageTypes?.getSchema,
      messageTypes?.updateSchema,
      messageTypes?.checkPreview,
      messageTypes?.renderPreview,
      messageTypes?.cleanupPreview,
      messageTypes?.startRecording,
      messageTypes?.stopRecording,
      messageTypes?.schemaPush,
      sdkId,
      level,
      methodLevels,
    ],
    () => {
      createBridgeInstance()
    },
    { deep: true }
  )

  // 返回 recording 对象
  const recording: SchemaElementEditorRecording = {
    push: (params: string, data: SchemaValue) => {
      bridge?.recording.push(params, data)
    },
  }

  return { recording }
}
