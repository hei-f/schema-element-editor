/**
 * Schema Element Editor Host SDK - Types
 * 类型定义
 */

/**
 * Schema 数据类型
 * 支持所有 JSON.parse 可返回的类型
 */
export type SchemaValue = Record<string, unknown> | unknown[] | string | number | boolean | null

/** postMessage 消息标识配置 */
export interface PostMessageSourceConfig {
  /** 插件端发送消息的 source 标识 */
  contentSource: string
  /** 宿主端响应消息的 source 标识 */
  hostSource: string
}

/** postMessage 消息类型配置 */
export interface PostMessageTypeConfig {
  getSchema: string
  updateSchema: string
  checkPreview: string
  renderPreview: string
  cleanupPreview: string
  // 录制模式相关
  startRecording: string
  stopRecording: string
  schemaPush: string
}

/** SDK 方法级别配置 */
export interface MethodLevelConfig {
  getSchema?: number
  updateSchema?: number
  checkPreview?: number
  renderPreview?: number
  cleanupPreview?: number
  startRecording?: number
  stopRecording?: number
}

/**
 * Schema Element Editor 配置接口
 */
export interface SchemaElementEditorConfig {
  /**
   * 获取 Schema 数据（可选）
   * @param params - 元素参数（通常是 data-id 的值）
   * @returns Schema 数据（支持所有 JSON 类型）
   */
  getSchema?: (params: string) => SchemaValue

  /**
   * 更新 Schema 数据（可选）
   * @param schema - 新的 Schema 数据（支持所有 JSON 类型）
   * @param params - 元素参数
   * @returns 是否更新成功
   */
  updateSchema?: (schema: SchemaValue, params: string) => boolean

  /**
   * 渲染预览（可选）
   * @param schema - Schema 数据（支持所有 JSON 类型）
   * @param containerId - 预览容器 ID
   * @returns 清理函数（可选）
   *
   * 特殊值说明：
   * - undefined（默认）：不关心预览功能，不参与优先级竞争
   * - null：明确阻止预览功能，参与优先级竞争但告诉插件不支持预览（触发内置预览器）
   * - function：提供预览功能，参与优先级竞争并正常渲染
   */
  renderPreview?: ((schema: SchemaValue, containerId: string) => (() => void) | void) | null

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

/** postMessage 请求数据结构 */
export interface PostMessageRequest {
  source: string
  type: string
  payload?: Record<string, unknown>
  requestId: string
}

/** SDK 注册信息 */
export interface SdkRegistrationInfo {
  sdkId: string
  messageSource: string // 该 SDK 使用的 contentSource
  level: number // 默认优先级
  methodLevels: MethodLevelConfig // 方法级别优先级
  implementedMethods: string[] // SDK 实现了哪些方法
}

/** SDK 协调消息 */
export interface SdkCoordinationMessage {
  source: string // SDK_COORDINATOR_SOURCE
  type: string
  payload: SdkRegistrationInfo | { sdkId: string }
}

/**
 * 录制相关方法
 */
export interface SchemaElementEditorRecording {
  /**
   * 推送 Schema 数据（SDK 内部判断是否在录制，未录制时静默忽略）
   * @param params - 元素参数（data-id 的值）
   * @param data - Schema 数据
   */
  push: (params: string, data: SchemaValue) => void
}

/**
 * Schema Element Editor 桥接器返回值
 */
export interface SchemaElementEditorBridge {
  /** 清理桥接器，移除事件监听 */
  cleanup: () => void

  /** 录制相关方法 */
  recording: SchemaElementEditorRecording
}

/** SDK 协调器配置 */
export interface SdkCoordinatorConfig {
  sdkId?: string
  messageSource: string
  level?: number
  methodLevels?: MethodLevelConfig
  implementedMethods: string[] // SDK 实现了哪些方法
}
